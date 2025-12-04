'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DaumPostcode from 'react-daum-postcode';

export default function SignUp() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const router = useRouter();

  const handleCompletePostcode = (data) => {
    setAddress(data.address);
    setIsPostcodeOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phoneNumber, email, address, password }),
      });

      if (response.ok) {
        router.push('/auth/signin');
      } else {
        const data = await response.json();
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-2xl">

        {/* Header */}
        <div className="mb-16">
          <h1 className="font-serif text-xl md:text-2xl text-black mb-4 uppercase tracking-wide">
            Register Account
          </h1>
          <p className="text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-black underline hover:text-zinc-600 transition-colors">
              Log in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Name */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-zinc-800 mb-2" htmlFor="name">
                Name
              </label>
              <input
                className="w-full border-b border-zinc-200 py-2 text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-zinc-800 mb-2" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                className="w-full border-b border-zinc-200 py-2 text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
                id="phoneNumber"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-800 mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full border-b border-zinc-200 py-2 text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-800 mb-2" htmlFor="address">
              Address
            </label>
            <div className="flex items-end gap-4">
              <input
                className="flex-1 border-b border-zinc-200 py-2 text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setIsPostcodeOpen(true)}
                className="bg-black text-white py-2 px-6 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
              >
                Find
              </button>
            </div>
            {isPostcodeOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-4 w-full max-w-md">
                  <DaumPostcode onComplete={handleCompletePostcode} />
                  <button
                    type="button"
                    onClick={() => setIsPostcodeOpen(false)}
                    className="mt-4 w-full bg-black text-white py-3 text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-800 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full border-b border-zinc-200 py-2 text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-zinc-800 mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="w-full border-b border-zinc-200 py-2 text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-8">
            <button
              className="bg-black text-white py-4 px-16 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
              type="submit"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

