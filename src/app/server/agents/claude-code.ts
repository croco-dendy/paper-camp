export interface ParsedAgentLine {
  text: string;
  sessionId?: string;
  done?: boolean;
  error?: boolean;
}

export const capabilities = { supportsResume: true };

export function buildArgs(prompt: string, opts: { resumeSessionId?: string } = {}): string[] {
  const args = [
    '-p',
    prompt,
    '--output-format',
    'stream-json',
    '--verbose',
    '--permission-mode',
    'auto',
  ];
  if (opts.resumeSessionId) {
    args.push('-r', opts.resumeSessionId);
  }
  return args;
}

/**
 * Shape confirmed by a live `claude -p ... --output-format stream-json` smoke test
 * (see decisions.md, "Confirm Claude Code's headless stream-json shape..."), not guessed
 * from --help. Unknown subtypes fall through to a generic status line rather than being
 * dropped or throwing, since new bookkeeping subtypes (e.g. thinking_tokens) can appear.
 */
export function parseLine(line: string): ParsedAgentLine | null {
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(line);
  } catch {
    return null;
  }

  const sessionId = typeof json.session_id === 'string' ? json.session_id : undefined;

  switch (json.type) {
    case 'system': {
      if (json.subtype === 'init') {
        return { text: 'Agent session started', sessionId };
      }
      if (json.subtype === 'post_turn_summary' && typeof json.status_detail === 'string') {
        return { text: json.status_detail, sessionId };
      }
      return null;
    }
    case 'rate_limit_event':
      return null;
    case 'assistant': {
      const message = json.message as { content?: unknown[] } | undefined;
      const blocks = message?.content ?? [];
      for (const block of blocks) {
        const b = block as { type?: string; name?: string; text?: string };
        if (b.type === 'tool_use') {
          return { text: `Running ${b.name ?? 'a tool'}…`, sessionId };
        }
        if (b.type === 'text' && typeof b.text === 'string' && b.text.trim()) {
          return { text: b.text.trim(), sessionId };
        }
      }
      return null;
    }
    case 'user': {
      const message = json.message as { content?: unknown[] } | undefined;
      const content = message?.content;
      const block = Array.isArray(content) ? (content[0] as Record<string, unknown>) : undefined;
      if (block?.is_error) {
        const text = typeof block.content === 'string' ? block.content : 'Tool call failed';
        return { text: `Error: ${text}`, sessionId, error: true };
      }
      return { text: 'Tool finished', sessionId };
    }
    case 'result': {
      const error = Boolean(json.is_error);
      const result = typeof json.result === 'string' ? json.result.trim() : '';
      const text = result || (error ? 'Agent run failed' : 'Agent run finished');
      return { text, sessionId, done: true, error };
    }
    default:
      return { text: 'Agent is working…', sessionId };
  }
}
