import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
  toolId: string;
  toolName: string;
  currentPlan: string;
  suggestedAlternative: string;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  type: 'downgrade' | 'consolidation' | 'alternative' | 'optimization';
  createdAt: Date;
  updatedAt: Date;
}

export const RecommendationSchema = new Schema<IRecommendation>({
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
}, {
  timestamps: true
});

export default mongoose.models.Recommendation || mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
