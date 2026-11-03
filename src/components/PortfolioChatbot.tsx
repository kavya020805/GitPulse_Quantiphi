"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Terminal,
} from "lucide-react";

interface PortfolioChatbotProps {
  username: string;
}

interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  message: string;
}

const QUICK_PROMPTS = [
  "What are this developer's top starred projects?",
  "Summarize their primary tech stack and languages.",
  "Are they a strong fit for a Full-Stack role?",
  "How consistent is their coding streak?",
];

export function PortfolioChatbot({ username }: PortfolioChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from SQLite backend on first open or username change
  useEffect(() => {
    if (isOpen && username) {
      fetch(`/api/chat?username=${encodeURIComponent(username)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.history) && data.history.length > 0) {
            setMessages(data.history);
          } else {
            // Initial greeting if no prior conversation
            setMessages([
              {
                role: "assistant",
                message: `Hi! I am **GitPulse AI**, the portfolio intelligence agent for **@${username}**.\n\nAsk me about their repositories, primary languages, commit consistency, or tech stack alignment!`,
              },
            ]);
          }
        })
        .catch(() => {
          setMessages([
            {
              role: "assistant",
              message: `Hi! I am **GitPulse AI** for **@${username}**. Ask me about their projects and technical skills!`,
            },
          ]);
        });
    }
  }, [isOpen, username]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", message: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, message: textToSend }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", message: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            message: "I encountered an issue processing your query. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: "Network error communicating with the portfolio AI backend.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={lIdx} className="block leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-semibold text-zinc-100">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Launcher Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-900/90 text-zinc-100 border border-zinc-800 hover:border-zinc-700 shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium tracking-wide">Ask Portfolio AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[360px] sm:w-[420px] h-[550px] bg-zinc-950/95 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Chat Header */}
            <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-semibold text-zinc-100">GitPulse Portfolio AI</h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Grounded in @{username}&apos;s SQLite cache
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-3 py-2 bg-zinc-900/30 border-b border-zinc-800/60 overflow-x-auto flex gap-1.5 scrollbar-none">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 text-[11px] font-mono rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-emerald-500/40 transition shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Terminal className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-500 text-zinc-950 font-medium rounded-br-none shadow"
                        : "bg-zinc-900/80 text-zinc-200 border border-zinc-800/80 rounded-bl-none font-sans"
                    }`}
                  >
                    {renderFormattedText(msg.message)}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 items-center text-zinc-400 text-xs py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span className="font-mono text-[11px] text-zinc-500">
                    Analyzing portfolio data & generating response...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-zinc-900/50 border-t border-zinc-800/80 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask anything about @${username}...`}
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-xs bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-xl border border-zinc-800/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
