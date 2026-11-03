"use client";

export function DotGridBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle, #a1a1aa 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
    </div>
  );
}
