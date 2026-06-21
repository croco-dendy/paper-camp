import { color } from '@/app/styles/tokens';
import { CheckIcon, CloseIcon, CopyIcon, IconButton } from '@dendelion/paper-ui';
import { useState } from 'react';

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through
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

interface PhaseCopyButtonProps {
  planTitle: string;
  phaseIndex: number;
}

export const PhaseCopyButton = ({ planTitle, phaseIndex }: PhaseCopyButtonProps) => {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const prompt = `Start phase ${phaseIndex + 1} of plan "${planTitle}" in papercamp/plans.md`;
    const ok = await copyToClipboard(prompt);
    setStatus(ok ? 'copied' : 'failed');
    setTimeout(() => setStatus('idle'), 1500);
  };

  return (
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
      className="transition-opacity"
      style={{
        color:
          status === 'copied' ? '#6A9B72' : status === 'failed' ? '#A06060' : color.textSecondary,
      }}
    />
  );
};
