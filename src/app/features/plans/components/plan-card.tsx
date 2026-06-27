import { fontFamily, space } from '@/app/styles/tokens';
import type { PlanEntry } from '@/types/index';
import { Card, Stamp } from '@dendelion/paper-ui';
import { STATUS_ACCENT, STATUS_COLOR, STATUS_LABEL, STATUS_STAMP } from '../constants';
import { phaseProgress, relativeDate } from '../helpers';
import { PlanIdStamp } from './plan-id-stamp';
import { ProgressBar } from './progress-bar';

interface PlanCardProps {
  plan: PlanEntry;
  highlighted?: boolean;
  onOpen?: (title: string) => void;
  rank?: number;
}

export const PlanCard = ({ plan, highlighted, onOpen, rank }: PlanCardProps) => {
  const progress = phaseProgress(plan);

  return (
    <div
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen ? () => onOpen(plan.title) : undefined}
      onKeyDown={
        onOpen
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(plan.title);
              }
            }
          : undefined
      }
      style={{
        cursor: onOpen ? 'pointer' : undefined,
        ...(highlighted
          ? { outline: '2px solid rgba(200,154,90,0.5)', outlineOffset: 2, borderRadius: 4 }
          : undefined),
      }}
    >
      <Card texture="kraft" accent accentColor={STATUS_ACCENT[plan.status]}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: space[3],
          }}
        >
          <h2
            style={{
              fontFamily: fontFamily.serif,
              fontWeight: 600,
              fontSize: '1.3rem',
              margin: 0,
              lineHeight: 1.3,
              display: 'flex',
              alignItems: 'center',
              gap: space[2],
            }}
          >
            {rank !== undefined && (
              <span className="text-sm" style={{ opacity: 0.4, fontWeight: 600 }}>
                {rank}.
              </span>
            )}
            <PlanIdStamp id={plan.id} />
            {plan.title}
          </h2>
          <Stamp
            size="small"
            fillColor={STATUS_STAMP[plan.status].fill}
            textColor={STATUS_STAMP[plan.status].text}
          >
            {STATUS_LABEL[plan.status]}
          </Stamp>
        </div>

        <div
          style={{
            marginTop: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            gap: space[2],
            flexWrap: 'wrap',
          }}
        >
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

        {progress !== null && (
          <div style={{ marginTop: space[3] }}>
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
      </Card>
    </div>
  );
};
