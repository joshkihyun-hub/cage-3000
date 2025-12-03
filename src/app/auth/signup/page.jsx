'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Anton } from 'next/font/google';
import Image from 'next/image';
import DaumPostcode from 'react-daum-postcode';

const anton = Anton({ subsets: ['latin'], weight: ['400'] });

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
    <div className="bg-white text-zinc-900 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full border-2 border-zinc-900 p-8 md:p-12">
        <div className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-1 flex flex-col items-center">
            <Image src="/asset/signup/cage 3000.png" alt="Cage 3000" width={200} height={240} className="mb-4" />
            <div className="w-full">
              <label className="block text-zinc-500 text-sm font-bold mb-2" htmlFor="name">
                NAME
              </label>
              <input
                className="border-b-2 border-zinc-400 w-full py-2 px-3 text-zinc-900 leading-tight focus:outline-none focus:border-zinc-900 font-bold"
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-4">
                <div>
                  <label className="block text-zinc-500 text-sm font-bold mb-2" htmlFor="phoneNumber">
                    PHONE NUMBER
                  </label>
                  <div className="flex">
                    <input
                      className="border-b-2 border-zinc-400 w-full py-2 px-3 text-zinc-900 leading-tight focus:outline-none focus:border-zinc-900 font-bold"
                      id="phoneNumber"
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-zinc-500 text-sm font-bold mb-2" htmlFor="email">
                  EMAIL
                </label>
                <input
                  className="border-b-2 border-zinc-400 w-full py-2 px-3 text-zinc-900 leading-tight focus:outline-none focus:border-zinc-900 font-bold"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-zinc-500 text-sm font-bold mb-2" htmlFor="address">
                  ADDRESS
                </label>
                <div className="flex">
                  <input
                    className="border-b-2 border-zinc-400 w-full py-2 px-3 text-zinc-900 leading-tight focus:outline-none focus:border-zinc-900 font-bold"
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPostcodeOpen(true)}
                    className="ml-4 bg-zinc-900 text-white py-2 px-4 text-sm font-bold tracking-wider hover:bg-zinc-800 transition-colors"
                  >
                    FIND
                  </button>
                </div>
                {isPostcodeOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg">
                      <DaumPostcode onComplete={handleCompletePostcode} />
                      <button type="button" onClick={() => setIsPostcodeOpen(false)} className="mt-4 bg-zinc-900 text-white py-2 px-4 text-sm font-bold tracking-wider hover:bg-zinc-800 transition-colors">
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-8">
                <label className="block text-zinc-500 text-sm font-bold mb-2" htmlFor="password">
                  PASSWORD
                </label>
                <input
                  className="border-b-2 border-zinc-400 w-full py-2 px-3 text-zinc-900 leading-tight focus:outline-none focus:border-zinc-900 font-bold"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mb-8">
                <label className="block text-zinc-500 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  CONFIRM PASSWORD
                </label>
                <input
                  className="border-b-2 border-zinc-400 w-full py-2 px-3 text-zinc-900 leading-tight focus:outline-none focus:border-zinc-900 font-bold"
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="bg-zinc-900 text-white py-4 px-12 text-xl font-bold tracking-wider hover:bg-zinc-800 transition-colors"
                  type="submit"
                >
                  SIGN UP
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

