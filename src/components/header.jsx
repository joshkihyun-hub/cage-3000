'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Anton } from 'next/font/google';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../shared/context/cart-context';

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

function CartIcon() {
  const { cart } = useCart();
  return (
    <Link href="/cart">
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cart.reduce((acc, item) => acc + item.quantity, 0)}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function Header() {
  const { data: session } = useSession();
  const [number, setNumber] = useState(3000);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <header className="w-full">
      <div className="max-w-screen-xl mx-auto flex flex-col items-center py-8 px-4">
        <div className="w-full flex justify-between items-center md:hidden">
          <div className="flex-1 flex justify-start">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-900">
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <Link
              href="/"
              className={`${anton.className} text-5xl tracking-tight text-zinc-900 transform scale-x-90`}
            >
              CAGE
            </Link>
          </div>
        </div>
        <div className="hidden md:flex w-full justify-between items-center">
          <div className="flex-1 flex justify-start">
            {/* Placeholder for left content on desktop */}
          </div>
          <div className="flex-1 flex justify-center">
            <Link
              href="/"
              className={`${anton.className} text-6xl tracking-tight text-zinc-900 transform scale-x-90`}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onTouchStart={() => setIsHovering(true)}
              onTouchEnd={() => setIsHovering(false)}
            >
              CAGE
              <span className="tabular-nums">{Math.round(number).toString().padStart(4, '0')}</span>
            </Link>
          </div>
          <div className="flex-1 flex justify-end items-center space-x-4">
            <CartIcon />
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/my-page" className="text-xs md:text-sm uppercase tracking-normal md:tracking-widest text-zinc-500 underline-offset-4 hover:text-zinc-900 transition-colors">
                  My Page
                </Link>
                <button onClick={() => signOut()} className="text-xs md:text-sm uppercase tracking-normal md:tracking-widest text-zinc-500 underline-offset-4 hover:text-zinc-900 transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" className="text-xs md:text-sm uppercase tracking-normal md:tracking-widest text-zinc-500 underline-offset-4 hover:text-zinc-900 transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
        <div className="w-full mt-6">
          <nav className="hidden md:flex justify-center items-center gap-x-8 md:gap-x-10">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                <Link href={item.href} className="text-sm uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                  {item.name}
                </Link>
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-zinc-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
              </div>
            ))}
          </nav>
        </div>
        <div className={`md:hidden w-full overflow-hidden transition-all duration-300 ease-out ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <nav className="flex flex-col items-center gap-y-4 mt-6 w-full">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                {item.name}
              </Link>
            ))}
            <div className="border-t border-zinc-200 w-full my-4"></div>
            {session ? (
              <div className="flex flex-col items-center gap-y-4">
                <Link href="/my-page" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                  My Page
                </Link>
                <button onClick={() => signOut()} className="text-sm uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
