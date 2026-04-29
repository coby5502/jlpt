const MAP: Record<string, string> = {
  'Kanji Reading': '한자 읽기',
  'Contextually-defined Expressions': '문맥 규정',
  'Paraphrases': '유의 표현',
  'Usage': '용법',
  'Sentential Grammar 1 (Selecting grammar form)': '문법 형식 판단',
  'Sentential Grammar 2 (Sentence composition)': '문장 만들기',
  'Text Grammar': '글의 문법',
  'Comprehension (Short passages)': '단문 독해',
  'Comprehension (Mid-size passages)': '중간 길이 독해',
  'Comprehension (Long passages)': '장문 독해',
  'Integrated Comprehension': '통합 이해',
  'Thematic Comprehension': '주장 이해',
  'Information Retrieval': '정보 검색',
};

export function categoryKo(en: string): string {
  return MAP[en] ?? en;
}

export function sectionLabelKo(num: number, category: string): string {
  return `問題${num} ${categoryKo(category)}`;
}
