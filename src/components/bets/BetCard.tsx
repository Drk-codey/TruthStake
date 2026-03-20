import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowRight, CheckCircle2, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Bet, BetStatus } from '../../types';
import { CategoryBadge } from '../ui/Badge';
import { StatusPulse } from '../ui/StatusPulse';
import { Button } from '../ui/Button';
import { useAcceptBet, useSettleBet } from '../../hooks/useBets';
import { useAppStore } from '../../store/appStore';
import { truncateAddress, truncateUrl, formatTokens, formatRelativeTime, getBetStatus } from '../../lib/formatters';
import confetti from 'canvas-confetti';

interface BetCardProps {
  bet: Bet;
  index?: number;
  variant?: 'compact' | 'full';
}

export const BetCard: React.FC<BetCardProps> = ({
  bet,
  index = 0,
  variant = 'compact',
}) => {
  const { wallet } = useAppStore();
  const acceptBet = useAcceptBet();
  const settleBet = useSettleBet();
  const [justSettled, setJustSettled] = useState(false);
  const [shakeClass, setShakeClass] = useState('');

  const status = getBetStatus(bet) as BetStatus;
  const isOwner = wallet.address?.toLowerCase() === bet.yes_address?.toLowerCase();
  const isTaker = wallet.address?.toLowerCase() === bet.no_address?.toLowerCase();
  const canAccept = !bet.no_address && !bet.settled && !isOwner && wallet.isConnected;
  const canSettle = bet.no_address && !bet.settled && (isOwner || isTaker) && wallet.isConnected;

  const floatDelays = [0, 1, 2, 3, 4, 5];
  const floatClass = `animate-float-${floatDelays[index % 6]}`;

  const handleAccept = async () => {
    if (!wallet.address) return;
    try {
      await acceptBet.mutateAsync({ betId: bet.id, taker: wallet.address });
      toast.success('Bet accepted! You are now the NO side.');
    } catch {
      toast.error('Failed to accept bet. Please try again.');
    }
  };

  const handleSettle = async () => {
    try {
      toast.loading('AI is reasoning...', { id: `settle-${bet.id}` });
      const outcome = await settleBet.mutateAsync(bet.id);
      toast.dismiss(`settle-${bet.id}`);

      if (outcome === 'YES') {
        toast.success('Outcome: YES! 🎉', { duration: 6000 });
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00E5C3', '#22D37A', '#5C8EF0', '#F5A623'],
        });
      } else {
        toast.error('Outcome: NO', { duration: 6000 });
        setShakeClass('animate-shake');
        setTimeout(() => setShakeClass(''), 600);
      }
      setJustSettled(true);
    } catch {
      toast.dismiss(`settle-${bet.id}`);
      toast.error('Settlement failed. Please try again.');
    }
  };

  return (
    <motion.div
      className={`glass-card p-5 flex flex-col gap-4 relative overflow-hidden ${floatClass} ${shakeClass}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      layout
    >
      {/* Settled overlay */}
      {bet.settled && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10 rounded-[20px] pointer-events-none"
          style={{
            background: bet.outcome === 'YES'
              ? 'rgba(34, 211, 122, 0.08)'
              : 'rgba(240, 92, 92, 0.08)',
          }}
        >
          <span
            className="text-6xl font-black opacity-20 font-syne"
            style={{
              color: bet.outcome === 'YES' ? 'var(--yes-green)' : 'var(--no-red)',
            }}
          >
            {bet.outcome}
          </span>
        </div>
      )}

      {/* Accent line on top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[20px]"
        style={{
          background: bet.settled
            ? bet.outcome === 'YES'
              ? 'linear-gradient(90deg, var(--yes-green), transparent)'
              : 'linear-gradient(90deg, var(--no-red), transparent)'
            : status === 'open'
            ? 'linear-gradient(90deg, var(--accent-primary), transparent)'
            : 'linear-gradient(90deg, var(--pending-blue), transparent)',
        }}
      />

      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        {bet.category && <CategoryBadge category={bet.category} />}
        <StatusPulse status={status} showLabel />
      </div>

      {/* Question */}
      <Link to={`/bets/${bet.id}`} className="group">
        <p
          className="font-syne font-bold text-lg leading-snug truncate-3 transition-colors group-hover:text-[var(--accent-primary)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {bet.question}
        </p>
      </Link>

      {/* Settlement URL */}
      <a
        href={bet.settlement_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs transition-colors hover:text-[var(--accent-primary)]"
        style={{ color: 'var(--text-muted)' }}
        aria-label={`Settlement source: ${bet.settlement_url}`}
      >
        <Globe size={12} className="flex-shrink-0" />
        <span className="truncate">{truncateUrl(bet.settlement_url)}</span>
      </a>

      {/* Participants */}
      <div
        className="flex items-center justify-between text-xs px-3 py-2.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex flex-col gap-0.5">
          <span style={{ color: 'var(--text-muted)' }}>YES side</span>
          <span className="font-mono" style={{ color: 'var(--yes-green)' }}>
            {truncateAddress(bet.yes_address)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <span style={{ color: 'var(--text-muted)' }}>NO side</span>
          <span
            className="font-mono"
            style={{ color: bet.no_address ? 'var(--no-red)' : 'var(--text-muted)' }}
          >
            {bet.no_address ? truncateAddress(bet.no_address) : 'Open'}
          </span>
        </div>
      </div>

      {/* Stake + time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} style={{ color: 'var(--stake-amber)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--stake-amber)' }}>
            {formatTokens(bet.stake)}
          </span>
        </div>
        {bet.created_at && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatRelativeTime(bet.created_at)}
          </span>
        )}
      </div>

      {/* Actions */}
      {!bet.settled && (
        <div className="flex gap-2 mt-auto">
          {canAccept && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleAccept}
              loading={acceptBet.isPending}
              icon={<Zap size={15} />}
              aria-label={`Accept bet: ${bet.question}`}
            >
              Accept Bet
            </Button>
          )}
          {canSettle && (
            <Button
              variant="amber"
              className="flex-1"
              onClick={handleSettle}
              loading={settleBet.isPending}
              icon={<CheckCircle2 size={15} />}
              aria-label={`Settle bet: ${bet.question}`}
            >
              Settle
            </Button>
          )}
          {!canAccept && !canSettle && (
            <Link to={`/bets/${bet.id}`} className="flex-1">
              <button
                className="btn btn-ghost w-full"
                aria-label={`View bet details: ${bet.question}`}
              >
                View Details
                <ArrowRight size={15} />
              </button>
            </Link>
          )}
        </div>
      )}

      {/* Settled outcome */}
      {bet.settled && (
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-xl"
          style={{
            background: bet.outcome === 'YES' ? 'var(--yes-green-glow)' : 'var(--no-red-glow)',
            border: `1px solid ${bet.outcome === 'YES' ? 'rgba(34,211,122,0.25)' : 'rgba(240,92,92,0.25)'}`,
          }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Outcome
          </span>
          <span
            className="text-lg font-black font-syne"
            style={{ color: bet.outcome === 'YES' ? 'var(--yes-green)' : 'var(--no-red)' }}
          >
            {bet.outcome}
          </span>
        </div>
      )}
    </motion.div>
  );
};
