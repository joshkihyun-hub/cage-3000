'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Route-segment error boundary. Catches render/runtime errors in pages so the
// user sees a branded recovery screen instead of a white screen.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[app/error]', error);
  }, [error]);

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-sm text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-6">Error</p>
        <h1 className="text-3xl md:text-4xl text-black mb-8 leading-tight">
          문제가 발생했습니다.
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed mb-10">
          일시적인 오류일 수 있습니다. 다시 시도해 주세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-black text-white py-3 px-8 text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="border border-black text-black py-3 px-8 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
          >
            홈으로
          </Link>
        </div>
        <p className="mt-12 text-[10px] text-zinc-400 leading-relaxed">
          문제가 계속되면 contact@cage3000.com 으로 문의해 주세요.
        </p>
      </div>
    </div>
  );
}
