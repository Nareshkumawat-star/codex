import { AuditResult } from '../types';

/**
 * Generates an AI spend summary based on audit data.
 * Checks for standard API keys in environment variables (Gemini, OpenAI, Anthropic).
 * Falls back to a rich, dynamically generated summary if offline or if no keys are set.
 */
export async function generateAISummary(audit: AuditResult): Promise<string> {
  const {
    currentMonthlySpend,
    monthlySavings,
    annualSavings,
    teamSize,
    primaryUseCase,
    recommendations,
  } = audit;

  const totalTools = audit.tools.length;
  const savingsPercent = currentMonthlySpend > 0 ? Math.round((monthlySavings / currentMonthlySpend) * 100) : 0;
  
  // Construct a solid prompt for the LLM
  const prompt = `
    You are an expert SaaS CFO and startup cost optimization analyst.
    Analyze this AI tooling spend audit and write a concise, highly professional ~100-word summary.
    
    Data:
    - Team Size: ${teamSize}
    - Total AI Tools: ${totalTools}
    - Primary Use Case: ${primaryUseCase}
    - Current Monthly Spend: $${currentMonthlySpend}
    - Identified Monthly Savings: $${monthlySavings}
    - Identified Annual Savings: $${annualSavings} (${savingsPercent}% reduction)
    - Key Recommendations: ${recommendations.map(r => `${r.toolName}: ${r.suggestedAlternative} (saves $${r.monthlySavings}/mo) - ${r.reason}`).join('; ')}
    
    Output requirements:
    - Keep it under 100 words.
    - Focus on strategic cost-efficiency and operational velocity.
    - Write in a modern, premium startup tone.
    - Do not output markdown lists, just a single cohesive paragraph.
  `;

  // 1. Try Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 200 }
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn('Gemini API call failed, trying fallbacks...', e);
    }
  }

  // 2. Try OpenAI API
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn('OpenAI API call failed, trying fallbacks...', e);
    }
  }

  // 3. Try Anthropic API
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data?.content?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn('Anthropic API call failed, running default template...', e);
    }
  }

  // 4. Default dynamic high-fidelity CFO optimization summary
  const redundancyCount = recommendations.filter(r => r.type === 'consolidation').length;
  const downgradeCount = recommendations.filter(r => r.type === 'downgrade').length;

  let fallbackSummary = `Credex analysis reveals a significant optimization runway for your team of ${teamSize}. `;
  if (monthlySavings > 0) {
    fallbackSummary += `We identified $${monthlySavings.toLocaleString()}/month ($${annualSavings.toLocaleString()}/year) in redundant licenses, representing a ${savingsPercent}% savings opportunities. `;
    if (redundancyCount > 0) {
      fallbackSummary += `By consolidating duplicate frontier chat models and streamlining developer tools, you eliminate license overlaps with zero impact on team bandwidth. `;
    }
    if (downgradeCount > 0) {
      fallbackSummary += `Additionally, resizing oversized 'Team' licenses to match your active seat allocation will recover immediate margins. `;
    }
    fallbackSummary += `Implementing these recommendations will lock in high operational speed while ensuring a highly optimized, lean stack.`;
  } else {
    fallbackSummary += `Your stack is highly optimized! Your active licensing matches your ${primaryUseCase}-focused team with excellent cost-to-value returns and zero redundant seat overlaps.`;
  }

  return fallbackSummary;
}

export interface ParsedTool {
  name: string;
  plan: string;
  seats: number;
  monthlySpend: number;
}

export interface ParsedAuditInput {
  tools: ParsedTool[];
  teamSize?: number;
  primaryUseCase?: string;
}

/**
 * Parses raw text or invoice snippet to auto-detect AI spend inputs.
 * Uses LLM if key is present, otherwise falls back to highly-optimized regex heuristic.
 */
