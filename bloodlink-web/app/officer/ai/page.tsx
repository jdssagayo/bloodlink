"use client";

import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Bot, Droplet, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "How many O+ donors are available?",
  "Which barangay has the most donors?",
  "Show me rare blood type counts",
  "Any donors overdue for donation?",
];

export default function OfficerAiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendQuestion(question: string) {
    if (!question.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const data = await apiFetch("/ai/ask", {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendQuestion(input);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-6 pt-10">
          {/* Header section */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Officer Intelligence</h1>
              <p className="text-sm text-gray-400">AI Assistant · BloodLink</p>
            </div>
          </div>

          {/* Chat messages */}
          {messages.length === 0 && !loading && (
            <p className="text-sm text-gray-400 mb-6">
              Ask about donor availability, blood type trends, or recruitment stats.
            </p>
          )}

          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <div key={i} className="flex items-start gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Droplet className="text-red-600" size={16} />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl py-3 px-5 shadow-sm">
                  <p className="text-gray-700 leading-relaxed text-sm">{m.text}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-end mb-6">
                <div className="bg-red-600 rounded-2xl py-3 px-5 max-w-[80%]">
                  <p className="text-white leading-relaxed text-sm">{m.text}</p>
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="flex items-start gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <Droplet className="text-red-600" size={16} />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl py-3 px-5 shadow-sm">
                <p className="text-gray-400 text-sm">Thinking...</p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom input area */}
      <div className="max-w-3xl mx-auto w-full px-6 pb-8 pt-4">
        {messages.length === 0 && (
          <div className="flex gap-3 mb-4 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendQuestion(s)}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about donor data..."
            className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-gray-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-12 h-12 rounded-2xl bg-red-400 hover:bg-red-500 flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Send className="text-white" size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}