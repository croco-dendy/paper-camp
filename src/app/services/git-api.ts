import type { GitStatusResponse } from '@/types/index';

export const fetchGitStatus = async (): Promise<GitStatusResponse> => {
  const response = await fetch('/api/git/status');
  return response.json();
};

export const commitChanges = async (
  files: string[],
  title: string,
  message?: string,
): Promise<void> => {
  const response = await fetch('/api/git/commit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files, title, message }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Commit failed' }));
    throw new Error(err.error);
  }
};
