# Credex.ai - AI Tools Pricing Master Database

This document serves as the master record of standard SaaS pricing tiers, limits, and rules implemented inside our deterministic audit engine.

---

## 📊 Developer Tools Benchmark Database

The engine evaluates subscriptions against standard price benchmarks as of Q2 2026:

| Tool Name | Plan Tier | Monthly Cost (USD) | Unit Metric | Key Plan Limits & Constraints |
|:---|:---|:---|:---|:---|
| **Cursor** | Pro | $20 | Per Seat | Individual next-gen IDE seat with fast premium queries |
| | Business | $40 | Per Seat | Team settings, centralized billing, and custom models |
| **Windsurf** | Pro | $15 | Per Seat | Flow state next-gen AI IDE editor |
| **GitHub Copilot**| Individual | $10 | Per Seat | Autocomplete engine, basic chat sidebar |
| | Business | $19 | Per Seat | Enterprise context, admin controls, IP indemnity |
| **ChatGPT** | Plus | $20 | Per Seat | Single user conversational LLM |
| | Team | $25 | Per Seat | Minimum 2-seat requirement, higher rate limits |
| | Enterprise | $60 | Per Seat | Custom seat pricing (estimated baseline for engine) |
| **Claude** | Pro | $20 | Per Seat | Single user premium conversational LLM |
| | Team | $25 | Per Seat | Minimum 5-seat requirement, larger prompt contexts |
| | Enterprise | $75 | Per Seat | Advanced enterprise control (estimated baseline) |
| **Gemini** | Advanced | $20 | Per Seat | Premium general conversational LLM (Google Workspace) |
| **OpenAI API** | Pay-as-you-go| Dynamic | Usage-based | Token pricing (GPT-4o, GPT-3.5-turbo) |
| **Anthropic API**| Pay-as-you-go| Dynamic | Usage-based | Token pricing (Claude 3.5 Sonnet, Haiku) |
| **v0** | Premium | $20 | Per Seat | UI generation workspace from Vercel |

---

## 📐 Deterministic Logic Calculations

- **Default Price Interpolation**: If a user submits an audit row with `monthlySpend: 0`, the engine checks the plan name. It automatically assigns:
  - `seats * monthlyCost` for standard tiers.
  - Generates standard recommendations based on those estimates.
- **Seat Overlap Checks**: We enforce `Math.min(toolA.seats, toolB.seats)` when evaluating overlapping items to make sure we only suggest consolidating seats that actually represent active duplicate developers.
