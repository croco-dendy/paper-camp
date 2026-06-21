import { space } from '@/app/styles/tokens';
import type { PlanEntry } from '@/types/index';
import { Stamp } from '@dendelion/paper-ui';
import { PlanIdStamp } from './plan-id-stamp';

interface KanbanCardProps {
  plan: PlanEntry;
}

export const KanbanCard = ({ plan }: KanbanCardProps) => {
  return (
    <div>
      <div
        className="text-sm"
        style={{
          fontWeight: 500,
          lineHeight: 1.3,
          display: 'flex',
          alignItems: 'center',
          gap: space[1],
        }}
      >
        <PlanIdStamp id={plan.id} />
        {plan.title}
      </div>
      {plan.tags.length > 0 && (
        <div style={{ display: 'flex', gap: space[1], flexWrap: 'wrap', marginTop: '0.4rem' }}>
          {plan.tags.map((t) => (
            <Stamp key={t} size="small" fillColor="rgba(0,0,0,0.06)">
              {t}
            </Stamp>
          ))}
        </div>
      )}
    </div>
  );
};
