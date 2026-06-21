import { updatePlan } from '@/app/services/plans-api';
import { useAppStore } from '@/app/stores/app-store';
import { fontFamily, fontSize, lineHeight, space } from '@/app/styles/tokens';
import type { PhaseItem, PlanEntry } from '@/types/index';
import { Button, Stamp } from '@dendelion/paper-ui';
import { useState } from 'react';
import { STATUS_COLOR, STATUS_LABEL, STATUS_STAMP } from '../constants';
import { phaseProgress, relativeDate } from '../helpers';
import { FocusPhaseItem } from './focus-phase-item';
import { ProgressBar } from './progress-bar';

interface PlanDetailProps {
  plan: PlanEntry;
}

export const PlanDetail = ({ plan }: PlanDetailProps) => {
  const loadPlans = useAppStore((s) => s.loadPlans);
  const [updating, setUpdating] = useState(false);
  const progress = phaseProgress(plan);
  const inProgress = plan.status === 'in-progress';
  const allDone = progress !== null && progress.done === progress.total && progress.total > 0;

  const handleStart = async () => {
    setUpdating(true);
    await updatePlan(plan.title, { status: 'in-progress' });
    await loadPlans();
    setUpdating(false);
  };

  const handleStop = async () => {
    setUpdating(true);
    await updatePlan(plan.title, { status: 'planned' });
    await loadPlans();
    setUpdating(false);
  };

  const handleTogglePhase = async (index: number) => {
    const nextPhases: PhaseItem[] = plan.phases.map((phase, i) =>
      i === index ? { ...phase, done: !phase.done } : phase,
    );
    setUpdating(true);
    await updatePlan(plan.title, { phases: nextPhases });
    await loadPlans();
    setUpdating(false);
  };

  const handleMarkDone = async () => {
    setUpdating(true);
    await updatePlan(plan.title, { status: 'done' });
    await loadPlans();
    setUpdating(false);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: space[4],
          marginBottom: space[3],
        }}
      >
        <h2
          style={{
            fontFamily: fontFamily.serif,
            fontWeight: 600,
            fontSize: '1.75rem',
            margin: 0,
            lineHeight: lineHeight.tight,
          }}
        >
          {plan.title}
        </h2>
        <Button
          variant="primary"
          size="small"
          className={inProgress ? 'btn-orange' : 'btn-green'}
          onClick={inProgress ? handleStop : handleStart}
          disabled={updating}
        >
          {inProgress ? 'Stop' : 'Start'}
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: space[2],
          flexWrap: 'wrap',
          marginBottom: space[4],
        }}
      >
        <Stamp
          size="small"
          fillColor={STATUS_STAMP[plan.status].fill}
          textColor={STATUS_STAMP[plan.status].text}
        >
          {STATUS_LABEL[plan.status]}
        </Stamp>
        <span className="text-sm" style={{ opacity: 0.45 }}>
          {plan.updated
            ? `updated ${relativeDate(plan.updated)}`
            : `created ${relativeDate(plan.created)}`}
        </span>
        {plan.tags.map((tag) => (
          <Stamp key={tag} size="small" fillColor="rgba(0,0,0,0.06)">
            {tag}
          </Stamp>
        ))}
      </div>

      {plan.body && (
        <p
          className="text-base"
          style={{ margin: `0 0 ${space[4]}`, opacity: 0.8, lineHeight: lineHeight.normal }}
        >
          {plan.body}
        </p>
      )}

      {progress !== null && (
        <div style={{ marginBottom: space[5] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space[3] }}>
            <div style={{ flex: 1 }}>
              <ProgressBar pct={progress.pct} color={STATUS_COLOR[plan.status]} />
            </div>
            <span className="text-sm" style={{ opacity: 0.5, flexShrink: 0 }}>
              {progress.done}/{progress.total}
            </span>
          </div>
        </div>
      )}

      {plan.phases.length > 0 && (
        <div style={{ marginBottom: space[5] }}>
          <h3
            style={{
              fontFamily: fontFamily.serif,
              fontSize: fontSize.sm,
              fontWeight: 600,
              margin: `0 0 ${space[3]}`,
              opacity: 0.65,
            }}
          >
            Phases
          </h3>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: space[1],
            }}
          >
            {plan.phases.map((phase, index) => (
              <li key={`${phase.text}-${index}`}>
                <FocusPhaseItem
                  phase={phase}
                  planTitle={plan.title}
                  phaseIndex={index}
                  onToggle={() => handleTogglePhase(index)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {allDone && plan.status !== 'done' && (
        <Button
          variant="primary"
          size="small"
          className="btn-violet"
          onClick={handleMarkDone}
          disabled={updating}
        >
          Mark complete
        </Button>
      )}
    </div>
  );
};
