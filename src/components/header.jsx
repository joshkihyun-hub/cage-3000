'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useCart } from '../shared/context/cart-context';
import { ShoppingBag, Menu, X, User, LogOut, LogIn } from 'lucide-react';

const navItemsLeft = [
  { name: 'Shop', href: '/shop' },
  { name: 'Projects', href: '/projects' },
];

const navItemsRight = [
  { name: 'Lookbook', href: '/lookbook' },
  { name: 'About', href: '/about' },
];

function CartIcon() {
  const { cart } = useCart();
  return (
    <Link href="/cart" className="relative group p-2">
      <ShoppingBag className="w-5 h-5 text-zinc-800 group-hover:text-black transition-colors" />
      {cart.length > 0 && (
        <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center">
          {cart.reduce((acc, item) => acc + item.quantity, 0)}
        </span>
      )}
    </Link>
  );
}

export default function Header() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled || isMobileMenuOpen
        ? 'bg-white/95 backdrop-blur-md py-2 border-b border-zinc-100'
        : 'bg-transparent py-6'
        }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center h-20 md:h-24 relative">

          {/* Mobile Menu Button */}
          <div className="md:hidden flex-1 flex justify-start z-20">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-zinc-900 p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Nav - Left Split */}
          <div className="hidden md:flex flex-1 justify-end pr-24 items-center gap-x-8">
            {navItemsLeft.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors relative group py-2 font-medium"
              >
                {item.name}
                <span className="absolute left-0 bottom-0 w-full h-[1px] bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
              </Link>
            ))}
          </div>

          {/* Logo - Centered & Large */}
          <div className="flex-none z-30 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="relative w-48 h-16 md:w-64 md:h-24 block transition-transform hover:scale-105 duration-500">
              <Image
                src="/IMG_1403.png"
                alt="CAGE3000"
                fill
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav - Right Split */}
          <div className="hidden md:flex flex-1 justify-start pl-24 items-center gap-x-8">
            {navItemsRight.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors relative group py-2 font-medium"
              >
                {item.name}
                <span className="absolute left-0 bottom-0 w-full h-[1px] bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
              </Link>
            ))}
          </div>

          {/* Actions (Cart, Auth) - Absolute Right */}
          <div className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 items-center space-x-6">
            <div className="flex items-center space-x-4">
              <CartIcon />
              {session ? (
                <div className="flex items-center space-x-2">
                  <Link href="/my-page" className="p-2 text-zinc-600 hover:text-black transition-colors" title="My Page">
                    <User className="w-5 h-5" />
                  </Link>
                  <button onClick={() => signOut()} className="p-2 text-zinc-600 hover:text-black transition-colors" title="Sign Out">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link href="/auth/signin" className="p-2 text-zinc-600 hover:text-black transition-colors" title="Sign In">
                  <LogIn className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Cart Icon (Right) */}
          <div className="md:hidden flex-1 flex justify-end z-20">
            <CartIcon />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.725,0.25,1)] ${isMobileMenuOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
            }`}
        >
          <nav className="flex flex-col items-center gap-y-6 py-8 bg-white/10 backdrop-blur-lg rounded-2xl mt-2 border border-white/20">
            {[...navItemsLeft, ...navItemsRight].map((item, idx) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg uppercase tracking-[0.2em] text-zinc-800 hover:text-black transition-colors"
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                {item.name}
              </Link>
            ))}
            <div className="w-12 h-px bg-zinc-200 my-2"></div>
            {session ? (
              <div className="flex flex-col items-center gap-y-4">
                <Link href="/my-page" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-widest text-zinc-600 hover:text-black">
                  My Page
                </Link>
                <button onClick={() => signOut()} className="text-sm uppercase tracking-widest text-zinc-600 hover:text-black">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-widest text-zinc-600 hover:text-black">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
