import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
}

const directionMap = {
  up: { y: 30, x: 0, scale: 1 },
  left: { y: 0, x: -30, scale: 1 },
  right: { y: 0, x: 30, scale: 1 },
  scale: { y: 0, x: 0, scale: 0.95 },
};

export default function ScrollReveal({ children, className, delay = 0, direction = 'up' }: ScrollRevealProps) {
  const { y, x, scale } = directionMap[direction];

  return (
    <motion.div
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
