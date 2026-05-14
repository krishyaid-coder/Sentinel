import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sentinel · Enterprise situation room",
  description: "Autonomous AI agents that monitor your business, detect anomalies, and act.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} relative min-h-screen bg-transparent text-zinc-100 antialiased`}>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[#030304]" aria-hidden />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-landing-mesh" aria-hidden />
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-faint opacity-[0.14]" aria-hidden />
        {children}
      </body>
    </html>
  );
}
