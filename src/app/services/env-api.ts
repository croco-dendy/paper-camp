import type { EnvEntry } from '@/types/index';

export interface EnvFile {
  exists: boolean;
  exampleExists: boolean;
  entries: EnvEntry[];
  missingKeys: string[];
}

export const fetchEnv = async (): Promise<EnvFile> => {
  try {
    const response = await fetch('/api/env');
    return await response.json();
  } catch {
    return { exists: false, exampleExists: false, entries: [], missingKeys: [] };
  }
};

export const saveEnv = async (entries: EnvEntry[]): Promise<boolean> => {
  try {
    const response = await fetch('/api/env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
    return response.ok;
  } catch {
    return false;
  }
};
