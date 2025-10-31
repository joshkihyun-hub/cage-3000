'use client'; // 스크롤 애니메이션을 위해 클라이언트 컴포넌트로 전환합니다.

import { PROJECT1_ITEMS } from '../../../shared/constants/project1-images';
import { useEffect, useRef, useState } from 'react';
// 1. Poppins 폰트를 가져옵니다.
import { Poppins } from 'next/font/google';

// 2. 프로젝트 제목을 위한 Poppins 폰트 설정을 일반 굵기(400)로 변경합니다.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400'], // 일반 굵기
});

// 스크롤 애니메이션을 적용할 이미지 컴포넌트
const AnimatedImage = ({ src, alt }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};


// 상세 페이지의 메인 컴포넌트
export default function ProjectDetailPage({ params }) {
  const projectId = parseInt(params.id, 10);
  const project = PROJECT1_ITEMS.find(item => item.id === projectId);

  if (!project) {
    return <div className="text-center py-20">프로젝트를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* 3. 첫 번째 이미지를 먼저 표시합니다. */}
      {project.subImages.length > 0 && (
        <div className="mt-12 md:mt-16">
          <AnimatedImage 
            src={project.subImages[0]} 
            alt={`${project.title} detail image 1`}
          />
        </div>
      )}

      {/* 4. 정보 블록을 '영양성분표' 스타일 대신 깔끔한 텍스트로 변경합니다. */}
      <div className="flex justify-end px-4 mt-12 md:mt-16">
        {/* 5. 폰트 크기와 간격을 줄여 더 세련되게 만듭니다. */}
        <div className="w-full md:max-w-md text-right space-y-1">
            <h1 className={`${poppins.className} text-2xl md:text-3xl text-zinc-800`}>{project.title}</h1>
            <p className="text-xs text-zinc-500 tracking-wider uppercase">{project.subtitle}</p>
        </div>
      </div>
      
      {/* 나머지 이미지들을 표시합니다. */}
      <div className="grid grid-cols-1 gap-y-0 mt-12 md:mt-16">
        {project.subImages.slice(1).map((src, index) => (
          <AnimatedImage 
            key={index}
            src={src} 
            alt={`${project.title} detail image ${index + 2}`}
          />
        ))}
      </div>
    </div>
  );
}
