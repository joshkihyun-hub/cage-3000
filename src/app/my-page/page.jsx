'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Anton } from 'next/font/google';
import Link from 'next/link';

const anton = Anton({ subsets: ['latin'], weight: ['400'] });

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  console.log('Session object:', session);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="bg-white text-zinc-900 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <h1 className={`${anton.className} text-4xl md:text-5xl font-semibold text-center mb-12 tracking-tighter`}>My Page</h1>
        <div className="mb-6">
          <p className="text-zinc-500 text-sm font-bold mb-2">NAME</p>
          <p className="text-zinc-900 font-bold">{session.user.name}</p>
        </div>
        <div className="mb-8">
          <p className="text-zinc-500 text-sm font-bold mb-2">EMAIL</p>
          <p className="text-zinc-900 font-bold">{session.user.email}</p>
        </div>
        <div className="flex flex-col items-center">
          <Link href="/my-page/edit" className="w-full bg-zinc-900 text-white py-4 text-xl font-bold tracking-wider hover:bg-zinc-800 transition-colors mb-4 text-center">
            Edit Profile
          </Link>
          {session.user.role === 'admin' && (
            <Link href="/admin/users" className="w-full bg-red-600 text-white py-4 text-xl font-bold tracking-wider hover:bg-red-700 transition-colors text-center">
              Admin Mode
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
