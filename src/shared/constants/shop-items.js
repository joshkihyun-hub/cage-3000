// wornIn: 이 모자가 등장한 프로젝트의 slug 목록(project1-images.js). 상품 상세에
// "Worn in"으로 표시된다. 예: wornIn: ['harpers-bazaar-sik-k']
// name은 번호뿐이다("11") — 피스에는 이름을 붙이지 않는다. 3000점을 만드는 작업 전체에서
// 번호가 이어지므로(GREEN 01~09 → QUARTERS 10~) 번호만으로 하나뿐이다. 컬렉션 이름은
// collection으로 따로 들고 다닌다. 상세·장바구니·주문에 그대로 쓰인다.
// collection은 룩북 컬렉션의 slug(lookbook.js)로, /shop은 그 순서대로 구역을 나누고
// 구역 안에선 이 배열 순서를 따른다.
// category는 아래 SHOP_CATEGORIES의 slug 중 하나 — /shop 맨 위 분류로 걸러진다.
// color는 카드 오른쪽 아래 점의 색 — 그 피스의 색(사진에서 뽑은 값). 없으면 검정.
// aspect는 사진 비율(CSS aspect-ratio, 없으면 3 / 4), forSale: false면 판매하지 않는 작품.
// id는 주문·장바구니가 붙잡는 값이라 바꾸지 말고 새 상품은 33부터 이어 간다(번호 name과는 따로 센다).

// /shop 맨 위 분류 — All 뒤에 이 순서대로 놓인다. slug는 주소(?category=)와 상품의 category 값,
// label은 화면에 보이는 이름. Hat = 모자, Upper = 상의, Lower = 하의, Furniture = 가구.
export const SHOP_CATEGORIES = [
  { slug: 'furniture', label: 'Furniture' },
  { slug: 'hat', label: 'Hat' },
  { slug: 'upper', label: 'Upper' },
  { slug: 'lower', label: 'Lower' },
];

// 가구를 만드는 과정 사진 — 파일 이름의 번호 순서대로 상세 페이지 아래에 깔린다.
const PROCESS = '/asset/details/shop/quarters/process';
// 원본의 과정 번호 중 흐름을 이해할 만큼만 골라 둔 것 — 화면에선 01부터 다시 센다.
const steps = (name, nums) => nums.map((n) => `${PROCESS}/${name}-${String(n).padStart(2, '0')}.jpg`);

// 카드·상세의 가격 자리 — 판매하지 않는 작품은 "Not for sale", 가격이 아직 없는 피스는
// "Not yet available"(구매 버튼도 숨긴다), 그 외엔 가격.
export const isPurchasable = (item) => item.forSale !== false && Boolean(item.priceNum);
export const priceLabel = (item) => {
  if (item.forSale === false) return 'Not for sale';
  return item.priceNum ? item.price : 'Not yet available';
};

