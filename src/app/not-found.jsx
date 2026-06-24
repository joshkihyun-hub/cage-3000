import Link from 'next/link';

export const metadata = { title: '페이지를 찾을 수 없습니다' };

export default function NotFound() {
  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-sm text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-6">404</p>
        <h1 className="text-3xl md:text-4xl text-black mb-8 leading-tight">
          페이지를 찾을 수 없습니다.
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed mb-10">
          요청하신 페이지가 이동되었거나 더 이상 존재하지 않습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-black text-white py-3 px-8 text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
          >
            홈으로
          </Link>
          <Link
            href="/shop"
            className="border border-black text-black py-3 px-8 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
          >
            쇼핑하기
          </Link>
        </div>
      </div>
    </div>
  );
}
