export declare const PAPER_CAMP_VERSION = "0.1.0";
export declare class AlreadyInitializedError extends Error {
    constructor(targetDir: string);
}
export interface InitOptions {
    projectName: string;
    intent?: string;
}
/**
 * Scaffolds papercamp/config.json and papercamp/ directory structure.
 * Creates per-file plan/idea directories and index files, plus monolithic
 * files for the remaining sections (progress, decisions, open-questions).
 * Never overwrites existing files.
 */
export declare function initProject(targetDir: string, options: InitOptions): Promise<void>;
//# sourceMappingURL=scaffold.d.ts.map