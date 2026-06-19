import { AddIdeaModal } from '@/app/components/add-idea-modal';
import { useProjectIdentity } from '@/app/hooks';
import { createPlan, deletePlan } from '@/app/services/plans-api';
import { useAppStore } from '@/app/stores/app-store';
import { fontFamily, fontSize, layout, space } from '@/app/styles/tokens';
import type { PlanEntry } from '@/types/index';
import { FolderIcon, Icon, IconButton, ListItem } from '@dendelion/paper-ui';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { PlanNavItem } from './plan-nav-item';
import { SidebarSection } from './sidebar-section';

export const PlansSidebar = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const {
    plans,
    loadPlans,
    activePlanTitle,
    setActivePlanTitle,
    activeIdeaTitle,
    setActiveIdeaTitle,
    ideaEntries,
  } = useAppStore();
  const [addingIdea, setAddingIdea] = useState(false);
  const { projectName, iconDataUri } = useProjectIdentity();

  const active = plans?.entries.filter((p) => p.status === 'in-progress') ?? [];
  const planned = plans?.entries.filter((p) => p.status === 'planned') ?? [];
  const ideas = plans?.entries.filter((p) => p.status === 'idea') ?? [];

  const handleAddIdea = async (idea: { title: string; content?: string }) => {
    await createPlan(idea);
    await loadPlans();
    setAddingIdea(false);
  };

  const handleDeleteIdea = async (title: string) => {
    if (!window.confirm(`Delete idea "${title}"?`)) return;
    await deletePlan(title);
    await loadPlans();
    if (activePlanTitle === title) setActivePlanTitle(null);
  };

  const handleSelectPlan = (plan: PlanEntry) => {
    navigate({ to: '/' });
    setActivePlanTitle(plan.title);
    setActiveIdeaTitle(null);
  };

  const handleSelectIdea = (title: string) => {
    setActiveIdeaTitle(title);
    setActivePlanTitle(null);
    navigate({ to: '/' });
  };

  const divider = (
    <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: `${space[3]} ${space[3]}` }} />
  );

  return (
    <>
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
        {/* Logo / project name */}
        <div style={{ padding: `${space[5]} ${space[3]} ${space[4]}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space[3] }}>
            {iconDataUri ? (
              <img
                src={iconDataUri}
                alt=""
                style={{ width: 18, height: 18, objectFit: 'contain' }}
              />
            ) : (
              <Icon icon={<FolderIcon />} size="small" />
            )}
            <span
              style={{
                fontFamily: fontFamily.serif,
                fontWeight: 600,
                fontSize: fontSize.md,
              }}
            >
              {projectName ?? 'Paper Camp'}
            </span>
          </div>
        </div>

        {divider}

        {/* Scrollable plan list */}
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: space[1] }}>
          {active.length > 0 && (
            <SidebarSection label="In progress">
              {active.map((p) => (
                <PlanNavItem
                  key={p.title}
                  plan={p}
                  active={pathname === '/' && activePlanTitle === p.title}
                  onClick={() => handleSelectPlan(p)}
                />
              ))}
            </SidebarSection>
          )}

          {planned.length > 0 && (
            <SidebarSection label="Planned">
              {planned.map((p) => (
                <PlanNavItem
                  key={p.title}
                  plan={p}
                  active={pathname === '/' && activePlanTitle === p.title}
                  onClick={() => handleSelectPlan(p)}
                />
              ))}
            </SidebarSection>
          )}

          {ideaEntries.length > 0 && (
            <SidebarSection label="Ideas">
              {ideaEntries.map((e) => (
                <ListItem
                  key={e.title}
                  size="small"
                  active={activeIdeaTitle === e.title}
                  onClick={() => handleSelectIdea(e.title)}
                >
                  {e.title}
                </ListItem>
              ))}
            </SidebarSection>
          )}

          <SidebarSection
            label="Backlog"
            action={
              <IconButton
                icon={<span>+</span>}
                variant="ghost"
                size="small"
                label="Add to backlog"
                onClick={() => setAddingIdea(true)}
              />
            }
          >
            {ideas.map((p) => (
              <PlanNavItem
                key={p.title}
                plan={p}
                active={pathname === '/' && activePlanTitle === p.title}
                onClick={() => handleSelectPlan(p)}
                action={
                  <IconButton
                    icon={<span>×</span>}
                    variant="ghost"
                    size="small"
                    label="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteIdea(p.title);
                    }}
                  />
                }
              />
            ))}
            {ideas.length === 0 && (
              <span
                className="text-sm"
                style={{
                  display: 'block',
                  padding: `${space[1]} ${space[3]}`,
                  opacity: 0.35,
                  fontStyle: 'italic',
                }}
              >
                Nothing yet
              </span>
            )}
          </SidebarSection>
        </div>
      </aside>
      <AddIdeaModal open={addingIdea} onClose={() => setAddingIdea(false)} onAdd={handleAddIdea} />
    </>
  );
};
