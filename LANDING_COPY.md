# Credex.ai - Marketing Copy & Positioning Swipe File

This document acts as our master copy reference, detailing the exact headlines, body text, FAQ answers, and email templates deployed across the Credex platform.

---

## 🎨 Hero Header & Subtitle Copy

### Hook (Above Hero)
- **Text**: `Product Hunt #1 Product of the Day 🏆`
- **Goal**: Establish immediate trust and social validation.

### Main Headline
- **Formula**: `Stop Overpaying for [Target Category]`
- **Text**: `Stop Overpaying for Frontier AI Tools`
- **Alternative**: `Reclaim up to 40% of your startup's cumulative AI budget instantly.`

### Subhead
- **Text**: `Startups waste up to 40% of their SaaS runway on overlapping AI subscriptions. Auditing seats across Claude, ChatGPT, Cursor, and Copilot takes under 60 seconds.`

### Trust Badges (KPIs)
- **KPI 1**: `Average Saved: $1,450/yr`
- **KPI 2**: `Audit Duration: < 60 seconds`
- **KPI 3**: `Engine Quality: 100% Deterministic`

---

## 💻 Feature Grid & Benefit Cards

### Benefit 1: License Consolidation
- **Headline**: `License Consolidation`
- **Description**: `Detect redundant user licenses. Consolidate developers paying for both Cursor and Copilot, or Claude and ChatGPT, and claw back up to $40/mo per engineer.`

### Benefit 2: Tier Optimization
- **Headline**: `Tier Optimization`
- **Description**: `Catch sub-optimal enterprise and team seats. Downgrade single-user Team subscriptions (like ChatGPT Team for 1 seat) back to standard Pro/Plus plans instantly.`

### Benefit 3: Determinible Rules
- **Headline**: `Deterministic Rules`
- **Description**: `Audit numbers must be defensible. Unlike other tools that run on subjective AI reasoning, our math runs on rigid finance equations for 100% mathematical fidelity.`

---

## 📧 Automated Resend Email Lead Swipe

Sent to customers when they submit their email address to capture the report:

```text
Subject: 🛡️ Your Credex AI Spend Audit is ready (Recapture ${{annualSavings}}!)

Hi Founder,

Thank you for running an AI Spend Audit on Credex.ai. 

We successfully analyzed your developer tooling stack and identified a potential ${{monthlySavings}}/month in savings (that's ${{annualSavings}}/year back into your operational runway!).

Summary of identified optimizations:
{{#each recommendations}}
* {{toolName}}: Change {{currentPlan}} to {{suggestedAlternative}} (Saves +${{monthlySavings}}/mo)
  Reason: {{reason}}
{{/each}}

Would you like one of our startup CFOs to review your subscription invoices manually, negotiate custom enterprise pricing with Anthropic/OpenAI, or optimize your API token routing?

Book a free 15-minute consultation directly:
https://calendly.com/credex-ai/spend-audit

To your runway,
The Credex Team
```
