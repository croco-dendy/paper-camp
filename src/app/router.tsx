import { fontFamily, fontSize, layout, space, transition } from '@/app/styles/tokens';
import { Button, FolderIcon, Icon, Input, Island, Layout, Page } from '@dendelion/paper-ui';
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { StackPanel } from './components/stack-panel';
import { DocsPage, DocsSidebar } from './features/docs/index';
import { FocusPage } from './features/focus/index';
import { PlansPage, PlansSidebar } from './features/plans/index';
import { SettingsPage, SettingsSidebar } from './features/settings/index';
import { useProjectIdentity } from './hooks';
import { useAppStore } from './stores/app-store';

const navItems = [
  { id: 'plans', label: 'Plans', path: '/' },
  { id: 'focus', label: 'Focus', path: '/focus' },
  { id: 'docs', label: 'Docs', path: '/docs' },
  { id: 'settings', label: 'Settings', path: '/settings' },
];

const RootLayout = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const loadPlans = useAppStore((s) => s.loadPlans);
  const loadIdeas = useAppStore((s) => s.loadIdeas);
  const activeId = navItems.find((item) => item.path === pathname)?.id;
  const docSearchQuery = useAppStore((s) => s.docSearchQuery);
  const setDocSearchQuery = useAppStore((s) => s.setDocSearchQuery);
  const [stackOpen, setStackOpen] = useState(true);
  const { projectName, iconDataUri } = useProjectIdentity();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    loadPlans();
    loadIdeas();
  }, [loadPlans, loadIdeas]);

  return (
    <Layout
      background={{ texture: 'paper', ruledType: 'grid', ruledColor: 'blue' }}
      showHeader={false}
      showSidebar={false}
      showPage={false}
    >
      <div
        className="flex h-full min-h-0 justify-center items-stretch box-border overflow-hidden"
        style={{ paddingRight: stackOpen ? layout.stackPanelWidth : 0 }}
      >
        <div className="flex h-full min-h-0 w-full max-w-layout" style={{ gap: layout.contentGap }}>
          {pathname === '/' && <PlansSidebar />}
          {pathname === '/docs' && <DocsSidebar />}
          {pathname === '/settings' && <SettingsSidebar />}
          <div className="flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden">
            <div className="flex-1 min-h-0" style={{ paddingBottom: layout.pagePaddingBottom }}>
              <Page texture={{ texture: 'parchment' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{ height: '100%' }}
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </Page>
            </div>
          </div>
        </div>
      </div>
      <StackPanel open={stackOpen} onToggle={() => setStackOpen((o) => !o)} />
      <motion.nav
        aria-label="Navigation island"
        style={{
          position: 'fixed',
          bottom: layout.navIslandBottom,
          left: '50%',
          zIndex: 110,
        }}
        animate={{
          x: stackOpen ? `calc(-50% - ${layout.stackPanelWidth / 2}px)` : '-50%',
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <Island>
          <div className="flex items-center gap-4">
            {iconDataUri ? (
              <img
                src={iconDataUri}
                alt=""
                style={{ width: 20, height: 20, objectFit: 'contain' }}
              />
            ) : (
              <Icon icon={<FolderIcon />} size="small" />
            )}
            <span
              style={{
                fontFamily: fontFamily.serif,
                fontWeight: 600,
                fontSize: fontSize.sm,
                whiteSpace: 'nowrap',
              }}
            >
              {projectName ?? 'Paper Camp'}
            </span>
          </div>
          <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.12)' }} />
          {pathname === '/docs' && (
            <div style={{ width: 180 }}>
              <Input
                size="small"
                placeholder="Search docs…"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
              />
            </div>
          )}
          <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.12)' }} />
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="small"
                isActive={item.id === activeId}
                onClick={() => navigate({ to: item.path })}
                aria-current={item.id === activeId ? 'page' : undefined}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </Island>
      </motion.nav>
    </Layout>
  );
};

const rootRoute = createRootRoute({ component: RootLayout });

const plansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PlansPage,
});
const focusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/focus',
  component: FocusPage,
});
const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/docs',
  component: DocsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([plansRoute, focusRoute, docsRoute, settingsRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
