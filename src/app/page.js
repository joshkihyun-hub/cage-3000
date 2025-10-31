"use client";

import { Anton } from 'next/font/google';
import { useState, useEffect, useRef, useCallback, memo } from 'react';

// 폰트 설정
const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
});

// 1. 픽셀 컴포넌트: '밝기'에 따라 다른 스타일을 갖도록 수정합니다.
const CagePixel = memo(function CagePixel({ num, brightness }) {
  const [justFlipped, setJustFlipped] = useState(false);
  const prevBrightness = useRef(brightness);

  const isFlipping = brightness > 0.8; // 가장 밝을 때만 CAGE로 변경

  useEffect(() => {
    // 픽셀이 어두웠다가 밝아지는 순간을 감지
    if (isFlipping && prevBrightness.current <= 0.8) {
      setJustFlipped(true);
      const timer = setTimeout(() => setJustFlipped(false), 600); // 애니메이션 지속 시간
      return () => clearTimeout(timer);
    }
    prevBrightness.current = isFlipping;
  }, [isFlipping]);

  // 밝기에 따라 텍스트 색상을 결정
  const colorClass = brightness > 0.8 ? 'text-zinc-800' :
                     brightness > 0.5 ? 'text-zinc-500' :
                     brightness > 0.2 ? 'text-zinc-300' : 'text-zinc-200';

  return (
    <div className="perspective-[200px] leading-[0.7]">
      <span 
        className={`${anton.className} text-[7px] w-[4ch] tabular-nums transition-colors duration-300 inline-block ${colorClass} ${justFlipped ? 'flipping' : ''}`}
      >
        {isFlipping ? 'CAGE' : num.toString().padStart(4, '0')}
      </span>
    </div>
  );
});

export default function HomePage() {
  const numbers = Array.from({ length: 3001 }, (_, i) => i + 1);
  const containerRef = useRef(null);
  
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const [pixelData, setPixelData] = useState(() => new Float32Array(numbers.length));
  
  const ripplesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastRippleTimeRef = useRef(0);
  const frameCountRef = useRef(0);

  const calculateGrid = useCallback(() => {
    if (!containerRef.current) return;
    const tempSpan = document.createElement('span');
    tempSpan.className = `${anton.className} text-[7px] w-[4ch] tabular-nums`;
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.innerText = '0000';
    document.body.appendChild(tempSpan);
    const itemWidth = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
    if (itemWidth > 0) {
      const containerWidth = containerRef.current.offsetWidth;
      const cols = Math.floor(containerWidth / (itemWidth + 1));
      const rows = Math.ceil(numbers.length / cols);
      if(cols !== grid.cols || rows !== grid.rows) { 
        setGrid({ cols, rows });
      }
    }
  }, [numbers.length, grid.cols, grid.rows]);

  useEffect(() => {
    const timeoutId = setTimeout(calculateGrid, 100);
    window.addEventListener('resize', calculateGrid);
    return () => { clearTimeout(timeoutId); window.removeEventListener('resize', calculateGrid); };
  }, [calculateGrid]);

  // 2. 안정화된 '파동' 애니메이션을 위한 최적화된 메인 루프
  useEffect(() => {
    if (grid.cols === 0) return;
    const animate = (timestamp) => {
      // 0.3초마다 새로운 파동 생성
      if (timestamp - lastRippleTimeRef.current > 300) {
        lastRippleTimeRef.current = timestamp;
        if (ripplesRef.current.length < 15) { // 최대 파동 수 제한
            ripplesRef.current.push({
              x: Math.floor(Math.random() * grid.cols),
              y: Math.floor(Math.random() * grid.rows),
              startTime: timestamp,
              maxBrightness: 0.6 + Math.random() * 0.4,
              radius: 15 + Math.random() * 20,
              duration: 3000 + Math.random() * 3000,
            });
        }
      }

      const newBrights = new Float32Array(numbers.length);
      ripplesRef.current = ripplesRef.current.filter(ripple => {
        const elapsedTime = timestamp - ripple.startTime;
        if (elapsedTime > ripple.duration) return false;

        const lifeRatio = elapsedTime / ripple.duration;
        const currentBrightness = ripple.maxBrightness * Math.sin(lifeRatio * Math.PI);

        const startX = Math.max(0, Math.floor(ripple.x - ripple.radius));
        const endX = Math.min(grid.cols - 1, Math.floor(ripple.x + ripple.radius));
        const startY = Math.max(0, Math.floor(ripple.y - ripple.radius));
        const endY = Math.min(grid.rows - 1, Math.floor(ripple.y + ripple.radius));

        for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
            const distance = Math.sqrt(Math.pow(x - ripple.x, 2) + Math.pow(y - ripple.y, 2));
            if (distance < ripple.radius) {
              const falloff = Math.pow(1 - (distance / ripple.radius), 2);
              const brightness = currentBrightness * falloff;
              const index = y * grid.cols + x;
              if (index < numbers.length && brightness > newBrights[index]) {
                newBrights[index] = brightness;
              }
            }
          }
        }
        return true;
      });
      
      // 3. 3프레임마다 한 번씩만 화면을 업데이트하여 최적화
      if (frameCountRef.current % 3 === 0) {
        setPixelData(newBrights);
      }
      frameCountRef.current++;

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // 페이지 이동 문제를 해결하기 위한 cleanup 함수
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [grid.cols, grid.rows, numbers.length]);

  return (
    <div 
      ref={containerRef}
      className="flex flex-wrap gap-x-px justify-center"
    >
      {numbers.map((num, index) => (
        <CagePixel key={index} num={num} brightness={pixelData[index] || 0} />
      ))}
    </div>
  );
}
