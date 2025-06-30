'use client';

import { useRef, useEffect, useState } from 'react';

interface FeatureVideoProps {
  src: string;
  poster: string;
  className?: string;
}

const FeatureVideo = ({ src, poster, className = '' }: FeatureVideoProps) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          setIsIntersecting(true);
          ref.current?.play();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      className={`pointer-events-none w-full h-full rounded-xl bg-[#13203A] 
                 shadow-inner shadow-black/40 ring-1 ring-white/5 ${className}`}
    />
  );
};

export default FeatureVideo; 