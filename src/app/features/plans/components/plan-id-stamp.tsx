import { Stamp } from '@dendelion/paper-ui';

interface PlanIdStampProps {
  id?: string;
}

export const PlanIdStamp = ({ id }: PlanIdStampProps) => {
  if (!id) return null;
  return (
    <Stamp size="small" fillColor="rgba(0,0,0,0.08)">
      {id}
    </Stamp>
  );
};
