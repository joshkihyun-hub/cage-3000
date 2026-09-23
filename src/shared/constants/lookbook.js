// GREEN 룩북 사진 — 정적 import라 next/image가 원본 크기와 흐린 placeholder를 알 수 있다.
import A1 from '../../../public/asset/details/lookbook/9hat/A1.jpg';
import A2 from '../../../public/asset/details/lookbook/9hat/A2.jpg';
import A3 from '../../../public/asset/details/lookbook/9hat/A3.jpeg';
import B1 from '../../../public/asset/details/lookbook/9hat/B1.jpg';
import B3 from '../../../public/asset/details/lookbook/9hat/B3.jpg';
import C1 from '../../../public/asset/details/lookbook/9hat/C1.jpg';
import C2 from '../../../public/asset/details/lookbook/9hat/C2.jpg';
import D1 from '../../../public/asset/details/lookbook/9hat/D1.jpg';
import D2 from '../../../public/asset/details/lookbook/9hat/D2.jpg';
import D3 from '../../../public/asset/details/lookbook/9hat/D3.jpg';
import E1 from '../../../public/asset/details/lookbook/9hat/E1.jpeg';
import E2 from '../../../public/asset/details/lookbook/9hat/E2.jpg';
import E3 from '../../../public/asset/details/lookbook/9hat/E3.jpg';
import F1 from '../../../public/asset/details/lookbook/9hat/F1.jpg';
import F2 from '../../../public/asset/details/lookbook/9hat/F2.jpg';
import G1 from '../../../public/asset/details/lookbook/9hat/G1.jpg';
import G2 from '../../../public/asset/details/lookbook/9hat/G2.jpg';
import H1 from '../../../public/asset/details/lookbook/9hat/H1.jpg';
import H2 from '../../../public/asset/details/lookbook/9hat/H2.jpg';
import H3 from '../../../public/asset/details/lookbook/9hat/H3.jpg';

// 룩북 컬렉션 — /lookbook 목록에 이 순서대로 쌓인다(위가 최신).
// upcoming은 아직 공개 전: 링크 없이 흐린 티저 이미지만 보인다.
// 티저 파일은 피사체만 누끼를 따 순백 위에 올리고 블러를 입혀 미리 저장한 것 — 원본은 사이트에 올리지 않는다.
// images가 있는 컬렉션은 목록에서 누르면 그 아래로 사진 격자가 펼쳐진다.
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
    images: [A1, A2, A3, B1, B3, C1, C2, D1, D2, D3, E1, E2, E3, F1, F2, G1, G2, H1, H2, H3],
  },
];
