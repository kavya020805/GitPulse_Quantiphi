import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitPulse — AI-Powered GitHub Developer Portfolio & Compatibility Engine",
  description:
    "Full-stack developer branding dashboard, SQLite caching engine, and AI Tech Stack Vibe Check.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
