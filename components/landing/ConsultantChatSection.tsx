"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Clock, Calendar, AlertCircle, Send } from "lucide-react";

interface ConsultantChatSectionProps {
  onOpenChatModal?: () => void;
}

export function ConsultantChatSection({ onOpenChatModal }: ConsultantChatSectionProps) {
  const [isWithinHours, setIsWithinHours] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  // Check CEDA service consultant operating hours: 09:00 - 16:00 CAT, Mon - Fri
  useEffect(() => {
    const checkOperatingHours = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Africa/Gaborone",
        hour: "2-digit",
        minute: "2-digit",
        weekday: "short",
        hour12: false,
      };
      const formatter = new Intl.DateTimeFormat("en-GB", options);
      setCurrentTimeStr(formatter.format(now));

      const catDate = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Gaborone" }));
      const day = catDate.getDay();
      const hour = catDate.getHours();

      const isWeekday = day >= 1 && day <= 5;
      const isOperatingHour = hour >= 9 && hour < 16;
      setIsWithinHours(isWeekday && isOperatingHour);
    };

    checkOperatingHours();
    const interval = setInterval(checkOperatingHours, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="support" className="py-20 bg-[#FFF3E8]/80 border-b border-[#7A1F14]/15">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF0E2] border border-[#7A1F14]/20 px-3.5 py-1 text-xs font-bold text-[#7A1F14]">
              <MessageSquare className="h-3.5 w-3.5 text-[#E8710A]" />
              <span>CEDA Advisory & Submission Desk</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#37231A] tracking-tight">
              Real-Time Guidance From CEDA Consultants
            </h2>

            <p className="text-sm sm:text-base text-[#573E32] leading-relaxed">
              Have questions about eligibility, application requirements, or proposal preparation? Connect directly with a CEDA innovation consultant during your submission process.
            </p>

            {/* Operating Hours Box */}
            <div className="rounded-3xl border border-[#7A1F14]/15 bg-white p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#7A1F14]/10">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#E8710A]" />
                  <span className="text-sm font-bold text-[#37231A]">Consultant Desk Schedule</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isWithinHours ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                  <span className={`text-xs font-bold ${isWithinHours ? "text-emerald-800" : "text-[#573E32]"}`}>
                    {isWithinHours ? "Online Now (09:00 - 16:00 CAT)" : "Currently Offline (After Hours)"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#573E32]">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-[#7A1F14]/60 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#37231A] block">Working Days Only:</strong>
                    <span>Monday to Friday (Excluding Public Holidays)</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-[#7A1F14]/60 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#37231A] block">Current Gaborone Time:</strong>
                    <span>{currentTimeStr || "09:00 - 16:00 CAT"}</span>
                  </div>
                </div>
              </div>

              {!isWithinHours && (
                <div className="flex items-center gap-2.5 rounded-2xl bg-[#FFF0E2] border border-[#7A1F14]/20 p-3.5 text-xs text-[#7A1F14]">
                  <AlertCircle className="h-4 w-4 text-[#E8710A] shrink-0" />
                  <span className="font-medium">
                    Our consultants are presently offline. You can still leave a message or explore our instant FAQs below.
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenChatModal}
                className="inline-flex items-center gap-2 rounded-full bg-[#7A1F14] px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#7A1F14]/20 hover:bg-[#60170E] transition active:scale-95"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Start Live Conversation</span>
              </button>
              <a
                href="#faqs"
                className="text-xs sm:text-sm font-bold text-[#7A1F14] hover:text-[#E8710A] transition"
              >
                Browse Common FAQs →
              </a>
            </div>

          </div>

          {/* Right Simulated Live Chat Preview Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-[#7A1F14]/20 bg-white shadow-2xl overflow-hidden">
              
              {/* Chat Header */}
              <div className="bg-[#7A1F14] px-6 py-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-[#F4B58A] text-[#7A1F14] flex items-center justify-center font-bold text-sm">
                      CK
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#7A1F14]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">CEDA Advisory Agent</p>
                    <p className="text-[11px] text-[#F4B58A] opacity-90">Enterprise Innovation Support</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full">
                  Live Desk
                </span>
              </div>

              {/* Chat Body Mock */}
              <div className="p-6 space-y-4 bg-[#FFF9F4] text-xs min-h-[260px] flex flex-col justify-end">
                {/* Agent Bubble */}
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-none bg-white p-3.5 shadow-sm border border-[#7A1F14]/10 text-[#37231A] space-y-1">
                    <p className="font-bold text-[#7A1F14] text-[11px]">
                      CEDA Consultant Desk
                    </p>
                    <p className="leading-relaxed">
                      Dumela! Welcome to the CEDA Innovation Portal. Are you applying as a 100% citizen youth enterprise or preparing a cooperative submission?
                    </p>
                    <span className="block text-[10px] text-[#573E32]/60 text-right">09:14 AM</span>
                  </div>
                </div>

                {/* User Bubble */}
                <div className="flex items-start justify-end gap-2.5 max-w-[85%] ml-auto">
                  <div className="rounded-2xl rounded-tr-none bg-[#7A1F14] text-white p-3.5 shadow-sm space-y-1">
                    <p className="leading-relaxed">
                      Dumela! We are a 2-person youth tech startup from Gaborone. We have a software prototype for smart farming.
                    </p>
                    <span className="block text-[10px] text-[#F4B58A] text-right">09:15 AM</span>
                  </div>
                </div>

                {/* System Notice */}
                <div className="text-center py-1">
                  <span className="text-[10px] font-medium text-[#7A1F14] bg-[#FFF0E2] px-3.5 py-1 rounded-full border border-[#7A1F14]/10">
                    Conversation logged securely under Data Protection Act 2024
                  </span>
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3.5 bg-white border-t border-[#7A1F14]/10 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your question for a consultant..."
                  className="flex-1 rounded-full bg-[#FFF9F4] border border-[#7A1F14]/15 px-4 py-2.5 text-xs text-[#37231A] placeholder:text-[#573E32]/60 focus:outline-none focus:ring-2 focus:ring-[#7A1F14]"
                  readOnly
                  onClick={onOpenChatModal}
                />
                <button
                  type="button"
                  onClick={onOpenChatModal}
                  className="h-9 w-9 rounded-full bg-[#7A1F14] text-white flex items-center justify-center hover:bg-[#60170E] transition shrink-0 shadow-sm"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
