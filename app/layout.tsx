import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "publisher-platform - Share Your Stories",
  description: "A platform for sharing ideas, stories, and knowledge",
  openGraph: {
    title: "publisher-platform- Share Your Stories",
    description: "A platform for sharing ideas, stories, and knowledge",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-8 bg-gradient-to-b from-white via-blue-50/20 to-indigo-50/20 overflow-visible">
              {children}
            </main>
            <Footer />
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}


