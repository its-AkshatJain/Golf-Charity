import type { Metadata } from "next";
import { Montserrat, DM_Sans } from "next/font/google";
import "./globals.css";

// DM Sans — geometric, clean, slightly wide. Used for headings & UI labels.
const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Montserrat — humanist, readable. Used for body copy & descriptive text.
const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Play for Purpose — Golf Charity Platform",
  description:
    "Subscribe, play Stableford, and drive real charitable impact. Every round you play funds the causes that matter most.",
  openGraph: {
    title: "Play for Purpose",
    description: "Golf meets charity. Subscribe and play for change.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${montserrat.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#f8f5ef] text-[#0d0d0d]">
        {children}
      </body>
    </html>
  );
}
