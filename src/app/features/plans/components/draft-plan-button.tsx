import { useAppStore } from '@/app/stores/app-store';
import { color } from '@/app/styles/tokens';
import type { IdeaEntry, PlanEntry } from '@/types/index';
import { Button } from '@dendelion/paper-ui';
import { useState } from 'react';
import { buildPlanDraftPrompt } from '../prompts';

interface DraftPlanButtonProps {
  idea: IdeaEntry;
  otherPlans: PlanEntry[];
}

export const DraftPlanButton = ({ idea, otherPlans }: DraftPlanButtonProps) => {
  const launchPlanDraft = useAppStore((s) => s.launchPlanDraft);
  const agentStatus = useAppStore((s) => s.agentStatus);
  const agentBusy =
    agentStatus !== null && agentStatus.status !== 'done' && agentStatus.status !== 'error';
  const [launching, setLaunching] = useState(false);

  const handleClick = async () => {
    if (!idea.id) return;
    setLaunching(true);
    try {
      await launchPlanDraft(idea.id, buildPlanDraftPrompt(idea, otherPlans));
    } finally {
      setLaunching(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="small"
      onClick={handleClick}
      disabled={agentBusy || launching || !idea.id}
      title={idea.id ? undefined : 'Idea needs an ID before an agent can run'}
      style={{ color: color.textSecondary }}
    >
      Draft plan
    </Button>
  );
};
