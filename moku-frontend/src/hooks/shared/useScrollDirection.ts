import { useState, useEffect } from 'react';

interface UseScrollDirectionOptions {
  threshold?: number;
  scrollStopDelay?: number;
}

interface ScrollState {
  isScrollingDown: boolean;
  isScrollingUp: boolean;
  isScrollingStopped: boolean;
  scrollY: number;
}

export const useScrollDirection = (options: UseScrollDirectionOptions = {}) => {
  const { threshold = 10, scrollStopDelay = 150 } = options;

  const [scrollState, setScrollState] = useState<ScrollState>({
    isScrollingDown: false,
    isScrollingUp: false,
    isScrollingStopped: true,
    scrollY: 0,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollStopTimeout: number;
    let ticking = false;

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      const scrollDifference = scrollY - lastScrollY;

      // Only update if scroll difference is greater than threshold
      if (Math.abs(scrollDifference) > threshold) {
        setScrollState(prev => ({
          ...prev,
          isScrollingDown: scrollDifference > 0,
          isScrollingUp: scrollDifference < 0,
          isScrollingStopped: false,
          scrollY,
        }));

        lastScrollY = scrollY;
      }

      // Clear existing timeout and set a new one for scroll stop detection
      clearTimeout(scrollStopTimeout);
      scrollStopTimeout = setTimeout(() => {
        setScrollState(prev => ({
          ...prev,
          isScrollingDown: false,
          isScrollingUp: false,
          isScrollingStopped: true,
        }));
      }, scrollStopDelay);

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    // Initial scroll position
    setScrollState(prev => ({
      ...prev,
      scrollY: window.scrollY,
    }));

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollStopTimeout);
    };
  }, [threshold, scrollStopDelay]);

  return scrollState;
};
