import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Calendar, AlertCircle } from 'lucide-react';
import { useBet } from '../hooks/useBets';
import { BetCard } from '../components/bets/BetCard';
import { BetCardSkeleton } from '../components/ui/Skeleton';
import { StatusPulse } from '../components/ui/StatusPulse';
import { CategoryBadge } from '../components/ui/Badge';
import { truncateAddress, formatTokens, getBetStatus } from '../lib/formatters';
import type { BetStatus } from '../types';
import { format } from 'date-fns';

export default function BetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const betId = Number(id);
  const navigate = useNavigate();

  const { data: bet, isLoading, error } = useBet(betId);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 max-w-3xl mx-auto px-4 py-12">
        <BetCardSkeleton />
      </div>
    );
  }

  if (error || !bet) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
        <div className="text-center px-4">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--no-red)' }} />
          <h2 className="font-syne font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
            Bet Not Found
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            This bet may have been removed or the ID is incorrect.
          </p>
          <Link to="/explore">
            <button className="btn btn-ghost">Browse all bets</button>
          </Link>
        </div>
      </div>
    );
  }

  const status = getBetStatus(bet) as BetStatus;

  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Back button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-sm font-medium transition-colors hover:text-[var(--accent-primary)]"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <BetCard bet={bet} index={0} variant="full" />

          {/* Detail panels */}
          <div className="surface-card p-6 space-y-5">
            <h2 className="font-syne font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Bet Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Bet ID', value: `#${bet.id}` },
                { label: 'Status', value: <StatusPulse status={status} /> },
                { label: 'Stake', value: <span style={{ color: 'var(--stake-amber)', fontWeight: 700 }}>{formatTokens(bet.stake)}</span> },
                { label: 'Category', value: bet.category ? <CategoryBadge category={bet.category} /> : '—' },
                {
                  label: 'YES (Creator)',
                  value: (
                    <span className="font-mono text-xs" style={{ color: 'var(--yes-green)' }}>
                      {truncateAddress(bet.yes_address, 10, 6)}
                    </span>
                  ),
                },
                {
                  label: 'NO (Taker)',
                  value: bet.no_address ? (
                    <span className="font-mono text-xs" style={{ color: 'var(--no-red)' }}>
                      {truncateAddress(bet.no_address, 10, 6)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Open</span>
                  ),
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </span>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Settlement URL */}
            <div className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span className="text-xs uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
                Settlement URL
              </span>
              <a
                href={bet.settlement_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-mono break-all transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Globe size={14} className="flex-shrink-0" />
                {bet.settlement_url}
              </a>
            </div>

            {/* Outcome */}
            {bet.settled && bet.outcome && (
              <div
                className="p-4 rounded-xl flex items-center justify-between"
                style={{
                  background: bet.outcome === 'YES' ? 'var(--yes-green-glow)' : 'var(--no-red-glow)',
                  border: `1px solid ${bet.outcome === 'YES' ? 'rgba(34,211,122,0.3)' : 'rgba(240,92,92,0.3)'}`,
                }}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Final Outcome
                </span>
                <span
                  className="text-2xl font-black font-syne"
                  style={{ color: bet.outcome === 'YES' ? 'var(--yes-green)' : 'var(--no-red)' }}
                >
                  {bet.outcome}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
