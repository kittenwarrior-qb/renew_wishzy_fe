"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number | undefined>(undefined);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const toggleVisibility = () => {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        
        // Only update if scroll position changed significantly (more than 50px)
        if (Math.abs(scrolled - lastScrollY.current) < 50) {
          return;
        }
        
        lastScrollY.current = scrolled;
        
        // Simple threshold - show after scrolling 500px
        setIsVisible(scrolled > 500);
      });
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTop;
