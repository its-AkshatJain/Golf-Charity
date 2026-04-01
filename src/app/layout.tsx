import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Play for Purpose — Golf Charity Platform",
  description: "Subscribe, play Stableford, and drive real charitable impact. Every round you play funds the causes that matter most.",
  openGraph: {
    title: "Play for Purpose",
    description: "Golf meets charity. Subscribe and play for change.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fcf9f2] text-[#111]">
        {children}
      </body>
    </html>
  );
}
