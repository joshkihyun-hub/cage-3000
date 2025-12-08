'use client';

import { PROJECT1_ITEMS } from '../../../shared/constants/project1-images';
import { useEffect, useRef, useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
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
      className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};


// 상세 페이지의 메인 컴포넌트
export default function ProjectDetailPage({ params }) {
  const unwrappedParams = use(params);
  const projectId = parseInt(unwrappedParams.id, 10);
  const project = PROJECT1_ITEMS.find(item => item.id === projectId);

  // State for Lightbox (Exoskeletal only)
  const [selectedId, setSelectedId] = useState(null);

  if (!project) {
    return <div className="text-center py-20">프로젝트를 찾을 수 없습니다.</div>;
  }

  const isExoskeletal = project.id === 3;

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* --- EXOSKELETAL LAYOUT (ID: 3) --- */}
      {isExoskeletal ? (
        <>
          <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 mt-12 md:mt-16">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {project.subImages.map((img, index) => (
                <motion.div
                  key={index}
                  layoutId={`image-${index}`}
                  className="relative w-full aspect-[3/4] cursor-pointer"
                  onClick={() => setSelectedId(index)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={img}
                    alt={`${project.title} detail ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index < 9}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Shared Info Block (Below Grid for Exoskeletal) */}
          <div className="flex justify-start px-4 mt-12 md:mt-16 pb-32">
            <div className="w-full md:max-w-md text-left space-y-2">
              <h1 className="font-serif text-3xl md:text-4xl text-zinc-900 uppercase tracking-wide">{project.title}</h1>
              <p className="text-xs text-zinc-500 tracking-wider uppercase">{project.subtitle}</p>
              {/* Credits */}
              {project.credits && (
                <div className="pt-4 space-y-1">
                  {project.credits.map((credit, idx) => (
                    <p key={idx} className="text-[10px] md:text-xs text-zinc-400 font-light tracking-wide">
                      <span className="font-normal text-zinc-600">{credit.role}</span> - {credit.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lightbox Overlay */}
          <AnimatePresence>
            {selectedId !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                onClick={() => setSelectedId(null)}
              >
                <motion.div
                  layoutId={`image-${selectedId}`}
                  className="relative w-full max-h-[90vh] aspect-[3/4] max-w-2xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()} // Prevent close on image click
                >
                  <Image
                    src={project.subImages[selectedId]}
                    alt="Expanded view"
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
                <button
                  className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors p-2"
                  onClick={() => setSelectedId(null)}
                >
                  <X size={32} strokeWidth={1.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        // --- ORIGINAL LAYOUT (Other Projects) ---
        <>
          {/* 1. Hero Image */}
          {project.subImages.length > 0 && (
            <div className="mt-12 md:mt-16">
              <AnimatedImage
                src={project.subImages[0]}
                alt={`${project.title} detail image 1`}
              />
            </div>
          )}

          {/* 2. Info Block */}
          <div className="flex justify-start px-4 mt-12 md:mt-16">
            <div className="w-full md:max-w-md text-left space-y-2">
              <h1 className="font-serif text-3xl md:text-4xl text-zinc-900 uppercase tracking-wide">{project.title}</h1>
              <p className="text-xs text-zinc-500 tracking-wider uppercase">{project.subtitle}</p>
              {project.credits && (
                <div className="pt-4 space-y-1">
                  {project.credits.map((credit, idx) => (
                    <p key={idx} className="text-[10px] md:text-xs text-zinc-400 font-light tracking-wide">
                      <span className="font-normal text-zinc-600">{credit.role}</span> - {credit.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Remaining Images */}
          <div className="grid grid-cols-1 gap-y-0 mt-12 md:mt-16 pb-32">
            {project.subImages.slice(1).map((src, index) => (
              <AnimatedImage
                key={index}
                src={src}
                alt={`${project.title} detail image ${index + 2}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
