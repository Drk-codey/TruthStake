import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Zap, Globe } from 'lucide-react';
import { useAllBets } from '../hooks/useBets';
import { BetCard } from '../components/bets/BetCard';
import { BetCardSkeleton } from '../components/ui/Skeleton';
import { countUp } from '../lib/formatters';
import { MOCK_STATS } from '../constants';

const STATS = [
  { label: 'Total Bets', value: MOCK_STATS.totalBets, suffix: '', prefix: '' },
  { label: 'Total Staked', value: MOCK_STATS.totalStaked, suffix: ' GEN', prefix: '' },
  { label: 'Bets Settled', value: MOCK_STATS.betsSettled, suffix: '', prefix: '' },
  { label: 'Success Rate', value: MOCK_STATS.successRate, suffix: '%', prefix: '', decimal: 1 },
];

const HOW_IT_WORKS = [
  {
    icon: <Sparkles size={28} />,
    step: '01',
    title: 'Create a Bet',
    desc: 'Pose any real-world question and set your stake. Your truth goes on-chain.',
  },
  {
    icon: <Zap size={28} />,
    step: '02',
    title: 'Get Matched',
    desc: 'Anyone can take the opposing side. Both stakes are locked in the Intelligent Contract.',
  },
  {
    icon: <Globe size={28} />,
    step: '03',
    title: 'AI Settles',
    desc: 'GenLayer validators fetch live data, reason with AI, and reach consensus. No judges needed.',
  },
];

function StatCounter({ value, suffix, prefix, decimal = 0 }: {
  value: number; suffix: string; prefix: string; decimal?: number
}) {
  const [display, setDisplay] = useState(0);
  const hasRun = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          countUp(0, value, 1800, setDisplay);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const formatted = decimal > 0
    ? display.toFixed(decimal)
    : display.toLocaleString('en-US');

  return (
    <div ref={ref} className="text-3xl font-black font-syne" style={{ color: 'var(--text-primary)' }}>
      {prefix}{formatted}{suffix}
    </div>
  );
}

export default function HomePage() {
  const { data: bets, isLoading } = useAllBets();
  const featured = bets?.slice(0, 6) ?? [];
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-scroll carousel
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    let paused = false;
    const interval = setInterval(() => {
      if (!paused && el) {
        el.scrollLeft += 1;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
          el.scrollLeft = 0;
        }
      }
    }, 30);
    el.addEventListener('mouseenter', () => { paused = true; });
    el.addEventListener('mouseleave', () => { paused = false; });
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ═══ HERO ═══ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-hero-gradient"
        style={{ paddingTop: '5rem' }}
      >
        {/* Floating orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,229,195,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'orb1 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(92,142,240,0.07) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'orb2 16s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'orb3 10s ease-in-out infinite',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(0,229,195,0.08)',
              border: '1px solid rgba(0,229,195,0.2)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse-glow" />
            <span className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
              Powered by GenLayer • AI-native blockchain
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="heading-xl mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span style={{ color: 'var(--text-primary)' }}>Truth,</span>
            {' '}
            <span className="text-gradient-teal">staked</span>
            {' '}
            <span style={{ color: 'var(--text-primary)' }}>on-chain.</span>
          </motion.h1>

          <motion.p
            className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Create P2P bets on any real-world question. Settled trustlessly by AI that
            fetches live data and reasons with consensus — no oracles, no judges.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/explore" aria-label="Explore all bets">
              <button className="btn btn-ghost btn-xl group">
                Explore Bets
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link to="/create" aria-label="Create a new bet">
              <button className="btn btn-primary btn-xl">
                <Sparkles size={18} />
                Create a Bet
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Scroll to explore
          </span>
          <div
            className="w-0.5 h-8 rounded-full"
            style={{ background: 'linear-gradient(180deg, var(--accent-primary), transparent)' }}
          />
        </motion.div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section
        className="py-16 border-y"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-surface)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(({ label, value, suffix, prefix, decimal }) => (
              <motion.div
                key={label}
                className="flex flex-col gap-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <StatCounter value={value} suffix={suffix} prefix={prefix} decimal={decimal} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED BETS ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex items-end justify-between mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <h2 className="heading-lg mb-2">
                <span style={{ color: 'var(--text-primary)' }}>Live </span>
                <span className="text-gradient-teal">Bets</span>
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Active prediction markets — join one or create your own
              </p>
            </div>
            <Link to="/explore">
              <button className="btn btn-ghost btn-sm group hidden sm:flex">
                View all
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </motion.div>

          {/* Horizontal scroll carousel */}
          <div
            ref={carouselRef}
            className="scroll-x flex gap-5 pb-4"
            style={{ scrollBehavior: 'smooth' }}
            aria-label="Featured bets carousel"
          >
            {isLoading
              ? [...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[360px]">
                  <BetCardSkeleton />
                </div>
              ))
              : featured.map((bet, i) => (
                <div key={bet.id} className="flex-shrink-0 w-[360px]">
                  <BetCard bet={bet} index={i} />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section
        className="py-24 px-4"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-lg mb-4">
              How <span className="text-gradient-teal">TruthStake</span> Works
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Three steps. No intermediaries. AI-verified truth.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connector lines */}
            <div
              className="absolute top-16 left-1/3 right-1/3 h-0.5 hidden sm:block"
              style={{ background: 'linear-gradient(90deg, var(--accent-primary), var(--pending-blue))' }}
            />

            {HOW_IT_WORKS.map(({ icon, step, title, desc }, i) => (
              <motion.div
                key={step}
                className="flex flex-col items-center text-center gap-4 p-8 rounded-[20px] relative"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-glass)',
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(0,229,195,0.1)',
                    border: '1px solid rgba(0,229,195,0.2)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {icon}
                </div>
                <span
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black font-mono"
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'var(--bg-void)',
                  }}
                >
                  {step}
                </span>
                <h3 className="font-syne font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA STRIP ═══ */}
      <section className="py-24 px-4 text-center">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="heading-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to stake your{' '}
            <span className="text-gradient-amber">truth?</span>
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Create your first prediction market in seconds. The AI never lies.
          </p>
          <Link to="/create">
            <button className="btn btn-primary btn-xl">
              <Sparkles size={20} />
              Create a Bet
              <ArrowRight size={18} />
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
