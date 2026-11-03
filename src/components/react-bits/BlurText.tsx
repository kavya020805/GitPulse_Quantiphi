"use client";

import { motion } from "framer-motion";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  animateBy?: "words" | "letters";
}

export function BlurText({
  text,
  className = "",
  delay = 0,
  animateBy = "words",
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <span className={className}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(10px)", opacity: 0, y: 6 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: delay + i * (animateBy === "words" ? 0.08 : 0.03),
            ease: "easeOut",
          }}
          className={animateBy === "words" ? "inline-block mr-[0.25em]" : "inline-block"}
        >
          {el === " " ? "\u00A0" : el}
        </motion.span>
      ))}
    </span>
  );
}
