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
};

// module.exports를 export default로 변경
export default nextConfig;

