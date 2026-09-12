"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronDown,
  MessageCircle,
  Phone,
  Mail,
  Send,
  X,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { FAQS, SCENT_FAMILIES } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

const QUICK_REPLIES = [
  "Where is my order?",
  "What's your return policy?",
  "Are your perfumes authentic?",
  "How do I track my order?",
  "Do you ship internationally?",
];

const KNOWLEDGE_BASE: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["track", "tracking", "where", "order status", "shipped"],
    reply: "You can track your order from your account dashboard under 'Orders'. Once your order ships, you'll also receive a tracking number via email.",
  },
  {
    keywords: ["return", "refund"],
    reply: "We accept returns of unopened items within 30 days. For hygiene reasons, opened fragrances are non-returnable unless damaged. Email us at returns@perfumeria.com to start a return.",
  },
  {
    keywords: ["authentic", "real", "genuine", "fake"],
    reply: "100% of our fragrances are sourced directly from brands or authorized distributors. Every order ships with a certificate of authenticity and our 100% money-back guarantee.",
  },
  {
    keywords: ["shipping", "delivery"],
    reply: "US orders ship free over $75 and arrive in 3-5 business days. International orders typically arrive in 7-14 business days.",
  },
  {
    keywords: ["international", "country"],
    reply: "We ship to 75+ countries. International shipping rates and delivery times are calculated at checkout based on your address.",
  },
  {
    keywords: ["price", "match", "discount"],
    reply: "We don't currently offer price matching, but we run frequent member-only sales. Subscribe to our newsletter or follow us on social for the latest deals.",
  },
  {
    keywords: ["size", "how to choose", "concentration"],
    reply: "EDT (Eau de Toilette) is light and refreshing (5-15% oil). EDP (Eau de Parfum) is more concentrated (15-20%) and longer-lasting. Parfum is the richest (20-30%). For everyday, EDP is a great balance.",
  },
  {
    keywords: ["sample", "test"],
    reply: "We include free samples with every order. You can also try our Discovery Sets — curated 5x10ml sets starting at $95 — to sample before committing to a full bottle.",
  },
  {
    keywords: ["contact", "phone", "email", "support", "human"],
    reply: "I can help with most questions, but if you need a human, email us at hello@perfumeria.com or call +1 (555) 012-3456, Mon-Fri 9am-6pm EST.",
  },
  {
    keywords: ["payment", "card", "paypal", "apple pay"],
    reply: "We accept all major credit cards, Apple Pay, Google Pay, and Cash on Delivery in select regions.",
  },
];

