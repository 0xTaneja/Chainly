'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const MotionSection = ({ children, className = '', delay = 0 }: MotionSectionProps) => {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.section>
  );
};

export default MotionSection; 