'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DaumPostcode from 'react-daum-postcode';
import { formatKrPhone, isValidKrPhone } from '@/lib/validation';
import { Block } from '@/components/block';

const inputClass =
  'w-full border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none';

export default function EditProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 세션에 이미 프로필 필드가 실려 있으므로(jwt 콜백) 그대로 프리필한다.
  useEffect(() => {
    if (!session?.user) return;
    setName((prev) => prev || session.user.name || '');
    setPhoneNumber((prev) => prev || session.user.phoneNumber || '');
    setZipCode((prev) => prev || session.user.zipCode || '');
    setAddress((prev) => prev || session.user.address || '');
    setDetailAddress((prev) => prev || session.user.detailAddress || '');
  }, [session]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/my-page/edit');
    }
  }, [status, router]);

  const handleCompletePostcode = (data) => {
    setAddress(data.address);
    setZipCode(data.zonecode);
    setIsPostcodeOpen(false);
  };

  const formValid =
    name.trim().length >= 2 && (!phoneNumber || isValidKrPhone(phoneNumber));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formValid) {
      setError('입력값을 확인해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          ...(phoneNumber ? { phoneNumber } : {}),
          address,
          detailAddress,
          zipCode,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        await update();
        router.push('/my-page');
        return;
      }
      setError(data.error || '프로필 수정 중 오류가 발생했습니다.');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-md">

        <Block>
          <h1 className="text-base md:text-lg">Edit Profile</h1>
        </Block>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          {error && (
            <Block>
              <p className="text-sm text-red-600">{error}</p>
            </Block>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block>
              <label className="block text-sm mb-2" htmlFor="name">Name</label>
              <input
                className={inputClass}
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Block>
            <Block>
              <label className="block text-sm mb-2" htmlFor="phoneNumber">Phone</label>
              <input
                className={inputClass}
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="010-1234-5678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatKrPhone(e.target.value))}
                maxLength={13}
              />
            </Block>
          </div>

          <Block>
            <label className="block text-sm mb-2">Address</label>
            <div className="space-y-3">
              <div className="flex gap-3 items-center">
                <input
                  className="w-32 border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none"
                  placeholder="우편번호"
                  value={zipCode}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsPostcodeOpen(true)}
                  className="text-sm hover:underline"
                >
                  검색
                </button>
              </div>
              <input className={inputClass} placeholder="기본 주소" value={address} readOnly />
              <input
                className={inputClass}
                placeholder="상세 주소 (동/호수 등)"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
              />
            </div>
          </Block>

          <Block>
            <button
              type="submit"
              disabled={submitting || !formValid}
              className="text-sm md:text-base hover:underline disabled:text-zinc-400 disabled:cursor-not-allowed"
            >
              {submitting ? '저장 중…' : '저장 →'}
            </button>
          </Block>

          <Block>
            <Link href="/my-page" className="text-sm hover:underline">
              마이페이지로 돌아가기
            </Link>
          </Block>
        </form>

        {isPostcodeOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
            <div className="bg-white p-4 w-full max-w-md relative">
              <button
                type="button"
                onClick={() => setIsPostcodeOpen(false)}
                className="absolute top-2 right-2 p-2 hover:bg-zinc-100 rounded-full"
                aria-label="닫기"
              >
                ✕
              </button>
              <DaumPostcode onComplete={handleCompletePostcode} className="h-[400px]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
