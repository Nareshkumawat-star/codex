import React from 'react';
import { Metadata } from 'next';
import { getAuditAction } from '../../actions';
import ShareClient from './ShareClient';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server-side metadata generator for Next.js 15 dynamic routing.
 * Correctly awaits the async params.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const res = await getAuditAction(id);
  
  if (res.success && res.data) {
    const savings = Math.round(res.data.annualSavings).toLocaleString();
    return {
      title: `Shared AI Spend Audit | Optimized Savings: $${savings}/yr | Credex`,
      description: `Credex identified $${savings}/year in tool optimizations across Claude, ChatGPT, and Cursor for this startup. Run your own instant cost audit today!`,
    };
  }
  
  return {
    title: 'Shared AI Spend Audit | Credex',
    description: 'Optimize your startup AI tool subscription costs instantly.',
  };
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch audit data server-side
  const res = await getAuditAction(id);

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="glass-panel rounded-3xl p-8 max-w-md w-full border-rose-500/20 bg-rose-950/10">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Audit Report Not Found</h3>
          <p className="text-gray-400 text-sm mb-6">
            The requested share link is invalid or has expired. Let&apos;s run a fresh audit to discover your savings.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Run New Audit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-between">
      {/* Header bar */}
      <header className="w-full border-b border-white/5 bg-gray-950/20 py-4 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90">
            <div className="bg-indigo-600 w-7 h-7 rounded flex items-center justify-center font-bold text-white text-sm shadow">
              C
            </div>
            <span className="font-extrabold text-lg text-white">
              Credex<span className="text-indigo-400">.ai</span>
            </span>
          </Link>
          <span className="text-xs text-gray-500 border-l border-white/10 pl-2">Shared Audit</span>
        </div>
      </header>

      {/* Shared Client component */}
      <div className="flex-grow">
        <ShareClient audit={res.data} />
      </div>

      {/* Footer bar */}
      <footer className="border-t border-white/5 bg-gray-950 py-8 text-xs text-gray-500 text-center">
        <p>&copy; {new Date().getFullYear()} Credex. AI Spend Optimization. All rights reserved.</p>
      </footer>
    </main>
  );
}
