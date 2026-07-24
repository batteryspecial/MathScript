import type { Metadata } from "next";
import { Lato, Geist } from "next/font/google";

import "./globals.css";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// Self-hosted at build time by next/font — no runtime request to Google,
// no third-party font CDN in the supply chain.
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MathScript",
  description: "The Jupyter notebook for pure mathematics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={lato.variable}>{children}</body>
    </html>
  );
}
