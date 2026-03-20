import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Globe, Brain, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    icon: <Brain size={32} />,
    title: 'AI-Powered Settlement',
    color: 'var(--accent-primary)',
    glow: 'rgba(0,229,195,0.12)',
    border: 'rgba(0,229,195,0.2)',
    content: `GenLayer's Intelligent Contracts don't rely on oracles or human judges. When a bet needs settling, the contract instructs multiple AI validators to fetch the settlement URL, analyze the content, and reason about the outcome. All of this happens trustlessly on-chain.`,
  },
  {
    icon: <Shield size={32} />,
    title: 'Optimistic Democracy',
    color: 'var(--pending-blue)',
    glow: 'rgba(92,142,240,0.12)',
    border: 'rgba(92,142,240,0.2)',
    content: `GenLayer uses a novel consensus mechanism called Optimistic Democracy. Multiple validator nodes independently run the same AI reasoning. A leader proposes an outcome, followers verify it, and the majority wins. No single point of failure. No corruption possible.`,
  },
  {
    icon: <Globe size={32} />,
    title: 'Real-World Data',
    color: 'var(--stake-amber)',
    glow: 'rgba(245,166,35,0.12)',
    border: 'rgba(245,166,35,0.2)',
    content: `Every bet has a settlement URL — a real web page that the AI will read. This could be a weather site, a news article, a sports result page, or any publicly accessible URL. The AI fetches the page, reads the content, and applies reasoning to determine the outcome.`,
  },
  {
    icon: <Zap size={32} />,
    title: 'P2P Without Intermediaries',
    color: 'var(--yes-green)',
    glow: 'rgba(34,211,122,0.12)',
    border: 'rgba(34,211,122,0.2)',
    content: `TruthStake is purely peer-to-peer. The creator (YES side) sets the question and stakes. The taker (NO side) takes the opposing position. Both stakes are locked in the contract. The winner receives the total pot. No platform fees. No counterparty risk.`,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(0,229,195,0.15), rgba(92,142,240,0.15))',
              border: '1px solid var(--border-active)',
            }}
          >
            <Sparkles size={36} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h1 className="heading-xl mb-6">
            <span style={{ color: 'var(--text-primary)' }}>How </span>
            <span className="text-gradient-teal">TruthStake</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Works</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            The world's first AI-settled prediction market. Built on GenLayer, where
            Intelligent Contracts can read the web and reason with LLMs.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map(({ icon, title, color, glow, border, content }, i) => (
            <motion.div
              key={title}
              className="p-8 rounded-[20px]"
              style={{
                background: glow,
                border: `1px solid ${border}`,
              }}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="flex gap-6 items-start">
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: glow, border: `1px solid ${border}`, color }}
                >
                  {icon}
                </div>
                <div>
                  <h2
                    className="font-syne font-bold text-2xl mb-3"
                    style={{ color }}
                  >
                    {title}
                  </h2>
                  <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="font-syne font-bold text-3xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to stake your truth?
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/create">
              <button className="btn btn-primary btn-lg" aria-label="Create a bet">
                <Sparkles size={18} />
                Create a Bet
              </button>
            </Link>
            <Link to="/explore">
              <button className="btn btn-ghost btn-lg" aria-label="Explore prediction markets">
                Explore Markets
                <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
