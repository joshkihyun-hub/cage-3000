import './globals.css';
import Link from 'next/link';
import { Analytics } from "@vercel/analytics/next"
import { Bodoni_Moda } from 'next/font/google';
import AuthProvider from './auth-provider';
import Header from '../components/header';
import UISound from '../components/ui-sound';
import UICursor from '../components/ui-cursor';
import { CartProvider } from '../shared/context/cart-context';
import { OPEN_GRAPH_BASE, SITE_NAME, SITE_URL, toJsonLd } from '@/lib/seo';

// 본문용 폰트 설정
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
});

const SITE_DESCRIPTION =
  'CAGE3000 — 서울 기반 디자이너 패션 브랜드. 디자이너 김기현이 이끄는 made-to-order 컬렉션으로, 조각적인 실루엣의 의상과 헤드웨어를 한 점씩 만듭니다. A designer fashion label from Seoul.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CAGE3000 — Designer Fashion from Seoul',
    template: '%s · CAGE3000',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'CAGE3000',
    '케이지3000',
    '케이에이치엔',
    'KHN',
    '김기현',
    'Kihyun Kim',
    '디자이너 패션 브랜드',
    '서울 패션 브랜드',
    '주문 제작',
    '모자 브랜드',
    '밀리너리',
    'designer fashion brand',
    'Seoul fashion brand',
    'made to order',
    'millinery',
    'avant-garde headwear',
  ],
  authors: [{ name: 'Kihyun Kim' }],
  creator: 'Kihyun Kim',
  publisher: 'KHN (케이에이치엔)',
  category: 'fashion',
  alternates: {
    canonical: '/',
    // 네이버 서치어드바이저 RSS 제출용 피드 (src/app/rss.xml/route.js)
    types: { 'application/rss+xml': [{ url: '/rss.xml', title: SITE_NAME }] },
  },
  // Favicons are auto-discovered from src/app/icon.png + apple-icon.png
  // (Next.js App Router convention) — no need to declare them here.
  // 공유 이미지는 src/app/opengraph-image.jsx(와 페이지별 opengraph-image)가 만든다 —
  // 여기에 images를 넣으면 파일 기반 이미지가 무시된다.
  openGraph: {
    ...OPEN_GRAPH_BASE,
    url: SITE_URL,
    title: 'CAGE3000 — Designer Fashion from Seoul',
    description: SITE_DESCRIPTION,
  },
  // title/description/images는 각 페이지의 openGraph에서 자동으로 이어받는다 —
  // 여기서 고정하면 모든 하위 페이지가 홈 문구로 공유된다.
  twitter: {
    card: 'summary_large_image',
    creator: '@cage3k',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // 구글 서치 콘솔 사이트 소유확인 — Next가 google-site-verification 메타로 내보낸다.
    google: 'g9a2cCctZgmG0J7dx9vAIDM0XOx5r2yFpJfqSR3npqM',
    other: {
      // 네이버 서치어드바이저 사이트 소유확인
      'naver-site-verification': 'b241ac4d96d0488d3057e76ea73237fc4a6ba8a3',
      // Bing 웹마스터 도구 사이트 소유확인 — ChatGPT·Copilot의 웹 검색이 쓰는 인덱스라
      // 여기에 들어가는 것이 AI 답변 노출로 가는 길이다.
      'msvalidate.01': '5FC00D794F28B21B3CC76EF29C0F2DBF',
    },
  },
};

const organizationJsonLd = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'CAGE3000',
  alternateName: ['케이지3000', 'KHN', '케이에이치엔'],
  url: SITE_URL,
  logo: `${SITE_URL}/logo_new.png`,
  email: 'contact@cage3000.com',
  // 브랜드가 무엇을 하는 곳인지 기계가 읽을 수 있게 — 검색엔진과 AI 검색이
  // "CAGE3000 = 서울의 디자이너 패션 브랜드"로 개체를 연결하는 근거가 된다.
  description: SITE_DESCRIPTION,
  knowsAbout: [
    '디자이너 패션',
    '패션 디자인',
    '주문 제작',
    '밀리너리',
    '헤드웨어',
    'designer fashion',
    'made-to-order fashion',
    'millinery',
    'avant-garde headwear',
  ],
  areaServed: 'KR',
  foundingLocation: {
    '@type': 'Place',
    name: 'Seoul, Republic of Korea',
  },
  makesOffer: {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Product',
      name: 'Made-to-order pieces — garments and headwear',
      category: 'Fashion',
    },
  },
  founder: {
    '@type': 'Person',
    name: 'Kihyun Kim',
    alternateName: '김기현',
    jobTitle: 'Designer',
    sameAs: 'https://instagram.com/cage3k',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: '서울특별시 서대문구',
    streetAddress: '연희로11사길 13 (연희동)',
    addressCountry: 'KR',
  },
  sameAs: ['https://instagram.com/cage3k'],
};

// WebSite의 name/alternateName은 구글 검색결과에 도메인 대신 "CAGE3000"을
// 사이트 이름으로 띄우는 신호다.
const websiteJsonLd = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: ['케이지3000', 'CAGE 3000'],
  url: SITE_URL,
  inLanguage: 'ko-KR',
  publisher: { '@id': `${SITE_URL}/#organization` },
};

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [organizationJsonLd, websiteJsonLd],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(siteJsonLd) }}
        />
      </head>
      <body className={`${bodoni.variable} font-sans bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-primary/10 selection:text-primary`}>
        <UISound />
        <UICursor />
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow w-full">
              {children}
            </main>
            <footer className="w-full border-t border-zinc-200 bg-white">
              {/* Business Info Section */}
              <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
                  {/* Brand */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-800 font-medium">CAGE3000</p>
                    <p className="text-[10px] text-zinc-400 tracking-wide">케이에이치엔(KHN)</p>
                    <a
                      href="https://instagram.com/cage3k"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors"
                    >
                      Instagram ↗
                    </a>
                  </div>

                  {/* Business Details */}
                  <div className="flex flex-col gap-1.5 text-[10px] text-zinc-400 leading-relaxed">
                    <p><span className="text-zinc-600 font-medium">대표자</span> &nbsp;김기현</p>
                    <p><span className="text-zinc-600 font-medium">사업자등록번호</span> &nbsp;830-32-01740</p>
                    <p><span className="text-zinc-600 font-medium">사업장 주소</span> &nbsp;서울특별시 서대문구 연희로11사길 13 (연희동)</p>
                    <p><span className="text-zinc-600 font-medium">이메일</span> &nbsp;contact@cage3000.com</p>
                  </div>

                  {/* Policy Links */}
                  <div className="flex flex-col gap-2 text-[10px] text-zinc-400">
                    <Link href="/faq" className="hover:text-black transition-colors tracking-wide">FAQ</Link>
                    <Link href="/order-lookup" className="hover:text-black transition-colors tracking-wide">주문조회</Link>
                    <Link href="/terms" className="hover:text-black transition-colors tracking-wide">이용약관</Link>
                    <Link href="/privacy" className="hover:text-black transition-colors tracking-wide">개인정보처리방침</Link>
                    <Link href="/refund" className="hover:text-black transition-colors tracking-wide">환불 및 취소 정책</Link>
                  </div>
                </div>

                {/* Divider + Copyright */}
                <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col md:flex-row md:justify-between items-center gap-2 text-[10px] text-zinc-300">
                  <p>&copy; {new Date().getFullYear()} CAGE3000 / 케이에이치엔(KHN). All rights reserved.</p>
                  <p>통신판매업 신고번호 제2026-서울서대문-0621호</p>
                </div>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}