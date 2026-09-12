"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function DonorAiPage() {
  const { ready } = useAuth("DONOR");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! Ask me anything about your donor profile or donation history." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const question = input;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const data = await apiFetch("/donor/ai/ask", {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center gap-3">
        <a href="/donor/dashboard" className="text-neutral-400 hover:text-neutral-700">
          <ArrowLeft size={20} />
        </a>
        <h1 className="text-lg font-semibold text-neutral-800">Ask BloodLink AI</h1>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col gap-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === "user"
                ? "bg-brand-600 text-white self-end"
                : "bg-white border border-neutral-200 text-neutral-700 self-start"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="bg-white border border-neutral-200 text-neutral-400 text-sm rounded-2xl px-4 py-2.5 self-start">
            Thinking...
          </div>
        )}
      </main>

      <form onSubmit={handleSend} className="border-t border-neutral-200 bg-white p-4 flex gap-2 max-w-md w-full mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-3 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}