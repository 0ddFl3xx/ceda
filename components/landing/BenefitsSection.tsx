"use client";

import type { ComponentType } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  AdvisorChatIllustration,
  FairReviewIllustration,
  FeedbackLoopIllustration,
  FundingIllustration,
} from "@/components/landing/BenefitsIllustrations";

type BentoArea = "funding" | "review" | "feedback" | "advisors";

interface BenefitCardItem {
  id: BentoArea;
  title: string;
  description: string;
  Illustration: ComponentType;
}

const benefits: BenefitCardItem[] = [
  {
    id: "funding",
    title: "Access to business funding",
    description:
      "Approved ideas can qualify for CEDA loans, innovation grants, and business support to help you launch and grow across Botswana.",
    Illustration: FundingIllustration,
  },
  {
    id: "review",
    title: "Fair review by experienced reviewers",
    description:
      "Experienced reviewers score your idea using clear standards: whether it can work, whether customers need it, and how it helps Botswana.",
    Illustration: FairReviewIllustration,
  },
  {
    id: "feedback",
    title: "Helpful feedback and a chance to improve",
    description:
      "If reviewers see something missing, your application is not simply rejected. You get clear notes and can submit an improved version right in the portal.",
    Illustration: FeedbackLoopIllustration,
  },
  {
    id: "advisors",
    title: "Direct help from CEDA advisors",
    description:
      "Chat with a CEDA advisor during working hours if you have questions about who can apply, what documents you need, or how to prepare.",
    Illustration: AdvisorChatIllustration,
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function BenefitsSection() {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <section
      id="benefits"
      className="relative overflow-clip bg-[#FFF7F0] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-345">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-sm font-semibold text-[#E8710A]">
              What you get when you apply
            </p>
            <h2 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-black leading-[1.06] tracking-[-0.03em] text-[#331F17]">
              More than an application form. Real support to help your business
              grow.
            </h2>
          </div>

          <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:items-end">
            <p className="max-w-md text-sm leading-7 text-[#573E32] sm:text-base lg:text-right">
              Every idea goes through a clear process designed to strengthen
              your plan and connect strong businesses with funding and advice.
            </p>
          </div>
        </div>

        {/* Unified Asymmetric Bento Grid */}
        <div className="benefits-bento-grid mt-12 lg:mt-14">
          {benefits.map((item, idx) => {
            const Illustration = item.Illustration;

            return (
              <motion.article
                key={item.id}
                data-bento-area={item.id}
                initial={prefersReduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: 0.55,
                  delay: idx * 0.08,
                  ease,
                }}
                className="benefits-bento-card group relative rounded-2xl border border-[#7A1F14]/12 bg-white text-[#331F17] transition-[border-color,box-shadow] duration-200 hover:border-[#7A1F14]/24 hover:shadow-[0_10px_28px_rgba(51,31,23,0.06)]">
                <div className="benefits-bento-card-inner p-6 sm:p-7">
                  <div className="benefits-bento-visual flex flex-col">
                    <Illustration />
                  </div>

                  <div className="benefits-bento-body">
                    <h3 className="text-lg font-bold leading-snug tracking-tight text-[#331F17] sm:text-xl">
                      {item.title}
                    </h3>

                    <p className="mt-2.5 max-w-xl text-sm leading-7 text-[#573E32]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
