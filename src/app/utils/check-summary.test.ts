import { describe, expect, it } from 'vitest';
import { summarizeQualityFailure, summarizeTestFailure } from './check-summary';

describe('summarizeQualityFailure', () => {
  it('sums lint and format error counts', () => {
    expect(summarizeQualityFailure('Found 1 error.', 'Found 2 errors.')).toBe(
      '3 lint/format issues found.',
    );
  });

  it('uses singular wording for exactly one issue', () => {
    expect(summarizeQualityFailure('Found 1 error.', '')).toBe('1 lint/format issue found.');
  });

  it('falls back to a generic message when no count is parseable', () => {
    expect(summarizeQualityFailure('', '')).toBe('Lint or format check failed.');
  });
});

describe('summarizeTestFailure', () => {
  it('parses the failed count from a vitest summary line', () => {
    expect(summarizeTestFailure('Tests  2 failed | 5 passed (7)')).toBe('2 tests failed.');
  });

  it('uses singular wording for exactly one failure', () => {
    expect(summarizeTestFailure('Tests  1 failed | 5 passed (6)')).toBe('1 test failed.');
  });

  it('falls back to a generic message when no count is parseable', () => {
    expect(summarizeTestFailure('')).toBe('Tests failed.');
  });
});
