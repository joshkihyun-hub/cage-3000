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

// QUARTERS 룩북 사진 — 대부분 가로 3:2, 06만 세로 3:4.
import Q1 from '../../../public/asset/details/lookbook/quarters/look-01.jpg';
import Q2 from '../../../public/asset/details/lookbook/quarters/look-02.jpg';
import Q3 from '../../../public/asset/details/lookbook/quarters/look-03.jpg';
import Q4 from '../../../public/asset/details/lookbook/quarters/look-04.jpg';
import Q5 from '../../../public/asset/details/lookbook/quarters/look-05.jpg';
import Q6 from '../../../public/asset/details/lookbook/quarters/look-06.jpg';
import Q7 from '../../../public/asset/details/lookbook/quarters/look-07.jpg';
import Q8 from '../../../public/asset/details/lookbook/quarters/look-08.jpg';

// 룩북 컬렉션 — /collections 목록에 이 순서대로 쌓인다(위가 최신).
// upcoming은 아직 공개 전: 링크 없이 흐린 티저 이미지만 보인다.
// 티저 파일은 피사체만 누끼를 따 순백 위에 올리고 블러를 입혀 미리 저장한 것 — 원본은 사이트에 올리지 않는다.
// images가 있는 컬렉션은 목록에서 누르면 그 아래로 사진 격자가 펼쳐진다.
export const LOOKBOOK_COLLECTIONS = [
  {
    slug: 'quarters',
    title: 'QUARTERS',
    date: '2026.10',
    cover: '/asset/details/lookbook/quarters/quarters-cover-duo.jpg',
    images: [Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8],
    // 펼친 격자에서 혼자 한 줄을 차지하며 가장 크게(줄 높이의 두 배) 놓이는 사진(0부터 센 번호) — 06, 위에서 내려다본 침대.
    feature: 5,
    // 펼친 격자 위에 작게 붙는 크레딧 — 인스타그램 게시물 캡션 그대로(@는 인스타그램 링크가 된다).
    credits: [
      ['Direction, Design and Making, Video', '@choppycocky (CAGE3000 @cage3k)'],
      ['Concept Development, Frame Design & Fabrication', '@woo_junhee'],
      ['Photography', '@youngikyoun'],
      ['Styling', '@choppycocky @bluevereal'],
      ['Performers', '@suny0u @monkgru'],
    ],
    creditNote: 'collaborative project by Kihyun Kim and Junhee Woo',
  },
  {
    slug: 'green',
    title: 'GREEN',
    date: '2025.12',
    cover: '/asset/details/lookbook/9hat/A3.jpeg',
    credits: [
      ['Design, Production', '@choppycocky'],
      ['Photography', '@youngikyoun'],
      ['Styling', '@bluevereal'],
      ['Model', '@simleeje @choppycocky'],
    ],
    images: [A1, A2, A3, B1, B3, C1, C2, D1, D2, D3, E1, E2, E3, F1, F2, G1, G2, H1, H2, H3],
  },
];
