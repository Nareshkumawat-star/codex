import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId?: string; // Reference to the audit report that drove this lead
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>({
  email: { 
    type: String, 
    required: true, 
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] 
  },
  companyName: { type: String, trim: true },
  role: { type: String, trim: true },
  teamSize: { type: Number },
  auditId: { type: String },
}, {
  timestamps: true
});

// Indexes for unique emails or sorting by creation date
LeadSchema.index({ email: 1 });
LeadSchema.index({ createdAt: -1 });

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
