import React, { useState, useEffect } from 'react';
import { Eye, Layers, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const NAV_LINKS = [
  { id: 'hero-section',    label: 'Beranda',       short: 'Home', icon: Layers },
  { id: 'scanner-section', label: 'Pemindai GENT',  short: 'Scan', icon: Eye },
];

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? 'shadow-md' : ''
        }`}
        style={{
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid var(--color-accent-mid)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">

          {/* Brand Logo */}
          <button
            onClick={() => handleNav('hero-section')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl p-0.5 shadow-md group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}
            >
              <div
                className="w-full h-full rounded-[10px] sm:rounded-[14px] flex items-center justify-center bg-white"
              >
                <span className="text-xs font-black" style={{ color: 'var(--color-primary)' }}>G</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight"
                  style={{ color: 'var(--color-primary-dark)' }}
                >
                  GENT<span style={{ color: 'var(--color-primary)' }}>-Vision</span>
                </span>
              </div>
              <span className="hidden sm:block text-[10px] tracking-wider font-medium -mt-0.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Smart Meat Packaging Platform
              </span>
            </div>
          </button>

          {/* Center Nav — Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap`}
                style={activeSection === id
                  ? {
                      background: 'var(--color-accent)',
                      color: 'var(--color-primary)',
                      border: '1px solid var(--color-accent-mid)',
                    }
                  : {
                      color: 'var(--color-text-muted)',
                      border: '1px solid transparent',
                    }
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Right area */}
          <div className="flex items-center gap-2">
            {/* Quick Scan CTA */}
            <button
              onClick={() => handleNav('scanner-section')}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', boxShadow: '0 4px 12px rgba(194,24,91,0.25)' }}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Pindai Stiker</span>
              <span className="sm:hidden">Scan</span>
            </button>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl border cursor-pointer transition-all"
              style={{ borderColor: 'var(--color-accent-mid)', color: 'var(--color-text-muted)' }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div
            className="lg:hidden border-t animate-fadeInUp shadow-xl"
            style={{ background: 'white', borderColor: 'var(--color-accent-mid)' }}
          >
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
              {NAV_LINKS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer text-left border"
                  style={activeSection === id
                    ? { background: 'var(--color-accent)', color: 'var(--color-primary)', borderColor: 'var(--color-accent-mid)' }
                    : { background: 'white', color: 'var(--color-text)', borderColor: 'transparent' }
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow-2xl bottom-nav-safe"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderColor: 'var(--color-accent-mid)' }}
      >
        <div className="flex items-stretch justify-around px-1 pt-2 pb-2">
          {NAV_LINKS.map(({ id, short, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all cursor-pointer min-w-0 flex-1"
              style={{ color: activeSection === id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
            >
              <div
                className="p-1.5 rounded-xl transition-all"
                style={activeSection === id ? {
                  background: 'var(--color-accent)',
                  border: '1px solid var(--color-accent-mid)',
                } : {}}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold leading-none truncate w-full text-center">{short}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};
