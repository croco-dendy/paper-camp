import { space } from '@/app/styles/tokens';
import type { PlanEntry } from '@/types/index';
import { KANBAN_COLUMNS } from '../constants';
import { KanbanColumn } from './kanban-column';

interface BoardViewProps {
  plans: PlanEntry[];
}

export const BoardView = ({ plans }: BoardViewProps) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: space[3],
        overflowX: 'auto',
        paddingBottom: space[4],
        alignItems: 'flex-start',
      }}
    >
      {KANBAN_COLUMNS.map(({ status, label, accent }) => (
        <KanbanColumn
          key={status}
          status={status}
          label={label}
          accent={accent}
          plans={plans.filter((p) => p.status === status)}
        />
      ))}
    </div>
  );
};
