import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@dendelion/paper-ui';
import type { PlanEntry } from '@/types/index';
import { useAppStore } from '../stores/app-store';

const CHALKBOARD_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.15 0 0 0 0 0.28 0 0 0 0 0.20 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23c)' opacity='1'/%3E%3C/svg%3E")`;

const deskBg = '#1e3a2d';
const deskLight = '#264a3a';
const deskText = '#e8e4d9';
const deskTextMuted = '#a8b5a0';
const deskBorder = 'rgba(200, 210, 195, 0.15)';
const deskChalk = '#d4e8cb';

interface StackPanelProps {
  open: boolean;
  onToggle: () => void;
}

interface SseEvent {
  message: string;
  timestamp: string;
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'Luminari, "Cormorant Garamond", Georgia, serif',
  fontSize: '1.1rem',
  fontWeight: 600,
  color: deskTextMuted,
  marginBottom: '0.75rem',
};

const findFocusPlan = (
  plans: PlanEntry[] | undefined,
): PlanEntry | undefined => {
  if (!plans) return undefined;
  return plans.find((p) => p.status === 'in-progress');
};

const phaseProgress = (plan: PlanEntry) => {
  if (plan.phases.length === 0) return null;
  const done = plan.phases.filter((p) => p.done).length;
  return { done, total: plan.phases.length, pct: Math.round((done / plan.phases.length) * 100) };
};

export const StackPanel = ({ open, onToggle }: StackPanelProps) => {
  const plans = useAppStore((s) => s.plans);
  const progress = useAppStore((s) => s.progress);
  const loadProgress = useAppStore((s) => s.loadProgress);
  const loadPlans = useAppStore((s) => s.loadPlans);
  const [liveEvents, setLiveEvents] = useState<SseEvent[]>([]);
  const refreshRef = useRef({ loadProgress, loadPlans });
  refreshRef.current = { loadProgress, loadPlans };

  useEffect(() => {
    refreshRef.current.loadProgress();
  }, []);

  useEffect(() => {
    const es = new EventSource('/api/activity/stream');
    es.onmessage = (e) => {
      try {
        const event: SseEvent = JSON.parse(e.data);
        setLiveEvents((prev) => {
          if (prev.length > 0 && prev[0].message === event.message) return prev;
          return [event, ...prev];
        });
        refreshRef.current.loadProgress();
        refreshRef.current.loadPlans();
      } catch {
        // ignore malformed events
      }
    };
    es.onerror = () => {
      setLiveEvents((prev) => {
        if (prev.length === 0 || prev[0].message !== 'Connection lost, retrying…') {
          return [{ message: 'Connection lost, retrying…', timestamp: new Date().toISOString() }, ...prev];
        }
        return prev;
      });
    };
    return () => es.close();
  }, []);

  const activePlan = useMemo(() => findFocusPlan(plans?.entries), [plans?.entries]);
  const pct = activePlan ? phaseProgress(activePlan) : null;

  const sorted = [...progress].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      {!open && (
        <button
          onClick={onToggle}
          type="button"
          aria-label="Open stack panel"
          style={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            width: 28,
            height: 64,
            border: 'none',
            borderRight: 'none',
            borderRadius: '6px 0 0 6px',
            background: deskBg,
            backgroundImage: `${CHALKBOARD_TEXTURE}, linear-gradient(135deg, ${deskLight} 0%, ${deskBg} 60%)`,
            backgroundRepeat: 'repeat, no-repeat',
            backgroundSize: '200px 200px, auto',
            color: deskChalk,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Luminari, "Cormorant Garamond", Georgia, serif',
            fontSize: '0.75rem',
            lineHeight: 1,
            padding: 0,
            transition: 'background 150ms ease',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
          }}
        >
          S
        </button>
      )}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          borderLeft: '4px solid rgba(61, 53, 43, 0.12)',
          backgroundColor: deskBg,
          backgroundImage: `${CHALKBOARD_TEXTURE}, linear-gradient(135deg, ${deskLight} 0%, ${deskBg} 60%)`,
          backgroundRepeat: 'repeat, no-repeat',
          backgroundSize: '200px 200px, auto',
          color: deskText,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 80,
            padding: '0 1.5rem',
            borderBottom: `1px solid ${deskBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'Luminari, "Cormorant Garamond", Georgia, serif',
              fontSize: '1.15rem',
              fontWeight: 700,
              color: deskChalk,
            }}
          >
            Stack
          </span>
          <button
            onClick={onToggle}
            type="button"
            aria-label="Close stack panel"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: `1px solid ${deskBorder}`,
              background: 'rgba(255, 255, 255, 0.05)',
              color: deskTextMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              lineHeight: 1,
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            &times;
          </button>
        </div>
        <div
          style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(200, 210, 195, 0.3) transparent',
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <div style={sectionLabelStyle}>Active</div>
            {activePlan ? (
              <Card variant="chalkboard" size="small">
                <h3
                  style={{
                    fontFamily: 'Luminari, "Cormorant Garamond", Georgia, serif',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: deskChalk,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {activePlan.title}
                </h3>
                {(() => {
                  const current = activePlan.phases.find((p) => !p.done);
                  if (!current) return null;
                  return (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontFamily: "'Caveat', cursive",
                        fontSize: '1.2rem',
                        fontWeight: 400,
                        lineHeight: 1.2,
                        color: deskText,
                        opacity: 0.9,
                      }}
                    >
                      <span style={{ flexShrink: 0, width: 14, textAlign: 'center' }}>○</span>
                      <span>{current.text}</span>
                    </div>
                  );
                })()}
              </Card>
            ) : (
              <p style={{ opacity: 0.5, fontSize: '0.875rem' }}>No active plan.</p>
            )}
          </div>

          {liveEvents.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={sectionLabelStyle}>Live</div>
              <Card variant="chalkboard" size="small">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {liveEvents.map((ev, i) => (
                    <div
                      key={`${ev.timestamp}-${i}`}
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: '1.2rem',
                        fontWeight: 400,
                        lineHeight: 1.2,
                        color: deskChalk,
                      }}
                    >
                      {ev.message}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          <div style={sectionLabelStyle}>Activity</div>
          {sorted.length === 0 ? (
            <p style={{ opacity: 0.5, fontSize: '0.875rem' }}>No activity yet.</p>
          ) : (
            sorted.map((entry, i) => (
              <div key={entry.date} style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: i < sorted.length - 1 ? `1px solid ${deskBorder}` : undefined }}>
                <div
                  style={{
                    fontFamily: 'Luminari, "Cormorant Garamond", Georgia, serif',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: deskChalk,
                    margin: '0 0 0.75rem',
                    lineHeight: 1.2,
                  }}
                >
                  {entry.date}
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {entry.items.map((item, i) => (
                    <li
                      key={`${entry.date}-${i}`}
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: '1.2rem',
                        fontWeight: 400,
                        lineHeight: 1.2,
                        color: deskText,
                        paddingLeft: '0.75rem',
                        borderLeft: `2px solid ${deskBorder}`,
                        opacity: 0.9,
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
