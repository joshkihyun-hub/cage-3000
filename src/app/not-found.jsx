import Link from 'next/link';
import { Block } from '@/components/block';

export const metadata = { title: '페이지를 찾을 수 없습니다' };

export default function NotFound() {
  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-md">

        <Block>
          <h1 className="text-base md:text-lg">404 — 페이지를 찾을 수 없습니다</h1>
          <p className="text-sm text-zinc-700 mt-2">
            요청하신 페이지가 이동되었거나 더 이상 존재하지 않습니다.
          </p>
        </Block>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Block>
            <Link href="/" className="text-sm md:text-base hover:underline">
              홈으로 →
            </Link>
          </Block>
          <Block>
            <Link href="/shop" className="text-sm md:text-base hover:underline">
              쇼핑하기 →
            </Link>
          </Block>
        </div>
      </div>
    </div>
  );
}
