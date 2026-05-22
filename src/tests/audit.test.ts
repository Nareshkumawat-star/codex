import { describe, it, expect } from 'vitest';
import { runAudit } from '../utils/auditEngine';
import { AuditInput } from '../types';
import { parseSpendText } from '../utils/ai';

describe('Credex AI Spend Audit Engine Tests', () => {
  
  // Test 1: Simple Stack Calculations
  it('should calculate base pricing and annual totals accurately', () => {
    const input: AuditInput = {
      tools: [
        { id: 't1', name: 'ChatGPT', plan: 'Plus', monthlySpend: 0, seats: 2 },
        { id: 't2', name: 'Claude', plan: 'Pro', monthlySpend: 0, seats: 3 }
      ],
      teamSize: 10,
      primaryUseCase: 'mixed'
    };

    const result = runAudit(input);

    expect(result.currentMonthlySpend).toBe(100); // 20*2 + 20*3 = 100
    expect(result.currentAnnualSpend).toBe(1200); // 100 * 12
    expect(result.monthlySavings).toBe(40); // Claude Pro + ChatGPT Plus overlap triggers $40 consolidation savings
    expect(result.optimizedMonthlySpend).toBe(60);
  });

  // Test 2: Redundant IDE Consolidation (Cursor + Windsurf)
  it('should consolidate overlapping next-gen AI IDEs (Cursor + Windsurf)', () => {
    const input: AuditInput = {
      tools: [
        { id: 't1', name: 'Cursor', plan: 'Pro', monthlySpend: 20, seats: 1 },
        { id: 't2', name: 'Windsurf', plan: 'Pro', monthlySpend: 15, seats: 1 }
      ],
      teamSize: 2,
      primaryUseCase: 'coding'
    };

    const result = runAudit(input);
    
    // It should recommend dropping Windsurf and consolidating in Cursor
    const consolidationRec = result.recommendations.find(r => r.type === 'consolidation');
    expect(consolidationRec).toBeDefined();
    expect(consolidationRec?.toolName).toBe('Windsurf');
    expect(consolidationRec?.monthlySavings).toBe(15);
    expect(result.monthlySavings).toBe(15);
    expect(result.optimizedMonthlySpend).toBe(20);
  });

  // Test 3: Autocomplete Redundancy (Cursor + Copilot)
  it('should identify Copilot as redundant if Cursor Pro/Business is present', () => {
    const input: AuditInput = {
      tools: [
        { id: 't1', name: 'Cursor', plan: 'Pro', monthlySpend: 0, seats: 5 },
        { id: 't2', name: 'GitHub Copilot', plan: 'Business', monthlySpend: 0, seats: 5 }
      ],
      teamSize: 5,
      primaryUseCase: 'coding'
    };

    const result = runAudit(input);

    const copilotRec = result.recommendations.find(r => r.toolName === 'GitHub Copilot');
    expect(copilotRec).toBeDefined();
    expect(copilotRec?.type).toBe('consolidation');
    expect(copilotRec?.monthlySavings).toBe(95); // 19 * 5 = 95
    expect(result.monthlySavings).toBe(95);
  });

  // Test 4: Oversized Team Plan Downgrades
  it('should recommend ChatGPT Team downgrades for single seat workspaces', () => {
    const input: AuditInput = {
      tools: [
        { id: 't1', name: 'ChatGPT', plan: 'Team', monthlySpend: 25, seats: 1 }
      ],
      teamSize: 1,
      primaryUseCase: 'writing'
    };

    const result = runAudit(input);

    const downgradeRec = result.recommendations.find(r => r.type === 'downgrade');
    expect(downgradeRec).toBeDefined();
    expect(downgradeRec?.suggestedAlternative).toBe('Plus');
    expect(downgradeRec?.monthlySavings).toBe(5); // $25 - $20 Plus price = $5 savings
  });

  // Test 5: Enterprise Plan Resizing
  it('should downgrade unneeded Enterprise tiers for small team sizes', () => {
    const input: AuditInput = {
      tools: [
        { id: 't1', name: 'Claude', plan: 'Enterprise', monthlySpend: 375, seats: 5 } // $75/mo per seat
      ],
      teamSize: 5,
      primaryUseCase: 'research'
    };

    const result = runAudit(input);

    const enterpriseRec = result.recommendations.find(r => r.currentPlan === 'Enterprise');
    expect(enterpriseRec).toBeDefined();
    expect(enterpriseRec?.type).toBe('downgrade');
    expect(enterpriseRec?.suggestedAlternative).toBe('Team'); // $25/mo per seat
    expect(enterpriseRec?.monthlySavings).toBe(250); // (75 - 25) * 5 = 250
  });

  // Test 6: Multi-model Consolidation Overlaps
  it('should optimize cost by consolidating separate Claude and ChatGPT subscriptions', () => {
    const input: AuditInput = {
      tools: [
        { id: 't1', name: 'Claude', plan: 'Pro', monthlySpend: 20, seats: 1 },
        { id: 't2', name: 'ChatGPT', plan: 'Plus', monthlySpend: 20, seats: 1 }
      ],
      teamSize: 1,
      primaryUseCase: 'mixed'
    };

    const result = runAudit(input);

    const consolidationRec = result.recommendations.find(r => r.toolName === 'ChatGPT' && r.type === 'consolidation');
    expect(consolidationRec).toBeDefined();
    expect(consolidationRec?.monthlySavings).toBe(20);
    expect(result.monthlySavings).toBe(20);
  });

  // Test 7: AI Statement Parser (Heuristic Verification)
  it('should successfully parse raw statement text into correct tool segments', async () => {
    const text = 'We are a startup with 7 people. We spend $90 for 3 seats of Claude Team, and also developers have Cursor Pro (2 seats at $40 total). The primary usecase is building software.';
    const result = await parseSpendText(text);

    expect(result.teamSize).toBe(7);
    expect(result.primaryUseCase).toBe('Coding & Software Development');
    expect(result.tools.length).toBe(2);

    const claudeTool = result.tools.find(t => t.name === 'Claude');
    expect(claudeTool).toBeDefined();
    expect(claudeTool?.plan).toBe('Team');
    expect(claudeTool?.seats).toBe(3);
    expect(claudeTool?.monthlySpend).toBe(90);

    const cursorTool = result.tools.find(t => t.name === 'Cursor');
    expect(cursorTool).toBeDefined();
    expect(cursorTool?.plan).toBe('Pro');
    expect(cursorTool?.seats).toBe(2);
    expect(cursorTool?.monthlySpend).toBe(40);
  });

  // Test 8: AI Statement Parser (Copilot shortname and match-term seats/plan check)
  it('should successfully map Copilot to GitHub Copilot and parse its seats and plan', async () => {
    const text = 'Our team has 3 seats of Copilot Pro, which costs us $30 per month.';
    const result = await parseSpendText(text);

    expect(result.tools.length).toBe(1);
    const copilotTool = result.tools.find(t => t.name === 'GitHub Copilot');
    expect(copilotTool).toBeDefined();
    expect(copilotTool?.plan).toBe('Pro');
    expect(copilotTool?.seats).toBe(3);
    expect(copilotTool?.monthlySpend).toBe(30);
  });
});
