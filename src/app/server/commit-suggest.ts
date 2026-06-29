import { spawn } from 'node:child_process';

function buildPrompt(diffText: string, planContext?: string): string {
  return `You are writing a single git commit message for the diff below. Do not use any tools, do not read or edit any files — base your answer only on the diff text given.

Follow this repo's commit convention: \`type(scope): Description\`, where type is one of feat|fix|chore|docs|refactor and scope is a short identifier (often a plan number).${
    planContext
      ? `\nThis work belongs to plan ${planContext} — use it as the scope unless the diff clearly suggests otherwise.`
      : ''
  }

Respond with ONLY a single JSON object, no prose, no code fences, no markdown — exactly this shape:
{"title": "type(scope): Description", "message": "optional longer body describing what changed and why, or an empty string if the title alone is clear enough"}

Diff:
${diffText}`;
}

/**
 * One-shot, read-only agent call — not the long-running phase/task system in agent.ts.
 * No --permission-mode flag: this task never needs file/bash access, so the default
 * (auto-deny outside a TTY) is exactly what's wanted if the model attempts a tool call.
 */
export async function suggestCommitMessage(
  diffText: string,
  planContext?: string,
): Promise<{ title: string; message: string }> {
  if (!diffText.trim()) {
    throw new Error('No changes to summarize — select at least one file first');
  }

  const prompt = buildPrompt(diffText, planContext);
  const output = await new Promise<string>((resolve, reject) => {
    const proc = spawn('claude', ['-p', prompt, '--output-format', 'json'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    proc.stdout?.on('data', (d: Buffer) => {
      stdout += d.toString();
    });
    proc.stderr?.on('data', (d: Buffer) => {
      stderr += d.toString();
    });
    proc.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `claude exited with code ${code}`));
    });
    proc.on('error', reject);
  });

  let resultText = output;
  try {
    const parsed = JSON.parse(output) as { result?: string };
    if (typeof parsed.result === 'string') resultText = parsed.result;
  } catch {
    // fall through with raw output
  }

  const match = resultText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Agent did not return a parseable commit message');

  const data = JSON.parse(match[0]) as { title?: string; message?: string };
  if (!data.title) throw new Error('Agent response missing a title');
  return { title: data.title, message: data.message ?? '' };
}
