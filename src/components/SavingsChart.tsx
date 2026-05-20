'use client';

import React, { useEffect, useState } from 'react';
import { TrendingDown, ShieldAlert, Award } from 'lucide-react';
import { AuditResult } from '../types';

interface SavingsChartProps {
  audit: AuditResult;
}

export default function SavingsChart({ audit }: SavingsChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const {
    currentMonthlySpend,
    optimizedMonthlySpend,
    monthlySavings,
    annualSavings,
  } = audit;

  const savingsPercent = currentMonthlySpend > 0 ? Math.round((monthlySavings / currentMonthlySpend) * 100) : 0;
  
  // Calculate relative heights for comparative bar chart (max height is 100%)
  const maxSpend = Math.max(currentMonthlySpend, 1);
  const currentHeight = 100;
  const optimizedHeight = Math.max(10, Math.round((optimizedMonthlySpend / maxSpend) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Comparative Spend Chart Card */}
      <div className="lg:col-span-2 glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between">
        <div>
          <h4 className="text-lg font-bold text-white mb-1">Cost Comparison</h4>
          <p className="text-gray-400 text-sm">Monthly runway comparison before and after audit optimization.</p>
        </div>

        {/* Visual Chart Bars */}
        <div className="flex justify-around items-end h-64 mt-8 pb-4 border-b border-white/5 relative">
          {/* Chart Background Grid lines */}
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-white/5 h-0" />
          <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-white/5 h-0" />
          <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-white/5 h-0" />

          {/* Current Spend Bar */}
          <div className="flex flex-col items-center gap-3 w-1/3 group">
            <div className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">
              ${Math.round(currentMonthlySpend)}/mo
            </div>
            <div className="w-full max-w-[80px] bg-gray-950/60 rounded-t-2xl border border-white/5 flex items-end h-44 overflow-hidden">
              <div 
                className="w-full bg-gradient-to-t from-gray-900 via-rose-500/20 to-rose-500 transition-all duration-1000 ease-out"
                style={{ height: animated ? `${currentHeight}%` : '0%' }}
              />
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Before Audit</div>
          </div>

          {/* Optimized Spend Bar */}
          <div className="flex flex-col items-center gap-3 w-1/3 group">
            <div className="text-sm font-bold text-emerald-400">
              ${Math.round(optimizedMonthlySpend)}/mo
            </div>
            <div className="w-full max-w-[80px] bg-gray-950/60 rounded-t-2xl border border-white/5 flex items-end h-44 overflow-hidden">
              <div 
                className="w-full bg-gradient-to-t from-emerald-950 via-emerald-500/20 to-emerald-400 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                style={{ height: animated ? `${optimizedHeight}%` : '0%' }}
              />
            </div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Optimized</div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 text-gray-400 text-xs bg-gray-950/20 border border-white/5 rounded-2xl p-3">
          <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Optimization cuts tooling burn immediately by <strong>{savingsPercent}%</strong>. Annual stack costs drop to <strong>${(optimizedMonthlySpend * 12).toLocaleString()}</strong>.</span>
        </div>
      </div>

      {/* Savings Stat Card */}
      <div className="glass-panel-glow rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform" />
        
        <div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl w-12 h-12 flex items-center justify-center mb-6">
            <Award className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Estimated Total Savings</span>
          <h3 className="text-4xl md:text-5xl font-extrabold text-white mt-2 font-mono tracking-tight">
            ${Math.round(annualSavings).toLocaleString()}
            <span className="text-base font-semibold text-indigo-300 block mt-1">per year saved</span>
          </h3>
        </div>

        <div className="border-t border-white/5 pt-6 mt-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Monthly Recovery:</span>
            <span className="font-bold text-white font-mono">${Math.round(monthlySavings).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Recovery Ratio:</span>
            <span className="font-bold text-emerald-400 font-mono">{savingsPercent}%</span>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-2 mt-4 font-semibold uppercase tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            Deterministic Financial Logic
          </div>
        </div>
      </div>
    </div>
  );
}