export const items = [
  {
    id: 1,
    name: '01',
    collection: 'green',
    category: 'hat',
    imageUrl: '/asset/details/shop/9hat/hat1/shop_hat1_ main_1.jpeg',
    price: '₩650,000',
    priceNum: 650000,
    material: 'Material : 40% Suri Alpaca, 60% Wool\nLining : 100% Cotton',
    images: [
      '/asset/details/shop/9hat/hat1/shop_hat1_ main_1.jpeg',
      '/asset/details/shop/9hat/hat1/shop_hat1_ main2.jpeg',
      '/asset/details/shop/9hat/hat1/shop_hat1_sub1.jpg',
      '/asset/details/shop/9hat/hat1/shop_hat1_sub2.jpg',
      '/asset/details/shop/9hat/hat1/shop_hat1_lookbook1.jpeg',
      '/asset/details/shop/9hat/hat1/shop_hat1_lookbook2.jpg',
      '/asset/details/shop/9hat/hat1/shop_hat1_lookbook3.jpg',
    ]
  },
  {
    id: 2,
    name: '02',
    collection: 'green',
    category: 'hat',
    imageUrl: '/asset/details/shop/9hat/hat2/shop_hat2_main1 .jpeg',
    price: '₩350,000',
    priceNum: 350000,
    material: 'Material : 40% Suri Alpaca, 60% Wool\nLining : 100% Cotton',
    images: [
      '/asset/details/shop/9hat/hat2/shop_hat2_main1 .jpeg',
      '/asset/details/shop/9hat/hat2/shop_hat2_main2.jpeg',
      '/asset/details/shop/9hat/hat2/shop_hat2_sub1.jpg',
      '/asset/details/shop/9hat/hat2/shop_hat2_sub2.jpg',
      '/asset/details/shop/9hat/hat2/shop_hat2_lookbook.jpg',
      '/asset/details/shop/9hat/hat2/shop_hat2_lookbook2.jpg',
    ]
  },
  {
    id: 3,
    name: '03',
    collection: 'green',
    category: 'hat',
    imageUrl: '/asset/details/shop/9hat/hat3/shop_hat3_main1.jpeg',
    price: '₩350,000',
    priceNum: 350000,
    material: 'Material : 40% Suri Alpaca, 60% Wool\nLining : 100% Cotton',
    images: [
      '/asset/details/shop/9hat/hat3/shop_hat3_main1.jpeg',
      '/asset/details/shop/9hat/hat3/shop_hat3_main2.jpeg',
      '/asset/details/shop/9hat/hat3/shop_hat3_main3.jpeg',
      '/asset/details/shop/9hat/hat3/shop_hat3_sub1.jpg',
      '/asset/details/shop/9hat/hat3/shop_hat3_sub2.jpg',
      '/asset/details/shop/9hat/hat3/shop_hat3_sub3.jpg',
      '/asset/details/shop/9hat/hat3/shop_hat3_lookbook1.jpg',
      '/asset/details/shop/9hat/hat3/shop_hat3_lookbook2.jpg',
    ]
  },
  {
    id: 4,
    name: '04',
    collection: 'green',
    category: 'hat',
    imageUrl: '/asset/details/shop/9hat/hat4/shop_hat4_main1.jpeg',
    price: '₩650,000',
    priceNum: 650000,
    material: 'Material : 40% Suri Alpaca, 60% Wool\nLining : 100% Cotton',
    images: [
      '/asset/details/shop/9hat/hat4/shop_hat4_main1.jpeg',
      '/asset/details/shop/9hat/hat4/shop_hat4_main2.jpeg',
      '/asset/details/shop/9hat/hat4/shop_hat4_sub1.jpg',
      '/asset/details/shop/9hat/hat4/shop_hat4_sub2.jpg',
      '/asset/details/shop/9hat/hat4/shop_hat4_lookbook1.jpg',
      '/asset/details/shop/9hat/hat4/shop_hat4_lookbook2.jpg',
    ]
  },
  {
    id: 5,
    name: '05',
    collection: 'green',
    category: 'hat',
    imageUrl: '/asset/details/shop/9hat/hat5/shop_hat5_main2.jpeg',
    price: '₩650,000',
    priceNum: 650000,
    material: 'Material : 40% Suri Alpaca, 60% Wool\nLining : 100% Cotton',
    images: [
      '/asset/details/shop/9hat/hat5/shop_hat5_main2.jpeg',
      '/asset/details/shop/9hat/hat5/shop_hat5_main1.jpeg',
      '/asset/details/shop/9hat/hat5/shop_hat5_main3.jpeg',
      '/asset/details/shop/9hat/hat5/shop_hat5_sub1.jpg',
      '/asset/details/shop/9hat/hat5/shop_hat5_sub2.jpg',
      '/asset/details/shop/9hat/hat5/shop_hat5_sub3.jpg',
      '/asset/details/shop/9hat/hat5/shop_hat5_lookbook1.jpg',
      '/asset/details/shop/9hat/hat5/shop_hat5_lookbook2.jpg',
    ]
  },
  {
    id: 6,
    name: '06',
    collection: 'green',
    category: 'hat',
    imageUrl: '/asset/details/shop/9hat/hat6/shop_hat6_main1.jpeg',
    price: '₩350,000',
    priceNum: 350000,
    material: 'Material : 40% Suri Alpaca, 60% Wool\nLining : 100% Cotton',
    images: [
      '/asset/details/shop/9hat/hat6/shop_hat6_main1.jpeg',
      '/asset/details/shop/9hat/hat6/shop_hat6_main2.jpeg',
      '/asset/details/shop/9hat/hat6/shop_hat6_sub1.jpg',
      '/asset/details/shop/9hat/hat6/shop_hat6_sub2.jpg',
      '/asset/details/shop/9hat/hat6/shop_hat6_lookbook1.jpg',
      '/asset/details/shop/9hat/hat6/shop_hat6_lookbook2.jpg',
    ]
  },
  {
    id: 7,
    name: '07',
    collection: 'green',
    category: 'hat',
    imageUrl: '/asset/details/shop/9hat/hat7/shop_hat7_main1.jpeg',
    price: '₩350,000',
    priceNum: 350000,
    material: 'Material : 40% Suri Alpaca, 60% Wool\nLining : 100% Cotton',
    images: [
      '/asset/details/shop/9hat/hat7/shop_hat7_main1.jpeg',
      '/asset/details/shop/9hat/hat7/shop_hat7_main2.jpeg',
      '/asset/details/shop/9hat/hat7/shop_hat7_main3.jpeg',
      '/asset/details/shop/9hat/hat7/shop_hat7_sub1.jpg',
      '/asset/details/shop/9hat/hat7/shop_hat7_sub2.jpg',
      '/asset/details/shop/9hat/hat7/shop_hat7_lookbook1.jpg',
      '/asset/details/shop/9hat/hat7/shop_hat7_lookbook2.jpg',
      '/asset/details/shop/9hat/hat7/shop_hat7_lookbook3.jpeg',
    ]
  },
  {
    id: 8,
    name: '08',
    collection: 'green',
    category: 'hat',
    imageUrl: '/asset/details/shop/9hat/hat8/shop_hat8_main1.jpeg',
    price: '₩350,000',
    priceNum: 350000,
    material: 'Material : 40% Suri Alpaca, 60% Wool\nLining : 100% Cotton',
    images: [
      '/asset/details/shop/9hat/hat8/shop_hat8_main1.jpeg',
      '/asset/details/shop/9hat/hat8/shop_hat8_main2.jpeg',
      '/asset/details/shop/9hat/hat8/shop_hat8_sub1.jpg',
      '/asset/details/shop/9hat/hat8/shop_hat8_sub2.jpg',
      '/asset/details/shop/9hat/hat8/shop_hat8_lookbook1.jpg',
    ]
  },
  {
    id: 9,
    name: '09',
    collection: 'green',
    category: 'hat',
    imageUrl: '/asset/details/shop/9hat/hat9/shop_hat9_main1.jpg',
    price: '₩350,000',
    priceNum: 350000,
    material: 'Material : 40% Suri Alpaca, 60% Wool\nLining : 100% Cotton',
    images: [
      '/asset/details/shop/9hat/hat9/shop_hat9_main1.jpg',
      '/asset/details/shop/9hat/hat9/shop_hat9_main2.jpeg',
      '/asset/details/shop/9hat/hat9/shop_hat9_main3.jpeg',
      '/asset/details/shop/9hat/hat9/shop_hat9_sub1.jpg',
      '/asset/details/shop/9hat/hat9/shop_hat9_sub2.jpg',
      '/asset/details/shop/9hat/hat9/shop_hat9_lookbook1.jpg',
      '/asset/details/shop/9hat/hat9/shop_hat9_lookbook2.jpg',
    ]
  },

  // QUARTERS — 번호는 작업 전체에 이어 붙는다: GREEN이 09에서 끝났으니 10부터.
  // 10 침대·11 스툴(furniture), 12~20 모자(hat, 표지는 모두 사선 컷),
  // 21~27 상의, 28~31 하의 순서로 /shop에 놓인다. 카키 나일론 쇼츠(id 18)는 뺐다 —
  // id는 다시 쓰지 않는다.
  // 가구는 판매하지 않는 작품(forSale: false) — 구매 버튼·제작 기간 없이 보여 주기만 하고,
  // 사진은 원본 그대로 가로 3:2(aspect). credit은 상세 이름 아래 작게 붙는 협업 표기.
  // 사진은 룩북 원본에서 아이템마다 멀리(전신·허리 위)와 가까이(상반신·모자·디테일)를
  // 번갈아 2:3으로 잘라 둔 것 — 첫 장이 카드 표지, 나머지는 마우스를 가로로 움직일 때
  // 넘어간다(GREEN과 같은 카드).
  // 가격 미정: price/priceNum이 null인 동안은 카드·상세에 가격이 비고, 주문 API가
  // "가격이 책정되지 않은 상품"으로 결제를 거절한다. 공개 전에 꼭 채울 것.
  {
    id: 31,
    name: '10',
    collection: 'quarters',
    category: 'furniture',
    color: '#6b6a30',
    imageUrl: '/asset/details/shop/quarters/f01/f01v2_01.jpg',
    aspect: '3 / 2',
    // 링크 공유 이미지(1200×630)로 자를 때 남길 높이(0=위, 1=아래). 침대가 사진 아래쪽에 있어
    // 기본값(0.3, 모자용)이면 다리 끝이 잘린다 — 맨 아래를 남겨야 침대가 가운데 가까이 온다.
    ogFocusY: 1,
    forSale: false,
    price: null,
    priceNum: null,
    material: 'Frame : Steel\nFabric : Carbon-coated Cotton',
    credit: 'Frame design & engineering — 우준희',
    // process: 만드는 과정 사진 묶음 — label이 있으면 묶음 위에 작게(스툴은 두 사람이 각각 만든 I·II).
    // 맨 끝은 완성된 침대에 두 사람이 누운 사진 — 커버 사진의 마지막 장과 같다. finale면 마지막
    // 장을 혼자 크게(사진 네 장 넓이, 가운데) 둔다.
    process: [{ images: [...steps('bed', [1, 4, 7, 8, 12, 14, 17, 20]), `${PROCESS}/bed-rest.jpg`], finale: true }],
    images: [
      '/asset/details/shop/quarters/f01/f01v2_01.jpg',
      '/asset/details/shop/quarters/f01/f01v2_02.jpg',
      '/asset/details/shop/quarters/f01/f01v2_03.jpg',
    ]
  },
  {
    id: 32,
    name: '11',
    collection: 'quarters',
    category: 'furniture',
    color: '#665a49',
    imageUrl: '/asset/details/shop/quarters/f02/f02v2_01.jpg',
    aspect: '3 / 2',
    ogFocusY: 0.73, // 스툴이 공유 이미지 가운데 오게
    forSale: false,
    price: null,
    priceNum: null,
    material: 'Frame : Steel\nFabric : Carbon-coated Cotton',
    credit: 'Frame design & engineering — 우준희',
    process: [
      // 같은 단계끼리 위아래로 맞춘다: 프레임을 세움 · 입은 옷을 벗음 · 옷을 씌움 · 앉음.
      { label: 'I', images: steps('stool-men', [3, 5, 6, 12]) },
      { label: 'II', images: steps('stool-women', [4, 5, 7, 12]) },
    ],
    images: [
      '/asset/details/shop/quarters/f02/f02v2_01.jpg',
      '/asset/details/shop/quarters/f02/f02v2_02.jpg',
      '/asset/details/shop/quarters/f02/f02v2_03.jpg',
      '/asset/details/shop/quarters/f02/f02v2_04.jpg',
    ]
  },
  {
    id: 22,
    name: '12',
    collection: 'quarters',
    category: 'hat',
    color: '#2b3b36',
    imageUrl: '/asset/details/shop/quarters/h01/h01v4_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/h01/h01v4_01.jpg',
      '/asset/details/shop/quarters/h01/h01v4_02.jpg',
      '/asset/details/shop/quarters/h01/h01v4_03.jpg',
      '/asset/details/shop/quarters/h01/h01v4_04.jpg',
      '/asset/details/shop/quarters/h01/h01v4_05.jpg',
    ]
  },
  {
    id: 23,
    name: '13',
    collection: 'quarters',
    category: 'hat',
    color: '#24332d',
    imageUrl: '/asset/details/shop/quarters/h02/h02v4_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/h02/h02v4_01.jpg',
      '/asset/details/shop/quarters/h02/h02v4_02.jpg',
      '/asset/details/shop/quarters/h02/h02v4_03.jpg',
      '/asset/details/shop/quarters/h02/h02v4_04.jpg',
      '/asset/details/shop/quarters/h02/h02v4_05.jpg',
      '/asset/details/shop/quarters/h02/h02v4_06.jpg',
      '/asset/details/shop/quarters/h02/h02v4_07.jpg',
    ]
  },
  {
    id: 26,
    name: '14',
    collection: 'quarters',
    category: 'hat',
    color: '#2d3b33',
    imageUrl: '/asset/details/shop/quarters/h05/h05v4_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/h05/h05v4_01.jpg',
      '/asset/details/shop/quarters/h05/h05v4_02.jpg',
      '/asset/details/shop/quarters/h05/h05v4_03.jpg',
      '/asset/details/shop/quarters/h05/h05v4_04.jpg',
      '/asset/details/shop/quarters/h05/h05v4_05.jpg',
      '/asset/details/shop/quarters/h05/h05v4_06.jpg',
    ]
  },
  {
    id: 25,
    name: '15',
    collection: 'quarters',
    category: 'hat',
    color: '#414944',
    imageUrl: '/asset/details/shop/quarters/h04/h04v4_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/h04/h04v4_01.jpg',
      '/asset/details/shop/quarters/h04/h04v4_02.jpg',
      '/asset/details/shop/quarters/h04/h04v4_03.jpg',
      '/asset/details/shop/quarters/h04/h04v4_04.jpg',
      '/asset/details/shop/quarters/h04/h04v4_05.jpg',
      '/asset/details/shop/quarters/h04/h04v4_06.jpg',
      '/asset/details/shop/quarters/h04/h04v4_07.jpg',
    ]
  },
  {
    id: 24,
    name: '16',
    collection: 'quarters',
    category: 'hat',
    color: '#303a31',
    imageUrl: '/asset/details/shop/quarters/h03/h03v4_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/h03/h03v4_01.jpg',
      '/asset/details/shop/quarters/h03/h03v4_02.jpg',
      '/asset/details/shop/quarters/h03/h03v4_03.jpg',
      '/asset/details/shop/quarters/h03/h03v4_04.jpg',
      '/asset/details/shop/quarters/h03/h03v4_05.jpg',
      '/asset/details/shop/quarters/h03/h03v4_06.jpg',
      '/asset/details/shop/quarters/h03/h03v4_07.jpg',
    ]
  },
  {
    id: 27,
    name: '17',
    collection: 'quarters',
    category: 'hat',
    color: '#8e8b67',
    imageUrl: '/asset/details/shop/quarters/h06/h06v4_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/h06/h06v4_01.jpg',
      '/asset/details/shop/quarters/h06/h06v4_02.jpg',
      '/asset/details/shop/quarters/h06/h06v4_03.jpg',
      '/asset/details/shop/quarters/h06/h06v4_04.jpg',
      '/asset/details/shop/quarters/h06/h06v4_05.jpg',
      '/asset/details/shop/quarters/h06/h06v4_06.jpg',
      '/asset/details/shop/quarters/h06/h06v4_07.jpg',
    ]
  },
  {
    id: 28,
    name: '18',
    collection: 'quarters',
    category: 'hat',
    color: '#555238',
    imageUrl: '/asset/details/shop/quarters/h07/h07v4_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/h07/h07v4_01.jpg',
      '/asset/details/shop/quarters/h07/h07v4_02.jpg',
      '/asset/details/shop/quarters/h07/h07v4_03.jpg',
      '/asset/details/shop/quarters/h07/h07v4_04.jpg',
      '/asset/details/shop/quarters/h07/h07v4_05.jpg',
      '/asset/details/shop/quarters/h07/h07v4_06.jpg',
    ]
  },
  {
    id: 29,
    name: '19',
    collection: 'quarters',
    category: 'hat',
    color: '#524d30',
    imageUrl: '/asset/details/shop/quarters/h08/h08v4_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/h08/h08v4_01.jpg',
      '/asset/details/shop/quarters/h08/h08v4_02.jpg',
      '/asset/details/shop/quarters/h08/h08v4_03.jpg',
      '/asset/details/shop/quarters/h08/h08v4_04.jpg',
      '/asset/details/shop/quarters/h08/h08v4_05.jpg',
      '/asset/details/shop/quarters/h08/h08v4_06.jpg',
    ]
  },
  {
    id: 30,
    name: '20',
    collection: 'quarters',
    category: 'hat',
    color: '#565134',
    imageUrl: '/asset/details/shop/quarters/h09/h09v4_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/h09/h09v4_01.jpg',
      '/asset/details/shop/quarters/h09/h09v4_02.jpg',
      '/asset/details/shop/quarters/h09/h09v4_03.jpg',
      '/asset/details/shop/quarters/h09/h09v4_04.jpg',
      '/asset/details/shop/quarters/h09/h09v4_05.jpg',
      '/asset/details/shop/quarters/h09/h09v4_06.jpg',
      '/asset/details/shop/quarters/h09/h09v4_07.jpg',
      '/asset/details/shop/quarters/h09/h09v4_08.jpg',
    ]
  },
  {
    id: 10,
    name: '21',
    collection: 'quarters',
    category: 'upper',
    color: '#645a33',
    imageUrl: '/asset/details/shop/quarters/q01/q01v3_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/q01/q01v3_01.jpg',
      '/asset/details/shop/quarters/q01/q01v4_02.jpg',
      '/asset/details/shop/quarters/q01/q01v4_03.jpg',
      '/asset/details/shop/quarters/q01/q01v4_04.jpg',
      '/asset/details/shop/quarters/q01/q01v4_05.jpg',
      '/asset/details/shop/quarters/q01/q01v4_06.jpg',
    ]
  },
  {
    id: 11,
    name: '22',
    collection: 'quarters',
    category: 'upper',
    color: '#9d802c',
    imageUrl: '/asset/details/shop/quarters/q02/q02v3_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/q02/q02v3_01.jpg',
      '/asset/details/shop/quarters/q02/q02v4_02.jpg',
      '/asset/details/shop/quarters/q02/q02v4_03.jpg',
      '/asset/details/shop/quarters/q02/q02v4_05.jpg',
      '/asset/details/shop/quarters/q02/q02v4_06.jpg',
    ]
  },
  {
    id: 12,
    name: '23',
    collection: 'quarters',
    category: 'upper',
    color: '#1a261d',
    imageUrl: '/asset/details/shop/quarters/q03/q03v3_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/q03/q03v3_01.jpg',
      '/asset/details/shop/quarters/q03/q03v4_02.jpg',
      '/asset/details/shop/quarters/q03/q03v4_03.jpg',
      '/asset/details/shop/quarters/q03/q03v4_04.jpg',
      '/asset/details/shop/quarters/q03/q03v4_05.jpg',
    ]
  },
  {
    id: 13,
    name: '24',
    collection: 'quarters',
    category: 'upper',
    color: '#1b271d',
    imageUrl: '/asset/details/shop/quarters/q04/q04v3_01.jpg',
    ogFocusY: 0, // 모자가 다른 표지보다 높이 올라가 있어 공유 이미지는 맨 위부터
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/q04/q04v3_01.jpg',
      '/asset/details/shop/quarters/q04/q04v4_02.jpg',
      '/asset/details/shop/quarters/q04/q04v3_03.jpg',
      '/asset/details/shop/quarters/q04/q04v4_04.jpg',
      '/asset/details/shop/quarters/q04/q04v4_05.jpg',
      '/asset/details/shop/quarters/q04/q04v4_06.jpg',
      '/asset/details/shop/quarters/q04/q04v4_07.jpg',
      '/asset/details/shop/quarters/q04/q04v4_08.jpg',
    ]
  },
  {
    id: 14,
    name: '25',
    collection: 'quarters',
    category: 'upper',
    color: '#65592f',
    imageUrl: '/asset/details/shop/quarters/q05/q05v3_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/q05/q05v3_01.jpg',
      '/asset/details/shop/quarters/q05/q05v4_02.jpg',
      '/asset/details/shop/quarters/q05/q05v4_03.jpg',
      '/asset/details/shop/quarters/q05/q05v4_04.jpg',
    ]
  },
  {
    id: 15,
    name: '26',
    collection: 'quarters',
    category: 'upper',
    color: '#6b6641',
    imageUrl: '/asset/details/shop/quarters/q06/q06v3_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/q06/q06v3_01.jpg',
      '/asset/details/shop/quarters/q06/q06v4_02.jpg',
      '/asset/details/shop/quarters/q06/q06v4_03.jpg',
      '/asset/details/shop/quarters/q06/q06v4_04.jpg',
      '/asset/details/shop/quarters/q06/q06v4_05.jpg',
      '/asset/details/shop/quarters/q06/q06v4_06.jpg',
    ]
  },
  {
    id: 16,
    name: '27',
    collection: 'quarters',
    category: 'upper',
    color: '#807536',
    imageUrl: '/asset/details/shop/quarters/q07/q07v3_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/q07/q07v3_01.jpg',
      '/asset/details/shop/quarters/q07/q07v4_02.jpg',
      '/asset/details/shop/quarters/q07/q07v3_03.jpg',
      '/asset/details/shop/quarters/q07/q07v4_04.jpg',
      '/asset/details/shop/quarters/q07/q07v4_05.jpg',
      '/asset/details/shop/quarters/q07/q07v4_06.jpg',
    ]
  },
  {
    id: 17,
    name: '28',
    collection: 'quarters',
    category: 'lower',
    color: '#0f1a13',
    imageUrl: '/asset/details/shop/quarters/q08/q08v3_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/q08/q08v3_01.jpg',
      '/asset/details/shop/quarters/q08/q08v4_02.jpg',
      '/asset/details/shop/quarters/q08/q08v4_03.jpg',
      '/asset/details/shop/quarters/q08/q08v4_04.jpg',
      '/asset/details/shop/quarters/q08/q08v4_05.jpg',
    ]
  },
  {
    id: 19,
    name: '29',
    collection: 'quarters',
    category: 'lower',
    color: '#0b140f',
    imageUrl: '/asset/details/shop/quarters/q10/q10v3_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/q10/q10v3_01.jpg',
      '/asset/details/shop/quarters/q10/q10v4_02.jpg',
      '/asset/details/shop/quarters/q10/q10v4_03.jpg',
      '/asset/details/shop/quarters/q10/q10v4_04.jpg',
    ]
  },
  {
    id: 20,
    name: '30',
    collection: 'quarters',
    category: 'lower',
    color: '#0c1510',
    imageUrl: '/asset/details/shop/quarters/q11/q11v3_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/q11/q11v3_01.jpg',
      '/asset/details/shop/quarters/q11/q11v4_02.jpg',
      '/asset/details/shop/quarters/q11/q11v4_03.jpg',
      '/asset/details/shop/quarters/q11/q11v4_04.jpg',
      '/asset/details/shop/quarters/q11/q11v4_05.jpg',
    ]
  },
  {
    id: 21,
    name: '31',
    collection: 'quarters',
    category: 'lower',
    color: '#4e4621',
    imageUrl: '/asset/details/shop/quarters/q12/q12v3_01.jpg',
    price: null,
    priceNum: null,
    material: 'Material : 100% Cotton, Fully Waxed',
    images: [
      '/asset/details/shop/quarters/q12/q12v3_01.jpg',
      '/asset/details/shop/quarters/q12/q12v4_02.jpg',
      '/asset/details/shop/quarters/q12/q12v4_03.jpg',
      '/asset/details/shop/quarters/q12/q12v4_04.jpg',
    ]
  }
];
