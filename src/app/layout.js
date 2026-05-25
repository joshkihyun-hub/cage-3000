import './globals.css';
import { Analytics } from "@vercel/analytics/next"
import { Bodoni_Moda } from 'next/font/google';
import AuthProvider from './auth-provider';
import Header from '../components/header';
import { CartProvider } from '../shared/context/cart-context';

// 본문용 폰트 설정
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
});

export const metadata = {
  title: 'CAGE3000',
  description: 'CAGE3000 Official Store',
  icons: {
    icon: '/favicon-v2.png',
  },
  openGraph: {
    title: 'CAGE3000',
    description: 'CAGE3000 Official Store',
    images: [
      {
        url: '/kl.png',
        width: 800,
        height: 600,
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">

      <body className={`${bodoni.variable} font-serif bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-primary/10 selection:text-primary`}>
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
                    <a href="/terms" className="hover:text-black transition-colors tracking-wide">이용약관</a>
                    <a href="/privacy" className="hover:text-black transition-colors tracking-wide">개인정보처리방침</a>
                    <a href="/refund" className="hover:text-black transition-colors tracking-wide">환불 및 취소 정책</a>
                  </div>
                </div>

                {/* Divider + Copyright */}
                <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col md:flex-row md:justify-between items-center gap-2 text-[10px] text-zinc-300">
                  <p>&copy; {new Date().getFullYear()} CAGE3000 / 케이에이치엔(KHN). All rights reserved.</p>
                  <p>통신판매업 신고 예정</p>
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