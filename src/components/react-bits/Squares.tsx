"use client";

import React, { useRef, useEffect } from "react";

interface SquaresProps {
  direction?: "diagonal" | "up" | "right" | "down" | "left";
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  className?: string;
}

export function Squares({
  direction = "diagonal",
  speed = 0.5,
  borderColor = "rgba(255, 255, 255, 0.04)",
  squareSize = 48,
  hoverFillColor = "rgba(16, 185, 129, 0.08)",
  className = "",
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Advance drift offset based on speed & direction
      if (direction === "diagonal") {
        offsetRef.current.x = (offsetRef.current.x + speed) % squareSize;
        offsetRef.current.y = (offsetRef.current.y + speed) % squareSize;
      } else if (direction === "right") {
        offsetRef.current.x = (offsetRef.current.x + speed) % squareSize;
      } else if (direction === "left") {
        offsetRef.current.x = (offsetRef.current.x - speed + squareSize) % squareSize;
      } else if (direction === "down") {
        offsetRef.current.y = (offsetRef.current.y + speed) % squareSize;
      } else if (direction === "up") {
        offsetRef.current.y = (offsetRef.current.y - speed + squareSize) % squareSize;
      }

      const offsetX = offsetRef.current.x;
      const offsetY = offsetRef.current.y;

      const numCols = Math.ceil(canvas.width / squareSize) + 2;
      const numRows = Math.ceil(canvas.height / squareSize) + 2;

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;

      for (let i = -1; i < numCols; i++) {
        for (let j = -1; j < numRows; j++) {
          const x = i * squareSize - (offsetX % squareSize);
          const y = j * squareSize - (offsetY % squareSize);

          // Check if mouse is hovering over this square
          if (
            mouseRef.current.x !== null &&
            mouseRef.current.y !== null &&
            mouseRef.current.x >= x &&
            mouseRef.current.x < x + squareSize &&
            mouseRef.current.y >= y &&
            mouseRef.current.y < y + squareSize
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(x, y, squareSize, squareSize);
          }

          // Subtle ambient glow on select pseudo-random grid locations
          const hash = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
          const noise = hash - Math.floor(hash);
          if (noise > 0.96) {
            ctx.fillStyle = "rgba(16, 185, 129, 0.035)";
            ctx.fillRect(x, y, squareSize, squareSize);
          } else if (noise > 0.94) {
            ctx.fillStyle = "rgba(6, 182, 212, 0.025)";
            ctx.fillRect(x, y, squareSize, squareSize);
          }

          ctx.strokeRect(x, y, squareSize, squareSize);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [direction, speed, borderColor, squareSize, hoverFillColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.28 }}
    />
  );
}

