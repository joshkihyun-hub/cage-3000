/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // fs 모듈을 클라이언트 측 번들에서 제외합니다.
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }

    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Next 16 only serves qualities that are explicitly allowed; the hero and
    // product shots request 85, everything else defaults to 75.
    qualities: [75, 85],
  },
  compiler: {
    // 결제·웹훅 오류 로그(console.error/warn)는 프로덕션에서도 남겨야
    // 장애를 추적할 수 있다 — log/debug만 제거한다.
    removeConsole:
      process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        // 전 페이지 보안 헤더. 다른 사이트가 결제·관리자 화면을 iframe에 넣고
        // 클릭을 유도하지 못하게 막는다(X-Frame-Options는 구형 브라우저용,
        // frame-ancestors는 현행 표준). PortOne 결제창·우편번호 검색은 우리 페이지가
        // 그쪽을 띄우는 방향이라 영향이 없다.
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // 영상·사진 원본. 기본값(max-age=0)이면 재방문 때마다 파일마다 서버에
        // 확인 요청을 보낸다 — 하루는 브라우저 캐시에서 바로 쓰게 한다.
        // 파일명에 해시가 없으니 immutable로 두지 않는다: 같은 이름으로 교체하면
        // 재방문자에게는 최대 하루 늦게 반영된다(즉시 바꾸려면 파일명을 바꿀 것).
        source: '/asset/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' }],
      },
    ];
  },
};

// module.exports를 export default로 변경
export default nextConfig;

