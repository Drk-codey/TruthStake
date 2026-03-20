import React from 'react';
import { motion } from 'framer-motion';
import { CreateBetForm } from '../components/bets/CreateBetForm';
import { Sparkles } from 'lucide-react';

export default function CreateBetPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0,229,195,0.15), rgba(92,142,240,0.15))',
              border: '1px solid var(--border-active)',
            }}
          >
            <Sparkles size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h1 className="heading-lg mb-3">
            <span style={{ color: 'var(--text-primary)' }}>Create a </span>
            <span className="text-gradient-teal">Prediction Bet</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Pose any real-world question and stake your truth. The AI will settle it.
          </p>
        </motion.div>

        <CreateBetForm />
      </div>
    </div>
  );
}
