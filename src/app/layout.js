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

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CAGE3000</title>
      </head>
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