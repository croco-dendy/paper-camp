import { color } from '@/app/styles/tokens';

interface LinkButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const LinkButton = ({ children, onClick }: LinkButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      color: color.accentAmberDark,
      cursor: 'pointer',
      textDecoration: 'underline',
      font: 'inherit',
    }}
  >
    {children}
  </button>
);
