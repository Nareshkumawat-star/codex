export interface PlanDetails {
  name: string;
  pricePerSeat: number; // USD per month, 0 if free or usage-based
  isUsageBased: boolean;
}

export interface ToolPricing {
  name: string;
  plans: PlanDetails[];
}

export const SUPPORTED_TOOLS = [
  'Cursor',
  'GitHub Copilot',
  'Claude',
  'ChatGPT',
  'Anthropic API direct',
  'OpenAI API direct',
  'Gemini',
  'Windsurf',
  'v0'
] as const;

export const TOOL_PRICING: Record<string, ToolPricing> = {
  'Cursor': {
    name: 'Cursor',
    plans: [
      { name: 'Hobby', pricePerSeat: 0, isUsageBased: false },
      { name: 'Pro', pricePerSeat: 20, isUsageBased: false },
      { name: 'Business', pricePerSeat: 40, isUsageBased: false },
      { name: 'Enterprise', pricePerSeat: 100, isUsageBased: false },
    ],
  },
  'GitHub Copilot': {
    name: 'GitHub Copilot',
    plans: [
      { name: 'Individual', pricePerSeat: 10, isUsageBased: false },
      { name: 'Business', pricePerSeat: 19, isUsageBased: false },
      { name: 'Enterprise', pricePerSeat: 39, isUsageBased: false },
    ],
  },
  'Claude': {
    name: 'Claude',
    plans: [
      { name: 'Free', pricePerSeat: 0, isUsageBased: false },
      { name: 'Pro', pricePerSeat: 20, isUsageBased: false },
      { name: 'Team', pricePerSeat: 25, isUsageBased: false },
      { name: 'Enterprise', pricePerSeat: 75, isUsageBased: false },
      { name: 'API direct', pricePerSeat: 0, isUsageBased: true },
    ],
  },
  'ChatGPT': {
    name: 'ChatGPT',
    plans: [
      { name: 'Plus', pricePerSeat: 20, isUsageBased: false },
      { name: 'Team', pricePerSeat: 25, isUsageBased: false },
      { name: 'Enterprise', pricePerSeat: 60, isUsageBased: false },
      { name: 'API direct', pricePerSeat: 0, isUsageBased: true },
    ],
  },
  'Anthropic API direct': {
    name: 'Anthropic API direct',
    plans: [
      { name: 'API direct', pricePerSeat: 0, isUsageBased: true },
    ],
  },
  'OpenAI API direct': {
    name: 'OpenAI API direct',
    plans: [
      { name: 'API direct', pricePerSeat: 0, isUsageBased: true },
    ],
  },
  'Gemini': {
    name: 'Gemini',
    plans: [
      { name: 'Free', pricePerSeat: 0, isUsageBased: false },
      { name: 'Pro', pricePerSeat: 20, isUsageBased: false },
      { name: 'Ultra', pricePerSeat: 40, isUsageBased: false },
      { name: 'API', pricePerSeat: 0, isUsageBased: true },
    ],
  },
  'Windsurf': {
    name: 'Windsurf',
    plans: [
      { name: 'Free', pricePerSeat: 0, isUsageBased: false },
      { name: 'Pro', pricePerSeat: 15, isUsageBased: false },
      { name: 'Team', pricePerSeat: 30, isUsageBased: false },
    ],
  },
  'v0': {
    name: 'v0',
    plans: [
      { name: 'Free', pricePerSeat: 0, isUsageBased: false },
      { name: 'Premium', pricePerSeat: 20, isUsageBased: false },
      { name: 'Team', pricePerSeat: 30, isUsageBased: false },
    ],
  },
};

/**
 * Gets the standard price per seat for a given tool and plan.
 * If usage-based, returns 0 (rely on user's inputted spend).
 */
export function getStandardPrice(toolName: string, planName: string): number {
  const tool = TOOL_PRICING[toolName];
  if (!tool) return 0;
  const plan = tool.plans.find(p => p.name.toLowerCase() === planName.toLowerCase());
  return plan ? plan.pricePerSeat : 0;
}
