'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Check, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { AuditResult } from '../../../types';
import SavingsChart from '../../../components/SavingsChart';
import LeadCapture from '../../../components/LeadCapture';

interface AuditResultClientProps {
  audit: AuditResult;
}

export default function AuditResultClient({ audit }: AuditResultClientProps) {
  const [copied, setCopied] = useState(false);

  const {
    id,
    tools,
    teamSize,
    primaryUseCase,
    recommendations,
    aiSummary,
  } = audit;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${id}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'consolidation': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'downgrade': return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'alternative': return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
      default: return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Back button and Share Action */}
      <div className="flex justify-between items-center mb-8">
        <Link 
          href="/" 
          className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Audit Calculator
        </Link>

        <button
          onClick={handleCopyLink}
          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/20 rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Link Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy Share Link
            </>
          )}
        </button>
      </div>

      {/* Main savings header */}
      <div className="mb-10 text-center md:text-left">
        <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Audit Report Complete
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight leading-none">
          Stack Savings Analysis
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-xl">
          Deterministic recommendations generated for team of {teamSize} ({primaryUseCase} use case).
        </p>
      </div>

      {/* Reusable Charts Dashboard */}
      <div className="mb-10">
        <SavingsChart audit={audit} />
      </div>

      {/* AI personalized summary */}
      {aiSummary && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-glow rounded-3xl p-6 md:p-8 mb-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-2.5 mb-4 text-indigo-400 font-bold text-sm tracking-wide uppercase">
            <Sparkles className="w-5 h-5 animate-pulse" />
            Credex CFO Agent Summary
          </div>
          <p className="text-gray-200 text-sm md:text-base leading-relaxed font-medium">
            {aiSummary}
          </p>
        </motion.div>
      )}

      {/* Per-Tool breakdown table / list */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-white mb-4">AI Stack Breakdown</h3>
        <div className="glass-panel rounded-3xl overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-400 uppercase font-semibold">
                  <th className="px-6 py-4">Tool</th>
                  <th className="px-6 py-4">Current Plan</th>
                  <th className="px-6 py-4 text-center">Allocated Seats</th>
                  <th className="px-6 py-4 text-right">Monthly Spend</th>
                  <th className="px-6 py-4 text-right">Annual Burn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{tool.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-lg text-xs font-medium">
                        {tool.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold">{tool.seats}</td>
                    <td className="px-6 py-4 text-right font-mono font-semibold">${tool.monthlySpend.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono text-gray-400">${(tool.monthlySpend * 12).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommended actions list */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Recommended Actions</h3>
          <span className="text-xs text-gray-400 font-bold bg-white/5 border border-white/10 rounded-full px-3 py-1 uppercase tracking-wider">
            {recommendations.length} action{recommendations.length === 1 ? '' : 's'} available
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center text-gray-400">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-1">Excellent Stack Health!</h4>
            <p className="text-sm">Our audit engine found no redundancies or overpricing. You are operating at peak margin efficiency!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 hover:border-white/10 transition-all border border-white/5 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.01] rounded-full blur-3xl -z-10" />

                <div className="space-y-3 flex-grow max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-white text-lg">{rec.toolName}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wide ${getBadgeColor(rec.type)}`}>
                      {rec.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
                    <div>
                      Current: <strong className="text-gray-300 font-semibold">{rec.currentPlan}</strong>
                    </div>
                    <div>
                      Alternative: <strong className="text-emerald-400 font-bold">{rec.suggestedAlternative}</strong>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed pt-1 font-medium">
                    {rec.reason}
                  </p>
                </div>

                {/* Savings side column */}
                <div className="shrink-0 flex md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 gap-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Potential Savings</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                      +${rec.monthlySavings}/mo
                    </span>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      ${rec.annualSavings}/yr saved
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Save/Export Form and Consultation CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Export / Save form */}
        <LeadCapture 
          auditId={id || ''} 
          defaultTeamSize={teamSize}
          defaultCompanyName={audit.tools[0]?.name || ''} 
        />

        {/* Credex consultation CTA */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-gray-900/60 to-gray-900 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform" />
          
          <div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <Briefcase className="w-6 h-6 text-indigo-400" />
            </div>
            <h4 className="text-xl font-bold text-white">Schedule manual CFO optimization review</h4>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              Startups are often bound by enterprise agreements or unique pricing metrics. Our professional startup CFO team will manually audit your licensing terms, API routing architecture, and negotiate down AI provider agreements.
            </p>
          </div>

          <div className="border-t border-white/5 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xs text-gray-500 block uppercase tracking-wider">Enterprise Service</span>
              <span className="text-sm font-bold text-indigo-300">15-minute high-fidelity savings deep-dive</span>
            </div>

            <a
              href="https://calendly.com/credex-ai/spend-audit"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 flex items-center gap-2 cursor-pointer shrink-0 text-sm w-full sm:w-auto justify-center"
            >
              Consult CFO
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
