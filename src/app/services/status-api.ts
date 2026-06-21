import type { CheckResult } from '@/types/index';

export interface StatusState {
  lint: CheckResult;
  format: CheckResult;
  test: CheckResult;
}

export const fetchStatus = async (): Promise<StatusState> => {
  const response = await fetch('/api/status');
  return response.json();
};

export const triggerTests = async (): Promise<void> => {
  await fetch('/api/status/test', { method: 'POST' });
};
