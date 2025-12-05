
/* RESPONSIVE NOTES:
   - "Hell Edition" V7: Oval/Pill Shape (rounded-full).
   - Transparent, Silent, Performance Optimized.
*/
import React from 'react';
import { motion, Variants } from 'framer-motion';

interface MirrorButtonProps {
  text: React.ReactNode;
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'danger' | 'ghost' | 'brand';
  className?: string;
  disabled?: boolean;
  reflectionDirection?: 'ltr' | 'rtl'; // Left-to-Right or Right-to-Left
  reflectionColor?: string; // Custom gradient colors
  shape?: 'pill' | 'octagonal' | 'rect'; // Added shape support
}

const MirrorButton: React.FC<MirrorButtonProps> = ({ 
  text, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  reflectionDirection = 'ltr',
  reflectionColor = 'from-transparent via-white/10 to-transparent',
  shape = 'pill'
}) => {
  // Oval / Transparent aesthetics
  const styleVariants = {
    // Standard Action: Transparent with subtle white border
    primary: 'bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(255,0,0,0.2)]',
    
    // Negative Action
    danger: 'bg-transparent text-red-500 border border-red-900/30 hover:bg-red-900/10 hover:border-red-500',
    
    // Ghost
    ghost: 'bg-transparent text-white/50 border border-transparent hover:text-white',
    
    // Brand Logo Style (The "NovaProgress - V7")
    brand: 'bg-transparent border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]'
  };

  // Determine initial and hover states based on direction
  const isRTL = reflectionDirection === 'rtl';
  const initialX = isRTL ? '100%' : '-100%';
  const hoverX = isRTL ? '-100%' : '100%';

  const buttonVariants: Variants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  const reflectionVariants: Variants = {
    idle: { 
      x: initialX, 
      opacity: 0,
      skewX: -12
    },
    hover: { 
      x: hoverX, 
      opacity: 1,
      skewX: -12,
      transition: { 
        x: { duration: 0.6, ease: "easeInOut" },
        opacity: { duration: 0.3 }
      }
    }
  };

  // Shape Styles
  const getShapeClasses = () => {
    switch(shape) {
      case 'octagonal':
        // Using clip-path for octagonal/chamfered look. 
        // Note: Border might be cut off with clip-path, so we use a specific approach or rely on CSS/SVG if high fidelity needed.
        // For simplicity and performance, we'll use a CSS clip-path polygon.
        return 'rounded-none [clip-path:polygon(15px_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%,0_15px)]';
      case 'rect':
        return 'rounded-xl';
      case 'pill':
      default:
        return 'rounded-full';
    }
  };

  return (
    <motion.button
      initial="idle"
      animate="idle"
      whileHover={!disabled ? "hover" : "idle"}
      whileTap={!disabled ? "tap" : "idle"}
      variants={buttonVariants}
      onClick={(e) => {
        if (!disabled) {
            onClick(e);
        }
      }}
      className={`
        relative overflow-hidden
        px-8 py-3
        font-display tracking-[0.1em] uppercase font-bold text-sm
        flex items-center justify-center
        transition-all duration-300
        backdrop-blur-sm
        ${getShapeClasses()}
        ${styleVariants[variant]}
        ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {variant === 'brand' ? (
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-red-400 to-red-900 tracking-widest font-black">
             {text}
           </span>
        ) : (
           text
        )}
      </span>
      
      {/* Subtle Mirror Sweep - Optimized */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-r ${reflectionColor} pointer-events-none`} 
        variants={reflectionVariants}
      />
    </motion.button>
  );
};

export default MirrorButton;
