import { ProjectIdentityHeader } from '@/app/components';
import { useAppStore } from '@/app/stores/app-store';
import { layout, space } from '@/app/styles/tokens';
import { ListItem } from '@dendelion/paper-ui';
import { useEffect } from 'react';
import { SidebarSection } from '../../plans/components/sidebar-section';

const simplecaseLabel = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <span
    className="text-sm"
    style={{
      display: 'block',
      padding: `${space[1]} ${space[3]}`,
      opacity: 0.35,
      fontStyle: 'italic',
    }}
  >
    {children}
  </span>
);

export const DocsSidebar = () => {
  const {
    decisions,
    openQuestions,
    progress,
    repoDocs,
    decisionsLoading,
    openQuestionsLoading,
    progressLoading,
    repoDocsLoading,
    loadDecisions,
    loadOpenQuestions,
    loadProgress,
    loadRepoDocs,
    activeDocSection,
    setActiveDocSection,
    activeDocTitle,
    setActiveDocTitle,
  } = useAppStore();

  useEffect(() => {
    loadDecisions();
    loadOpenQuestions();
    loadProgress();
    loadRepoDocs();
  }, [loadDecisions, loadOpenQuestions, loadProgress, loadRepoDocs]);

  const handleSelectDecision = (title: string) => {
    setActiveDocSection('decisions');
    setActiveDocTitle(title);
  };

  const divider = (
    <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: `${space[3]} ${space[3]}` }} />
  );

  return (
    <aside
      style={{
        width: layout.sidebarWidth,
        flexShrink: 0,
        height: '100%',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: `${space[5]} ${space[3]} ${space[4]}`, flexShrink: 0 }}>
        <ProjectIdentityHeader />
      </div>

      {divider}

      <div style={{ flex: 1, overflowY: 'auto', paddingTop: space[1] }}>
        <SidebarSection label="Repo Docs">
          {repoDocsLoading && repoDocs.length === 0 ? (
            <EmptyState>Loading…</EmptyState>
          ) : repoDocs.length > 0 ? (
            repoDocs.map((f) => (
              <ListItem
                key={f.name}
                size="small"
                active={activeDocSection === 'repo-docs' && activeDocTitle === f.name}
                onClick={() => {
                  setActiveDocSection('repo-docs');
                  setActiveDocTitle(f.name);
                }}
              >
                {simplecaseLabel(f.name)}
              </ListItem>
            ))
          ) : (
            <EmptyState>No repo docs found</EmptyState>
          )}
        </SidebarSection>

        <SidebarSection label="Decisions">
          {decisionsLoading && decisions.length === 0 ? (
            <EmptyState>Loading…</EmptyState>
          ) : decisions.length > 0 ? (
            decisions.map((d) => (
              <ListItem
                key={d.title}
                size="small"
                active={activeDocSection === 'decisions' && activeDocTitle === d.title}
                onClick={() => handleSelectDecision(d.title)}
              >
                {d.title}
              </ListItem>
            ))
          ) : (
            <EmptyState>No decisions yet</EmptyState>
          )}
        </SidebarSection>

        <SidebarSection label="Open Questions">
          {openQuestionsLoading && openQuestions.length === 0 ? (
            <EmptyState>Loading…</EmptyState>
          ) : openQuestions.length > 0 ? (
            openQuestions.map((q) => (
              <ListItem
                key={q.title}
                size="small"
                active={activeDocSection === 'questions' && activeDocTitle === q.title}
                onClick={() => {
                  setActiveDocSection('questions');
                  setActiveDocTitle(q.title);
                }}
              >
                {q.title}
              </ListItem>
            ))
          ) : (
            <EmptyState>No open questions</EmptyState>
          )}
        </SidebarSection>

        <SidebarSection label="Progress">
          {progressLoading && progress.length === 0 ? (
            <EmptyState>Loading…</EmptyState>
          ) : progress.length > 0 ? (
            progress.map((p) => (
              <ListItem
                key={p.date}
                size="small"
                active={activeDocSection === 'progress' && activeDocTitle === p.date}
                onClick={() => {
                  setActiveDocSection('progress');
                  setActiveDocTitle(p.date);
                }}
              >
                {p.date}
              </ListItem>
            ))
          ) : (
            <EmptyState>No progress entries</EmptyState>
          )}
        </SidebarSection>
      </div>
    </aside>
  );
};
