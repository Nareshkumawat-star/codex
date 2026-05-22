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
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const {
    id,
    tools,
    teamSize,
    primaryUseCase,
    recommendations,
    aiSummary,
  } = audit;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${id}` : '';

  const totalRecommendations = recommendations.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalRecommendations > 0 ? Math.round((completedCount / totalRecommendations) * 100) : 100;

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

      {/* Dynamic Actionable Savings Roadmap */}
      {recommendations.length > 0 && (
        <div className="mb-10 mt-12">
          <div className="glass-panel rounded-3xl p-6 md:p-8 border-indigo-500/20 bg-indigo-950/5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/5">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  🪄 Next Steps: Actionable Savings Roadmap
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Follow this interactive step-by-step checklist to claim your annual savings of ${(audit.annualSavings).toLocaleString()}/yr.
                </p>
              </div>

              {/* Progress Tracker */}
              <div className="flex items-center gap-3 w-full md:w-auto shrink-0 bg-gray-900/60 border border-white/5 rounded-2xl p-3">
                <div className="text-left">
                  <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider block">Roadmap Progress</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {completedCount} of {totalRecommendations} completed
                  </span>
                </div>
                <div className="w-24 bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-indigo-400 font-mono w-8 text-right">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-4">
              {recommendations.map((rec, idx) => {
                const isCompleted = !!completedSteps[idx];
                return (
                  <div 
                    key={idx}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : 'bg-gray-950/40 border-white/5 hover:border-white/10'
                    }`}
                    onClick={() => toggleStep(idx)}
                  >
                    {/* Checkbox button */}
                    <div
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-400 text-white' 
                          : 'border-white/20 text-transparent hover:border-indigo-400'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </div>

                    {/* Step Content */}
                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-1">
                        <span className={`text-sm font-bold transition-all ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                          Step {idx + 1}: {rec.type === 'consolidation' ? 'Consolidate' : rec.type === 'downgrade' ? 'Downgrade' : 'Optimize'} {rec.toolName}
                        </span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${isCompleted ? 'bg-gray-800 text-gray-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          Save +${rec.monthlySavings}/mo
                        </span>
                      </div>
                      <p className={`text-xs mt-1.5 leading-relaxed transition-all ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                        {rec.type === 'consolidation' 
                          ? `Consolidate your licensing. Migrate your team members or shared models from ${rec.toolName} to your primary suite to prevent overlap. Cancel any redundant accounts.`
                          : rec.type === 'downgrade'
                          ? `Log in to your ${rec.toolName} Billing/Admin settings. Change your subscription tier from "${rec.currentPlan}" to "${rec.suggestedAlternative}" to lower costs immediately.`
                          : `Optimize your seat allocations for ${rec.toolName}. Review unused licenses and drop excessive seats to scale back spend.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Congratulations Banner */}
            {progressPercent === 100 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400"
              >
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">🎉 Stack Efficiency Unlocked!</h5>
                  <p className="text-xs text-gray-400 mt-0.5">You have completed all actions on your roadmap. Your annual savings of ${(audit.annualSavings).toLocaleString()}/yr are officially secured!</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Grid: Save/Export Form and Consultation CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Export / Save form */}
        <LeadCapture 
          auditId={id || ''} 
          defaultTeamSize={teamSize}
          defaultCompanyName={audit.companyName || ''} 
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
