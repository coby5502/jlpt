# JLPT N1 학습 웹앱 설계

## Context

JLPT N1을 본인 학습용으로 준비하기 위한 정적 웹앱. 청해는 제외하고 **언어지식(어휘·문법)·독해**만 다룬다. GitHub Pages로 배포한다.

데이터는 이미 `data/n1_corpus/`에 준비됨:
- `exams/` — 11회차 모의고사 (2018 公式問題集 + 2020.12 ~ 2025.7 nihonez 회차) 총 740문제, 138 독해 지문, 모든 정답 + 영문 해설 + 영문 번역 포함
- `vocab.json` — N1 어휘 2,699 (영문 의미)
- `kanji_n1.json` / `kanji_all.json` — N1 한자 + JLPT 레벨 태그 매핑
- `index.json` — 메타 인덱스

본 설계의 목적은 이 코퍼스를 학습 흐름으로 노출하는 SPA를 만드는 것.

## 학습 흐름 (사용자 확정)

1. **회차별** 구분, **최신순** 정렬
2. 회차 안에서 **섹션별 + 문제 번호 범위 지정**
3. **한 화면에 한 문제**
4. 답 선택 즉시 **정답 안내 + 한국어 해설** 노출
5. 문장 안의 단어/표현 클릭 → 한국어 의미 팝오버 (B방식: 우리 N1 vocab에 매칭되는 단어만 클릭 가능)
6. UI·해설·번역 **모두 한국어**

## 기술 스택

- **Vite + 바닐라 TypeScript** — 프레임워크 없이 모듈 단위. 작은 번들·빠른 HMR
- **해시 라우팅** SPA — 빌드 산출물 그대로 GitHub Pages 호스팅 (서브패스 호환)
- **GitHub Actions** 배포 — `main` 푸시 시 `gh-pages` 자동 갱신
- **localStorage**로 진도/설정 저장 (서버 없음)
- **Claude API (Haiku 4.5)** 빌드 타임 1회 실행으로 영문 데이터 한국어화

## 한국어 번역 파이프라인 (build-time)

런타임 API 호출은 안 한다 (CORS·키 노출·비용 모두 회피). 사용자가 빌드 머신에서 1회 실행 → 결과 `data/n1_corpus_ko/`로 커밋 → 정적 자산.

`scripts/translate.py`:

