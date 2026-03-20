import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAllBets } from '../hooks/useBets';
import { BetList } from '../components/bets/BetList';
import { useAppStore } from '../store/appStore';

type Tab = 'created' | 'accepted';

export default function MyBetsPage() {
  const { wallet } = useAppStore();
  const { data: bets, isLoading } = useAllBets();
  const [activeTab, setActiveTab] = useState<Tab>('created');

  const myCreatedBets = useMemo(
    () => bets?.filter((b) => b.yes_address?.toLowerCase() === wallet.address?.toLowerCase()) ?? [],
    [bets, wallet.address]
  );

  const myAcceptedBets = useMemo(
    () => bets?.filter((b) => b.no_address?.toLowerCase() === wallet.address?.toLowerCase()) ?? [],
    [bets, wallet.address]
  );

  const tabs = [
    { id: 'created' as Tab, label: 'Created', count: myCreatedBets.length, icon: <Layers size={16} /> },
    { id: 'accepted' as Tab, label: 'Accepted', count: myAcceptedBets.length, icon: <Users size={16} /> },
  ];

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-glass)' }}
          >
            <Trophy size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h2 className="font-syne font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>
            Connect Your Wallet
          </h2>
          <p className="mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Connect your wallet to view your created and accepted bets
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="heading-lg mb-2">
              <span style={{ color: 'var(--text-primary)' }}>My </span>
              <span className="text-gradient-teal">Bets</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Track your predictions and settlements
            </p>
          </div>
          <Link to="/create">
            <button className="btn btn-primary btn-sm" aria-label="Create new bet">
              <Plus size={15} />
              New Bet
            </button>
          </Link>
        </motion.div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-8 w-fit"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          role="tablist"
          aria-label="My bets tabs"
        >
          {tabs.map(({ id, label, count, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`panel-${id}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: activeTab === id ? 'var(--bg-glass)' : 'transparent',
                color: activeTab === id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backdropFilter: activeTab === id ? 'blur(10px)' : 'none',
                border: activeTab === id ? '1px solid var(--border-active)' : '1px solid transparent',
              }}
            >
              {icon}
              {label}
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: activeTab === id ? 'rgba(0,229,195,0.15)' : 'var(--bg-surface)',
                  color: activeTab === id ? 'var(--accent-primary)' : 'var(--text-muted)',
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-label={activeTab === 'created' ? 'Created bets' : 'Accepted bets'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BetList
            bets={activeTab === 'created' ? myCreatedBets : myAcceptedBets}
            isLoading={isLoading}
            emptyTitle={activeTab === 'created' ? 'No bets created yet' : 'No bets accepted yet'}
            emptyMessage={
              activeTab === 'created'
                ? 'Create your first prediction market!'
                : 'Browse open bets and take a position'
            }
            showCreateCTA={activeTab === 'created'}
          />
        </motion.div>
      </div>
    </div>
  );
}
