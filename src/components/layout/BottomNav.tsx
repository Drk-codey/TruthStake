import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Plus, Layers, BookOpen } from 'lucide-react';

const LINKS = [
  { to: '/', icon: <Home size={20} />, label: 'Home', exact: true },
  { to: '/explore', icon: <Compass size={20} />, label: 'Explore' },
  { to: '/create', icon: <Plus size={20} />, label: 'Create', highlight: true },
  { to: '/my-bets', icon: <Layers size={20} />, label: 'My Bets' },
  { to: '/how-it-works', icon: <BookOpen size={20} />, label: 'How' },
];

export const BottomNav: React.FC = () => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-stretch"
    style={{
      background: 'rgba(15,16,32,0.96)',
      borderTop: '1px solid var(--border-subtle)',
      backdropFilter: 'blur(20px)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}
    aria-label="Mobile navigation"
  >
    {LINKS.map(({ to, icon, label, exact, highlight }) => (
      <NavLink
        key={to}
        to={to}
        end={exact}
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center justify-center py-3 gap-0.5 text-[10px] font-semibold transition-colors ${
            isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
          }`
        }
        aria-label={label}
      >
        {highlight ? (
          <span
            className="flex items-center justify-center w-10 h-10 rounded-2xl -mt-5 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-dim))',
              boxShadow: '0 4px 20px rgba(0,229,195,0.4)',
              color: 'var(--bg-void)',
            }}
          >
            {icon}
          </span>
        ) : (
          icon
        )}
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);
