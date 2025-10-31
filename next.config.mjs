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
};

// module.exports를 export default로 변경
export default nextConfig;

