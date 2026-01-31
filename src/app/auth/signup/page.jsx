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
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const router = useRouter();

  const handleCompletePostcode = (data) => {
    setAddress(data.address);
    setZipCode(data.zonecode);
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
        body: JSON.stringify({
          name,
          phoneNumber,
          email,
          address,
          detailAddress,
          zipCode,
          marketingConsent,
          password
        }),
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
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  className="w-32 border-b border-zinc-200 py-2 text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
                  placeholder="Zip Code"
                  value={zipCode}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsPostcodeOpen(true)}
                  className="bg-black text-white py-2 px-6 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                >
                  Search
                </button>
              </div>
              <input
                className="w-full border-b border-zinc-200 py-2 text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
                placeholder="Basic Address"
                value={address}
                readOnly
              />
              <input
                className="w-full border-b border-zinc-200 py-2 text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
                placeholder="Detail Address (e.g. Apt, Suite, Unit)"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
              />
            </div>
            {isPostcodeOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-4 w-full max-w-md relative">
                  <button
                    type="button"
                    onClick={() => setIsPostcodeOpen(false)}
                    className="absolute top-2 right-2 p-2 hover:bg-zinc-100 rounded-full"
                  >
                    ✕
                  </button>
                  <DaumPostcode onComplete={handleCompletePostcode} className="h-[400px]" />
                </div>
              </div>
            )}
          </div>

          {/* Marketing Consent */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="marketing"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-1 w-4 h-4 accent-black"
            />
            <label htmlFor="marketing" className="text-xs text-zinc-600 leading-relaxed cursor-pointer select-none">
              (Optional) I agree to receive marketing communications, updates, and news via email and SMS.
            </label>
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

