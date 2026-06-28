import { IdeaEntry, PlanEntry } from '../types/index';
/**
 * Pure, no I/O — kept out of parser.ts so client-bundled importers (e.g.
 * app-store.ts) don't pull in parser.ts's Node-only file-reading code.
 */
export declare function deriveIdeaStatuses(ideas: IdeaEntry[], plans: PlanEntry[]): IdeaEntry[];
//# sourceMappingURL=idea-status.d.ts.map