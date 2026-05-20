import mongoose, { Schema, Document } from 'mongoose';

export interface IToolInput {
  id: string;
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface IRecommendation {
  toolId: string;
  toolName: string;
  currentPlan: string;
  suggestedAlternative: string;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  type: 'downgrade' | 'consolidation' | 'alternative' | 'optimization';
}

export interface IAudit extends Document {
  tools: IToolInput[];
  teamSize: number;
  primaryUseCase: string;
  currentMonthlySpend: number;
  currentAnnualSpend: number;
  optimizedMonthlySpend: number;
  optimizedAnnualSpend: number;
  monthlySavings: number;
  annualSavings: number;
  recommendations: IRecommendation[];
  aiSummary?: string;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ToolInputSchema = new Schema<IToolInput>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  plan: { type: String, required: true },
  monthlySpend: { type: Number, required: true },
  seats: { type: Number, required: true },
});

const RecommendationSchema = new Schema<IRecommendation>({
  toolId: { type: String, required: true },
  toolName: { type: String, required: true },
  currentPlan: { type: String, required: true },
  suggestedAlternative: { type: String, required: true },
  monthlySavings: { type: Number, required: true },
  annualSavings: { type: Number, required: true },
  reason: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['downgrade', 'consolidation', 'alternative', 'optimization'], 
    required: true 
  },
});

const AuditSchema = new Schema<IAudit>({
  tools: [ToolInputSchema],
  teamSize: { type: Number, required: true },
  primaryUseCase: { type: String, required: true },
  currentMonthlySpend: { type: Number, required: true },
  currentAnnualSpend: { type: Number, required: true },
  optimizedMonthlySpend: { type: Number, required: true },
  optimizedAnnualSpend: { type: Number, required: true },
  monthlySavings: { type: Number, required: true },
  annualSavings: { type: Number, required: true },
  recommendations: [RecommendationSchema],
  aiSummary: { type: String },
  companyName: { type: String },
}, {
  timestamps: true
});

// Indexing for performance and speed on lookup
AuditSchema.index({ createdAt: -1 });

export default mongoose.models.Audit || mongoose.model<IAudit>('Audit', AuditSchema);
