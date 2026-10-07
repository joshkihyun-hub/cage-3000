// wornIn: 이 모자가 등장한 프로젝트의 slug 목록(project1-images.js). 상품 상세에
// "Worn in"으로 표시된다. 예: wornIn: ['harpers-bazaar-sik-k']
// name은 "컬렉션 이름 + 컬렉션 안의 번호"(GREEN 01, QUARTERS 01…) — 상세·장바구니·주문에
// 그대로 쓰여서 어느 작업의 01인지 구분된다. collection은 룩북 컬렉션의 slug(lookbook.js)로,
// /shop은 그 순서대로 구역을 나누고 구역 안에선 이 배열 순서를 따른다.
// category는 아래 SHOP_CATEGORIES의 slug 중 하나 — /shop 맨 위 분류로 걸러진다.
// id는 주문·장바구니가 붙잡는 값이라 바꾸지 말고 새 상품은 10, 11…로 이어 간다.

// /shop 맨 위 분류 — All 뒤에 이 순서대로 놓인다. slug는 주소(?category=)와 상품의 category 값,
// label은 화면에 보이는 이름. Objects = 모자·소품, Upper = 상의, Lower = 하의.
export const SHOP_CATEGORIES = [
  { slug: 'objects', label: 'Objects' },
  { slug: 'upper', label: 'Upper' },
  { slug: 'lower', label: 'Lower' },
];

export const items = [
  {
    id: 1,
    name: 'GREEN 01',
    collection: 'green',
    category: 'objects',
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
    name: 'GREEN 02',
    collection: 'green',
    category: 'objects',
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
    name: 'GREEN 03',
    collection: 'green',
    category: 'objects',
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
    name: 'GREEN 04',
    collection: 'green',
    category: 'objects',
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
    name: 'GREEN 05',
    collection: 'green',
    category: 'objects',
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
    name: 'GREEN 06',
    collection: 'green',
    category: 'objects',
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
    name: 'GREEN 07',
    collection: 'green',
    category: 'objects',
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
    name: 'GREEN 08',
    collection: 'green',
    category: 'objects',
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
    name: 'GREEN 09',
    collection: 'green',
    category: 'objects',
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
  }
];
