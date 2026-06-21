import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import type { ServerResponse } from 'node:http';
import { join } from 'node:path';
import type { GitStatusEntry } from '../../types';

export function createGitManager(root: string) {
  const clients = new Set<ServerResponse>();
  let cached: GitStatusEntry[] | null = null;

  function broadcast(event: { message: string; timestamp: string }) {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of clients) {
      try {
        client.write(data);
      } catch {
        clients.delete(client);
      }
    }
  }

  function parsePorcelain(output: string): GitStatusEntry[] {
    const entries: GitStatusEntry[] = [];
    for (const line of output.split('\n')) {
      if (!line.trim()) continue;
      const x = line[0] ?? ' ';
      const y = line[1] ?? ' ';
      const rest = line.slice(3);
      const path = rest.split(' -> ').pop() ?? rest;
      entries.push({
        path,
        status: `${x}${y}`,
        staged: x !== ' ' && x !== '?',
      });
    }
    return entries;
  }

  function runGit(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn('git', args, {
        cwd: root,
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
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || `git ${args[0]} exited with code ${code}`));
        }
      });
      proc.on('error', reject);
    });
  }

  function runGitStatus(): Promise<GitStatusEntry[]> {
    return runGit(['status', '--porcelain=v1']).then(parsePorcelain);
  }

  async function commit(files: string[], title: string, message?: string): Promise<void> {
    if (files.length > 0) {
      await runGit(['add', '--', ...files]);
    }
    const args = ['commit', '-m', title];
    if (message) args.push('-m', message);
    await runGit(args);
  }

  async function refresh() {
    try {
      cached = await runGitStatus();
      broadcast({
        message: 'Working tree status updated',
        timestamp: new Date().toISOString(),
      });
    } catch {
      // git not available or not a repo
    }
  }

  const gitDir = join(root, '.git');
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    watch(gitDir, { recursive: true }, (eventType, filename) => {
      if (filename === 'index') {
        if (timer) clearTimeout(timer);
        timer = setTimeout(refresh, 500);
      }
    });
  } catch {
    // watcher not available
  }

  return {
    async getStatus(): Promise<GitStatusEntry[]> {
      if (!cached) {
        cached = await runGitStatus();
      }
      return cached;
    },
    commit,
    subscribe(res: ServerResponse) {
      clients.add(res);
      res.on('close', () => clients.delete(res));
    },
  };
}
