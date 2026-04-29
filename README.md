# JLPT N1 학습

본인 학습용 정적 N1 모의고사 풀이 SPA. 11회차 (2018 公式問題集 + 2020.12 ~ 2025.7) · 어휘 N1 단어 클릭 → 한국어 의미.

## Dev

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173/jlpt/` 열기.

## Korean translation (build-time)

영문 해설/번역을 한국어로 변환하려면:

```bash
.venv/bin/pip install -r scripts/requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
.venv/bin/python scripts/translate.py
```

산출물은 `data/n1_corpus_ko/`에 생성되며 git에 커밋되어야 한다.
실행 안 하면 sync 스크립트가 자동으로 영문 원본으로 fallback.

## Deploy

`main` 푸시 시 GitHub Actions가 `dist/`를 GitHub Pages로 자동 배포.
URL: `https://<username>.github.io/jlpt/`

GitHub repo Settings → Pages → Source = "GitHub Actions" 설정 필요.
