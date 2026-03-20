import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useAllBets } from '../hooks/useBets';
import { BetList } from '../components/bets/BetList';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../constants';
import type { BetCategory } from '../types';

const CATEGORIES = ['all', 'weather', 'sports', 'politics', 'crypto', 'entertainment', 'custom'] as const;
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest-stake', label: 'Highest Stake' },
  { value: 'most-matched', label: 'Most Matched' },
] as const;
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'matched', label: 'Matched' },
  { value: 'settled', label: 'Settled' },
] as const;

export default function ExplorePage() {
  const { data: bets, isLoading, error } = useAllBets();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('all');
  const [status, setStatus] = useState<typeof STATUS_OPTIONS[number]['value']>('all');
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]['value']>('newest');

  const filtered = useMemo(() => {
    if (!bets) return [];
    let result = [...bets];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.question.toLowerCase().includes(q));
    }

    if (category !== 'all') {
      result = result.filter((b) => b.category === category);
    }

    if (status !== 'all') {
      result = result.filter((b) => {
        if (status === 'settled') return b.settled;
        if (status === 'open') return !b.settled && !b.no_address;
        if (status === 'matched') return !b.settled && !!b.no_address;
        return true;
      });
    }

    if (sortBy === 'highest-stake') {
      result.sort((a, b) => b.stake - a.stake);
    } else if (sortBy === 'most-matched') {
      result.sort((a, b) => (b.no_address ? 1 : 0) - (a.no_address ? 1 : 0));
    } else {
      result.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
    }

    return result;
  }, [bets, search, category, status, sortBy]);

  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="heading-lg mb-2">
            <span style={{ color: 'var(--text-primary)' }}>Explore </span>
            <span className="text-gradient-teal">Prediction Markets</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {bets?.length ?? 0} active bets across all categories
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="search"
            placeholder="Search bets by question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12 pr-12"
            aria-label="Search bets"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </motion.div>

        {/* Filters row */}
        <motion.div
          className="flex flex-wrap gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto scroll-x pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: category === cat ? 'rgba(0,229,195,0.12)' : 'var(--bg-elevated)',
                  border: category === cat ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
                  color: category === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                }}
                aria-pressed={category === cat}
                aria-label={`Filter by ${CATEGORY_LABELS[cat] ?? cat}`}
              >
                {cat !== 'all' && (
                  <span aria-hidden="true">{CATEGORY_ICONS[cat]}</span>
                )}
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {/* Status filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="input-field py-1.5 text-sm w-auto pr-8"
              style={{ minWidth: 130 }}
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="input-field py-1.5 text-sm w-auto pr-8"
              style={{ minWidth: 150 }}
              aria-label="Sort bets"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Results */}
        {error ? (
          <div
            className="py-16 text-center rounded-2xl"
            style={{ background: 'rgba(240,92,92,0.05)', border: '1px solid rgba(240,92,92,0.15)' }}
          >
            <p style={{ color: 'var(--no-red)' }}>Failed to load bets. Please refresh the page.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <BetList
              bets={filtered}
              isLoading={isLoading}
              emptyTitle="No bets match your filters"
              emptyMessage="Try adjusting your search or category filters"
              showCreateCTA
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
