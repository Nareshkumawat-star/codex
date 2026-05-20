'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { AuditResult } from '../../../types';
import SavingsChart from '../../../components/SavingsChart';

interface ShareClientProps {
  audit: AuditResult;
}

export default function ShareClient({ audit }: ShareClientProps) {
  const {
    tools,
    teamSize,
    primaryUseCase,
    recommendations,
    aiSummary,
  } = audit;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-12">
      {/* Share header */}
      <div className="text-center mb-10">
        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Shared AI Spend Audit
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight leading-none">
          Stack Optimization Results
        </h2>
        <p className="text-gray-400 text-sm mt-3 max-w-xl mx-auto">
          Public, secure report breakdown for a {teamSize}-seat workspace utilizing AI for {primaryUseCase}.
        </p>
      </div>

      {/* Reusable Comparative Chart */}
      <div className="mb-10">
        <SavingsChart audit={audit} />
      </div>

      {/* AI personalized summary */}
      {aiSummary && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 md:p-8 mb-10 border-white/5 bg-gray-900/30 relative"
        >
          <div className="flex items-center gap-2 mb-3 text-indigo-400 font-bold text-xs tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            CFO Agent Overview
          </div>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            {aiSummary}
          </p>
        </motion.div>
      )}

      {/* Tools Table */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-white mb-4">Audited Tooling Stack</h3>
        <div className="glass-panel rounded-3xl overflow-hidden border-white/5">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs text-gray-400 uppercase font-semibold">
                <th className="px-6 py-4">Tool</th>
                <th className="px-6 py-4">Plan Name</th>
                <th className="px-6 py-4 text-center">Allocated Seats</th>
                <th className="px-6 py-4 text-right">Monthly Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-white/[0.005] transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{tool.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded text-xs">
                      {tool.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono">{tool.seats}</td>
                  <td className="px-6 py-4 text-right font-mono font-medium">${tool.monthlySpend.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="mb-12">
        <h3 className="text-lg font-bold text-white mb-4">Identified Optimizations</h3>
        {recommendations.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center text-gray-400">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-md font-bold text-white">Full Cost Efficiency</h4>
            <p className="text-xs">No cost redundancies identified in this stack.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row justify-between gap-6 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="space-y-2 flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{rec.toolName}</span>
                    <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {rec.type}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Switch current <strong className="text-gray-300">{rec.currentPlan}</strong> to <strong className="text-emerald-400 font-bold">{rec.suggestedAlternative}</strong>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed mt-2">
                    {rec.reason}
                  </p>
                </div>

                <div className="shrink-0 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-5">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Savings</span>
                  <div className="text-right mt-1">
                    <span className="text-xl font-bold text-emerald-400 font-mono">
                      +${rec.monthlySavings}/mo
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Call to action for viewers to run their own audit */}
      <div className="glass-panel-glow rounded-3xl p-6 md:p-8 text-center border-indigo-500/30 bg-gradient-to-br from-indigo-950/25 via-gray-900/60 to-gray-900">
        <h4 className="text-xl font-bold text-white mb-2">How Optimized is Your Team&apos;s AI Budget?</h4>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
          Startups waste thousands of dollars monthly on overlapping subscriptions and sub-optimal tiers. Run your own instant audit for free.
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-glow text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 text-sm"
        >
          Run Instant Spend Audit
          <ArrowRight className="w-4.5 h-4.5" />
        </Link>
      </div>
    </div>
  );
}
