import { z } from 'zod';
import { AGENT_IDS } from '../types/index';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected a YYYY-MM-DD date');

export const planFieldsSchema = z.object({
  status: z.enum(['idea', 'planned', 'in-progress', 'review', 'done', 'dropped']),
  kind: z.enum(['feat', 'fix', 'chore', 'docs', 'refactor']).optional(),
  id: z.string().optional(),
  idea: z.string().optional(),
  agent: z.enum(AGENT_IDS).optional(),
  created: dateString,
  updated: dateString.optional(),
  tags: z.string().optional(),
});

export const decisionFieldsSchema = z.object({
  date: dateString,
  status: z.enum(['decided', 'superseded']),
  'superseded-by': z.string().optional(),
});

export const openQuestionFieldsSchema = z.object({
  status: z.enum(['open', 'resolved']),
  raised: dateString,
  'resolved-by': z.string().optional(),
});

export const paperCampConfigSchema = z.object({
  version: z.string(),
  projectName: z.string(),
  initializedAt: z.string(),
  nextId: z
    .object({
      feat: z.number(),
      fix: z.number(),
      chore: z.number(),
      docs: z.number(),
      refactor: z.number(),
    })
    .optional(),
  defaultAgent: z.enum(AGENT_IDS).optional(),
});

export type PlanFields = z.infer<typeof planFieldsSchema>;
export type DecisionFields = z.infer<typeof decisionFieldsSchema>;
export type OpenQuestionFields = z.infer<typeof openQuestionFieldsSchema>;
