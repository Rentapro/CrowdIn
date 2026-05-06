import React, { useState, useEffect } from 'react';

export default function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="parallax-bg" 
      style={{ transform: `translateY(${scrollY * 0.4}px)` }}
    ></div>
  );
}
