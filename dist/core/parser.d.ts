import { z } from 'zod';
import { ConsistencyIssue, DecisionEntry, IdeaEntry, OpenQuestionEntry, ParseResult, ParseWarning, PlanEntry, ProgressEntry, RawEntry } from '../types/index';
export declare function parseRawEntries(markdown: string): RawEntry[];
export declare function parsePlans(markdown: string): ParseResult<PlanEntry>;
export declare function parseDecisions(markdown: string): ParseResult<DecisionEntry>;
export declare function parseOpenQuestions(markdown: string): ParseResult<OpenQuestionEntry>;
/**
 * Extracts and validates YAML frontmatter from a markdown string.
 * Returns the parsed data + body without warnings on success.
 * Returns partial data + warnings when frontmatter is absent, malformed,
 * or fails schema validation — never throws.
 */
export declare function parseFrontmatter<T>(content: string, schema: z.ZodType<T>): {
    data: T | null;
    body: string;
    warnings: ParseWarning[];
};
/**
 * Parse a single per-plan file with YAML frontmatter.
 * The body after frontmatter is scanned for ### Phases and ### Log sections,
 * same as the monolithic parser.
 */
export declare function parsePlanFile(content: string): ParseResult<PlanEntry>;
/**
 * Parse a single per-idea file with YAML frontmatter.
 */
export declare function parseIdeaFile(content: string): ParseResult<IdeaEntry>;
/** ideas.md is split into sections by `---` separators. Each section has an optional
 * `### IDEA-N:` heading prefix followed by a short title, and a prose body. */
export declare function parseIdeas(markdown: string): IdeaEntry[];
/** Read-only cross-reference checks over already-parsed decisions/open-questions/plans —
 * dangling `resolved-by`/`superseded-by` titles, and open questions blocking an
 * already-active plan. */
export declare function findConsistencyIssues(decisions: DecisionEntry[], openQuestions: OpenQuestionEntry[], plans: PlanEntry[]): ConsistencyIssue[];
/**
 * Reads all per-file plans from a directory (non-recursive, excludes index.md).
 * Returns empty result if the directory doesn't exist or has no plan files.
 */
export declare function readAllPlanFiles(plansDir: string): Promise<ParseResult<PlanEntry>>;
/**
 * Reads all per-file ideas from a directory (non-recursive, excludes index.md).
 */
export declare function readAllIdeaFiles(ideasDir: string): Promise<ParseResult<IdeaEntry>>;
/**
 * Merges per-file plan entries with monolithic fallback, deduplicating by id/title.
 * Per-file entries take precedence; any plan in per-file that also exists in
 * the monolithic file is only included once (per-file version wins).
 */
export declare function readPlansMerged(plansDir: string, monolithicPath: string): Promise<ParseResult<PlanEntry>>;
/**
 * Merges per-file idea entries with monolithic fallback, deduplicating by id.
 */
export declare function readIdeasMerged(ideasDir: string, monolithicPath: string): Promise<ParseResult<IdeaEntry>>;
export declare function parseProgress(markdown: string): ProgressEntry[];
//# sourceMappingURL=parser.d.ts.map