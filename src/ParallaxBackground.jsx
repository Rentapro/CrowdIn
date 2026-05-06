import React from 'react';
import { motion } from 'framer-motion';

export default function ParallaxBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      overflow: 'hidden',
      background: 'var(--sage-50)'
    }}>
      {/* Cinematic Background with Ken Burns Effect */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          x: [0, -10, 0],
          y: [0, -5, 0]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          width: '110%',
          height: '110%',
          backgroundImage: `linear-gradient(to bottom, rgba(244, 247, 244, 0.7), rgba(244, 247, 244, 0.9)), url('/condominio.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(1.05) contrast(1.02)'
        }}
      />
      
      {/* Decorative Overlay Gradients */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}
