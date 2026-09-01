import React, { useState, useCallback } from 'react';
import { AnimatedProductShowcase } from './components/Hero/AnimatedProductShowcase';
import { SmartColorAnalyzer } from './components/Scanner/SmartColorAnalyzer';
import { ScanHistory } from './components/Scanner/ScanHistory';
import { Footer } from './components/Footer';
import { ColorAnalysisResult, UserMode } from './types';

const HISTORY_KEY = 'gent_scan_history_v2';
const MAX_HISTORY = 50;

function loadHistory(): ColorAnalysisResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ColorAnalysisResult[];
  } catch {
    return [];
  }
}

function saveHistory(items: ColorAnalysisResult[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch {
    // ignore quota errors
  }
}

export function App() {
  const [userMode, setUserMode] = useState<UserMode>('retail');
  const [scanHistory, setScanHistory] = useState<ColorAnalysisResult[]>(() => loadHistory());

  const scrollToScanner = () => {
    const elem = document.getElementById('scanner-section');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScanComplete = useCallback((result: ColorAnalysisResult) => {
    setScanHistory(prev => {
      const updated = [result, ...prev.filter(r => r.id !== result.id)];
      saveHistory(updated);
      return updated;
    });
  }, []);

  const handleDeleteHistoryItem = useCallback((id: string) => {
    setScanHistory(prev => {
      const updated = prev.filter(r => r.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    setScanHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  return (
    <div
      className="min-h-screen font-sans flex flex-col"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <main className="flex-1">
        <section id="hero-section">
          <AnimatedProductShowcase
            onScanClick={scrollToScanner}
            userMode={userMode}
            onModeChange={setUserMode}
          />
        </section>

        <div className="section-divider" />

        <section id="scanner-section" style={{ background: 'white' }}>
          <SmartColorAnalyzer
            userMode={userMode}
            onScanComplete={handleScanComplete}
          />
        </section>

        {/* History Section */}
        {scanHistory.length > 0 && (
          <section
            id="history-section"
            className="py-10 px-4 sm:px-6 lg:px-8 border-t"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent-mid)' }}
          >
            <ScanHistory
              history={scanHistory}
              userMode={userMode}
              onDelete={handleDeleteHistoryItem}
              onClear={handleClearHistory}
            />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
