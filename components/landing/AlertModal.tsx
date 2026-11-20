"use client";

import { useState } from "react";
import { X, Bell, CheckCircle2, ShieldCheck } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertModal({ isOpen, onClose }: AlertModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [refNo, setRefNo] = useState("");
  const [contact, setContact] = useState("");
  const [channel, setChannel] = useState<"both" | "sms" | "email">("both");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#37231A]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#FFF9F4] border border-[#7A1F14]/20 p-6 sm:p-8 shadow-2xl text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-[#573E32] hover:text-[#7A1F14] hover:bg-[#FFF0E2] transition"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0E2] text-[#7A1F14] mb-4 border border-[#7A1F14]/15">
              <Bell className="h-6 w-6 text-[#E8710A]" />
            </div>

            <h3 id="alert-modal-title" className="text-xl font-black text-[#37231A]">
              Subscribe to Free Submission Alerts
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#573E32] leading-relaxed">
              Stay informed as your proposal progresses through screening, evaluation, revision requests, and final adjudication.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#37231A] mb-1">
                  Idea Reference Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CEDA-2026-0001"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="w-full rounded-2xl border border-[#7A1F14]/20 bg-white px-4 py-2.5 text-xs text-[#37231A] placeholder:text-[#573E32]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1F14]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#37231A] mb-1">
                  Email Address or Botswana Phone (+267) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="user@example.com or +267 71 234 567"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-2xl border border-[#7A1F14]/20 bg-white px-4 py-2.5 text-xs text-[#37231A] placeholder:text-[#573E32]/50 focus:outline-none focus:ring-2 focus:ring-[#7A1F14]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#37231A] mb-1.5">
                  Notification Channel
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setChannel("both")}
                    className={`rounded-xl py-2 px-3 border text-center font-bold transition ${
                      channel === "both"
                        ? "border-[#7A1F14] bg-[#7A1F14] text-white shadow-sm"
                        : "border-[#7A1F14]/20 bg-white text-[#573E32]"
                    }`}
                  >
                    SMS & Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel("email")}
                    className={`rounded-xl py-2 px-3 border text-center font-bold transition ${
                      channel === "email"
                        ? "border-[#7A1F14] bg-[#7A1F14] text-white shadow-sm"
                        : "border-[#7A1F14]/20 bg-white text-[#573E32]"
                    }`}
                  >
                    Email Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel("sms")}
                    className={`rounded-xl py-2 px-3 border text-center font-bold transition ${
                      channel === "sms"
                        ? "border-[#7A1F14] bg-[#7A1F14] text-white shadow-sm"
                        : "border-[#7A1F14]/20 bg-white text-[#573E32]"
                    }`}
                  >
                    SMS Only
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#573E32]">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Zero charge. Unsubscribe anytime in accordance with DPA 2024.</span>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#7A1F14] py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#60170E] transition shadow-md active:scale-[0.98]"
              >
                Activate Free Alerts
              </button>
            </form>
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-[#37231A]">
              Alerts Activated!
            </h3>
            <p className="text-xs sm:text-sm text-[#573E32] leading-relaxed">
              We have linked <strong>{contact}</strong> to automatic milestone notifications. You will receive updates at zero cost whenever an action is performed on your proposal.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-full bg-[#7A1F14] text-white px-8 py-2.5 text-xs font-bold hover:bg-[#60170E] transition shadow"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
