import { AuditInput, AuditResult, Recommendation, ToolInput } from '../types';
import { getStandardPrice } from './pricing';

/**
 * Deterministic AI Spend Audit Engine.
 * Implements strict, logical cost-optimization rules based on seat counts,
 * primary use cases, tool overlaps, and plan levels.
 */
export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, primaryUseCase } = input;
  
  let currentMonthlySpend = 0;
  const recommendations: Recommendation[] = [];
  
  // 1. Calculate actual current monthly spend
  const processedTools: ToolInput[] = tools.map(tool => {
    // If user specified 0 monthly spend, we check if there's a standard price for it
    let spend = tool.monthlySpend;
    if (spend <= 0) {
      const pricePerSeat = getStandardPrice(tool.name, tool.plan);
      spend = pricePerSeat * tool.seats;
    }
    currentMonthlySpend += spend;
    return {
      ...tool,
      monthlySpend: spend
    };
  });

  const toolMap = new Map<string, ToolInput>();
  processedTools.forEach(t => toolMap.set(t.name.toLowerCase(), t));

  // 2. Perform Cost-Optimization Analysis and Generate Recommendations
  
  // Rule A: Overlap between premium IDEs (Cursor & Windsurf)
  if (toolMap.has('cursor') && toolMap.has('windsurf')) {
    const cursor = toolMap.get('cursor')!;
    const windsurf = toolMap.get('windsurf')!;
    const cursorPrice = cursor.monthlySpend;
    const windsurfPrice = windsurf.monthlySpend;

    if (cursorPrice >= windsurfPrice) {
      // Recommend dropping Windsurf and consolidating in Cursor
      recommendations.push({
        toolId: windsurf.id,
        toolName: 'Windsurf',
        currentPlan: windsurf.plan,
        suggestedAlternative: 'Consolidate into Cursor',
        monthlySavings: windsurfPrice,
        annualSavings: windsurfPrice * 12,
        reason: `Both Cursor and Windsurf are next-generation AI IDEs with overlapping feature sets. Consolidating your team under a single IDE (Cursor) removes duplicate licensing fees.`,
        type: 'consolidation'
      });
    } else {
      recommendations.push({
        toolId: cursor.id,
        toolName: 'Cursor',
        currentPlan: cursor.plan,
        suggestedAlternative: 'Consolidate into Windsurf',
        monthlySavings: cursorPrice,
        annualSavings: cursorPrice * 12,
        reason: `Both Cursor and Windsurf are next-generation AI IDEs with overlapping features. Consolidating your team under a single IDE (Windsurf) removes duplicate licensing fees.`,
        type: 'consolidation'
      });
    }
  }

  // Rule B: Overlap between GitHub Copilot and Cursor
  if (toolMap.has('cursor') && toolMap.has('github copilot')) {
    const copilot = toolMap.get('github copilot')!;
    const cursor = toolMap.get('cursor')!;
    
    // If they have Cursor Pro/Business, they don't need a separate GitHub Copilot license
    if (cursor.plan.toLowerCase() !== 'hobby' && copilot.plan.toLowerCase() !== 'enterprise') {
      const copilotSavings = copilot.monthlySpend;
      recommendations.push({
        toolId: copilot.id,
        toolName: 'GitHub Copilot',
        currentPlan: copilot.plan,
        suggestedAlternative: 'Cancel Copilot subscription',
        monthlySavings: copilotSavings,
        annualSavings: copilotSavings * 12,
        reason: `Cursor has an outstanding, high-performance built-in tab autocomplete and chat feature powered by state-of-the-art frontier models. Running Copilot alongside Cursor is highly redundant and leads to visual conflicts in autocomplete.`,
        type: 'consolidation'
      });
    }
  }

  // Rule C: ChatGPT Team Plan seat count check
  // ChatGPT Team has a minimum of 2 users, but if they are buying it for 1 user, they are overpaying.
  // Or, if they have multiple users on ChatGPT Team but their primary use case is 'coding' or 'data',
  // maybe they should consolidate onto a developer-centric IDE like Cursor and save.
  if (toolMap.has('chatgpt')) {
    const chatgpt = toolMap.get('chatgpt')!;
    if (chatgpt.plan.toLowerCase() === 'team' && chatgpt.seats === 1) {
      const pricePlus = 20;
      const spendDiff = chatgpt.monthlySpend - (pricePlus * 1);
      if (spendDiff > 0) {
        recommendations.push({
          toolId: chatgpt.id,
          toolName: 'ChatGPT',
          currentPlan: 'Team',
          suggestedAlternative: 'Plus',
          monthlySavings: spendDiff,
          annualSavings: spendDiff * 12,
          reason: `ChatGPT Team requires a minimum of 2 seats. Since you've allocated only 1 seat, downgrading to ChatGPT Plus provides identical core AI features (GPTo, Advanced Voice, Custom GPTs) while cutting licensing costs.`,
          type: 'downgrade'
        });
      }
    }
  }

  // Rule D: Claude Team Plan seat count check
  // Claude Team requires a minimum of 5 seats. If seats < 5, they are either paying for unassigned seats
  // or paying team rates when Pro is sufficient.
  if (toolMap.has('claude')) {
    const claude = toolMap.get('claude')!;
    if (claude.plan.toLowerCase() === 'team' && claude.seats < 5) {
      const proCost = 20 * claude.seats;
      const savings = Math.max(0, claude.monthlySpend - proCost);
      if (savings > 0) {
        recommendations.push({
          toolId: claude.id,
          toolName: 'Claude',
          currentPlan: 'Team',
          suggestedAlternative: 'Pro',
          monthlySavings: savings,
          annualSavings: savings * 12,
          reason: `Claude Team requires a minimum of 5 seats. If your active seats are less than 5, downgrading to Claude Pro for those active users will save money without losing access to Claude 3.5 Sonnet.`,
          type: 'downgrade'
        });
      }
    }
  }

  // Rule E: Multi-Chat-Subscription Consolidation
  // If the user has BOTH Claude Pro/Team and ChatGPT Plus/Team, and their use case is standard,
  // we recommend consolidating to one. Claude 3.5 Sonnet is currently the industry gold standard.
  if (toolMap.has('claude') && toolMap.has('chatgpt')) {
    const claude = toolMap.get('claude')!;
    const chatgpt = toolMap.get('chatgpt')!;
    
    // Only recommend if they are individual/pro-level subs
    const isClaudePro = ['pro', 'team'].includes(claude.plan.toLowerCase());
    const isChatgptPro = ['plus', 'team'].includes(chatgpt.plan.toLowerCase());

    if (isClaudePro && isChatgptPro) {
      // Recommend keeping Claude (usually better for coding/writing) and dropping ChatGPT Plus
      const chatgptSavings = chatgpt.monthlySpend;
      recommendations.push({
        toolId: chatgpt.id,
        toolName: 'ChatGPT',
        currentPlan: chatgpt.plan,
        suggestedAlternative: 'Consolidate into Claude Pro/Team',
        monthlySavings: chatgptSavings,
        annualSavings: chatgptSavings * 12,
        reason: `Your team is paying for both Claude and ChatGPT subscriptions. Claude 3.5 Sonnet is widely considered superior for coding, technical writing, and structural logic. Consolidating onto Claude saves significant subscription spend.`,
        type: 'consolidation'
      });
    }
  }

  // Rule F: API Direct savings over fixed subscriptions
  // If they have large team size (> 10) but low usage or specific use cases,
  // API direct options with a custom shared interface can save up to 70%.
  // Or, if they use OpenAI API and Anthropic API direct and spend > $300,
  // suggest using a unified routing tool or open source UI. Let's make a generic API rule.
  processedTools.forEach(tool => {
    const lowerName = tool.name.toLowerCase();
    
    // If they are on enterprise plans but team size is small, suggest downgrade to Business or Pro
    if (tool.plan.toLowerCase() === 'enterprise' && teamSize < 15) {
      let bizPlanName = 'Business';
      let bizCostPerSeat = 40;
      if (lowerName === 'chatgpt') {
        bizPlanName = 'Team';
        bizCostPerSeat = 25;
      } else if (lowerName === 'claude') {
        bizPlanName = 'Team';
        bizCostPerSeat = 25;
      } else if (lowerName === 'github copilot') {
        bizPlanName = 'Business';
        bizCostPerSeat = 19;
      }
      
      const newSpend = bizCostPerSeat * tool.seats;
      const savings = tool.monthlySpend - newSpend;
      
      if (savings > 0) {
        recommendations.push({
          toolId: tool.id,
          toolName: tool.name,
          currentPlan: 'Enterprise',
          suggestedAlternative: bizPlanName,
          monthlySavings: savings,
          annualSavings: savings * 12,
          reason: `Enterprise plans typically require high minimum seats and include long contract lock-ins. With your team size of ${teamSize}, downgrading to the self-serve ${bizPlanName} plan provides core collaborative features with immediate billing agility.`,
          type: 'downgrade'
        });
      }
    }

    // Coding specific: if primary use case is coding but they use ChatGPT Plus (and not Cursor/Windsurf)
    if (primaryUseCase === 'coding' && lowerName === 'chatgpt' && ['plus', 'team'].includes(tool.plan.toLowerCase()) && !toolMap.has('cursor') && !toolMap.has('windsurf')) {
      // Recommend shifting to Cursor for massive productivity gain
      recommendations.push({
        toolId: tool.id,
        toolName: 'ChatGPT',
        currentPlan: tool.plan,
        suggestedAlternative: 'Cursor Pro',
        monthlySavings: 0, // productivity swap
        annualSavings: 0,
        reason: `Since your primary use case is coding, shifting from general-purpose ChatGPT to Cursor Pro (which is priced identically at $20/mo) will increase your developer velocity by 2-3x by integrating inline AI directly into your codebase.`,
        type: 'alternative'
      });
    }

    // Research/Writing: if using high-priced Gemini Ultra but Gemini Pro API or Gemini Free is sufficient
    if (lowerName === 'gemini' && tool.plan.toLowerCase() === 'ultra') {
      const proCost = 20 * tool.seats;
      const savings = tool.monthlySpend - proCost;
      if (savings > 0) {
        recommendations.push({
          toolId: tool.id,
          toolName: 'Gemini',
          currentPlan: 'Ultra',
          suggestedAlternative: 'Pro',
          monthlySavings: savings,
          annualSavings: savings * 12,
          reason: `Gemini Advanced (Ultra) is billed at a premium. Gemini 1.5 Pro via Google AI Studio is either free or highly cost-effective, and provides a massive 2M token context window—significantly outperforming the web UI limits for research and data.`,
          type: 'downgrade'
        });
      }
    }
  });

  // 3. Summarize Optimized Spend and Savings
  // Deduct savings from the current spend. Let's make sure we don't double count savings if we suggest cancelling a tool entirely
  // and also downgrading it. We'll group recommendations by toolId and take the maximum savings.
  const savingsByTool = new Map<string, number>();
  recommendations.forEach(rec => {
    const existing = savingsByTool.get(rec.toolId) || 0;
    if (rec.monthlySavings > existing) {
      savingsByTool.set(rec.toolId, rec.monthlySavings);
    }
  });

  let totalMonthlySavings = 0;
  savingsByTool.forEach(savings => {
    totalMonthlySavings += savings;
  });

  // Ensure savings don't exceed current spend
  totalMonthlySavings = Math.min(currentMonthlySpend, totalMonthlySavings);
  
  const optimizedMonthlySpend = currentMonthlySpend - totalMonthlySavings;

  return {
    tools: processedTools,
    teamSize,
    primaryUseCase,
    currentMonthlySpend,
    currentAnnualSpend: currentMonthlySpend * 12,
    optimizedMonthlySpend,
    optimizedAnnualSpend: optimizedMonthlySpend * 12,
    monthlySavings: totalMonthlySavings,
    annualSavings: totalMonthlySavings * 12,
    recommendations,
  };
}
