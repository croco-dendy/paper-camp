import type {
  DecisionEntry,
  IdeaEntry,
  IdeaStatus,
  OpenQuestionEntry,
  ParseResult,
  PhaseItem,
  PlanEntry,
  ProgressEntry,
  RawEntry,
} from '../types/index';
import { decisionFieldsSchema, openQuestionFieldsSchema, planFieldsSchema } from './schemas';

const HEADING_RE = /^##\s+(.+?)\s*$/;
const FIELD_RE = /^\*\*([A-Za-z][A-Za-z-]*):\*\*\s*(.*)$/;
const PHASES_HEADING_RE = /^###\s+Phases\s*$/i;
const LOG_HEADING_RE = /^###\s+Log\s*$/i;
const SUB_HEADING_RE = /^#{2,3}\s+/;
const CHECKBOX_RE = /^[-*]\s+\[([ xX])\]\s+(.*)$/;
const LOG_ENTRY_RE = /^-\s+(\d{4}-\d{2}-\d{2}):\s*(.*)$/;

function extractSection<T>(
  body: string,
  headingRe: RegExp,
  parseFn: (lines: string[], start: number, end: number) => T[],
): { body: string; entries: T[] } {
  const lines = body.split('\n');
  const sectionStart = lines.findIndex((line) => headingRe.test(line));
  if (sectionStart === -1) return { body, entries: [] };

  let sectionEnd = lines.length;
  for (let i = sectionStart + 1; i < lines.length; i++) {
    if (SUB_HEADING_RE.test(lines[i])) {
      sectionEnd = i;
      break;
    }
  }

  const entries = parseFn(lines, sectionStart + 1, sectionEnd);
  const remaining = [...lines.slice(0, sectionStart), ...lines.slice(sectionEnd)].join('\n').trim();
  return { body: remaining, entries };
}

function parsePhaseEntries(lines: string[], start: number, end: number): PhaseItem[] {
  const phases: PhaseItem[] = [];
  let i = start;
  while (i < end) {
    const match = lines[i].match(CHECKBOX_RE);
    if (match) {
      const text = match[2].trim();
      const done = match[1].toLowerCase() === 'x';
      const descriptionLines: string[] = [];
      i++;
      while (i < end) {
        const next = lines[i];
        if (next.trim() === '') break;
        if (CHECKBOX_RE.test(next) || SUB_HEADING_RE.test(next)) break;
        if (/^\s/.test(next)) {
          descriptionLines.push(next.trimStart());
          i++;
        } else {
          break;
        }
      }
      phases.push({
        done,
        text,
        description: descriptionLines.length > 0 ? descriptionLines.join('\n') : undefined,
      });
    } else {
      i++;
    }
  }
  return phases;
}

function extractPhases(body: string): { body: string; phases: PhaseItem[] } {
  const result = extractSection(body, PHASES_HEADING_RE, parsePhaseEntries);
  return { body: result.body, phases: result.entries };
}

function parseLogEntries(
  lines: string[],
  start: number,
  end: number,
): import('../types/index').LogEntry[] {
  const log: import('../types/index').LogEntry[] = [];
  for (let i = start; i < end; i++) {
    const match = lines[i].match(LOG_ENTRY_RE);
    if (match) {
      log.push({ date: match[1], text: match[2].trim() });
    }
  }
  return log;
}

function extractLog(body: string): { body: string; log: import('../types/index').LogEntry[] } {
  const result = extractSection(body, LOG_HEADING_RE, parseLogEntries);
  return { body: result.body, log: result.entries };
}

export function parseRawEntries(markdown: string): RawEntry[] {
  const lines = markdown.split('\n');
  const headingIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (HEADING_RE.test(lines[i])) {
      headingIndices.push(i);
    }
  }

  const entries: RawEntry[] = [];
  for (let h = 0; h < headingIndices.length; h++) {
    const start = headingIndices[h];
    const end = h + 1 < headingIndices.length ? headingIndices[h + 1] : lines.length;
    const title = lines[start].match(HEADING_RE)![1];
    const block = lines.slice(start + 1, end);

    let cursor = 0;
    while (cursor < block.length && block[cursor].trim() === '') cursor++;

    const fields: Record<string, string> = {};
    while (cursor < block.length) {
      const match = block[cursor].match(FIELD_RE);
      if (!match) break;
      fields[match[1].toLowerCase()] = match[2].trim();
      cursor++;
    }

    while (cursor < block.length && block[cursor].trim() === '') cursor++;

    const rawBody = block.slice(cursor).join('\n').trim();
    let { body, phases } = extractPhases(rawBody);
    const { body: bodyAfterLog, log } = extractLog(body);
    body = bodyAfterLog;

    entries.push({ title, fields, body, phases, log });
  }

  return entries;
}

