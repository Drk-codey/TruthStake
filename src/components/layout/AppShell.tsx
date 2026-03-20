import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { Toaster } from 'sonner';
import { ConsensusModal } from '../consensus/ConsensusVisualizer';

export const AppShell: React.FC = () => (
  <div
    className="min-h-screen"
    style={{ background: 'var(--bg-deep)' }}
  >
    <Navbar />
    <main className="pb-16 md:pb-0">
      <Outlet />
    </main>
    <BottomNav />
    <ConsensusModal />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-glass)',
          color: 'var(--text-primary)',
          fontFamily: 'DM Sans, sans-serif',
        },
      }}
      theme="dark"
    />
  </div>
);
