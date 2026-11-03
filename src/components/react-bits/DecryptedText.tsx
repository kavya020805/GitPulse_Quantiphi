"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;
  chars?: string;
}

export function DecryptedText({
  text,
  className = "",
  speed = 40,
  chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
}: DecryptedTextProps) {
  const [displayed, setDisplayed] = useState("");
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayed(
        text
          .split("")
          .map((char, idx) => {
            if (char === " ") return " ";
            if (idx < iteration) return text[idx];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      iteration += 1 / 3;
      if (iteration >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isInView, text, speed, chars]);

  return (
    <span ref={ref} className={`font-mono ${className}`}>
      {displayed || text}
    </span>
  );
}
