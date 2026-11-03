"use client";

import React from "react";

interface StarBorderProps {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function StarBorder({
  as: Component = "button",
  className = "",
  color = "#10b981",
  speed = "4s",
  children,
  onClick,
}: StarBorderProps) {
  return (
    <Component
      onClick={onClick}
      className={`relative inline-flex items-center justify-center p-[1px] overflow-hidden rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {/* Animated spinning conic gradient border */}
      <span
        className="absolute inset-[-100%] animate-[spin_4s_linear_infinite]"
        style={{
          background: `conic-gradient(from 0deg, transparent 0 320deg, ${color} 340deg, #38bdf8 360deg)`,
          animationDuration: speed,
        }}
      />

      {/* Subtle outer glow layer */}
      <span
        className="absolute inset-0 rounded-full opacity-40 blur-[4px] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
      />

      {/* Inner background container */}
      <div className="relative z-10 w-full h-full rounded-full bg-zinc-950/95 backdrop-blur-md px-3.5 py-1.5 flex items-center justify-center">
        {children}
      </div>
    </Component>
  );
}

