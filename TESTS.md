# Credex.ai - Automated Testing Documentation

To guarantee complete financial accuracy and prevent pricing regressions, Credex uses a robust test suite powered by **Vitest** in a mock **jsdom** environment.

---

## 🧪 Testing Command Directory

### 1. Run all unit tests once
```bash
npx vitest run
```

### 2. Run tests in hot-reloading watch mode
```bash
npx vitest
```

### 3. Generate test coverage report
```bash
npx vitest run --coverage
```

---

## 📐 Test Case Catalog

Our test suite resides at `src/tests/audit.test.ts` and contains 6 critical validation tests:

| Test ID | Title | Verified Target | Expected Assertions |
|:---|:---|:---|:---|
| **01** | Simple Stack Calculations | Dynamic base seat math | Multiplies pricing for ChatGPT and Claude seats. Confirms $100 base monthly spend and $1,200 annual run rate, alongside a $40 consolidation deduction. |
| **02** | Redundant IDE Consolidation | Next-gen AI editor overlap | Asserts that using Cursor Pro alongside Windsurf Pro triggers an optimization card recommending discarding Windsurf and saving $15/mo. |
| **03** | Autocomplete Redundancy | Inline plugin overlap | Verifies that using GitHub Copilot Business while Cursor Pro is active flags Copilot as completely redundant, saving $95/mo for a team of 5. |
| **04** | Team Plan Inflation | Small workspace sizing | Asserts that a single-user workspace on a ChatGPT Team plan is recommended for a downgrade to standard ChatGPT Plus, saving $5/mo. |
| **05** | Enterprise Plan Resizing | Large plan downgrades | Validates that small teams (< 10 users) on Claude Enterprise are recommended for a downgrade to Claude Team plans, saving $50/mo per seat. |
| **06** | Multi-model Chat Overlap | General workspace chat | Checks that small teams paying for both Claude Pro and ChatGPT Plus for the same team members are advised to standardize on one chat portal. |

---

## 🛡️ Testing Architecture Principles

1. **Deterministic Mock Pricing**: Tests bypass external database fetches and rely on standard core pricing constants. This prevents tests from failing during pricing changes or network connection timeouts.
2. **Zero Hallucination Assurance**: Since all evaluations are built on mathematical inequalities rather than LLM text reasoning, we achieve 100% test coverage consistency. Every execution produces identical results.
3. **Assertive Cost Differentials**: We verify that `currentMonthlySpend - monthlySavings === optimizedMonthlySpend` across every test case, ensuring high-fidelity accounting ledgers.
