"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, ArrowDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative isolate mx-3 my-4 flex min-h-[min(100dvh,720px)] max-w-[1380px] flex-col justify-center overflow-hidden rounded-2xl border border-[#7A1F14]/10 bg-gradient-to-b from-[#FFF6EE] via-[#FFF0E2] to-[#F6DCCB] px-4 sm:mx-6 sm:my-6 sm:px-8 lg:mx-auto lg:min-h-[min(76dvh,760px)] lg:px-12">
      
      {/* =========================================================================
          BACKGROUND GRAPHICAL PATTERNS (Sampled from Reference)
      ========================================================================== */}
      {/* 1. Dotted pattern in top-left corner */}
      <div 
        className="pointer-events-none absolute left-0 top-0 h-56 w-56 opacity-20 sm:h-80 sm:w-80 sm:opacity-40"
        style={{
          backgroundImage: `radial-gradient(#7A1F14 1.2px, transparent 1.2px)`,
          backgroundSize: "20px 20px"
        }}
      />

      {/* 2. Soft blurred warmth radial glow behind the hero */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#E8710A]/15 blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[450px] h-[450px] rounded-full bg-[#F4B58A]/30 blur-[90px] pointer-events-none" />

      {/* Warm light behind the decorative GIF */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[72%] md:block"
        style={{
          background:
            "radial-gradient(ellipse at 70% 48%, rgba(244, 181, 138, 0.4) 0%, transparent 70%)",
        }}
      />

      {/* 3. Diagonal line pattern in bottom-left corner */}
      <div 
        className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 opacity-[0.04] sm:h-64 sm:w-64 sm:opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #7A1F14, #7A1F14 1.5px, transparent 1.5px, transparent 14px)`
        }}
      />

      {/* 4. Diagonal line pattern in bottom-right corner */}
      <div 
        className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 opacity-[0.08] sm:h-72 sm:w-72 sm:opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, #E8710A, #E8710A 1.5px, transparent 1.5px, transparent 16px)`
        }}
      />

      {/* Decorative hero animation, blended into the existing background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[68%] overflow-hidden opacity-30 mix-blend-multiply md:block"
      >
        <Image
          src="/assets/hero-animation.webp"
          alt=""
          width={800}
          height={533}
          unoptimized
          className="h-full w-full scale-110 object-cover object-center sepia-[.12] saturate-[.85]"
          style={{
            maskImage:
              "radial-gradient(ellipse 56% 58% at 76% 42%, #000 18%, rgb(0 0 0 / 72%) 58%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 56% 58% at 76% 42%, #000 18%, rgb(0 0 0 / 72%) 58%, transparent 100%)",
          }}
        />
      </div>

      {/* =========================================================================
          MAIN HERO CONTENT (Vertically Centered, Left Aligned)
      ========================================================================== */}
      <div className="relative mx-auto w-full max-w-7xl py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="z-10 space-y-5 text-center lg:col-span-7 lg:space-y-6 lg:text-left xl:col-span-6">
            {/* Large Two-Tone Headline (Reference Match: "COMPETITION / HACKATHON") */}
            <h1 className="text-[clamp(2.35rem,11vw,3.75rem)] font-black leading-[0.92] tracking-tight lg:text-[72px]">
              <span className="block text-[#7A1F14]">INNOVATION</span>
              <span className="block text-[#E8710A] mt-1.5">PORTAL</span>
            </h1>

            {/* Subheading in bold */}
            <h2 className="text-lg font-black tracking-tight text-[#37231A] sm:text-2xl">
              Innovate. Build. Transform.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#573E32] leading-relaxed max-w-lg mx-auto lg:mx-0">
              The official Citizen Entrepreneurial Development Agency digital gateway. Submit pioneering solutions, collaborate with expert evaluators, and unlock funding to drive Botswana’s economic transformation.
            </p>

            {/* Primary routes */}
            <div className="flex flex-col items-center justify-center gap-3.5 pt-2 sm:flex-row lg:justify-start">
              <Link
                href="/submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#7A1F14] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#7A1F14]/25 hover:bg-[#60170E] hover:shadow-xl active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1F14]"
              >
                <span>Submit Idea</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/track"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#7A1F14]/30 bg-white/70 backdrop-blur-sm px-6 py-3.5 text-sm font-bold text-[#7A1F14] hover:bg-white hover:border-[#7A1F14] transition shadow-sm"
              >
                <Search className="h-4 w-4 text-[#7A1F14]" />
                <span>Track Submission</span>
              </Link>
            </div>
          </div>

          {/* Right Column spacer preserves the existing hero text layout */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6" aria-hidden="true" />

        </div>
      </div>

      {/* =========================================================================
          SCROLL-DOWN ARROW (Centred at bottom with gentle bounce)
      ========================================================================== */}
      <Link
        href="/#featured-announcements"
        aria-label="Scroll down"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#7A1F14] text-[#7A1F14] hover:bg-[#7A1F14] hover:text-white transition shadow-sm animate-scroll-bounce focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1F14]"
      >
        <ArrowDown className="h-4 w-4" />
      </Link>

    </section>
  );
}
