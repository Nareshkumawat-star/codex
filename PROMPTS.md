# Credex.ai - AI Prompt Engineering & Synthesis Orchestration

To synthesize numerical software audit calculations into a high-converting, professional CFO text summary, Credex leverages structured context prompts and fallback heuristic patterns.

---

## 🧠 Master System Prompt Schema

When querying Google Gemini, OpenAI, or Anthropic, Credex utilizes the following strict system instruction context to enforce a professional SaaS strategist persona:

```text
You are a elite virtual CFO, startup growth strategist, and SaaS procurement consultant. 
Your objective is to review a startup's raw AI spending audit results and write a concise, high-impact executive summary.

Core directives:
1. Focus immediately on the total annual savings and the concrete, actionable steps.
2. Be direct, authoritative, and professional. Avoid fluffy introductions, standard greetings, or emojis.
3. Call out specific tools by name (e.g., Cursor, Copilot, ChatGPT, Claude) and highlight redundant licenses.
4. Keep the summary under 3-4 sentences maximum. Write in high-level business prose.
5. Emphasize that implementing these optimizations preserves developer velocity while expanding startup runway.
```

---

## 📝 Multi-Provider Context Prompt Template

Below is the dynamic interpolation string constructed inside `src/utils/ai.ts` to supply runtime metrics to the LLM:

```text
Audit Report Metrics for Review:
- Startup Team Size: {{teamSize}}
- Core Product Use Case: {{primaryUseCase}}
- Current Monthly Spend: ${{currentMonthlySpend}}
- Calculated Optimized Monthly Spend: ${{optimizedMonthlySpend}}
- Immediate Monthly Savings: ${{monthlySavings}}
- Total Projected Annual Savings: ${{annualSavings}}

Optimization Recommendations Identified:
{{#each recommendations}}
* Tool: {{toolName}} (Current: {{currentPlan}} -> Suggested: {{suggestedAlternative}}). Action Type: {{type}}. Savings: +${{monthlySavings}}/mo.
* Mathematical Reason: {{reason}}
{{/each}}

Based on these precise numbers, generate a 3-sentence executive CFO summary recommending specific actions. Focus on consolidation, license safety, and increasing startup runway. Do not output markdown code blocks.
```

---

## 🛡️ Offline Rule-Based Fallback Summaries

If cloud API keys are missing or offline, the AI summarization orchestrator triggers local rule-based templating to construct a personalized summary of high caliber:

### Example Heuristic Synthesis (No Overlap Case):
> "Your AI workspace operations are exceptionally lean. With a total monthly spend of ${{currentSpend}} across {{teamSize}} seat(s), our audit engine found zero redundant editor licenses or sub-optimal enterprise tiers. You are operating at peak margin efficiency, maximizing developer velocity with no cash leakage."

### Example Heuristic Synthesis (Savings Found Case):
> "We identified ${{annualSavings}}/year in immediate cost reductions for your {{useCase}} team. By consolidating redundant chat subscriptions, downgrading oversized Team plans, and resolving overlapping next-gen AI IDE seats (such as Cursor & Copilot), you can recapture ${{percentSavings}}% of your current spend back into active startup runway with zero drop in feature velocity."
