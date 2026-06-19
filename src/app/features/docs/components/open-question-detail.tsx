import { LinkButton, Markdown } from '@/app/components';
import { useAppStore } from '@/app/stores/app-store';
import { color, fontFamily, fontSize, lineHeight, space } from '@/app/styles/tokens';
import { Stamp } from '@dendelion/paper-ui';

export const OpenQuestionDetail = () => {
  const openQuestions = useAppStore((s) => s.openQuestions);
  const activeDocTitle = useAppStore((s) => s.activeDocTitle);
  const setActiveDocSection = useAppStore((s) => s.setActiveDocSection);
  const setActiveDocTitle = useAppStore((s) => s.setActiveDocTitle);

  const question = openQuestions.find((q) => q.title === activeDocTitle);
  if (!question) return null;

  const handleResolvedByClick = () => {
    if (question.resolvedBy) {
      setActiveDocSection('decisions');
      setActiveDocTitle(question.resolvedBy);
    }
  };

  return (
    <div>
      <h2
        style={{
          fontFamily: fontFamily.serif,
          fontWeight: 600,
          fontSize: '1.75rem',
          margin: `0 0 ${space[3]}`,
          lineHeight: lineHeight.tight,
        }}
      >
        {question.title}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: space[2], marginBottom: space[5] }}>
        <span className="text-sm" style={{ opacity: 0.5 }}>
          {question.raised}
        </span>
        <Stamp
          size="small"
          fillColor={
            question.status === 'open' ? 'rgba(212, 163, 115, 0.25)' : 'rgba(143, 185, 150, 0.25)'
          }
          textColor={question.status === 'open' ? color.accentAmberDark : color.accentGreenDark}
        >
          {question.status}
        </Stamp>
        {question.resolvedBy && (
          <span className="text-sm" style={{ opacity: 0.5 }}>
            Resolved by{' '}
            <LinkButton onClick={handleResolvedByClick}>{question.resolvedBy}</LinkButton>
          </span>
        )}
      </div>

      <div
        style={{
          fontFamily: fontFamily.body,
          fontSize: fontSize.base,
          lineHeight: lineHeight.relaxed,
          color: '#1C1B18',
        }}
      >
        <Markdown>{question.body}</Markdown>
      </div>
    </div>
  );
};
