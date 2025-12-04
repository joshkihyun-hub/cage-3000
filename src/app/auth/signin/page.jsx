'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { data: session, update } = useSession();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError('Invalid email or password');
    } else {
      await update();
      router.push('/');
    }
  };

  return (
    <div className="bg-white text-zinc-900 min-h-screen flex items-center justify-center pt-20">
      <div className="max-w-sm w-full p-8">
        <h1 className="font-serif text-3xl text-center mb-12 text-black uppercase">Login</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center mb-4 text-xs">{error}</p>}
          <div className="mb-8">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-12">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center space-y-6">
            <button
              className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
              type="submit"
            >
              Sign In
            </button>
            <Link href="/auth/signup" className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5">
              Register Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
