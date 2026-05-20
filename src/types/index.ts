export type UseCase = 'coding' | 'writing' | 'research' | 'data' | 'mixed';

export interface ToolInput {
  id: string;
  name: string; // e.g., 'Cursor', 'ChatGPT', etc.
  plan: string; // e.g., 'Pro', 'Business', 'API direct'
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  tools: ToolInput[];
  teamSize: number;
  primaryUseCase: UseCase;
  companyName?: string;
}

export interface Recommendation {
  toolId: string;
  toolName: string;
  currentPlan: string;
  suggestedAlternative: string;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  type: 'downgrade' | 'consolidation' | 'alternative' | 'optimization';
}

export interface AuditResult {
  id?: string;
  tools: ToolInput[];
  teamSize: number;
  primaryUseCase: UseCase;
  currentMonthlySpend: number;
  currentAnnualSpend: number;
  optimizedMonthlySpend: number;
  optimizedAnnualSpend: number;
  monthlySavings: number;
  annualSavings: number;
  recommendations: Recommendation[];
  aiSummary?: string;
  createdAt?: string;
}

export interface LeadInput {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId?: string;
}

export interface Lead {
  id: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId?: string;
  createdAt: string;
}
