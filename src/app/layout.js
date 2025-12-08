import './globals.css';
import { Playfair_Display } from 'next/font/google';
import AuthProvider from './auth-provider';
import Header from '../components/header';
import { CartProvider } from '../shared/context/cart-context';

// 본문용 폰트 설정
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
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

      <body className={`${playfair.variable} font-serif bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-primary/10 selection:text-primary`}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow w-full">
              {children}
            </main>
            <footer className="w-full text-center py-8 text-xs text-zinc-400 border-t border-zinc-200">
              &copy; {new Date().getFullYear()} CAGE3000
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}