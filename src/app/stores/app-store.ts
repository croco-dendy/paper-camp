import type {
  DecisionEntry,
  OpenQuestionEntry,
  ParseResult,
  PlanEntry,
  ProgressEntry,
} from '@/types/index';
import { create } from 'zustand';
import {
  fetchDecisions,
  fetchOpenQuestions,
  fetchProgress,
  fetchRepoDocs,
} from '../services/docs-api';
import { fetchIdeas } from '../services/ideas-api';
import { fetchPlans } from '../services/plans-api';

interface IdeaEntry {
  id: string | null;
  title: string;
  body: string;
}

const IDEA_ID_RE = /^(IDEA-\d+):\s*/;

const parseIdeas = (content: string): IdeaEntry[] => {
  const sections = content.split(/\n---+\n/).filter(Boolean);
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
};

type AppStore = {
  plans: ParseResult<PlanEntry> | null;
  plansLoading: boolean;
  plansError: string | null;
  loadPlans: () => Promise<void>;

  ideasContent: string | null;
  ideaEntries: IdeaEntry[];
  loadIdeas: () => Promise<void>;

  activePlanTitle: string | null;
  setActivePlanTitle: (title: string | null) => void;

  activeIdeaTitle: string | null;
  setActiveIdeaTitle: (title: string | null) => void;

  view: 'list' | 'board';
  setView: (v: 'list' | 'board') => void;

  decisions: DecisionEntry[];
  decisionsLoading: boolean;
  loadDecisions: () => Promise<void>;

  openQuestions: OpenQuestionEntry[];
  openQuestionsLoading: boolean;
  loadOpenQuestions: () => Promise<void>;

  progress: ProgressEntry[];
  progressLoading: boolean;
  loadProgress: () => Promise<void>;

  repoDocs: { name: string; content: string }[];
  repoDocsLoading: boolean;
  loadRepoDocs: () => Promise<void>;

  activeDocSection: 'decisions' | 'questions' | 'progress' | 'repo-docs' | null;
  setActiveDocSection: (
    section: 'decisions' | 'questions' | 'progress' | 'repo-docs' | null,
  ) => void;

  activeDocTitle: string | null;
  setActiveDocTitle: (title: string | null) => void;

  docSearchQuery: string;
  setDocSearchQuery: (query: string) => void;

  activeSettingsSection: string;
  setActiveSettingsSection: (section: string) => void;

  settingsConfigFiles: string[];
  setSettingsConfigFiles: (files: string[]) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  plans: null,
  plansLoading: false,
  plansError: null,
  loadPlans: async () => {
    set({ plansLoading: true });
    try {
      const data = await fetchPlans();
      set({ plans: data, plansError: null, plansLoading: false });
    } catch (err) {
      set({ plansError: String(err), plansLoading: false });
    }
  },

  ideasContent: null,
  ideaEntries: [],
  loadIdeas: async () => {
    try {
      const content = await fetchIdeas();
      set({ ideasContent: content, ideaEntries: content.trim() ? parseIdeas(content) : [] });
    } catch {
      set({ ideasContent: null, ideaEntries: [] });
    }
  },

  activePlanTitle: null,
  setActivePlanTitle: (title) => set({ activePlanTitle: title }),

  activeIdeaTitle: null,
  setActiveIdeaTitle: (title) => set({ activeIdeaTitle: title }),

  view: 'list',
  setView: (v) => set({ view: v }),

  decisions: [],
  decisionsLoading: true,
  loadDecisions: async () => {
    set({ decisionsLoading: true });
    try {
      const data = await fetchDecisions();
      set({ decisions: data.entries, decisionsLoading: false });
    } catch {
      set({ decisions: [], decisionsLoading: false });
    }
  },

  openQuestions: [],
  openQuestionsLoading: true,
  loadOpenQuestions: async () => {
    set({ openQuestionsLoading: true });
    try {
      const data = await fetchOpenQuestions();
      set({ openQuestions: data.entries, openQuestionsLoading: false });
    } catch {
      set({ openQuestions: [], openQuestionsLoading: false });
    }
  },

  progress: [],
  progressLoading: true,
  loadProgress: async () => {
    set({ progressLoading: true });
    try {
      const data = await fetchProgress();
      set({ progress: data.entries, progressLoading: false });
    } catch {
      set({ progress: [], progressLoading: false });
    }
  },

  repoDocs: [],
  repoDocsLoading: true,
  loadRepoDocs: async () => {
    set({ repoDocsLoading: true });
    try {
      const data = await fetchRepoDocs();
      set({ repoDocs: data.files, repoDocsLoading: false });
    } catch {
      set({ repoDocs: [], repoDocsLoading: false });
    }
  },

  activeDocSection: null,
  setActiveDocSection: (section) => set({ activeDocSection: section }),

  activeDocTitle: null,
  setActiveDocTitle: (title) => set({ activeDocTitle: title }),

  docSearchQuery: '',
  setDocSearchQuery: (query) => set({ docSearchQuery: query }),

  activeSettingsSection: 'general',
  setActiveSettingsSection: (section) => set({ activeSettingsSection: section }),

  settingsConfigFiles: [],
  setSettingsConfigFiles: (files) => set({ settingsConfigFiles: files }),
}));
