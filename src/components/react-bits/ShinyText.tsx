"use client";

import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = "",
}: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`relative inline-block text-transparent bg-clip-text ${
        disabled
          ? "text-zinc-400"
          : "bg-gradient-to-r from-zinc-200 via-white to-zinc-400 bg-[length:200%_100%] animate-[shine_4s_ease-in-out_infinite]"
      } ${className}`}
      style={{
        animationDuration: disabled ? undefined : animationDuration,
        backgroundImage: disabled
          ? undefined
          : "linear-gradient(120deg, rgba(255, 255, 255, 0.4) 20%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.4) 80%)",
      }}
    >
      {text}
    </span>
  );
}

