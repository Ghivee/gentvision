import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AnimatedProductShowcase } from './components/Hero/AnimatedProductShowcase';
import { SmartColorAnalyzer } from './components/Scanner/SmartColorAnalyzer';
import { FefoDashboard } from './components/Dashboard/FefoDashboard';
import { ChemLabSimulator } from './components/LabSimulator/ChemLabSimulator';
import { EcoTraceabilityHub } from './components/Traceability/EcoTraceabilityHub';
import { ConsumerHub } from './components/Consumer/ConsumerHub';
import { Footer } from './components/Footer';

export function App() {
  const [activeSection, setActiveSection] = useState<string>('hero-section');

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9ea] text-slate-800 font-sans flex flex-col selection:bg-emerald-500 selection:text-slate-900">
      {/* Navigation Header */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <main className="flex-1">
        
        {/* SECTION 1: Hero / Landing */}
        <section id="hero-section">
          <AnimatedProductShowcase
            onScanClick={() => handleNavigate('scanner-section')}
          />
        </section>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* SECTION 2: Smart Color Scanner (Fitur Utama A) */}
        <section id="scanner-section" className="bg-white">
          <SmartColorAnalyzer />
        </section>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* SECTION 3: FEFO Dashboard B2B (Fitur Utama B) */}
        <section id="fefo-section" className="bg-[#faf9ea]">
          <FefoDashboard />
        </section>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* SECTION 4: Chem Lab Simulator (Fitur Utama C) */}
        <section id="lab-section" className="bg-[#faf9ea]">
          <ChemLabSimulator />
        </section>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* SECTION 5: Eco Traceability Hub (Fitur Utama D) */}
        <section id="traceability-section" className="bg-[#faf9ea]">
          <EcoTraceabilityHub />
        </section>

        {/* Section Divider */}
        <div className="section-divider" />

        {/* SECTION 6: Consumer Hub (Fitur Utama E) */}
        <section id="consumer-section" className="bg-[#faf9ea]">
          <ConsumerHub />
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
