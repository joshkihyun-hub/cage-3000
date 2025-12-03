'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Anton } from 'next/font/google';

const anton = Anton({ subsets: ['latin'], weight: ['400'] });

export default function EditProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session) {
      setName(session.user.name || '');
      // These fields are not in the session, so we need to fetch them
      // For now, we'll leave them blank
      setPhoneNumber(''); 
      setAddress('');
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const response = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phoneNumber, address }),
    });

    if (response.ok) {
      const data = await response.json();
      update({ user: data.user });
      setSuccess('Profile updated successfully!');
      router.push('/my-page');
    } else {
      const data = await response.json();
      setError(data.error || 'Something went wrong');
    }
  };

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
        <h1 className={`${anton.className} text-4xl md:text-5xl font-semibold text-center mb-12 tracking-tighter`}>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}
          <div className="mb-6">
            <label className="block text-zinc-500 text-sm font-bold mb-2" htmlFor="name">
              NAME
            </label>
            <input
              className="border-b-2 border-zinc-400 w-full py-2 px-3 text-zinc-900 leading-tight focus:outline-none focus:border-zinc-900"
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-zinc-500 text-sm font-bold mb-2" htmlFor="phoneNumber">
              PHONE NUMBER
            </label>
            <input
              className="border-b-2 border-zinc-400 w-full py-2 px-3 text-zinc-900 leading-tight focus:outline-none focus:border-zinc-900"
              id="phoneNumber"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="mb-8">
            <label className="block text-zinc-500 text-sm font-bold mb-2" htmlFor="address">
              ADDRESS
            </label>
            <input
              className="border-b-2 border-zinc-400 w-full py-2 px-3 text-zinc-900 leading-tight focus:outline-none focus:border-zinc-900"
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center">
            <button
              className="w-full bg-zinc-900 text-white py-4 text-xl font-bold tracking-wider hover:bg-zinc-800 transition-colors mb-4"
              type="submit"
            >
              SAVE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
