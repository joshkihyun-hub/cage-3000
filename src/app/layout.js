import './globals.css';
import Link from 'next/link';
import { Analytics } from "@vercel/analytics/next"
import { Bodoni_Moda } from 'next/font/google';
import AuthProvider from './auth-provider';
import Header from '../components/header';
import UISound from '../components/ui-sound';
import UICursor from '../components/ui-cursor';
import { CartProvider } from '../shared/context/cart-context';

// 본문용 폰트 설정
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
});

const SITE_URL = 'https://cage3000.com';
const SITE_NAME = 'CAGE3000';
const SITE_DESCRIPTION =
  'CAGE3000 — 서울 기반 모자 브랜드. 디자이너 김기현이 이끄는 made-to-order 밀리너리 컬렉션. Sculpted felt caps, asymmetric brims, avant-garde headwear in Suri Alpaca & wool.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CAGE3000 — Sculpted Headwear from Seoul',
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
    '모자 브랜드',
    '디자이너 모자',
    '밀리너리',
    'millinery',
    'made-to-order hat',
    'sculpted felt cap',
    'avant-garde hat',
    'Seoul fashion brand',
    'Suri Alpaca hat',
  ],
  authors: [{ name: 'Kihyun Kim' }],
  creator: 'Kihyun Kim',
  publisher: 'KHN (케이에이치엔)',
  category: 'fashion',
  alternates: {
    canonical: '/',
  },
  // Favicons are auto-discovered from src/app/icon.png + apple-icon.png
  // (Next.js App Router convention) — no need to declare them here.
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'CAGE3000 — Sculpted Headwear from Seoul',
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/kl.png',
        width: 800,
        height: 600,
        alt: 'CAGE3000',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CAGE3000 — Sculpted Headwear from Seoul',
    description: SITE_DESCRIPTION,
    images: ['/kl.png'],
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
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CAGE3000',
  alternateName: ['케이지3000', 'KHN', '케이에이치엔'],
  url: SITE_URL,
  logo: `${SITE_URL}/logo_new.png`,
  email: 'contact@cage3000.com',
  founder: {
    '@type': 'Person',
    name: 'Kihyun Kim',
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

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
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
                    <p><span className="text-zinc-600 font-medium">전화번호</span> &nbsp;010-4890-9497</p>
                    <p><span className="text-zinc-600 font-medium">이메일</span> &nbsp;contact@cage3000.com</p>
                  </div>

                  {/* Policy Links */}
                  <div className="flex flex-col gap-2 text-[10px] text-zinc-400">
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