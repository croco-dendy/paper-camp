import { AddIdeaModal } from '@/app/components/add-idea-modal';
import { createPlan, deletePlan } from '@/app/services/plans-api';
import { useAppStore } from '@/app/stores/app-store';
import { space } from '@/app/styles/tokens';
import type { PlanEntry } from '@/types/index';
import { IconButton, ListItem } from '@dendelion/paper-ui';
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

  const active = plans?.entries.filter((p) => p.status === 'in-progress') ?? [];
  const planned = plans?.entries.filter((p) => p.status === 'planned') ?? [];
  const ideas = plans?.entries.filter((p) => p.status === 'idea') ?? [];

  const handleAddIdea = async (idea: { title: string; content?: string; kind: string }) => {
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

  return (
    <>
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
      <AddIdeaModal open={addingIdea} onClose={() => setAddingIdea(false)} onAdd={handleAddIdea} />
    </>
  );
};
