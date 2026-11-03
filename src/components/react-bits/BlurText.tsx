"use client";

import { motion } from "framer-motion";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function BlurText({ text, className = "", delay = 0 }: BlurTextProps) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(8px)", opacity: 0, y: 5 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: delay + i * 0.08,
            ease: "easeOut",
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
