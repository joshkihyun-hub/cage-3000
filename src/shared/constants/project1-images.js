// 프로젝트 분류. 목록 페이지는 이 순서대로 묶어서 보여준다.
// 화면 라벨은 업계 용어를 쓴다 — 'Sponsored'는 영어권에서 유료 광고로 읽힌다.
//   custom    — 의뢰를 받아 새로 디자인·제작한 커스텀 메이드
//   sponsored — 기존 CAGE3000 제품을 협찬한 작업
//   personal  — 브랜드 자체 작업
export const PROJECT_CATEGORIES = [
  { key: 'custom', label: 'Commissions', label_ko: '커스텀 메이드' },
  { key: 'sponsored', label: 'Press', label_ko: '협찬' },
  { key: 'personal', label: 'Archive', label_ko: '개인 작업' },
];

export const PROJECT1_ITEMS = [
  {
    id: 6,
    slug: 'puma-manchester-city-pov',
    category: 'sponsored',
    description_ko: "푸마(PUMA) × 맨체스터 시티(Manchester City) × POV 협업 프로젝트에 CAGE3000 헤드웨어 협찬.",
    title: 'PUMA × MANCHESTER CITY POV',
    subtitle: 'COLLABORATION / 2026',
    image: '/asset/details/puma-pov/puma-pov1.jpg',
    image_hover: '/asset/details/puma-pov/puma-pov2.jpg',
    subImages: [
      '/asset/details/puma-pov/puma-pov1.jpg',
      '/asset/details/puma-pov/puma-pov2.jpg',
    ],
    credits: [
      { role: 'Headwear', name: 'CAGE3000 (@cage3k)' },
      { role: 'Model', name: '@kidcozyboy' },
      { role: 'Brand', name: 'PUMA × Manchester City × POV' },
    ],
  },
  {
    id: 7,
    slug: 'purynn-wee-woo',
    category: 'custom',
    description_ko: "퓨린(PURYNN) — Wee-Woo 뮤직비디오를 위해 커스텀 메이드로 디자인·제작한 마스크.",
    title: 'PURYNN WEE-WOO',
    subtitle: 'MUSIC VIDEO / 2026',
    image: '/asset/details/purynn/purynn1.jpg',
    image_hover: '/asset/details/purynn/purynn2.jpg',
    subImages: [
      '/asset/details/purynn/purynn1.jpg',
      '/asset/details/purynn/purynn2.jpg',
      '/asset/details/purynn/purynn3.jpg',
      '/asset/details/purynn/purynn4.jpg',
    ],
    credits: [
      { role: 'Mask Design', name: 'CAGE3000 (@cage3k)' },
      { role: 'Designer', name: 'Kihyun Kim (@choppycocky)' },
      { role: 'Artist', name: '@purynn__' },
      { role: 'Label', name: '@lucent_label' },
    ],
  },
  {
    id: 0,
    slug: 'esquire-korea-june-issue',
    category: 'sponsored',
    description_ko: "에스콰이어 코리아(Esquire Korea) 6월호 에디토리얼에 CAGE3000 헤드웨어 협찬.",
    title: 'ESQUIRE KOREA JUNE ISSUE',
    subtitle: 'EDITORIAL / 2026',
    image: '/asset/details/esquire/esquire1.jpg',
    image_hover: '/asset/details/esquire/esquire2.jpg',
    subImages: [
      '/asset/details/esquire/esquire1.jpg',
      '/asset/details/esquire/esquire2.jpg',
    ],
    credits: [
      { role: 'Headwear', name: 'CAGE3000 (@cage3k)' },
    ],
  },
  {
    id: 4,
    slug: 'nmixx-heavy-serenade',
    category: 'custom',
    description_ko: "엔믹스(NMIXX) — Heavy Serenade 뮤직비디오를 위해 커스텀 메이드로 디자인·제작한 헤드웨어.",
    title: 'NMIXX HEAVY SERENADE',
    subtitle: 'MUSIC VIDEO / 2026',
    image: '/asset/details/heavy-serenade/heavy-serenade2.jpg',
    image_hover: '/asset/details/heavy-serenade/heavy-serenade1.jpg',
    subImages: [
      '/asset/details/heavy-serenade/heavy-serenade2.jpg',
      '/asset/details/heavy-serenade/heavy-serenade1.jpg',
      '/asset/details/heavy-serenade/heavy-serenade3.jpg',
      '/asset/details/heavy-serenade/heavy-serenade4.jpg',
      '/asset/details/heavy-serenade/heavy-serenade5.jpg',
      '/asset/details/heavy-serenade/heavy-serenade6.jpg',
    ],
    credits: [
      { role: 'Headwear Design', name: 'CAGE3000 (@cage3k)' },
    ],
  },
  {
    id: 5,
    slug: 'harpers-bazaar-sik-k',
    category: 'sponsored',
    description_ko: "하퍼스 바자(Harper's Bazaar) 4월호 식케이(SIK-K) 화보에 CAGE3000 헤드웨어 협찬.",
    title: "HARPER'S BAZAAR APRIL ISSUE SIK-K",
    subtitle: 'EDITORIAL / 2026',
    image: '/asset/details/bazaar-sikk/bazaar-sikk1.jpg',
    image_hover: '/asset/details/bazaar-sikk/bazaar-sikk2.jpg',
    subImages: [
      '/asset/details/bazaar-sikk/bazaar-sikk1.jpg',
      '/asset/details/bazaar-sikk/bazaar-sikk2.jpg',
    ],
    credits: [
      { role: 'Headwear', name: 'CAGE3000 (@cage3k)' },
    ],
  },
  {
    id: 1,
    slug: 'dazed-bat-apt',
    category: 'sponsored',
    description_ko: "데이즈드(Dazed) 2025년 6월호 BAT APT 화보에 CAGE3000 협찬.",
    title: 'DAZED 2025 JUNE BAT APT',
    subtitle: 'FASHION / 2025', // 부제목 추가
    image: '/asset/details/batapt1.JPG',
    image_hover: '/asset/details/batapt2.JPG',
    subImages: [
      // 여기에 상세 페이지에 보일 이미지 경로들을 추가합니다.
      '/asset/details/batapt1.JPG',
      '/asset/details/batapt6.JPG',
      '/asset/details/batapt3.JPG',
      '/asset/details/batapt4.JPG',
      '/asset/details/batapt5.JPG',
      '/asset/details/batapt2.JPG'
    ],
  },
  {
    id: 2,
    slug: 'i-gr-whrrr-i-plrrsr',
    category: 'personal',
    description_ko: "2025년 패션 프로젝트 \" I gr whrrr I plrrsr \".",
    title: '" I gr whrrr I plrrsr "',
    subtitle: 'FASHION / 2025', // 부제목 추가
    image: '/asset/details/bike/bike.png',
    image_hover: '/asset/details/bike/bike2.png',
    subImages: [
      '/asset/details/bike/bike.png',
      '/asset/details/bike/bike2.png',
      '/asset/details/bike/bike8.jpg',
      '/asset/details/bike/KakaoTalk_Photo_2025-04-05-23-52-57.jpeg',
    ],
    credits: [
      { role: 'Design', name: 'Kihyun Kim (@choppycocky), @youngikyoun' },
      { role: 'Making', name: 'Kihyun Kim (@choppycocky), @youngikyoun' },
      { role: 'Photography', name: '@hanhyeon_ (@kiamkoysek )' },
      { role: 'Model', name: '@xaulkim' },
      { role: 'Photography Assistant', name: '@sung.m.j @uiqnshot' },
      { role: 'Making Assistant', name: '@always_wooo , @bluevereal , Jaeseong Hwang' },
    ],
  },
  {
    id: 3,
    slug: 'exoskeletal',
    category: 'personal',
    description_ko: "2024년 패션 프로젝트 EXOSKELETAL.",
    title: 'EXOSKELETAL',
    subtitle: 'FASHION / 2024', // 
    image: '/asset/head1.png',
    image_hover: '/asset/head2.png',
    subImages: [
      '/asset/details/EXOSKELETAL/034A9637.png',
      '/asset/details/EXOSKELETAL/034A9685.png',
      '/asset/details/EXOSKELETAL/034A9731.png',
      '/asset/details/EXOSKELETAL/034A9810.png',
      '/asset/details/EXOSKELETAL/Untitled-1.png', // Center (5th item)
      '/asset/details/EXOSKELETAL/034A9817.png',
      '/asset/details/EXOSKELETAL/back.png',
      '/asset/details/EXOSKELETAL/pants focus fin.png',
      '/asset/details/EXOSKELETAL/sssss.png',
    ],
  },
  // 여기에 새로운 프로젝트를 계속 추가할 수 있습니다.
];


// 분류 순서대로 묶은 목록 — 빈 분류는 뺀다.
export const PROJECT_GROUPS = PROJECT_CATEGORIES.map((category) => ({
  ...category,
  items: PROJECT1_ITEMS.filter((item) => item.category === category.key),
})).filter((group) => group.items.length > 0);

export function projectCategory(project) {
  return PROJECT_CATEGORIES.find((category) => category.key === project.category) || null;
}
