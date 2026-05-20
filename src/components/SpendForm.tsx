'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calculator, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { ToolInput, UseCase, AuditInput } from '../types';
import { TOOL_PRICING, SUPPORTED_TOOLS, getStandardPrice } from '../utils/pricing';
import { createAuditAction, parseSpendTextAction } from '../app/actions';

const STORAGE_KEY = 'credex_audit_draft';

const DEFAULT_TOOLS: ToolInput[] = [
  { id: '1', name: 'ChatGPT', plan: 'Plus', monthlySpend: 20, seats: 1 },
  { id: '2', name: 'Cursor', plan: 'Pro', monthlySpend: 20, seats: 1 }
];

export default function SpendForm() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolInput[]>([]);
  const [teamSize, setTeamSize] = useState<number>(5);
  const [primaryUseCase, setPrimaryUseCase] = useState<UseCase>('mixed');
  const [companyName, setCompanyName] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // AI Parser states
  const [invoiceText, setInvoiceText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState<string | null>(null);
  const [showAutoFill, setShowAutoFill] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tools && Array.isArray(parsed.tools)) {
          setTools(parsed.tools);
          setTeamSize(parsed.teamSize || 5);
          setPrimaryUseCase(parsed.primaryUseCase || 'mixed');
          setCompanyName(parsed.companyName || '');
          setHydrated(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load form cache:', e);
    }
    setTools(DEFAULT_TOOLS);
    setHydrated(true);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tools,
        teamSize,
        primaryUseCase,
        companyName
      }));
    } catch (e) {
      console.warn('Failed to save form cache:', e);
    }
  }, [tools, teamSize, primaryUseCase, companyName, hydrated]);

  if (!hydrated) {
    return (
      <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-8 animate-shimmer min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Row update helpers
  const handleAddRow = () => {
    const nextId = Math.random().toString(36).substring(7);
    const newTool: ToolInput = {
      id: nextId,
      name: 'ChatGPT',
      plan: 'Plus',
      monthlySpend: 20,
      seats: 1
    };
    setTools([...tools, newTool]);
  };

  const handleRemoveRow = (id: string) => {
    if (tools.length <= 1) {
      setError('Please audit at least one AI tool.');
      return;
    }
    setError(null);
    setTools(tools.filter(t => t.id !== id));
  };

  const handleUpdateRow = (id: string, field: keyof ToolInput, value: string | number) => {
    setError(null);
    setTools(tools.map(tool => {
      if (tool.id !== id) return tool;
      
      const updated = { ...tool, [field]: value };
      
      // If tool name changes, reset plan to the first available plan of the new tool
      if (field === 'name') {
        const pricing = TOOL_PRICING[value as string];
        updated.plan = pricing ? pricing.plans[0].name : '';
      }
      
      // Re-calculate suggested spend based on seats and plan pricing
      if (field === 'name' || field === 'plan' || field === 'seats') {
        const pricePerSeat = getStandardPrice(updated.name, updated.plan);
        const standardSpend = pricePerSeat * updated.seats;
        updated.monthlySpend = standardSpend > 0 ? standardSpend : updated.monthlySpend;
      }
      
      return updated;
    }));
  };

  const handleParseText = async () => {
    if (!invoiceText.trim()) {
      setError('Please paste your statement or text notes first.');
      return;
    }
    setIsParsing(true);
    setError(null);
    setParseSuccess(null);

    const res = await parseSpendTextAction(invoiceText);
    if (res.success && res.data) {
      const parsedData = res.data;
      if (parsedData.tools && parsedData.tools.length > 0) {
        // Map parsed tools to include temporary IDs
        const formattedTools = parsedData.tools.map((t, idx) => ({
          id: Math.random().toString(36).substring(7) + idx,
          name: t.name, // Natively typed as string
          plan: t.plan,
          seats: t.seats || 1,
          monthlySpend: t.monthlySpend || 0
        }));
        
        setTools(formattedTools);
        if (parsedData.teamSize) {
          setTeamSize(parsedData.teamSize);
        }
        if (parsedData.primaryUseCase) {
          let mappedUseCase: UseCase = 'mixed';
          const uc = parsedData.primaryUseCase.toLowerCase();
          if (uc.includes('coding')) mappedUseCase = 'coding';
          else if (uc.includes('content') || uc.includes('writing') || uc.includes('copy')) mappedUseCase = 'writing';
          else if (uc.includes('support') || uc.includes('chat')) mappedUseCase = 'mixed';
          else if (uc.includes('data') || uc.includes('finance')) mappedUseCase = 'data';
          else if (uc.includes('research') || uc.includes('academic')) mappedUseCase = 'research';
          
          setPrimaryUseCase(mappedUseCase);
        }
        setParseSuccess(`Successfully auto-populated ${parsedData.tools.length} tool(s) from your statement!`);
      } else {
        setError('Could not identify any supported AI tools in the text. Try describing them like "5 seats of Claude Pro".');
      }
    } else {
      setError(res.error || 'Failed to parse the billing statement.');
    }
    setIsParsing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (tools.length === 0) {
      setError('Please add at least one AI tool to analyze.');
      setIsSubmitting(false);
      return;
    }

    for (const tool of tools) {
      if (tool.seats <= 0) {
        setError(`Please specify a valid seat count for ${tool.name}.`);
        setIsSubmitting(false);
        return;
      }
      if (tool.monthlySpend < 0) {
        setError(`Monthly spend for ${tool.name} cannot be negative.`);
        setIsSubmitting(false);
        return;
      }
    }

    const payload: AuditInput = {
      tools,
      teamSize,
      primaryUseCase,
      companyName: companyName.trim() || undefined
    };

    const res = await createAuditAction(payload);
    
    if (res.success && res.id) {
      // Clear localStorage cache upon successful submission
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/audit/${res.id}`);
    } else {
      setError(res.error || 'Failed to analyze spend. Please check inputs.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" />
              AI Spend Audit Calculator
            </h3>
            <p className="text-gray-400 text-sm mt-1">Enter your tools, users, and plans to detect cost overlaps.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Company (Optional)</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="bg-gray-950/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              />
            </div>
          </div>
        </div>

        {/* AI Auto-Fill / Parser widget */}
        <div className="mb-8 border border-indigo-500/20 bg-indigo-950/10 rounded-2xl p-5 relative overflow-hidden transition-all">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowAutoFill(!showAutoFill)}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  🪄 AI Invoice & Statement Auto-Fill
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full">New</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">Paste a credit card bill, subscription email, or text to auto-populate your calculator.</p>
              </div>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
            >
              {showAutoFill ? 'Collapse Importer' : 'Expand Importer'}
            </button>
          </div>

          <AnimatePresence>
            {showAutoFill && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-white/5 space-y-4 overflow-hidden"
              >
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Billing Statement or Subscription Notes</label>
                  <textarea
                    rows={4}
                    value={invoiceText}
                    onChange={e => setInvoiceText(e.target.value)}
                    placeholder="e.g., We pay $90/mo for 3 seats of Claude Team. Developers use Cursor Pro (2 licenses at $40 total). We also bought ChatGPT Team for 1 user. Startup size is 7 people."
                    className="bg-gray-950/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm transition-all resize-y"
                  />
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <span className="text-[11px] text-gray-500">Supported: Claude, ChatGPT, Cursor, Copilot, Gemini, Windsurf, v0.</span>
                    <button
                      type="button"
                      disabled={isParsing}
                      onClick={handleParseText}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10"
                    >
                      {isParsing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Parsing Statement...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                          Parse & Auto-Fill Form
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {parseSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <p>{parseSuccess}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global params */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-950/30 border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-300 mb-2">Total Team Size</label>
            <input
              type="number"
              min={1}
              max={10000}
              value={teamSize}
              onChange={e => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-gray-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="text-xs text-gray-500 mt-1">Helps audit team/enterprise subscription tiers.</span>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-300 mb-2">Primary AI Use Case</label>
            <select
              value={primaryUseCase}
              onChange={e => setPrimaryUseCase(e.target.value as UseCase)}
              className="bg-gray-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="coding">Coding & Software Development</option>
              <option value="writing">Writing, Marketing & Content</option>
              <option value="research">Academic & Market Research</option>
              <option value="data">Data Analysis & Financial Analysis</option>
              <option value="mixed">Mixed / General Collaborative AI</option>
            </select>
            <span className="text-xs text-gray-500 mt-1">Filters tool alternatives suited for your workflow.</span>
          </div>
        </div>

        {/* Tools rows */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Active Subscriptions & API Spend</h4>
            <span className="text-xs text-gray-400">{tools.length} tool{tools.length === 1 ? '' : 's'}</span>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {tools.map((tool) => {
                const availablePlans = TOOL_PRICING[tool.name]?.plans || [];
                const standardPrice = getStandardPrice(tool.name, tool.plan);
                const isPriceOverridden = tool.monthlySpend !== standardPrice * tool.seats && standardPrice > 0;

                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end bg-gray-900/40 border border-white/5 rounded-2xl p-4 relative group"
                  >
                    {/* Tool Select */}
                    <div className="sm:col-span-3 flex flex-col">
                      <label className="text-xs font-semibold text-gray-400 mb-1">Tool</label>
                      <select
                        value={tool.name}
                        onChange={e => handleUpdateRow(tool.id, 'name', e.target.value)}
                        className="bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm cursor-pointer"
                      >
                        {SUPPORTED_TOOLS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Plan Select */}
                    <div className="sm:col-span-3 flex flex-col">
                      <label className="text-xs font-semibold text-gray-400 mb-1">Plan</label>
                      <select
                        value={tool.plan}
                        onChange={e => handleUpdateRow(tool.id, 'plan', e.target.value)}
                        className="bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm cursor-pointer"
                      >
                        {availablePlans.map(p => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Seats Count */}
                    <div className="sm:col-span-2 flex flex-col">
                      <label className="text-xs font-semibold text-gray-400 mb-1">Seats</label>
                      <input
                        type="number"
                        min={1}
                        value={tool.seats}
                        onChange={e => handleUpdateRow(tool.id, 'seats', Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                      />
                    </div>

                    {/* Monthly Spend */}
                    <div className="sm:col-span-3 flex flex-col relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-gray-400">Monthly ($)</label>
                        {isPriceOverridden && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full">Custom</span>
                        )}
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={tool.monthlySpend}
                        onChange={e => handleUpdateRow(tool.id, 'monthlySpend', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="bg-gray-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                      />
                    </div>

                    {/* Delete button */}
                    <div className="sm:col-span-1 flex justify-center sm:justify-end pb-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(tool.id)}
                        className="text-gray-500 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Add Row Button */}
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center justify-center gap-2 w-full border border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl py-3 text-sm text-gray-400 hover:text-indigo-300 bg-white/[0.01] hover:bg-indigo-500/[0.02] transition-all cursor-pointer font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Tool Subscription or API Spend Row
        </button>

        {/* Errors display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mt-6 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Form Action */}
        <div className="mt-8 border-t border-white/5 pt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative bg-gradient-glow text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Auditing SaaS Overlap...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
                Analyze AI Spending & Optimize
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
