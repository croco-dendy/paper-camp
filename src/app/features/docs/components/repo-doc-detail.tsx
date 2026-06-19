import { Markdown } from '@/app/components/markdown';
import { useAppStore } from '@/app/stores/app-store';
import { fontFamily, fontSize, lineHeight, space } from '@/app/styles/tokens';

export const RepoDocDetail = () => {
  const repoDocs = useAppStore((s) => s.repoDocs);
  const activeDocTitle = useAppStore((s) => s.activeDocTitle);

  const file = repoDocs.find((f) => f.name === activeDocTitle);
  if (!file) return null;

  const isMarkdown = file.name.endsWith('.md');

  return (
    <div>
      <h2
        style={{
          fontFamily: fontFamily.serif,
          fontWeight: 600,
          fontSize: '1.75rem',
          margin: `0 0 ${space[4]}`,
          lineHeight: lineHeight.tight,
        }}
      >
        {file.name}
      </h2>

      {isMarkdown ? (
        <div
          style={{
            fontFamily: fontFamily.body,
            fontSize: fontSize.base,
            lineHeight: lineHeight.relaxed,
            color: '#1C1B18',
          }}
        >
          <Markdown>{file.content}</Markdown>
        </div>
      ) : (
        <pre
          style={{
            fontFamily: fontFamily.mono,
            fontSize: fontSize['sm-alt'],
            background: 'rgba(0,0,0,0.04)',
            borderRadius: 6,
            padding: space[4],
            overflowX: 'auto',
            lineHeight: lineHeight.normal,
            whiteSpace: 'pre-wrap',
          }}
        >
          {file.content}
        </pre>
      )}
    </div>
  );
};
