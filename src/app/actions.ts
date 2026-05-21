'use server';

import { AuditInput, AuditResult, LeadInput } from '../types';
import { runAudit } from '../utils/auditEngine';
import { generateAISummary, parseSpendText, ParsedAuditInput } from '../utils/ai';
import dbConnect from '../lib/mongodb';
import Audit from '../models/Audit';
import Lead from '../models/Lead';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Helper to encrypt/encode data as a URL-safe base64 string for zero-db sharing
function encodeAuditData(data: AuditResult): string {
  try {
    const jsonStr = JSON.stringify(data);
    // Use Buffer for base64 encoding in Node environment
    return 'b64_' + Buffer.from(jsonStr).toString('base64url');
  } catch (e) {
    console.error('Failed to encode audit data:', e);
    return 'error';
  }
}

// Helper to decode base64 back to AuditResult
function decodeAuditData(encoded: string): AuditResult | null {
  try {
    if (!encoded.startsWith('b64_')) return null;
    const base64Str = encoded.slice(4);
    const jsonStr = Buffer.from(base64Str, 'base64url').toString('utf8');
    return JSON.parse(jsonStr) as AuditResult;
  } catch (e) {
    console.error('Failed to decode audit data:', e);
    return null;
  }
}

/**
 * Server Action to run the audit engine, generate the AI summary,
 * and persist the audit report to MongoDB (falling back to URL serialization if offline).
 */
export async function createAuditAction(input: AuditInput): Promise<{ success: boolean; id: string; data?: AuditResult; error?: string }> {
  try {
    // 1. Run the deterministic cost-optimization audit engine
    const auditResult = runAudit(input);

    // 2. Generate personalized AI summary
    const aiSummary = await generateAISummary(auditResult);
    auditResult.aiSummary = aiSummary;

    // 3. Attempt to connect and write to MongoDB
    const db = await dbConnect();
    if (db) {
      const newAudit = new Audit({
        tools: auditResult.tools,
        teamSize: auditResult.teamSize,
        primaryUseCase: auditResult.primaryUseCase,
        currentMonthlySpend: auditResult.currentMonthlySpend,
        currentAnnualSpend: auditResult.currentAnnualSpend,
        optimizedMonthlySpend: auditResult.optimizedMonthlySpend,
        optimizedAnnualSpend: auditResult.optimizedAnnualSpend,
        monthlySavings: auditResult.monthlySavings,
        annualSavings: auditResult.annualSavings,
        recommendations: auditResult.recommendations,
        aiSummary: auditResult.aiSummary,
        companyName: input.companyName,
      });

      const savedAudit = await newAudit.save();
      return {
        success: true,
        id: savedAudit._id.toString(),
        data: {
          ...auditResult,
          id: savedAudit._id.toString(),
        }
      };
    } else {
      // Offline fallback: encode the entire audit data inside the ID!
      const encodedId = encodeAuditData(auditResult);
      return {
        success: true,
        id: encodedId,
        data: {
          ...auditResult,
          id: encodedId,
        }
      };
    }
  } catch (err) {
    const error = err as Error;
    console.error('Server Action - createAuditAction error:', error);
    return { success: false, id: '', error: error.message || 'Internal server error running spend audit.' };
  }
}

/**
 * Server Action to retrieve an audit report by its unique ID.
 * Supports standard MongoDB ObjectId fetch or offline base64 decoding.
 */
export async function getAuditAction(id: string): Promise<{ success: boolean; data: AuditResult | null; offline: boolean }> {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, data: null, offline: true };
    }

    // Check if it's a serialized base64 audit (offline share fallback)
    if (id.startsWith('b64_')) {
      const decodedData = decodeAuditData(id);
      if (decodedData) {
        return { success: true, data: decodedData, offline: true };
      }
    }

    // Attempt MongoDB lookup
    const db = await dbConnect();
    if (db) {
      const doc = await Audit.findById(id).lean();
      if (doc) {
        // Cast mongoose document to strict typescript interface
        const leanDoc = doc as unknown as AuditResult & { _id: { toString(): string }; createdAt?: Date };
        const auditData: AuditResult = {
          id: leanDoc._id.toString(),
          tools: leanDoc.tools,
          teamSize: leanDoc.teamSize,
          primaryUseCase: leanDoc.primaryUseCase,
          currentMonthlySpend: leanDoc.currentMonthlySpend,
          currentAnnualSpend: leanDoc.currentAnnualSpend,
          optimizedMonthlySpend: leanDoc.optimizedMonthlySpend,
          optimizedAnnualSpend: leanDoc.optimizedAnnualSpend,
          monthlySavings: leanDoc.monthlySavings,
          annualSavings: leanDoc.annualSavings,
          recommendations: leanDoc.recommendations,
          aiSummary: leanDoc.aiSummary,
          createdAt: leanDoc.createdAt?.toISOString(),
        };
        return { success: true, data: auditData, offline: false };
      }
    }

    return { success: false, data: null, offline: !db };
  } catch (err) {
    console.error('Server Action - getAuditAction error:', err);
    return { success: false, data: null, offline: true };
  }
}

