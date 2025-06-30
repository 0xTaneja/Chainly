import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Intersection Observer hook for animations
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [elementRef, options])

  return isIntersecting
}

// Button variants
export const buttonVariants = {
  primary: "bg-[#7EE787] text-[#101010] hover:bg-[#6DD477] font-semibold",
  secondary: "bg-transparent border border-[#7EE787] text-[#7EE787] hover:bg-[#7EE787] hover:text-[#101010]",
  ghost: "bg-transparent text-white hover:bg-white/10",
}

// Animation delays for staggered animations
export const staggerDelay = (index: number) => ({
  animationDelay: `${index * 0.1}s`
})

import React from "react" 