import { watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import type { ServerResponse } from 'node:http';
import { join } from 'node:path';
import { parseDecisions, parseOpenQuestions, parsePlans, parseProgress } from '../../core/parser';
import type { DecisionEntry, OpenQuestionEntry, PlanEntry, ProgressEntry } from '../../types';

export interface ActivityEvent {
  message: string;
  timestamp: string;
}

interface Snapshot {
  plans: PlanEntry[];
  decisions: DecisionEntry[];
  openQuestions: OpenQuestionEntry[];
  progress: ProgressEntry[];
}

const campFile = (root: string, name: string) => join(root, 'papercamp', name);

const readMaybe = (path: string): Promise<string> =>
  readFile(path, 'utf-8').catch(() => '');

async function takeSnapshot(root: string): Promise<Snapshot> {
  const [plansRaw, decisionsRaw, questionsRaw, progressRaw] = await Promise.all([
    readMaybe(campFile(root, 'plans.md')),
    readMaybe(campFile(root, 'decisions.md')),
    readMaybe(campFile(root, 'open-questions.md')),
    readMaybe(campFile(root, 'progress.md')),
  ]);
  return {
    plans: parsePlans(plansRaw).entries,
    decisions: parseDecisions(decisionsRaw).entries,
    openQuestions: parseOpenQuestions(questionsRaw).entries,
    progress: parseProgress(progressRaw),
  };
}

function diffAndSynthesize(before: Snapshot, after: Snapshot): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const ts = new Date().toISOString();

  const beforePlans = new Map(before.plans.map((p) => [p.title, p]));
  const afterPlans = new Map(after.plans.map((p) => [p.title, p]));

  for (const [title, afterP] of afterPlans) {
    const beforeP = beforePlans.get(title);
    if (!beforeP) {
      events.push({ message: `New plan added: ${title}`, timestamp: ts });
    } else if (beforeP.status !== afterP.status) {
      events.push({ message: `Plan "${title}" marked ${afterP.status}`, timestamp: ts });
    } else {
      for (let i = 0; i < afterP.phases.length; i++) {
        const beforePhase = beforeP.phases[i];
        const afterPhase = afterP.phases[i];
        if (beforePhase && beforePhase.done !== afterPhase.done) {
          events.push({
            message: afterPhase.done
              ? `Phase ${i + 1}/${afterP.phases.length} checked off in "${title}"`
              : `Phase ${i + 1}/${afterP.phases.length} unchecked in "${title}"`,
            timestamp: ts,
          });
        }
      }
    }
  }

  for (const [title] of beforePlans) {
    if (!afterPlans.has(title)) {
      events.push({ message: `Plan removed: ${title}`, timestamp: ts });
    }
  }

  const beforeDecisions = new Map(before.decisions.map((d) => [d.title, d]));
  const afterDecisions = new Map(after.decisions.map((d) => [d.title, d]));
  for (const [title] of afterDecisions) {
    if (!beforeDecisions.has(title)) {
      events.push({ message: `New decision: ${title}`, timestamp: ts });
    }
  }

  const beforeQuestions = new Map(before.openQuestions.map((q) => [q.title, q]));
  const afterQuestions = new Map(after.openQuestions.map((q) => [q.title, q]));
  for (const [title] of afterQuestions) {
    if (!beforeQuestions.has(title)) {
      events.push({ message: `New open question: ${title}`, timestamp: ts });
    }
  }

  const beforeProgress = new Map(before.progress.map((p) => [p.date, p]));
  const afterProgress = new Map(after.progress.map((p) => [p.date, p]));
  for (const [date] of afterProgress) {
    if (!beforeProgress.has(date)) {
      events.push({ message: `Progress logged: ${date}`, timestamp: ts });
    }
  }

  return events;
}

export function createActivityManager(root: string) {
  const clients = new Set<ServerResponse>();
  let snapshot: Snapshot | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const files = ['plans.md', 'decisions.md', 'open-questions.md', 'progress.md'];

  async function check() {
    try {
      const next = await takeSnapshot(root);
      if (snapshot) {
        const events = diffAndSynthesize(snapshot, next);
        for (const event of events) {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          for (const client of clients) {
            try {
              client.write(data);
            } catch {
              clients.delete(client);
            }
          }
        }
      }
      snapshot = next;
    } catch {
      // re-parse failed, keep the old snapshot
    }
  }

  for (const file of files) {
    const filePath = campFile(root, file);
    try {
      watch(filePath, () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(check, 300);
      });
    } catch {
      // file might not exist yet
    }
  }

  takeSnapshot(root).then((s) => {
    snapshot = s;
  });

  return {
    subscribe(res: ServerResponse) {
      clients.add(res);
      const connected = JSON.stringify({ message: 'Watching for changes…', timestamp: new Date().toISOString() });
      res.write(`data: ${connected}\n\n`);
      res.on('close', () => clients.delete(res));
    },
  };
}
