import { useAppStore } from '@/app/stores/app-store';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { PlanNavItem } from './plan-nav-item';
import { SidebarSection } from './sidebar-section';

export const ReviewSidebar = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { plans, activePlanTitle, setActivePlanTitle, setActiveIdeaTitle } = useAppStore();

  const reviewPlans = plans?.entries.filter((p) => p.status === 'review') ?? [];

  const handleSelectPlan = (title: string) => {
    navigate({ to: '/review' });
    setActivePlanTitle(title);
    setActiveIdeaTitle(null);
  };

  return (
    <SidebarSection label="Pending review">
      {reviewPlans.length === 0 ? (
        <span
          className="text-sm"
          style={{
            display: 'block',
            padding: '0.25rem 0.75rem',
            opacity: 0.35,
            fontStyle: 'italic',
          }}
        >
          None
        </span>
      ) : (
        reviewPlans.map((p) => (
          <PlanNavItem
            key={p.title}
            plan={p}
            active={pathname === '/review' && activePlanTitle === p.title}
            onClick={() => handleSelectPlan(p.title)}
          />
        ))
      )}
    </SidebarSection>
  );
};
