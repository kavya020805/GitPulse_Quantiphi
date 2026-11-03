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
  speed = 35,
  chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
}: DecryptedTextProps) {
  const [displayed, setDisplayed] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const prevTextRef = useRef(text);

  useEffect(() => {
    if (!isInView) return;

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

      iteration += 1 / 2.5;

      if (iteration >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
      }
    }, speed);

    prevTextRef.current = text;

    return () => clearInterval(interval);
  }, [isInView, text, speed, chars]);

  return (
    <span ref={ref} className={`font-mono tabular-nums ${className}`}>
      {displayed}
    </span>
  );
}
