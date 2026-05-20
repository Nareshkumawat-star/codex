'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Briefcase, Users, Building, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { submitLeadAction } from '../app/actions';
import { LeadInput } from '../types';

interface LeadCaptureProps {
  auditId: string;
  defaultTeamSize?: number;
  defaultCompanyName?: string;
}

export default function LeadCapture({ auditId, defaultTeamSize, defaultCompanyName }: LeadCaptureProps) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState(defaultCompanyName || '');
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState<number>(defaultTeamSize || 5);
  
  // Honeypot field for bot protection
  const [websiteUrl, setWebsiteUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Bot detection honey pot check
    if (websiteUrl) {
      // Quietly ignore submission
      setIsSubmitting(false);
      setIsSuccess(true);
      return;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    const payload: LeadInput = {
      email: email.trim(),
      companyName: companyName.trim() || undefined,
      role: role.trim() || undefined,
      teamSize: teamSize,
      auditId: auditId
    };

    const res = await submitLeadAction(payload);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setError(res.message || 'Something went wrong. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-3xl p-6 md:p-8 text-center border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-gray-900/60 to-gray-900"
      >
        <div className="bg-emerald-500/10 border border-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h4 className="text-xl font-bold text-white mb-2">Audit Saved & Dispatched!</h4>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-4">
          A copy of this audit report has been emailed to <strong className="text-gray-200">{email}</strong>. 
        </p>
        <p className="text-xs text-indigo-400 font-semibold tracking-wide uppercase">
          Welcome to the lean SaaS collective
        </p>
      </motion.div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-xl">
      <div className="mb-6">
        <h4 className="text-xl font-bold text-white">Export & Save Report</h4>
        <p className="text-gray-400 text-sm mt-1">Receive a copy in your inbox and activate your shared link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field (hidden from users) */}
        <input 
          type="text" 
          value={websiteUrl} 
          onChange={e => setWebsiteUrl(e.target.value)} 
          className="hidden" 
          autoComplete="off" 
          placeholder="Leave this empty"
        />

        {/* Email Input */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            Work Email <span className="text-indigo-400">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="bg-gray-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              className="bg-gray-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Your Role
            </label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. CTO, CFO, Founder"
              className="bg-gray-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
            />
          </div>
        </div>

        {/* Team Size (read-only prefilled, adjustable) */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Verify Team Size
          </label>
          <input
            type="number"
            value={teamSize}
            onChange={e => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
            className="bg-gray-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Emailing Audit...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Email PDF Report & Save
            </>
          )}
        </button>

        <p className="text-[10px] text-gray-500 text-center mt-2">
          By saving, you agree to receive transactional optimization advice. No spam, cancel anytime.
        </p>
      </form>
    </div>
  );
}
