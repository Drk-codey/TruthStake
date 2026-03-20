import React from 'react';
import { BetCard } from './BetCard';
import { BetCardSkeleton } from '../ui/Skeleton';
import type { Bet } from '../../types';
import { Layers, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BetListProps {
  bets: Bet[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  showCreateCTA?: boolean;
  columns?: 1 | 2 | 3;
}

export const BetList: React.FC<BetListProps> = ({
  bets,
  isLoading = false,
  emptyTitle = 'No bets found',
  emptyMessage = 'Be the first to create a bet!',
  showCreateCTA = true,
  columns = 3,
}) => {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }[columns];

  if (isLoading) {
    return (
      <div className={`grid ${gridClass} gap-6`}>
        {[...Array(6)].map((_, i) => (
          <BetCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 text-center"
        style={{ color: 'var(--text-muted)' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <Layers size={32} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h3 className="font-syne font-bold text-xl mb-2" style={{ color: 'var(--text-secondary)' }}>
          {emptyTitle}
        </h3>
        <p className="text-sm max-w-xs mb-6">{emptyMessage}</p>
        {showCreateCTA && (
          <Link to="/create">
            <button className="btn btn-primary" aria-label="Create your first bet">
              <Plus size={16} />
              Create a Bet
            </button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {bets.map((bet, i) => (
        <BetCard key={bet.id} bet={bet} index={i} />
      ))}
    </div>
  );
};
