"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface SparklesProps {
  children: React.ReactNode;
  className?: string;
  sparkleColor?: string;
  sparkleCount?: number;
  sparkleSize?: number;
}

export const Sparkles = ({
  children,
  className,
  sparkleColor = "#7EE787",
  sparkleCount = 8,
  sparkleSize = 4,
}: SparklesProps) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateSparkles = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const newSparkles = Array.from({ length: sparkleCount }, (_, i) => ({
        id: Math.random(),
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        delay: Math.random() * 2,
      }));
      
      setSparkles(newSparkles);
    };

    generateSparkles();
    const interval = setInterval(generateSparkles, 3000);
    
    return () => clearInterval(interval);
  }, [sparkleCount]);

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", className)}
    >
      {children}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute pointer-events-none animate-sparkle"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            animationDelay: `${sparkle.delay}s`,
            width: sparkleSize,
            height: sparkleSize,
          }}
        >
          <svg
            width={sparkleSize}
            height={sparkleSize}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 0L7.35 4.65L12 6L7.35 7.35L6 12L4.65 7.35L0 6L4.65 4.65L6 0Z"
              fill={sparkleColor}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}; 