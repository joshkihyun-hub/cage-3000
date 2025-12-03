import './globals.css';
import { Inter } from 'next/font/google';
import AuthProvider from './auth-provider';
import Header from '../components/header';
import { CartProvider } from '../shared/context/cart-context';

// 본문용 폰트 설정
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CAGE3000</title>
      </head>.
      <body className={`${inter.className} bg-white text-zinc-800 min-h-screen flex flex-col`}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 md:px-12 py-10">
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