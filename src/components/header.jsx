'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../shared/context/cart-context';
import { ShoppingBag, Menu, X, User, LogOut, LogIn, Shield, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const DURATION = 0.25;
const STAGGER = 0.025;

const RandomHoverLink = ({ href, text, className }) => {
  return (
    <Link
      href={href}
      className={`relative block overflow-hidden whitespace-nowrap group ${className}`}
    >
      <div className="relative">
        {text.split("").map((l, i) => (
          <motion.span
            key={i}
            variants={{
              initial: { y: 0 },
              hover: { y: "-100%" },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i + Math.random() * 0.1, // Randomized delay for "unpredictable" feel
            }}
            className="inline-block"
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>
      <div className="absolute inset-0">
        {text.split("").map((l, i) => (
          <motion.span
            key={i}
            variants={{
              initial: { y: "100%" },
              hover: { y: 0 },
            }}
            transition={{
              duration: DURATION,
              ease: "easeInOut",
              delay: STAGGER * i + Math.random() * 0.1, // Same random delay seed if possible, or just random enough
            }}
            className="inline-block"
          >
            {l === " " ? "\u00A0" : l}
          </motion.span>
        ))}
      </div>
    </Link>
  );
};

const navItemsLeft = [
  {
    name: 'Shop',
    href: '/shop',
    subItems: [
      { name: 'All', href: '/shop' },
      { name: 'Clothes', href: '/shop?category=clothes' },
      { name: 'Accessories', href: '/shop?category=accessories' },
    ]
  },
  { name: 'Lookbook', href: '/lookbook' },
];

const navItemsRight = [
  { name: 'Projects', href: '/projects' },
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
  const [isScrolling, setIsScrolling] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const scrollTimeoutRef = useRef(null);

  const toggleSubMenu = (name) => {
    setOpenSubMenu(openSubMenu === name ? null : name);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000); // 1 second delay before becoming transparent
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Show glass effect only when:
  // 1. Mobile menu is open OR
  // 2. We are scrolled down AND currently scrolling
  const showGlass = isMobileMenuOpen || (scrolled && isScrolling);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.32,0.725,0.25,1)] pointer-events-none ${showGlass
        ? 'bg-white/60 backdrop-blur-3xl backdrop-brightness-105 border-b border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]'
        : 'bg-transparent border-transparent'
        } ${scrolled ? 'py-4' : 'py-6'}`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 pointer-events-auto">
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
          <div className="hidden md:flex flex-1 justify-end pr-24 items-center gap-x-8 z-40 relative">
            {navItemsLeft.map((item) => (
              <div key={item.name} className="relative group h-full flex items-center">
                <motion.div
                  initial="initial"
                  whileHover="hover"
                  className="relative py-2"
                >
                  <RandomHoverLink
                    href={item.href}
                    text={item.name}
                    className="text-xs uppercase tracking-[0.2em] text-zinc-600 font-medium"
                  />
                </motion.div>

                {/* Dropdown Menu */}
                {item.subItems && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-[cubic-bezier(0.32,0.725,0.25,1)]">
                    <div className="bg-white/90 backdrop-blur-md border border-zinc-100/50 shadow-xl rounded-sm py-2 min-w-[140px] flex flex-col gap-1 ring-1 ring-black/5">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="px-6 py-2 text-[10px] uppercase tracking-[0.15em] text-zinc-500 hover:text-black hover:bg-zinc-50 transition-colors whitespace-nowrap text-center"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Logo - Centered & Large */}
          <div className="flex-none z-30 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="relative w-20 h-20 md:w-24 md:h-24 block transition-transform hover:scale-105 duration-500">
              <Image
                src="/logo_new.png"
                alt="CAGE3000"
                fill
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav - Right Split */}
          <div className="hidden md:flex flex-1 justify-start pl-24 items-center gap-x-8 z-40 relative">
            {navItemsRight.map((item) => (
              <motion.div
                key={item.name}
                initial="initial"
                whileHover="hover"
                className="relative py-2"
              >
                <RandomHoverLink
                  href={item.href}
                  text={item.name}
                  className="text-xs uppercase tracking-[0.2em] text-zinc-600 font-medium"
                />
              </motion.div>
            ))}
          </div>

          {/* Actions (Cart, Auth) - Absolute Right */}
          <div className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 items-center space-x-6 z-50">
            <div className="flex items-center space-x-4">
              <CartIcon />
              {session ? (
                <div className="flex items-center space-x-2">
                  {session.user?.role === 'admin' && (
                    <Link href="/admin/users" className="p-2 text-zinc-600 hover:text-black transition-colors" title="Admin">
                      <Shield className="w-5 h-5" />
                    </Link>
                  )}
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
          <div className="md:hidden flex-1 flex justify-end z-50">
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
              <div key={item.name} className="flex flex-col items-center w-full">
                {item.subItems ? (
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className="text-lg uppercase tracking-[0.2em] text-zinc-800 hover:text-black transition-colors flex items-center gap-2"
                    style={{ transitionDelay: `${idx * 50}ms` }}
                  >
                    {item.name}
                    <div className={`transition-transform duration-300 ${openSubMenu === item.name ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} />
                    </div>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg uppercase tracking-[0.2em] text-zinc-800 hover:text-black transition-colors"
                    style={{ transitionDelay: `${idx * 50}ms` }}
                  >
                    {item.name}
                  </Link>
                )}

                {/* Mobile Submenu Accordion */}
                {item.subItems && (
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${openSubMenu === item.name ? 'grid-rows-[1fr] opacity-100 mt-3 mb-2' : 'grid-rows-[0fr] opacity-0 mt-0 mb-0'
                      }`}
                  >
                    <div className="overflow-hidden flex flex-col items-center gap-y-3">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-xs uppercase tracking-[0.15em] text-zinc-500 hover:text-black transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="w-12 h-px bg-zinc-200 my-2"></div>
            {session ? (
              <div className="flex flex-col items-center gap-y-4">
                <Link href="/my-page" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-widest text-zinc-600 hover:text-black">
                  My Page
                </Link>
                {session.user?.role === 'admin' && (
                  <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase tracking-widest text-zinc-600 hover:text-black">
                    Admin
                  </Link>
                )}
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
