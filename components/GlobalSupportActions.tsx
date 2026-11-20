"use client";

import { useState } from "react";
import { Bell, MessageSquare } from "lucide-react";
import { AlertModal } from "@/components/landing/AlertModal";
import { LiveChatModal } from "@/components/landing/LiveChatModal";

export function GlobalSupportActions() {
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  return (
    <>
      <aside aria-label="Quick Support Actions" className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-3 z-40 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 sm:bottom-6 sm:right-6 sm:gap-3">
        <button
          type="button"
          onClick={() => setAlertModalOpen(true)}
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#7A1F14]/20 bg-white text-[#7A1F14] shadow-lg transition hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1F14]"
          title="Subscribe to free submission alerts"
          aria-label="Subscribe to free submission alerts"
        >
          <Bell className="h-5 w-5 text-[#E8710A] transition-transform group-hover:rotate-12" />
        </button>

        <button
          type="button"
          onClick={() => setChatModalOpen(true)}
          className="flex min-h-11 max-w-full items-center gap-2 rounded-full border border-white/20 bg-[#7A1F14] px-3 py-2.5 text-white shadow-xl transition hover:scale-105 hover:bg-[#60170E] hover:shadow-2xl active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1F14] sm:gap-2.5 sm:px-5 sm:py-3"
          aria-label="Chat with CEDA Consultant"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs font-bold tracking-wide">CEDA Consultant</span>
        </button>
      </aside>

      <AlertModal isOpen={alertModalOpen} onClose={() => setAlertModalOpen(false)} />
      <LiveChatModal isOpen={chatModalOpen} onClose={() => setChatModalOpen(false)} />
    </>
  );
}
