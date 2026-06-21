import { Card, Icon, LightbulbIcon, Stamp } from '@dendelion/paper-ui';

interface IdeaCardProps {
  id?: string | null;
  title: string;
  onClick?: () => void;
}

export const IdeaCard = ({ id, title, onClick }: IdeaCardProps) => (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onClick) onClick();
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ cursor: onClick ? 'pointer' : undefined, height: '100%' }}
    >
      <Card texture="white" size="small" className="h-full">
        <div className="flex items-center gap-2">
          <Icon icon={<LightbulbIcon />} size="small" />
          {id && (
            <Stamp size="small" fillColor="rgba(0,0,0,0.08)">
              {id}
            </Stamp>
          )}
          <span
            style={{
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#1C1B18',
            }}
          >
            {title}
          </span>
        </div>
      </Card>
    </div>
  );
