// 룩북 컬렉션 — /lookbook 목록에 이 순서대로 쌓인다(위가 최신).
// upcoming은 아직 공개 전: 링크 없이 흐린 티저 이미지만 보인다.
// 티저 파일은 피사체만 누끼를 따 순백 위에 올리고 블러를 입혀 미리 저장한 것 — 원본은 사이트에 올리지 않는다.
export const LOOKBOOK_COLLECTIONS = [
  {
    slug: 'quarters',
    title: 'QUARTERS',
    date: '2026.10',
    cover: '/asset/details/lookbook/quarters/quarters-cover-v3.jpg',
    // 마우스를 올리면 이 덜 흐린 버전으로 천천히 바뀐다 — 여전히 디테일은 가려질 만큼만.
    coverHover: '/asset/details/lookbook/quarters/quarters-cover-v3-hover.jpg',
    upcoming: true,
  },
  {
    slug: 'green',
    title: 'GREEN',
    date: '2025.12',
    cover: '/asset/details/lookbook/9hat/A3.jpeg',
  },
];
