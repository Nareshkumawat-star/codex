import type { Metadata } from 'next';
import { Geist, Geist_Mono, Outfit } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Credex | AI Spend Audit & SaaS Cost Optimization',
  description: "Analyze, audit, and optimize your startup's AI tool spending in seconds. Identify redundancies across Claude, ChatGPT, Cursor, Gemini, and save up to 40% instantly.",
  keywords: ['AI Spend Audit', 'SaaS cost optimization', 'startup spend', 'Claude', 'ChatGPT', 'Cursor Pro', 'copilot costs', 'finance optimization'],
  authors: [{ name: 'Credex Team', url: 'https://credex.ai' }],
  metadataBase: new URL('https://credex.ai'),
  icons: {
    icon: '/vercel.svg',
    shortcut: '/vercel.svg',
    apple: '/vercel.svg',
  },
  openGraph: {
    title: 'Credex | AI Spend Audit & Cost Optimization',
    description: "Audit your startup's AI tool spending. Identify seat overlaps, plan downgrades, and save thousands of dollars annually with our deterministic audit engine.",
    url: 'https://credex.ai',
    siteName: 'Credex',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg', // Will generate mock or safe render path
        width: 1200,
        height: 630,
        alt: 'Credex AI Spend Audit System Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Credex | AI Spend Audit',
    description: 'Optimize your AI spend instantly. Get detailed breakdowns and deterministic cost-saving recommendations.',
    creator: '@credex_ai',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased min-h-screen flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200`}
      >
        <div className="flex-grow flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
