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
      <aside aria-label="Quick Support Actions" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={() => setAlertModalOpen(true)}
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-[#7A1F14]/20 bg-white text-[#7A1F14] shadow-lg transition hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1F14]"
          title="Subscribe to free submission alerts"
          aria-label="Free submission alerts"
        >
          <Bell className="h-5 w-5 text-[#E8710A] transition-transform group-hover:rotate-12" />
        </button>

        <button
          type="button"
          onClick={() => setChatModalOpen(true)}
          className="flex items-center gap-2.5 rounded-full border border-white/20 bg-[#7A1F14] px-5 py-3 text-white shadow-xl transition hover:scale-105 hover:bg-[#60170E] hover:shadow-2xl active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1F14]"
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
