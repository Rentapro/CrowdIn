import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxBackground() {
  const { scrollYProgress } = useScroll();

  // Opacity transitions for crossfading
  const blueprintOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const finishedOpacity = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);
  
  // Scale and Position effects
  const blueprintScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);
  const finishedScale = useTransform(scrollYProgress, [0.3, 1], [0.8, 1.1]);
  const finishedY = useTransform(scrollYProgress, [0.3, 1], [100, 0]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden', background: 'var(--sage-50)' }}>
      
      {/* LAYER 1: THE ORIGIN (BLUEPRINT) */}
      <motion.div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url("/blueprint.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: blueprintOpacity,
          scale: blueprintScale,
          filter: 'grayscale(0.5) contrast(1.1)'
        }}
      />

      {/* LAYER 2: THE EVOLUTION (OVERLAY GRADIENT) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(244, 247, 244, 0.6), rgba(227, 235, 227, 0.9))',
          zIndex: 1
        }}
      />

      {/* LAYER 3: THE FINISHED PRODUCT (LUXURY BUILDING) */}
      <motion.div 
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '80%',
          height: '80%',
          backgroundImage: 'url("/building_final.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: finishedOpacity,
          scale: finishedScale,
          y: finishedY,
          zIndex: 2,
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.1))'
        }}
      />

      {/* AMBIENT FLOATING ELEMENTS (OPTIONAL GOLD PARTICLES) */}
      <motion.div 
        style={{
          position: 'absolute',
          top: '20%',
          left: '80%',
          width: '100px',
          height: '100px',
          background: 'var(--gold-primary)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.2,
          y: useTransform(scrollYProgress, [0, 1], [0, -500])
        }}
      />
    </div>
  );
}
