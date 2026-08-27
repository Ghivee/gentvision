import React, { useState, useEffect } from 'react';
import { Leaf, Eye, Layers, Package, FlaskConical, Truck, Users, ChevronRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const NAV_LINKS = [
  { id: 'hero-section', label: 'Beranda', short: 'Home', icon: Layers },
  { id: 'scanner-section', label: 'Pemindai GENT', short: 'Scan', icon: Eye },
  { id: 'fefo-section', label: 'Dashboard FEFO', short: 'FEFO', icon: Package },
  { id: 'lab-section', label: 'Lab Kimia', short: 'Lab', icon: FlaskConical },
  { id: 'traceability-section', label: 'Eco Traceability', short: 'Eco', icon: Truck },
  { id: 'consumer-section', label: 'Portal Konsumen', short: 'Info', icon: Users },
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
      {/* ─── Top Navbar ──────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/97 backdrop-blur-xl shadow-md border-b border-[#1e6238]/10'
            : 'bg-white/90 backdrop-blur-sm border-b border-[#1e6238]/8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <button
            onClick={() => handleNav('hero-section')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#1e6238] via-[#70bc2c] to-[#c4cb38] p-0.5 shadow-md shadow-[#1e6238]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e6238]" />
              </div>
            </div>
            <div className="hidden xs:block">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-emerald-950">
                  GENT<span className="text-[#1e6238]">-Vision</span>
                </span>
                <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-[#f0efc0] text-[#1e6238] font-mono font-bold border border-[#c4cb38]/40">
                  Eco
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-emerald-700/80 tracking-wider font-medium -mt-0.5">
                Smart Meat Packaging Platform
              </span>
            </div>
            {/* Mobile brand text */}
            <span className="xs:hidden text-lg font-extrabold text-emerald-950">
              GENT<span className="text-[#1e6238]">-Vision</span>
            </span>
          </button>

          {/* Center Nav — Desktop Only */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeSection === id
                    ? 'bg-[#f0efc0]/80 text-[#1e6238] border border-[#c4cb38]/60 shadow-sm'
                    : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Right area */}
          <div className="flex items-center gap-2">
            {/* Quick Scan CTA — always visible */}
            <button
              onClick={() => handleNav('scanner-section')}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#1e6238] to-[#70bc2c] hover:from-[#174e2c] hover:to-[#5ea322] text-white text-xs font-bold shadow-md shadow-[#1e6238]/20 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Pindai Stiker</span>
              <span className="sm:hidden">Scan</span>
              <ChevronRight className="w-3 h-3 hidden sm:inline" />
            </button>

            {/* Hamburger — tablet/mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-emerald-100 text-emerald-800 hover:bg-emerald-50 transition-all cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ─── Mobile Dropdown Menu ────────────────────────── */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-emerald-50 bg-white/98 backdrop-blur-xl animate-fadeInUp shadow-xl">
            <nav className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-2">
              {NAV_LINKS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer text-left ${
                    activeSection === id
                      ? 'bg-[#f0efc0] text-[#1e6238] border border-[#c4cb38]/60'
                      : 'text-emerald-900 bg-white hover:bg-emerald-50 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="leading-tight">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ─── Bottom Navigation Bar (Mobile Only) ─────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-xl border-t border-emerald-100 shadow-2xl bottom-nav-safe">
        <div className="flex items-stretch justify-around px-1 pt-2 pb-2">
          {NAV_LINKS.map(({ id, short, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all cursor-pointer min-w-0 flex-1 ${
                activeSection === id
                  ? 'text-[#1e6238]'
                  : 'text-emerald-600/70 hover:text-emerald-800'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                activeSection === id ? 'bg-[#f0efc0] border border-[#c4cb38]/50' : ''
              }`}>
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
