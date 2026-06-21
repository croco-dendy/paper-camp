import { layout, space } from '@/app/styles/tokens';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ProjectIdentityHeader } from './project-identity-header';

interface SidebarShellProps {
  routeKey: string;
  children: React.ReactNode;
}

export const SidebarShell = ({ routeKey, children }: SidebarShellProps) => {
  const shouldReduceMotion = useReducedMotion();

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

      <div
        style={{
          height: 1,
          background: 'rgba(0,0,0,0.08)',
          margin: `${space[3]} ${space[3]}`,
        }}
      />

      <div style={{ flex: 1, overflowY: 'auto', paddingTop: space[1], position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={routeKey}
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
};