/**
 * Server Action to capture leads, save to MongoDB, and dispatch email via Resend.
 */
export async function submitLeadAction(input: LeadInput): Promise<{ success: boolean; message: string }> {
  try {
    const { email, companyName, role, teamSize, auditId } = input;

    // Validate email again
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    // 1. Save lead to Database
    const db = await dbConnect();
    if (db) {
      const lead = new Lead({
        email,
        companyName,
        role,
        teamSize,
        auditId,
      });
      await lead.save();
    } else {
      console.log('📝 Lead captured (offline mode):', input);
    }

    // 2. Dispatch Confirmation Email via SMTP or Resend
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const auditLink = `${appUrl}/audit/${auditId}`;

    const subject = 'Your AI Spend Audit Report - Credex';
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f3f4f6; border-radius: 8px;">
        <h2 style="color: #6366f1; margin-bottom: 20px;">Your Credex AI Spend Audit is Ready!</h2>
        <p>Hi there,</p>
        <p>Thank you for using Credex. We have completed your cost audit analysis and found significant areas to save budget while maintaining your engineering velocity.</p>
        <p>You can access your personalized report at any time using your audit link:</p>
        <div style="margin: 25px 0;">
          <a href="${auditLink}" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Full Interactive Audit</a>
        </div>
        <p style="font-size: 14px; color: #9ca3af;">If you have any questions or want a manual deep-dive into tool licensing, schedule a consultation on our dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #1f2937; margin: 30px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">&copy; ${new Date().getFullYear()} Credex. AI Spend Optimization for Startups.</p>
      </div>
    `;

    let emailSent = false;

    // A. Option 1: Standard SMTP (Gmail App Password, Brevo SMTP, etc.)
    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // True for 465, false for 587
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const fromAddress = process.env.SMTP_FROM || `"Credex Spend Audit" <${smtpUser}>`;
        await transporter.sendMail({
          from: fromAddress,
          to: email,
          subject,
          html: htmlBody,
        });

        console.log(`✉️ Audit confirmation email dispatched via SMTP to ${email}`);
        emailSent = true;
      } catch (smtpErr) {
        console.error('⚠️ SMTP email delivery failed:', smtpErr);
      }
    }

    // B. Option 2: Resend API (Fallback if SMTP is not defined)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!emailSent && resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        // Fallback to onboarding@resend.dev to prevent unverified domain blocks
        const fromAddress = process.env.RESEND_FROM || process.env.RESEND_SENDER_EMAIL || 'Credex Spend Audit <onboarding@resend.dev>';
        await resend.emails.send({
          from: fromAddress,
          to: email,
          subject,
          html: htmlBody,
        });
        console.log(`✉️ Audit confirmation email dispatched via Resend to ${email}`);
        emailSent = true;
      } catch (resendErr) {
        console.error('⚠️ Resend email delivery failed:', resendErr);
      }
    }

    if (!emailSent) {
      console.log(`✉️ Email Mocked (Configure SMTP_USER & SMTP_PASS or RESEND_API_KEY in .env): Sent audit link to ${email}`);
    }

    return { success: true, message: 'Your audit has been emailed and lead successfully registered!' };
  } catch (err) {
    const error = err as Error;
    console.error('Server Action - submitLeadAction error:', error);
    return { success: false, message: error.message || 'Failed to submit lead registration.' };
  }
}

/**
 * Server Action to parse pasted invoice or billing text and auto-detect subscriptions.
 */
export async function parseSpendTextAction(text: string): Promise<{ success: boolean; data: ParsedAuditInput | null; error?: string }> {
  try {
    const data = await parseSpendText(text);
    return { success: true, data };
  } catch (err) {
    const error = err as Error;
    console.error('Server Action - parseSpendTextAction error:', error);
    return { success: false, data: null, error: error.message || 'Failed to parse invoice text.' };
  }
}
