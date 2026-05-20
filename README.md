# Credex.ai 🛡️ - AI Spend Audit SaaS

Credex is a production-ready, high-converting SaaS web application built to help startups analyze, audit, and optimize their cumulative monthly and annual spend on modern AI tools (ChatGPT, Claude, Cursor, Copilot, API tokens, etc.). 

By leveraging a 100% deterministic finance engine combined with a secure local base64-compression fallback, Credex provides accurate license consolidation, seat resizing, and tier-downgrade advice without requiring a database connection during local development.

---

## 🚀 Key Product Features

- **Dynamic Interactive Spend Calculator**: Seamlessly add active developer tooling rows with dynamic local storage states.
- **Deterministic Optimization Engine**: Evaluates overlapping IDE subscriptions (Cursor vs Windsurf), autocomplete overrides (Copilot vs Cursor Pro), unassigned Team plan bounds, and chat licensing redundancies.
- **Offline Base64 Fallback Mode**: If MongoDB is disconnected or unconfigured, reports are compressed into URL-safe base64 strings (`/audit/b64_...`), maintaining full sharing and report rendering capabilities.
- **AI Personalized CFO Summary**: Connects to Gemini, OpenAI, or Anthropic to generate a conversational narrative of cost reductions, with custom rule-based templates if API keys are missing.
- **Transactional Lead Capture**: Integrates honeypot-guarded inputs and Resend transactional email hooks to convert anonymous auditors into qualified enterprise leads.
- **Product Hunt Ready UX**: Fully optimized dark glassmorphism styling, responsive layouts, micro-animations, Outfit custom fonts, and SEO OpenGraph tags.

---

## 🛠️ Tech Stack & Requirements

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4 (Inline @theme custom tokens, space dark-mode palette)
- **State & Graphics**: Framer Motion, Recharts, Lucide Icons
- **Database**: Mongoose (MongoDB Atlas) with offline resilience
- **Email**: Resend Transactional API
- **Testing**: Vitest (jsdom testing suite)

---

## ⚙️ Quick Start Onboarding

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/credex.git
cd credex
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and customize the parameters:
```bash
cp .env.example .env.local
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests

We use Vitest for high-speed deterministic calculations coverage. Run:
```bash
npx vitest run
```

---

## 📂 Repository Architecture

```text
├── src/
│   ├── app/                 # Next.js 15 App Router & Server Actions
│   │   ├── audit/[id]/      # Server/Client dynamic reports
│   │   ├── share/[id]/      # Private-data filtering secure sharing
│   │   ├── globals.css      # Tailwind v4 globals & custom animations
│   │   └── page.tsx         # Launch-ready product landing page
│   ├── components/          # Reusable interface widgets (SpendForm, SavingsChart, LeadCapture)
│   ├── lib/                 # MongoDB database pooler
│   ├── models/              # Mongoose Audit & Lead Schemas
│   ├── tests/               # Vitest suite for cost calculation rules
│   ├── types/               # TypeScript contracts & models
│   └── utils/               # Pricing databases, Audit Engine, and AI engines
```
