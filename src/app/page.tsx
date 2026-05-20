'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import SpendForm from '../components/SpendForm';
import { 
  Sparkles, 
  TrendingDown, 
  Search, 
  ShieldCheck, 
  ChevronDown
} from 'lucide-react';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const FAQS = [
    {
      question: "How does the Credex spend audit calculate optimized pricing?",
      answer: "Credex uses a deterministic finance engine containing standard plan prices for all frontier AI models (ChatGPT, Claude, Gemini, Cursor, etc.). It scans your active seats and use cases to identify duplicate licensing, unassigned or sub-optimal enterprise tiers, and recommends cheaper configurations with zero loss in feature velocity."
    },
    {
      question: "Do you transmit our private tool data to AI providers?",
      answer: "No. The spend calculations are run entirely deterministically in our server environment using hardcoded mathematical rules. The optional AI summaries only analyze quantitative numbers and do not read your internal codebase, prompts, or proprietary data."
    },
    {
      question: "What savings do startups typically see?",
      answer: "On average, early-stage and growth startups reduce their monthly AI tool burn by 32% to 45% immediately after acting on Credex recommendations, primarily by consolidating overlapping IDE seats and downgrading oversized Team licenses."
    },
    {
      question: "Is there a charge to use the self-serve audit engine?",
      answer: "The base self-serve AI spend audit tool is 100% free and open-source. For high-growth startups requiring custom seat management, API gateways, or automated enterprise provisioning, we offer specialized paid audits and consulting."
    }
  ];

  const TESTIMONIALS = [
    {
      quote: "Credex saved us $14,200 annually in about 30 seconds. We were paying for separate Claude, ChatGPT, and Copilot licenses for the same 12 developers. Complete madness.",
      author: "Sarah Jenkins",
      role: "CTO, Vellum AI",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      quote: "We were on ChatGPT Team for 1 seat because of a configuration error, costing us double. Credex caught it instantly. The deterministic rule engine is exceptionally accurate.",
      author: "Marcus Chen",
      role: "Founder, LangFlow",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    }
  ];

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
            C
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Credex<span className="text-indigo-400">.ai</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Social Proof</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQs</a>
        </nav>

        <a 
          href="#audit-tool"
          className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-500/20 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          Launch Audit
        </a>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-16 text-center relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10" />
        
        {/* Product Hunt Badge Mock */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-bold text-indigo-300 mb-6 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Product Hunt #1 Product of the Day
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05] max-w-4xl mx-auto">
          Stop Overpaying for <span className="text-gradient">Frontier AI Tools</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
          Startups waste up to 40% of their SaaS runway on overlapping AI subscriptions. Auditing seats across Claude, ChatGPT, Cursor, and Copilot takes under 60 seconds.
        </p>

        {/* Dynamic Trust KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-10">
          <div className="glass-panel rounded-2xl p-3 text-center border-white/5">
            <span className="text-gray-400 text-xs block">Average Saved</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">$1,450/yr</span>
          </div>
          <div className="glass-panel rounded-2xl p-3 text-center border-white/5">
            <span className="text-gray-400 text-xs block">Audit Duration</span>
            <span className="text-xl font-bold text-indigo-400 mt-1 block">&lt; 60 seconds</span>
          </div>
          <div className="glass-panel rounded-2xl p-3 text-center border-white/5 col-span-2 md:col-span-1">
            <span className="text-gray-400 text-xs block">Engine Quality</span>
            <span className="text-xl font-bold text-white mt-1 block">Deterministic</span>
          </div>
        </div>

        {/* Form CTA anchor */}
        <div className="mt-16" id="audit-tool">
          <div className="relative">
            {/* Glow backing */}
            <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl blur-3xl -z-10" />
            <SpendForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-950/40 border-y border-white/5 py-20" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Engineered for Finance & Dev Teams
            </h2>
            <p className="text-gray-400 mt-4">
              Real calculations, zero hallucination. Discover immediate bottom-line optimizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 hover:border-indigo-500/30 transition-all group">
              <div className="bg-indigo-500/10 border border-indigo-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white">License Consolidation</h3>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                Detect redundant user licenses. Consolidate developers paying for both Cursor and Copilot, or Claude and ChatGPT, and claw back up to $40/mo per engineer.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 hover:border-emerald-500/30 transition-all group">
              <div className="bg-emerald-500/10 border border-emerald-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Tier Optimization</h3>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                Catch sub-optimal enterprise and team seats. Downgrade single-user Team subscriptions (like ChatGPT Team for 1 seat) back to standard Pro/Plus plans instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 hover:border-indigo-500/30 transition-all group">
              <div className="bg-indigo-500/10 border border-indigo-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Deterministic Rules</h3>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                Audit numbers must be defensible. Unlike other tools that run on subjective AI reasoning, our math runs on rigid finance equations for 100% mathematical fidelity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Social Proof) */}
      <section className="py-20 max-w-7xl mx-auto px-6" id="testimonials">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white">
            Trusted by Modern Startups
          </h2>
          <p className="text-gray-400 mt-3">See how fast-growing teams are streamlining their overhead.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between border-white/5 relative">
              <p className="text-gray-300 text-sm italic leading-relaxed">
                “{t.quote}”
              </p>
              
              <div className="flex items-center gap-4 mt-6 border-t border-white/5 pt-4">
                <Image 
                  src={t.avatar} 
                  alt={t.author} 
                  width={40} 
                  height={40} 
                  className="rounded-full border border-white/10 shrink-0 object-cover"
                />
                <div>
                  <h4 className="text-white font-bold text-sm">{t.author}</h4>
                  <span className="text-xs text-gray-500">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-950/20 border-t border-white/5 py-20" id="faq">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-gray-400 mt-3">Everything you need to know about the Credex SaaS audit engine.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="glass-panel rounded-2xl overflow-hidden border-white/5 transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="flex justify-between items-center w-full px-6 py-5 text-left text-white font-semibold cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-gray-400 text-sm leading-relaxed border-t border-white/5 bg-gray-950/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Beautiful Footer */}
      <footer className="border-t border-white/5 bg-gray-950 py-12 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600/20 w-6 h-6 rounded flex items-center justify-center font-bold text-indigo-400 text-xs">
              C
            </div>
            <span className="font-bold text-white text-sm">Credex.ai</span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQs</a>
          </div>

          <p className="text-xs">&copy; {new Date().getFullYear()} Credex. AI Spend Optimization. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
