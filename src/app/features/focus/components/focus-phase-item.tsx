import { color, fontFamily, lineHeight } from '@/app/styles/tokens';
import type { PhaseItem } from '@/types/index';
import { CheckIcon, Checkbox, CloseIcon, CopyIcon, IconButton } from '@dendelion/paper-ui';
import { useState } from 'react';

interface FocusPhaseItemProps {
  phase: PhaseItem;
  planTitle: string;
  phaseIndex: number;
  onToggle: () => void;
}

/**
 * navigator.clipboard is undefined outside a secure context — which includes any
 * non-"localhost" origin over plain http (Tailscale/LAN access, which this dev server
 * supports). Falls back to the legacy execCommand path there instead of throwing.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy path below
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

export const FocusPhaseItem = ({ phase, planTitle, phaseIndex, onToggle }: FocusPhaseItemProps) => {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleCopy = async () => {
    const prompt = `Start phase ${phaseIndex + 1} of plan "${planTitle}" in papercamp/plans.md`;
    const ok = await copyToClipboard(prompt);
    setStatus(ok ? 'copied' : 'failed');
    setTimeout(() => setStatus('idle'), 1500);
  };

  return (
    <div className="flex items-center gap-3 py-2 group">
      <Checkbox checked={phase.done} onChange={onToggle} />
      <span
        className={`text-base flex-1 ${phase.done ? 'line-through' : ''}`}
        style={{
          fontFamily: fontFamily.body,
          lineHeight: lineHeight.snug,
          opacity: phase.done ? 0.55 : 1,
        }}
      >
        {phase.text}
      </span>
      <IconButton
        icon={
          status === 'copied' ? (
            <CheckIcon size={16} />
          ) : status === 'failed' ? (
            <CloseIcon size={16} />
          ) : (
            <CopyIcon size={16} />
          )
        }
        variant="ghost"
        size="small"
        label={
          status === 'copied'
            ? 'Copied'
            : status === 'failed'
              ? 'Copy failed — select and copy manually'
              : 'Copy phase prompt'
        }
        onClick={handleCopy}
        className={`transition-opacity ${status === 'idle' ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
        style={{
          color:
            status === 'copied' ? '#6A9B72' : status === 'failed' ? '#A06060' : color.textSecondary,
        }}
      />
    </div>
  );
};
