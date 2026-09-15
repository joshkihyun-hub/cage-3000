// 검색·링크 공유 메타데이터 공용 값 — 루트 레이아웃, 페이지별 layout, sitemap/robots/rss가 함께 쓴다.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cage3000.com';
export const SITE_NAME = 'CAGE3000';

// Next는 하위 세그먼트의 openGraph 객체로 상위 값을 통째로 덮어쓴다 — 페이지마다
// 이 기본값을 다시 펼치지 않으면 공유 카드에서 사이트 이름·로케일이 빠진다.
export const OPEN_GRAPH_BASE = { type: 'website', locale: 'ko_KR', siteName: SITE_NAME };

// 공백이 들어간 에셋 파일명(예: "shop_hat1_ main_1.jpeg")도 유효한 절대 URL로.
export function absoluteUrl(path) {
  return encodeURI(`${SITE_URL}${path}`);
}

// 일반 페이지용 metadata. 공유 이미지는 각 세그먼트의 opengraph-image.jsx가 만들므로
// openGraph에 images 키를 넣지 않는다 — 넣으면 파일 기반 이미지가 무시된다.
export function pageMetadata({ title, description, path, ogDescription }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      title: `${title} · ${SITE_NAME}`,
      description: ogDescription || description,
      url: path,
    },
  };
}

// <script type="application/ld+json">용 직렬화 — 문자열에 "</script>"가 섞여도 태그가 깨지지 않게.
export function toJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
