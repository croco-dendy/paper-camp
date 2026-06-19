import { color, fontFamily, fontSize, space } from '@/app/styles/tokens';
import type { ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';

const headingStyle = (fontSizeValue: string): React.CSSProperties => ({
  fontFamily: fontFamily.serif,
  fontWeight: 600,
  fontSize: fontSizeValue,
  margin: `${space[6]} 0 ${space[3]}`,
  lineHeight: 1.25,
});

const components: Components = {
  p: ({ children }) => <p style={{ margin: `0 0 ${space[4]}` }}>{children}</p>,
  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
  h1: ({ children }) => <h1 style={headingStyle(fontSize.lg)}>{children}</h1>,
  h2: ({ children }) => <h2 style={headingStyle('1.3rem')}>{children}</h2>,
  h3: ({ children }) => <h3 style={headingStyle('1.1rem')}>{children}</h3>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" style={{ color: color.accentAmberDark }}>
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code
      style={{
        fontFamily: fontFamily.mono,
        fontSize: '0.85em',
        background: 'rgba(0,0,0,0.06)',
        borderRadius: 3,
        padding: '0.1em 0.35em',
      }}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      style={{
        fontFamily: fontFamily.mono,
        fontSize: '0.85em',
        background: 'rgba(0,0,0,0.06)',
        borderRadius: 6,
        padding: `${space[3]} ${space[4]}`,
        overflowX: 'auto',
        margin: `0 0 ${space[4]}`,
      }}
    >
      {children}
    </pre>
  ),
  ul: ({ children }) => (
    <ul style={{ listStyle: 'disc', margin: `0 0 ${space[4]}`, paddingLeft: '1.4rem' }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ listStyle: 'decimal', margin: `0 0 ${space[4]}`, paddingLeft: '1.4rem' }}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li style={{ marginBottom: '0.4rem' }}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: `0 0 ${space[4]}`,
        paddingLeft: space[4],
        borderLeft: '3px solid rgba(0,0,0,0.15)',
        opacity: 0.85,
      }}
    >
      {children}
    </blockquote>
  ),
};

interface MarkdownProps {
  children: string;
}

export const Markdown = ({ children }: MarkdownProps): ReactNode => (
  <ReactMarkdown components={components}>{children}</ReactMarkdown>
);
