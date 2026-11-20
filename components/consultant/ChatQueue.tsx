"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

type ChatMessage = { id: string; senderId: string; senderName: string; body: string; createdAt: string };
type Conversation = { id: string; requesterId: string; agentId: string | null; status: "waiting" | "active" | "closed"; startedAt: string };
type ChatData = { conversation: Conversation | null; messages: ChatMessage[]; currentUserId: string; isConsultantOpen: boolean };

export function ChatQueue({ conversations }: { conversations: Conversation[] }) {
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? "");
  const [chat, setChat] = useState<ChatData | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!selectedId) return;
    const response = await fetch(`/api/chat?conversationId=${encodeURIComponent(selectedId)}`, { cache: "no-store" }).catch(() => null);
    const data = await response?.json().catch(() => null);
    if (!response?.ok || !data) { setError(data?.error ?? "Could not load this conversation."); return; }
    setChat(data as ChatData);
    setError("");
  }, [selectedId]);

  useEffect(() => {
    let active = true;
    const poll = () => {
      if (!selectedId) return;
      void fetch(`/api/chat?conversationId=${encodeURIComponent(selectedId)}`, { cache: "no-store" })
        .then(async (response) => ({ response, data: await response.json().catch(() => null) }))
        .then(({ response, data }) => {
          if (!active) return;
          if (!response.ok || !data) { setError(data?.error ?? "Could not load this conversation."); return; }
          setChat(data as ChatData);
          setError("");
        })
        .catch(() => { if (active) setError("Could not load this conversation."); });
    };
    queueMicrotask(poll);
    const timer = window.setInterval(poll, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [selectedId]);

  async function act(action: "claim" | "close" | "message", body?: string) {
    setBusy(true); setError("");
    const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, conversationId: selectedId, ...(body ? { body } : {}) }) }).catch(() => null);
    const data = await response?.json().catch(() => null);
    setBusy(false);
    if (!response?.ok) { setError(data?.error ?? "The chat action failed."); await refresh(); return false; }
    await refresh();
    return true;
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || busy) return;
    if (await act("message", message.trim())) setMessage("");
  }

  const selected = conversations.find((item) => item.id === selectedId);
  const assignedToMe = chat?.conversation?.agentId === chat?.currentUserId;

  return <div className="mt-7 grid gap-5 lg:grid-cols-[300px_1fr]">
    <nav aria-label="Consultant chat queue" className="space-y-2">
      {conversations.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} aria-pressed={item.id === selectedId} className={`w-full rounded-xl border p-4 text-left ${item.id === selectedId ? "border-ceda-burgundy bg-[#FFF9F4]" : "border-ceda-line bg-white"}`}>
        <span className="block text-xs font-bold uppercase tracking-wide text-ceda-burgundy">{item.status} {item.agentId ? "· assigned" : "· waiting"}</span>
        <span className="mt-1 block text-xs text-ceda-muted">Started {new Date(item.startedAt).toLocaleString("en-BW", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Gaborone" })}</span>
      </button>)}
      {!conversations.length && <p className="rounded-xl bg-[#FFF9F4] p-4 text-sm text-ceda-muted">The queue is empty.</p>}
    </nav>

    <section aria-label="Selected conversation" className="flex min-h-[480px] flex-col rounded-2xl border border-ceda-line bg-white">
      {!selected ? <p className="m-auto p-6 text-sm text-ceda-muted">Select a conversation to view it.</p> : <>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ceda-line p-4"><div><h2 className="font-bold text-ceda-ink">Consultant conversation</h2><p className="text-xs capitalize text-ceda-muted">{chat?.conversation?.status ?? selected.status}</p></div>
          {chat?.conversation?.status === "waiting" && !chat.conversation.agentId && <button type="button" onClick={() => void act("claim")} disabled={busy} className="min-h-10 rounded-full bg-ceda-burgundy px-4 text-sm font-bold text-white disabled:opacity-60">Claim chat</button>}
          {assignedToMe && chat?.conversation?.status === "active" && <button type="button" onClick={() => void act("close")} disabled={busy} className="min-h-10 rounded-full border border-ceda-line px-4 text-sm font-semibold text-ceda-burgundy disabled:opacity-60">Close chat</button>}
        </header>
        {error && <p role="alert" className="border-b border-red-800/20 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>}
        <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite" aria-label="Conversation messages">
          {chat?.messages.map((item) => <article key={item.id} className={`max-w-[85%] rounded-xl p-3 ${item.senderId === chat.currentUserId ? "ml-auto bg-[#7A1F14] text-white" : "border border-ceda-line bg-[#FFF9F4] text-ceda-ink"}`}><p className="text-xs font-semibold">{item.senderName}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{item.body}</p><time className="mt-1 block text-right text-[10px] opacity-70" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleTimeString("en-BW", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Gaborone" })}</time></article>)}
          {chat && chat.messages.length === 0 && <p className="text-sm text-ceda-muted">No messages have been sent yet.</p>}
        </div>
        {assignedToMe && chat?.conversation?.status === "active" && <form onSubmit={send} className="flex gap-2 border-t border-ceda-line p-3"><label htmlFor="consultant-reply" className="sr-only">Reply to requester</label><input id="consultant-reply" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} required className="min-h-11 flex-1 rounded-lg border border-ceda-line px-3 text-sm" placeholder="Write a reply" /><button type="submit" disabled={busy || !message.trim()} className="min-h-11 rounded-full bg-ceda-burgundy px-4 text-sm font-bold text-white disabled:opacity-60">Send</button></form>}
      </>}
    </section>
  </div>;
}
