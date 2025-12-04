'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import PageContainer from '@/components/page-container';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Optional: Check for admin role if your app has roles
    // if (session?.user?.role !== 'admin') {
    //   router.push('/');
    //   return;
    // }

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [status, router, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-500 text-sm uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500 text-sm uppercase tracking-widest">Error: {error}</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-white text-zinc-900 pt-32 px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-3xl mb-12 uppercase">User Management</h1>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="py-4 px-4 text-xs uppercase tracking-widest text-zinc-500 font-normal">Name</th>
                  <th className="py-4 px-4 text-xs uppercase tracking-widest text-zinc-500 font-normal">Email</th>
                  <th className="py-4 px-4 text-xs uppercase tracking-widest text-zinc-500 font-normal">Phone</th>
                  <th className="py-4 px-4 text-xs uppercase tracking-widest text-zinc-500 font-normal">Address</th>
                  <th className="py-4 px-4 text-xs uppercase tracking-widest text-zinc-500 font-normal">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                    <td className="py-4 px-4 text-sm">{user.name}</td>
                    <td className="py-4 px-4 text-sm">{user.email}</td>
                    <td className="py-4 px-4 text-sm">{user.phoneNumber || '-'}</td>
                    <td className="py-4 px-4 text-sm truncate max-w-xs">{user.address || '-'}</td>
                    <td className="py-4 px-4 text-sm uppercase text-xs tracking-wider">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
