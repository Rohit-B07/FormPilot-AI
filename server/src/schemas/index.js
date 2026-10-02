import { z } from 'zod';

// ── Auth ─────────────────────────────────────────────────────
export const profileUpdateSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  preferred_language: z.string().max(10).optional(),
  avatar_url: z.string().url().optional().nullable(),
});

// ── Forms ────────────────────────────────────────────────────
export const formIdSchema = z.object({
  id: z.string().uuid(),
});

// ── Field update ─────────────────────────────────────────────
export const fieldUpdateSchema = z.object({
  mapped_value: z.string().optional().nullable(),
  validation_status: z.enum(['PENDING', 'VALID', 'INVALID', 'WARNING', 'NEEDS_INPUT']).optional(),
});

// ── Answer mapping ───────────────────────────────────────────
export const mapAnswerSchema = z.object({
  text: z.string().min(1).max(5000),
  source: z.enum(['text', 'voice']).default('text'),
});

// ── AI explain field ─────────────────────────────────────────
export const explainFieldSchema = z.object({
  field_label: z.string().min(1),
  field_description: z.string().optional().default(''),
  form_context: z.string().optional().default(''),
});

// ── AI chat ──────────────────────────────────────────────────
export const chatSchema = z.object({
  message: z.string().min(1).max(5000),
  form_id: z.string().uuid().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

// ── Answer create ────────────────────────────────────────────
export const answerCreateSchema = z.object({
  field_id: z.string().uuid(),
  raw_answer: z.string().min(1).max(10000),
  source: z.enum(['text', 'voice', 'autofill']).default('text'),
});

export const answerUpdateSchema = z.object({
  raw_answer: z.string().min(1).max(10000).optional(),
  normalized_answer: z.string().optional(),
});

// ── Document upload metadata ─────────────────────────────────
export const documentMetaSchema = z.object({
  form_id: z.string().uuid().optional(),
  document_type: z.string().max(100).optional(),
});
