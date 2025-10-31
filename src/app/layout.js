"use client";

import Link from 'next/link';
import './globals.css';
import { Inter, Anton } from 'next/font/google';
import { useState, useEffect, useRef } from 'react';

// 본문용 폰트 설정
const inter = Inter({ subsets: ['latin'] });
// 로고용 폰트 설정 (Anton)
const anton = Anton({
  subsets: ['latin'],
  weight: ['400'], // Anton은 단일 굵기(400)만 제공합니다.
});

const navItems = [
  { name: 'Shop', href: '/shop' },
  { name: 'Projects', href: '/projects' },
  { name: 'Commissions', href: '/commissions' },
  { name: 'Lookbook', href: '/lookbook' },
];

export default function RootLayout({ children }) {
  const [number, setNumber] = useState(3000);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (isHovering) {
      intervalRef.current = setInterval(() => {
        setNumber(prev => {
          const nextValue = prev - 37;
          if (nextValue <= 0) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return nextValue;
        });
      }, 10);
    } else {
      setNumber(3000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isHovering]);

  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale-1.0" />
        <title>CAGE3000</title>
      </head>
      <body className={`${inter.className} bg-white text-zinc-800 min-h-screen flex flex-col`}>
        <header className="w-full border-b border-zinc-200">
          <div className="max-w-screen-xl mx-auto flex flex-col items-center py-8 px-4">
            <Link
              href="/"
              className={`${anton.className} text-5xl md:text-6xl tracking-tight mb-6 text-zinc-900 transform scale-x-90`}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onTouchStart={() => setIsHovering(true)}
              onTouchEnd={() => setIsHovering(false)}
            >
              CAGE
              <span className="tabular-nums">{Math.round(number).toString().padStart(4, '0')}</span>
            </Link>
            <nav className="flex justify-center items-center gap-x-6 md:gap-x-8">
              {navItems.map((item) => (
                <div key={item.name} className="relative group">
                  <Link href={item.href} className="text-xs md:text-sm uppercase tracking-normal md:tracking-widest text-zinc-500 underline-offset-4 group-hover:text-zinc-900 transition-colors">
                    {item.name}
                  </Link>
                  <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-4 text-lg text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    ★
                  </span>
                </div>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 md:px-12 py-10">
          {children}
        </main>
        
        <footer className="w-full text-center py-8 text-xs text-zinc-400 border-t border-zinc-200">
          &copy; {new Date().getFullYear()} CAGE3000
        </footer>
      </body>
    </html>
  );
}
