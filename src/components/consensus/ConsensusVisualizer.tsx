import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Brain, Globe, Check } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const VALIDATOR_ICONS = [Shield, Brain, Globe, Shield, Brain];
const ORBIT_DELAYS = [0, 1.2, 2.4, 3.6, 4.8];

const STATUS_MESSAGES = [
  'Broadcasting transaction...',
  'Fetching web data...',
  'LLM reasoning in progress...',
  'Comparing validator outputs...',
  'Consensus reaching...',
  'Finalizing result...',
];

export const ConsensusVisualizer: React.FC = () => {
  const { consensus } = useAppStore();
  const [messageIndex, setMessageIndex] = React.useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (consensus.status === 'idle') return;
    intervalRef.current = setInterval(() => {
      setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 1800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [consensus.status]);

  const agreementPercent = (consensus.agreementCount / consensus.validatorCount) * 100;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Orbital animation */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 200, height: 200 }}
      >
        {/* Center pulse */}
        <motion.div
          className="absolute w-12 h-12 rounded-full flex items-center justify-center z-10"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--pending-blue))',
            boxShadow: '0 0 30px rgba(0,229,195,0.5)',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Brain size={20} color="#050508" />
        </motion.div>

        {/* Orbit ring */}
        <div
          className="absolute w-40 h-40 rounded-full"
          style={{ border: '1px dashed rgba(0,229,195,0.15)' }}
        />

        {/* Validator nodes */}
        {VALIDATOR_ICONS.map((Icon, i) => {
          const agreed = i < consensus.agreementCount;
          const angle = (i / 5) * 360;
          
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                animation: `spin ${7 + i * 0.5}s linear infinite`,
                animationDelay: `-${(i / 5) * (7 + i * 0.5)}s`,
              }}
            >
              <motion.div
                className="absolute w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  top: 0,
                  left: '50%',
                  transform: `translate(-50%, -50%) translateY(-80px) rotate(${-angle}deg)`,
                  background: agreed ? 'rgba(34,211,122,0.2)' : 'var(--bg-elevated)',
                  border: agreed ? '1px solid var(--yes-green)' : '1px solid var(--border-glass)',
                  boxShadow: agreed ? '0 0 12px rgba(34,211,122,0.4)' : 'none',
                  transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s',
                }}
                animate={agreed ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                {agreed ? (
                  <Check size={13} style={{ color: 'var(--yes-green)' }} />
                ) : (
                  <Icon size={13} style={{ color: 'var(--text-muted)' }} />
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Status message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-medium text-center"
          style={{ color: 'var(--text-secondary)' }}
        >
          {STATUS_MESSAGES[messageIndex]}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>Validator Agreement</span>
          <span style={{ color: 'var(--accent-primary)' }}>
            {consensus.agreementCount}/{consensus.validatorCount}
          </span>
        </div>
        <div
          className="h-2 w-full rounded-full overflow-hidden"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--accent-primary), var(--pending-blue))',
              boxShadow: '0 0 8px rgba(0,229,195,0.4)',
            }}
            animate={{ width: `${agreementPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* TX hash */}
      {consensus.txHash && (
        <div
          className="w-full px-3 py-2 rounded-lg text-xs font-mono text-center break-all"
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          Tx: {consensus.txHash.slice(0, 42)}...
        </div>
      )}
    </div>
  );
};

// Modal wrapper connected to store state
export const ConsensusModal: React.FC = () => {
  const { isConsensusModalOpen } = useAppStore();
  const { updateConsensus, closeConsensusModal } = useAppStore();

  // Simulate progressive validator agreement
  useEffect(() => {
    if (!isConsensusModalOpen) return;
    
    let count = 0;
    const timer = setInterval(() => {
      count++;
      if (count <= 5) {
        updateConsensus({ agreementCount: count });
      } else {
        clearInterval(timer);
        updateConsensus({ status: 'done' });
        setTimeout(closeConsensusModal, 1500);
      }
    }, 800);

    return () => clearInterval(timer);
  }, [isConsensusModalOpen, updateConsensus, closeConsensusModal]);

  if (!isConsensusModalOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Consensus in progress"
    >
      <motion.div
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="p-6">
          <h2
            className="font-syne font-bold text-2xl text-center mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            GenLayer Consensus
          </h2>
          <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>
            Intelligent validators are reaching agreement
          </p>
          <ConsensusVisualizer />
        </div>
      </motion.div>
    </div>
  );
};
