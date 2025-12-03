'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Anton } from 'next/font/google';

const anton = Anton({ subsets: ['latin'], weight: ['400'] });

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
    <div className="bg-white text-zinc-900 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="mb-6">
            <label className="block text-zinc-500 text-sm font-bold mb-2" htmlFor="email">
              EMAIL
            </label>
            <input
              className="border-b-2 border-zinc-400 w-full py-2 px-3 text-zinc-900 leading-tight focus:outline-none focus:border-zinc-900"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-8">
            <label className="block text-zinc-500 text-sm font-bold mb-2" htmlFor="password">
              PASSWORD
            </label>
            <input
              className="border-b-2 border-zinc-400 w-full py-2 px-3 text-zinc-900 leading-tight focus:outline-none focus:border-zinc-900"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center">
            <button
              className="w-full bg-zinc-900 text-white py-4 text-xl font-bold tracking-wider hover:bg-zinc-800 transition-colors mb-4"
              type="submit"
            >
              SIGN IN
            </button>
            <Link href="/auth/signup" className="text-zinc-500 hover:text-zinc-900 transition-colors">
              Don't have an account? Sign up.
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
