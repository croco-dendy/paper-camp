import { useAppStore } from '@/app/stores/app-store';
import { color } from '@/app/styles/tokens';
import type { PlanEntry } from '@/types/index';
import { Button } from '@dendelion/paper-ui';
import { useState } from 'react';

interface RunAllPhasesButtonProps {
  plan: PlanEntry;
  disabled?: boolean;
}

export const RunAllPhasesButton = ({ plan, disabled }: RunAllPhasesButtonProps) => {
  const launchRunAll = useAppStore((s) => s.launchRunAll);
  const [launching, setLaunching] = useState(false);

  const handleClick = async () => {
    if (!plan.id) return;
    setLaunching(true);
    try {
      await launchRunAll(plan.id);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLaunching(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="small"
      onClick={handleClick}
      disabled={disabled || launching || !plan.id}
      title={plan.id ? undefined : 'Plan needs an ID before an agent can run'}
      style={{ color: color.textSecondary }}
    >
      Run all phases
    </Button>
  );
};
