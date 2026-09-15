"use client";

import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Bot, Droplet, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Summarize recent audit logs",
  "Show user role distribution",
  "How many new donors this week?",
  "Check system security events",
];

export default function AdminAIPage() {
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
      // Ensure this endpoint exists in your AdminController or GeminiService
      const data = await apiFetch("/admin/ai/ask", {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I am currently unable to reach the server. Please check your backend connection." }]);
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
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">Admin Intelligence</h1>
              <p className="text-sm text-gray-400 mt-0.5">AI Assistant · BloodLink</p>
            </div>
          </div>

          {/* Chat messages */}
          {messages.length === 0 && !loading && (
            <p className="text-sm text-gray-400 mb-6 bg-white border border-gray-200 rounded-2xl py-4 px-5 shadow-sm inline-block">
              Hello, Admin! I can answer questions about user management, role changes, audit log summaries, donation statistics, and system security. What do you need?
            </p>
          )}

          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <div key={i} className="flex items-start gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-1">
                  <Droplet className="text-red-500" size={16} />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm py-3 px-5 shadow-sm max-w-[85%]">
                  <p className="text-gray-700 leading-relaxed text-[15px]">{m.text}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-end mb-6">
                <div className="bg-red-600 rounded-2xl rounded-tr-sm py-3 px-5 max-w-[80%] shadow-sm">
                  <p className="text-white leading-relaxed text-[15px]">{m.text}</p>
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="flex items-start gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-1">
                <Droplet className="text-red-500" size={16} />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm py-4 px-5 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></span>
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Bottom input area */}
      <div className="max-w-3xl mx-auto w-full px-6 pb-8 pt-2 flex-shrink-0">
        {messages.length === 0 && (
          <div className="flex gap-3 mb-4 flex-wrap">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendQuestion(s)}
                className="bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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
            disabled={loading}
            placeholder="Ask a question..."
            className="flex-1 bg-white border border-gray-200 shadow-sm rounded-full px-5 h-12 text-[15px] text-gray-900 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-xl bg-[#f87171] hover:bg-red-500 shadow-sm flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-[#f87171] flex-shrink-0"
          >
            <Send className="text-white ml-0.5" size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}