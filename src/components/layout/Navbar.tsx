import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, Compass, PlusSquare, Layers } from 'lucide-react';
import { WalletBadge } from '../wallet/WalletBadge';

const navLinks = [
  { to: '/explore', label: 'Explore', icon: <Compass size={17} /> },
  { to: '/create', label: 'Create', icon: <PlusSquare size={17} /> },
  { to: '/my-bets', label: 'My Bets', icon: <Layers size={17} /> },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => setIsMobileOpen(false), [location.pathname]);

  const navStyle: React.CSSProperties = {
    background: isScrolled || !isHomePage
      ? 'rgba(15, 16, 32, 0.92)'
      : 'transparent',
    backdropFilter: isScrolled || !isHomePage ? 'blur(20px)' : 'none',
    borderBottom: isScrolled || !isHomePage
      ? '1px solid var(--border-subtle)'
      : '1px solid transparent',
    transition: 'all 0.3s ease',
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
              aria-label="TruthStake home"
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl transition-all group-hover:shadow-[0_0_20px_rgba(0,229,195,0.4)]"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--pending-blue))',
                }}
              >
                <Sparkles size={18} color="#050508" />
              </div>
              <span
                className="text-xl font-bold hidden sm:block"
                style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
              >
                Truth<span style={{ color: 'var(--accent-primary)' }}>Stake</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navLinks.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[rgba(0,229,195,0.1)] text-[var(--accent-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                    }`
                  }
                  aria-label={label}
                >
                  {icon}
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <WalletBadge />
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden p-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
                aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileOpen}
              >
                {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`nav-drawer md:hidden ${isMobileOpen ? 'open' : ''} pt-20 px-4`}
      >
        <nav className="flex flex-col gap-1" role="navigation" aria-label="Mobile navigation">
          {navLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive
                    ? 'bg-[rgba(0,229,195,0.1)] text-[var(--accent-primary)] border border-[rgba(0,229,195,0.2)]'
                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Network
          </p>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--yes-green)]" />
            GenLayer Localnet
          </div>
        </div>
      </div>
    </>
  );
};
