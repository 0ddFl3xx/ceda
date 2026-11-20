import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalSupportActions } from "@/components/GlobalSupportActions";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CEDA Innovation Portal | Citizen Entrepreneurial Development Agency",
  description: "Official digital innovation platform for Batswana youth entrepreneurs to submit, collaborate, and scale breakthrough ideas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-white text-ceda-body">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-white px-4 py-3 text-ceda-burgundy focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-2 focus:outline-ceda-burgundy"
        >
          Skip to main content
        </a>
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
        <GlobalSupportActions />
      </body>
    </html>
  );
}