export default function SupportPage() {
  const [openChat, setOpenChat] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>("0-0");
  const [search, setSearch] = useState("");

  const filteredFaqs = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (f) =>
        !search ||
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((c) => c.items.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <p className="eyebrow mb-2">We're here to help</p>
        <h1 className="font-display text-5xl mb-3">Customer Support</h1>
        <p className="text-[var(--color-ink-soft)] max-w-xl mx-auto">
          Find answers, chat with our concierge, or get in touch.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        <button
          onClick={() => setOpenChat(true)}
          className="bg-[var(--color-bg-alt)] p-6 text-left hover:bg-[var(--color-line)]/30 transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-[var(--color-gold-dark)] mb-3" />
          <h3 className="font-display text-xl mb-1">Live chat</h3>
          <p className="text-sm text-[var(--color-ink-soft)]">
            Chat with our fragrance concierge. Usually replies in under 2 minutes.
          </p>
        </button>
        <a
          href="mailto:hello@perfumeria.com"
          className="bg-[var(--color-bg-alt)] p-6 text-left hover:bg-[var(--color-line)]/30 transition-colors"
        >
          <Mail className="w-6 h-6 text-[var(--color-gold-dark)] mb-3" />
          <h3 className="font-display text-xl mb-1">Email us</h3>
          <p className="text-sm text-[var(--color-ink-soft)]">
            hello@perfumeria.com — typical reply within 24 hours.
          </p>
        </a>
        <div className="bg-[var(--color-bg-alt)] p-6">
          <Phone className="w-6 h-6 text-[var(--color-gold-dark)] mb-3" />
          <h3 className="font-display text-xl mb-1">Call us</h3>
          <p className="text-sm text-[var(--color-ink-soft)]">
            +1 (555) 012-3456 · Mon-Fri 9am-6pm EST
          </p>
        </div>
      </div>

      {/* Trust strip */}
      <div className="grid sm:grid-cols-3 gap-6 mb-12 p-6 bg-[var(--color-oud)] text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--color-gold-light)]" />
          <div>
            <p className="font-medium text-sm">100% Authentic</p>
            <p className="text-xs text-white/60">Certificate included</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-[var(--color-gold-light)]" />
          <div>
            <p className="font-medium text-sm">Free US shipping</p>
            <p className="text-xs text-white/60">On orders over $75</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RotateCcw className="w-5 h-5 text-[var(--color-gold-light)]" />
          <div>
            <p className="font-medium text-sm">30-day returns</p>
            <p className="text-xs text-white/60">Unopened items only</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section id="faq" className="mb-12">
        <h2 className="font-display text-3xl mb-6">Frequently asked</h2>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="input pl-10"
          />
        </div>
        <div className="space-y-8">
          {filteredFaqs.map((cat, ci) => (
            <div key={cat.category}>
              <h3 className="eyebrow mb-3">{cat.category}</h3>
              <div className="border-t border-[var(--color-line)]">
                {cat.items.map((item, ii) => {
                  const key = `${ci}-${ii}`;
                  const open = openFaq === key;
                  return (
                    <div key={ii} className="border-b border-[var(--color-line)]">
                      <button
                        onClick={() => setOpenFaq(open ? null : key)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-[var(--color-bg-alt)]"
                      >
                        <span className="font-medium pr-4">{item.q}</span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 shrink-0 transition-transform",
                            open && "rotate-180"
                          )}
                        />
                      </button>
                      {open && (
                        <div className="px-4 pb-4 text-[var(--color-ink-soft)] leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scent guide */}
      <section id="scent-guide" className="mt-20">
        <h2 className="font-display text-3xl mb-3">Scent Family Guide</h2>
        <p className="text-[var(--color-ink-soft)] mb-8 max-w-2xl">
          Every fragrance belongs to a scent family. Learn what each one smells
          like to find what resonates with you.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {SCENT_FAMILIES.map((f) => (
            <div
              key={f.id}
              className="p-5 border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{f.emoji}</div>
                <div>
                  <h3 className="font-display text-xl mb-1">{f.label}</h3>
                  <p className="text-sm text-[var(--color-ink-soft)]">
                    {f.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {openChat && <ChatBot onClose={() => setOpenChat(false)} />}
    </div>
  );
}

function ChatBot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "0",
      from: "bot",
      text: "Hi! I'm Liora, your fragrance concierge. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      from: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    setTimeout(() => {
      const lower = text.toLowerCase();
      const match = KNOWLEDGE_BASE.find((k) =>
        k.keywords.some((kw) => lower.includes(kw))
      );
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: "bot",
        text: match
          ? match.reply
          : "I'm not sure I have a great answer for that. Let me connect you with a human — email hello@perfumeria.com and we'll get back to you within 24 hours.",
        timestamp: new Date().toISOString(),
      };
      setMessages((m) => [...m, reply]);
    }, 600);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-[var(--color-bg)] border border-[var(--color-line)] shadow-2xl flex flex-col max-h-[80vh] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-[var(--color-ink)] text-[var(--color-bg)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-white text-sm font-display">
            L
          </div>
          <div>
            <p className="font-medium text-sm">Liora</p>
            <p className="text-[10px] text-white/60">Fragrance concierge</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close chat">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--color-bg-alt)]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[80%] p-3 text-sm",
              m.from === "user"
                ? "ml-auto bg-[var(--color-ink)] text-[var(--color-bg)] rounded-2xl rounded-tr-sm"
                : "bg-[var(--color-bg)] border border-[var(--color-line)] rounded-2xl rounded-tl-sm"
            )}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="p-3 border-t border-[var(--color-line)] flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-xs px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-line)] hover:border-[var(--color-gold)]"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 border-t border-[var(--color-line)] flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="input flex-1 text-sm"
        />
        <button
          type="submit"
          className="btn btn-primary px-3"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