export function parsePlans(markdown: string): ParseResult<PlanEntry> {
  const entries: PlanEntry[] = [];
  const warnings: ParseResult<PlanEntry>['warnings'] = [];

  for (const raw of parseRawEntries(markdown)) {
    const result = planFieldsSchema.safeParse(raw.fields);
    if (!result.success) {
      warnings.push({
        title: raw.title,
        message: result.error.issues.map((i) => i.message).join('; '),
      });
      continue;
    }
    const fields = result.data;
    entries.push({
      title: raw.title,
      status: fields.status,
      kind: fields.kind,
      id: fields.id,
      idea: fields.idea,
      agent: fields.agent,
      created: fields.created,
      updated: fields.updated,
      tags: fields.tags
        ? fields.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      body: raw.body,
      phases: raw.phases,
      log: raw.log,
    });
  }

  return { entries, warnings };
}

export function parseDecisions(markdown: string): ParseResult<DecisionEntry> {
  const entries: DecisionEntry[] = [];
  const warnings: ParseResult<DecisionEntry>['warnings'] = [];

  for (const raw of parseRawEntries(markdown)) {
    const result = decisionFieldsSchema.safeParse(raw.fields);
    if (!result.success) {
      warnings.push({
        title: raw.title,
        message: result.error.issues.map((i) => i.message).join('; '),
      });
      continue;
    }
    const fields = result.data;
    entries.push({
      title: raw.title,
      date: fields.date,
      status: fields.status,
      supersededBy: fields['superseded-by'],
      body: raw.body,
    });
  }

  return { entries, warnings };
}

export function parseOpenQuestions(markdown: string): ParseResult<OpenQuestionEntry> {
  const entries: OpenQuestionEntry[] = [];
  const warnings: ParseResult<OpenQuestionEntry>['warnings'] = [];

  for (const raw of parseRawEntries(markdown)) {
    const result = openQuestionFieldsSchema.safeParse(raw.fields);
    if (!result.success) {
      warnings.push({
        title: raw.title,
        message: result.error.issues.map((i) => i.message).join('; '),
      });
      continue;
    }
    const fields = result.data;
    entries.push({
      title: raw.title,
      status: fields.status,
      raised: fields.raised,
      resolvedBy: fields['resolved-by'],
      body: raw.body,
    });
  }

  return { entries, warnings };
}

const IDEA_ID_RE = /^(IDEA-\d+):\s*/;

const IDEA_SEPARATOR_RE = /\n---+\n/;

/** ideas.md is split into sections by `---` separators. Each section has an optional
 * `### IDEA-N:` heading prefix followed by a short title, and a prose body. */
export function parseIdeas(markdown: string): IdeaEntry[] {
  const sections = markdown.split(IDEA_SEPARATOR_RE).filter(Boolean);
  return sections.map((section) => {
    const headingMatch = section.match(/^#{1,3}\s+(.+)/m);
    const rawTitle = headingMatch
      ? headingMatch[1].trim()
      : (section.trim().split('\n')[0]?.trim() ?? 'Untitled');
    const idMatch = rawTitle.match(IDEA_ID_RE);
    const id = idMatch?.[1] ?? null;
    const title = id ? rawTitle.slice(idMatch![0].length) : rawTitle;
    return { id, title, body: section.trim() };
  });
}

export function deriveIdeaStatuses(ideas: IdeaEntry[], plans: PlanEntry[]): IdeaEntry[] {
  return ideas.map((idea) => {
    if (!idea.id) {
      return { ...idea, status: 'planned' };
    }
    const linkedPlans = plans.filter((p) => p.idea === idea.id);
    if (linkedPlans.length === 0) {
      return { ...idea, status: 'planned' };
    }
    const allDone = linkedPlans.every((p) => p.status === 'done' || p.status === 'dropped');
    return { ...idea, status: allDone ? 'done' : 'planned' };
  });
}

const PROGRESS_HEADING_RE = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/;
const BULLET_RE = /^[-*]\s+(.*)$/;

/** progress.md is an append-only date log, not a record-based file — no fields, no validation. */
export function parseProgress(markdown: string): ProgressEntry[] {
  const lines = markdown.split('\n');
  const headingIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (PROGRESS_HEADING_RE.test(lines[i])) {
      headingIndices.push(i);
    }
  }

  const entries: ProgressEntry[] = [];
  for (let h = 0; h < headingIndices.length; h++) {
    const start = headingIndices[h];
    const end = h + 1 < headingIndices.length ? headingIndices[h + 1] : lines.length;
    const date = lines[start].match(PROGRESS_HEADING_RE)![1];
    const items = lines
      .slice(start + 1, end)
      .map((line) => line.match(BULLET_RE))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => m[1].trim());

    entries.push({ date, items });
  }

  return entries;
}