- 입력: `data/n1_corpus/` 원본 (영문 해설/번역 포함)
- 출력: `data/n1_corpus_ko/` (스키마 동일, 영문 자리에 한국어)
- 캐시: `cache/translations.json` (hash-keyed JSON). 재실행 시 미번역 항목만 호출
- 번역 대상:
  1. **vocab.json** — 2,699 단어 × 영문 의미 → 한국어 의미 (예: "to remember" → "기억하다, 외우다"). 출력 스키마 `{w, r, m, m_ko}`
  2. **exams/*.json `expl`** — 회차당 ~66~70 문제, 영문 해설 → 한국어 해설로 **재생성** (정답 이유 + 핵심 문법/어휘 포인트). 영문 원본도 보존(디버그용)
  3. **passages.en** — 138개 지문 영문 번역 → 한국어 번역으로 교체. 일본어 원문은 그대로
- API 비용: Haiku 4.5 추정 USD $1~3 (사용자 부담)
- 멱등성: 모든 요청은 `(model, prompt_hash)` 키로 캐시 → 같은 입력은 다시 호출 안 함
- 실패 처리: 항목별 재시도 3회, 최종 실패 시 영문 원본 fallback

## 화면 구조

### 라우트 (해시 기반)

| 라우트 | 화면 |
|---|---|
| `#/` | 회차 목록 (홈) |
| `#/exam/:id` | 회차 상세: 섹션·범위 선택 |
| `#/exam/:id/q/:n` | 문제 풀이 (메인) |

### 홈 (`#/`)

- 회차 카드 11개, 최신순 (`index.json` 정렬)
- 카드 안: 회차명 / 문제 수 / 진도(% + 정답률 분자/분모) / 마지막 학습 시각
- "이어서 풀기" 버튼 — 마지막 위치로 점프

### 회차 상세 (`#/exam/:id`)

- 섹션 리스트(問題1~問題13, 카테고리별 한국어 라벨), 각 섹션 `n - n` 문제 수 + 진도
- "섹션 전체" / "범위 지정 [from]–[to]" 토글 → 시작 버튼 → `#/exam/:id/q/<from>`
- "처음부터" / "이어서" 버튼

### 문제 풀이 (`#/exam/:id/q/:n`) — 핵심 화면

레이아웃:

```
┌─ 좌 사이드바 (collapsible) ─┐ ┌─ 메인 ────────────────────┐
│ JLPT N1 - 2024-07           │ │ 문제 41 / 66              │
│ ─────                        │ │ Text Grammar (문법)        │
│ ▸ 2025-07                   │ │                            │
│ ▾ 2024-07 [지금]             │ │ 〔지문〕 (있을 때만)        │
│   問題1 한자 6               │ │   ...일본어 본문...         │
│   問題2 문맥 7               │ │   (vocab 매치 단어 = 밑줄) │
│   問題3 유의 6               │ │                            │
│   ...                       │ │ 〔질문〕                   │
│   현재 범위: 41–44          │ │  ...빈칸이 있는 문장...     │
│ ▸ 2024-12                   │ │                            │
│ ─────                        │ │  ① 보기1                   │
│ 후리가나 [ON/OFF]            │ │  ② 보기2                   │
│ 다크모드  [ON/OFF]           │ │  ③ 보기3                   │
└──────────────────────────────┘ │  ④ 보기4                   │
                                 │                            │
                                 │  └ 선택 시:                │
                                 │     ✓/✗ 표시 + 한국어 해설 │
                                 │     [이전] [다음]          │
                                 └────────────────────────────┘
```

- **단어 클릭**: 문장 렌더 시 `vocab-match.ts`가 longest-match 토큰화 → 매치 부분만 `<span class="vw">`로 감쌈. 클릭 시 popover (단어 / 후리가나 / 한국어 의미)
- 답 선택 후에도 옵션 변경 가능 (다시 풀기). 단 답 한 번이라도 봤으면 진도에 기록
- 키보드: `1~4` 답 선택, `←/→` 이전/다음, `Esc` 팝오버 닫기

## 데이터 로딩 전략

- 앱 시작: `index.json` (3KB) — 회차 목록만
- 회차 진입: 해당 `exams_ko/n1_xxxx.json` (~150KB) lazy fetch + 메모리 캐시
- vocab.json: 첫 단어 클릭 시점 lazy fetch (~300KB 한국어화 후)
- 한자: v1 미사용

## State / Persistence

`localStorage` 키 구조:

```
jlpt:progress = {
  [examId]: {
    [questionN]: { picked: 0|1|2|3, correct: bool, ts: epoch }
  }
}
jlpt:last = { examId, questionN, ts }
jlpt:settings = { furigana: bool, dark: bool }
```

- 답 선택 → 즉시 progress 업데이트
- 다음/이전 이동 → last 업데이트
- 세팅 변경 → settings 업데이트
- 모든 키 1MB 미만 (회차당 ~3KB × 11회차)

## 단어 매칭 (B방식)

`lib/vocab-match.ts`:

- 빌드 시 또는 첫 로드 시: vocab의 `w` 필드로 사전 (Map) 구성
- 동적 토큰화 함수: 입력 문자열에서 longest-match 우선으로 vocab 단어 위치 찾기 (greedy left-to-right)
- 결과: `{start, end, vocab}` 배열 → 렌더 시 span 삽입
- 매치 안 되는 부분은 plain text
- 동음이의어/이형 표기: vocab `w`는 한자 표기 우선, 후리가나 표기는 같은 단어로 매핑되도록 보강 (예: 余暇 vs よか)

성능: 사전 ~3KLOC 단어, 한 문장당 매칭 < 1ms (체감 즉시)

## 디렉토리 구조

```
jlpt/
  index.html
  vite.config.ts
  tsconfig.json
  package.json
  src/
    main.ts             # 진입점, 라우터 부착
    router.ts           # 해시 라우팅
    state.ts            # localStorage I/O
    views/
      home.ts           # 회차 목록
      exam.ts           # 섹션/범위 선택
      question.ts       # 문제 풀이 (메인)
    lib/
      data.ts           # 코퍼스 fetch + 캐시
      vocab-match.ts    # B방식 단어 매칭
      popover.ts        # 단어 팝오버 컴포넌트
      furigana.ts       # 후리가나 토글 처리
    style.css
  public/
    data/               # 빌드 시 data/n1_corpus_ko/ 복사본 (배포되는 데이터)
  scripts/
    translate.py        # 한국어 번역 파이프라인
    build-data.sh       # 코퍼스 → public/data 복사
  .github/workflows/
    deploy.yml          # main → gh-pages
  data/
    n1_corpus/          # 원본 (이미 있음)
    n1_corpus_ko/       # 번역 산출물 (커밋됨)
  cache/
    translations.json   # 번역 캐시 (커밋됨, 멱등성)
  docs/superpowers/specs/
    2026-04-29-jlpt-n1-app-design.md  # 본 문서
```

## 배포

`.github/workflows/deploy.yml`:

- 트리거: `main` 푸시
- 단계: checkout → node 22 → `npm ci` → `npm run build` → `peaceiris/actions-gh-pages`로 `dist/` push to `gh-pages` 브랜치
- GitHub Pages 설정: `gh-pages` 브랜치 root → URL `https://<user>.github.io/jlpt/`
- `vite.config.ts`의 `base: '/jlpt/'`로 서브패스 처리

## 검증

빌드/배포 단계별:

1. **로컬 dev**: `npm run dev` → 11개 회차 클릭, 첫 회차 첫 문제 풀이, 정답·오답 모두 시도 → 한국어 해설 노출, 단어 1개 이상 클릭 → 팝오버
2. **번역 파이프라인**: `python scripts/translate.py --dry-run` → 토큰 사용량 미리 보기. 실제 실행 후 `vocab_ko.json`의 random 5개 의미 한국어 검수
3. **빌드**: `npm run build` → `dist/` 생성, 산출물 크기 < 5MB
4. **GitHub Pages**: 배포된 URL 직접 접속 → SPA 라우트가 새로고침에도 동작 (해시 라우팅이라 OK)
5. **localStorage 무결성**: 풀이 → 새로고침 → 같은 위치/답 복원

## 비포함 (v1 yagni)

- 청해 (애초 제외)
- 어휘 카드/플래시카드 모드
- 한자 학습 모드
- 통계 대시보드 (정답률 추이, 약점 카테고리 분석)
- 멀티 디바이스 동기화
- 회차 검색
- 사용자별 노트/메모

위 항목은 v2 이후 검토. 데이터(vocab/kanji)는 코퍼스에 이미 있으므로 추후 모듈 추가 비용은 크지 않음.

## 위험과 대응

| 위험 | 대응 |
|---|---|
| Claude 번역 품질 편차 | 한국어 검수 5건 샘플 → 결과 안 좋으면 Sonnet 4.6로 재번역 (USD ~$5 추가) |
| 단어 매칭 longest-match 실패 (예: "受ける"가 "受" + "ける"로 분리) | vocab `w` 필드를 base form 기준 정규화. 활용형은 v1 범위 외 — 매치 실패 시 plain text |
| GitHub Pages 서브패스 라우팅 | 해시 라우팅으로 우회. 새로고침에도 안전 |
| localStorage 용량 폭주 | 진도 키 정리 정책: 회차 통째 삭제 버튼 추후 |
| API 키 유출 (translate.py) | `.env` 파일 + `.gitignore`. 빌드 머신에서만 실행 |
