import type { Metadata } from "next";
import { Toaster } from "sonner";
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-zinc-950 text-zinc-50 antialiased min-h-screen flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(24, 24, 27, 0.95)",
              border: "1px solid rgba(63, 63, 70, 0.8)",
              color: "#fafafa",
              backdropFilter: "blur(12px)",
              fontSize: "13px",
              fontFamily: "'Inter', system-ui, sans-serif",
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
