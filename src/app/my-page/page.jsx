'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-500 text-sm uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-md">
        <h1 className="font-serif text-4xl md:text-5xl text-center mb-16 text-black font-normal">
          My Page
        </h1>

        <div className="space-y-12 mb-16">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-4">NAME</p>
            <p className="font-serif text-xl text-black">{session.user.name}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-4">PHONE NUMBER</p>
            <p className="font-serif text-xl text-black">{session.user.phoneNumber || '-'}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-4">EMAIL</p>
            <p className="font-serif text-xl text-black">{session.user.email}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-4">ADDRESS</p>
            <p className="font-serif text-xl text-black">{session.user.address || '-'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/my-page/edit"
            className="block w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors text-center font-serif"
          >
            Edit Profile
          </Link>

          {session.user.role === 'admin' && (
            <Link
              href="/admin/users"
              className="block w-full bg-red-600 text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-colors text-center font-serif"
            >
              Admin Mode
            </Link>
          )}

          <button
            onClick={async () => {
              if (confirm('Are you sure you want to withdraw? This action cannot be undone.')) {
                try {
                  const res = await fetch('/api/user/delete', { method: 'DELETE' });
                  if (res.ok) {
                    alert('Account deleted successfully.');
                    window.location.href = '/'; // Force redirect to refresh session state
                  } else {
                    alert('Failed to delete account.');
                  }
                } catch (err) {
                  console.error(err);
                  alert('An error occurred.');
                }
              }
            }}
            className="block w-full border border-zinc-200 text-zinc-400 py-4 text-xs uppercase tracking-[0.2em] hover:text-red-500 hover:border-red-500 transition-colors text-center font-serif"
          >
            Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
}
