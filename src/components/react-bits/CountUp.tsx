"use client";

import { useEffect, useRef, useState } from "react";
import { useSpring, useTransform, motion, useInView } from "framer-motion";

interface CountUpProps {
  target: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CountUp({
  target,
  duration = 1.5,
  className = "",
  prefix = "",
  suffix = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (isInView) {
      spring.set(target);
    }
  }, [isInView, spring, target]);

  return (
    <motion.span ref={ref} className={`tabular-nums ${className}`}>
      {display}
    </motion.span>
  );
}