export async function parseSpendText(text: string): Promise<ParsedAuditInput> {
  const normalizedText = text || '';
  const prompt = `
    You are an expert AI software licensing parser. Your task is to analyze the raw input text below (which might be a past billing statement, email invoice, or manual text notes) and extract details of AI tool subscriptions.
    
    Format the output strictly as a JSON object matching this schema:
    {
      "tools": [
        {
          "name": "Cursor" | "GitHub Copilot" | "Claude" | "ChatGPT" | "Anthropic API direct" | "OpenAI API direct" | "Gemini" | "Windsurf" | "v0",
          "plan": "Pro" | "Team" | "Business" | "Enterprise" | "Individual" | "Free" | "API direct" | "Premium" | "Hobby",
          "seats": number,
          "monthlySpend": number
        }
      ],
      "teamSize": number,
      "primaryUseCase": "Coding & Software Development" | "Content & Copywriting" | "Customer Support & Chatbots" | "Product Design & Prototyping" | "General Productivity & Enterprise Search" | "Data Analytics & Research"
    }

    Rules:
    1. Map tool names exactly to one of: "Cursor", "GitHub Copilot", "Claude", "ChatGPT", "Anthropic API direct", "OpenAI API direct", "Gemini", "Windsurf", "v0".
    2. Try to map plans to supported plans (e.g. "Pro", "Team", "Business", "Enterprise", "Individual", "Free", "Premium").
    3. If seats is not mentioned, default to 1.
    4. If monthlySpend is not mentioned, use standard seat price multiplied by seats, or 0.
    5. Output ONLY a valid JSON block. Do not include markdown code fences (\`\`\`), additional text, or explanation.
    
    Input Text:
    "${normalizedText.replace(/"/g, '\\"')}"
  `;

  // 1. Try Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 500, responseMimeType: 'application/json' }
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResult) {
          const parsed = JSON.parse(textResult.trim());
          if (parsed && Array.isArray(parsed.tools)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Gemini parser failed, checking other methods...', e);
    }
  }

  // 2. Try OpenAI API
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          max_tokens: 300,
          temperature: 0.1,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const textResult = data?.choices?.[0]?.message?.content;
        if (textResult) {
          const parsed = JSON.parse(textResult.trim());
          if (parsed && Array.isArray(parsed.tools)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('OpenAI parser failed, checking other methods...', e);
    }
  }

  // 3. Fallback Heuristic Regex Parser (extremely high-fidelity regex mapping)
  const parsedTools: ParsedTool[] = [];
  const lowercaseText = normalizedText.toLowerCase();

  // Define regex matches for tool names
  const toolMappings = [
    { regex: /cursor/i, name: 'Cursor', defaultPlan: 'Pro' },
    { regex: /copilot/i, name: 'GitHub Copilot', defaultPlan: 'Business' },
    { regex: /claude/i, name: 'Claude', defaultPlan: 'Team' },
    { regex: /chatgpt/i, name: 'ChatGPT', defaultPlan: 'Team' },
    { regex: /anthropic\s*api/i, name: 'Anthropic API direct', defaultPlan: 'API direct' },
    { regex: /openai\s*api/i, name: 'OpenAI API direct', defaultPlan: 'API direct' },
    { regex: /gemini/i, name: 'Gemini', defaultPlan: 'Pro' },
    { regex: /windsurf/i, name: 'Windsurf', defaultPlan: 'Pro' },
    { regex: /v0/i, name: 'v0', defaultPlan: 'Premium' },
  ];

  for (const tool of toolMappings) {
    if (tool.regex.test(normalizedText)) {
      // Find plan details
      let plan = tool.defaultPlan;
      const toolIdx = lowercaseText.indexOf(tool.name.toLowerCase());
      const startWindow = Math.max(0, toolIdx - 25);
      const endWindow = Math.min(lowercaseText.length, toolIdx + tool.name.length + 25);
      const localContext = lowercaseText.slice(startWindow, endWindow);

      if (/enterprise/i.test(localContext)) {
        plan = 'Enterprise';
      } else if (/business/i.test(localContext)) {
        plan = 'Business';
      } else if (/team/i.test(localContext)) {
        plan = 'Team';
      } else if (/pro/i.test(localContext)) {
        plan = 'Pro';
      }

      // Try to find seats (e.g. "5 seats", "3 users", "7 devs", "2 licenses")
      let seats = 1;
      const seatRegex = new RegExp(`(\\d+)\\s*(?:seats?|users?|devs?|licenses?|people|person|accounts?)\\s*(?:of|for)?\\s*${tool.name}`, 'i');
      const seatRegexReverse = new RegExp(`${tool.name}[^.,]*?(\\d+)\\s*(?:seats?|users?|devs?|licenses?|people|person|accounts?)`, 'i');
      
      const match1 = normalizedText.match(seatRegex);
      const match2 = normalizedText.match(seatRegexReverse);
      if (match1) {
        seats = parseInt(match1[1], 10);
      } else if (match2) {
        seats = parseInt(match2[1], 10);
      } else {
        // Look for general digit before or after the tool name
        const genericSeatMatch = normalizedText.match(new RegExp(`(\\d+)\\s*x\\s*${tool.name}`, 'i'));
        if (genericSeatMatch) {
          seats = parseInt(genericSeatMatch[1], 10);
        }
      }

      // Try to find price/monthlySpend (e.g. "$90", "120/mo", "spending 200 dollars")
      let monthlySpend = 0;
      const priceRegex = new RegExp(`(?:\\$|usd|price|cost|pay)\\s*(\\d+(?:\\.\\d{2})?)`, 'i');
      const priceMatch = normalizedText.match(priceRegex);
      
      // Attempt context-aware pricing
      if (priceMatch) {
        // Simple heuristic: if only one price is found, apply it to the first tool or split it
        monthlySpend = parseFloat(priceMatch[1]);
      } else {
        // Use realistic defaults based on plan and seats
        const defaultSeatPrice: Record<string, number> = {
          'Pro': 20,
          'Team': 25,
          'Business': 19,
          'Enterprise': 60,
          'Premium': 20,
          'API direct': 50
        };
        monthlySpend = (defaultSeatPrice[plan] || 20) * seats;
      }

      parsedTools.push({
        name: tool.name,
        plan,
        seats: seats || 1,
        monthlySpend: monthlySpend || 20
      });
    }
  }

  // Detect team size
  let teamSize = 5;
  const teamMatch1 = normalizedText.match(/(?:team size|company size|our team|startup size)\s*(?:of|is|has)?\s*(\d+)/i);
  const teamMatch2 = normalizedText.match(/(\d+)\s*(?:people|employees|members|staff|devs)\s*(?:in|on)?\s*(?:our|the)?\s*(?:team|company|startup)/i);
  const teamMatch3 = normalizedText.match(/(?:we are|startup with|team of)\s*(?:a|an)?\s*(?:startup|team)?\s*(?:of|with|is)?\s*(\d+)\s*(?:people|employees|members|users)?/i);
  
  if (teamMatch1) {
    teamSize = parseInt(teamMatch1[1], 10);
  } else if (teamMatch2) {
    teamSize = parseInt(teamMatch2[1], 10);
  } else if (teamMatch3) {
    teamSize = parseInt(teamMatch3[1], 10);
  }

  // Detect use case
  let primaryUseCase = 'Coding & Software Development';
  if (/design|\bui\b|\bux\b|figma|proto/i.test(lowercaseText)) {
    primaryUseCase = 'Product Design & Prototyping';
  } else if (/copy|write|content|marketing/i.test(lowercaseText)) {
    primaryUseCase = 'Content & Copywriting';
  } else if (/support|chat|customer|help/i.test(lowercaseText)) {
    primaryUseCase = 'Customer Support & Chatbots';
  } else if (/analytics|data|research|excel/i.test(lowercaseText)) {
    primaryUseCase = 'Data Analytics & Research';
  }

  return {
    tools: parsedTools,
    teamSize,
    primaryUseCase
  };
}
