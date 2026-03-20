import React from 'react';
import type { BetStatus } from '../../types';

interface StatusPulseProps {
  status: BetStatus;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<BetStatus, { dotClass: string; label: string; color: string }> = {
  open: { dotClass: 'pulse-dot-teal', label: 'Open', color: 'var(--accent-primary)' },
  matched: { dotClass: 'pulse-dot-blue', label: 'Matched', color: 'var(--pending-blue)' },
  settling: { dotClass: 'pulse-dot-amber', label: 'Settling...', color: 'var(--stake-amber)' },
  settled: { dotClass: '', label: 'Settled', color: 'var(--settled-ghost)' },
  appealed: { dotClass: 'pulse-dot-amber', label: 'Appealed', color: 'var(--stake-amber)' },
};

export const StatusPulse: React.FC<StatusPulseProps> = ({ status, showLabel = true }) => {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2">
      {config.dotClass ? (
        <span className={`pulse-dot ${config.dotClass}`} aria-hidden="true" />
      ) : (
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: config.color }}
          aria-hidden="true"
        />
      )}
      {showLabel && (
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
};
