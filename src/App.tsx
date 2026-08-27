import React from 'react';
import { AnimatedProductShowcase } from './components/Hero/AnimatedProductShowcase';
import { SmartColorAnalyzer } from './components/Scanner/SmartColorAnalyzer';
import { Footer } from './components/Footer';

export function App() {
  const scrollToScanner = () => {
    const elem = document.getElementById('scanner-section');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen font-sans flex flex-col"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <main className="flex-1">
        <section id="hero-section">
          <AnimatedProductShowcase onScanClick={scrollToScanner} />
        </section>

        <div className="section-divider" />

        <section id="scanner-section" style={{ background: 'white' }}>
          <SmartColorAnalyzer />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
