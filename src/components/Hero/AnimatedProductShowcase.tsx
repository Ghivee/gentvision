import React from 'react';
import { 
  Eye, 
  Leaf, 
  ChevronRight,
  ShieldCheck,
  Zap,
  FlaskConical,
  Cpu
} from 'lucide-react';

interface AnimatedProductShowcaseProps {
  onScanClick: () => void;
}

const FEATURE_BADGES = [
  { icon: FlaskConical, label: 'Sensor Kurkumin-DES', color: 'text-[#70bc2c] bg-[#f0efc0]' },
  { icon: Cpu, label: 'Analisis Real-time', color: 'text-[#1e6238] bg-[#f0efc0]' },
  { icon: ShieldCheck, label: 'Kalibrasi Titik Putih', color: 'text-[#9f5472] bg-[#eaa2b2]/20' },
  { icon: Leaf, label: 'Biomassa Jerami Padi', color: 'text-[#70bc2c] bg-[#f0efc0]' },
  { icon: Zap, label: 'Hasil Instan', color: 'text-[#c4cb38] bg-[#f0efc0]' },
];

export const AnimatedProductShowcase: React.FC<AnimatedProductShowcaseProps> = ({
  onScanClick,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#1e6238]/10 bg-gradient-to-b from-[#faf9ea] via-white to-[#faf9ea]">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-[#c4cb38]/8 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-[#1e6238]/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            
            {/* Category badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f0efc0]/80 border border-[#c4cb38]/50 text-[#1e6238] text-xs font-bold shadow-sm animate-fadeInUp">
              <Leaf className="w-4 h-4 text-[#70bc2c]" />
              <span>Smart Packaging Berbasis Kurkumin-DES &amp; Jerami Padi</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight animate-slideInLeft">
              Platform Pemindai Presisi{' '}
              <span className="bg-gradient-to-r from-[#1e6238] via-[#70bc2c] to-[#ba2c67] bg-clip-text text-transparent">
                GENT-Vision
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed animate-fadeInUp">
              Solusi digital presisi untuk membaca spektrum warna stiker indikator kesegaran daging GENT 
              (kurkumin-DES). Dilengkapi sistem{' '}
              <strong className="text-slate-800">Kalibrasi Titik Putih</strong> otomatis untuk hasil akurat 
              di semua kamera dan kondisi pencahayaan.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 animate-fadeInUp">
              {FEATURE_BADGES.map(({ icon: Icon, label, color }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#c4cb38]/30 shadow-sm ${color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-2 animate-fadeInUp">
              <button
                onClick={onScanClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#1e6238] to-[#70bc2c] hover:from-[#174e2c] hover:to-[#5ea322] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#1e6238]/25 transition-all flex items-center justify-center gap-3 cursor-pointer transform hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Eye className="w-5 h-5 text-white" />
                <span>Buka Pemindai Stiker GENT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#70bc2c]" />
                Scroll otomatis ke hasil analisis setelah pemindaian
              </p>
            </div>
          </div>

          {/* Right Column: Product Image */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              
              {/* Floating decoration dots */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-[#c4cb38]/15 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-6 -left-4 w-32 h-32 rounded-full bg-[#1e6238]/10 blur-3xl pointer-events-none" />

              {/* Product card */}
              <div className="relative bg-white rounded-3xl p-3 sm:p-4 border border-[#c4cb38]/40 shadow-2xl animate-float">
                
                {/* Card header */}
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5 px-1">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#70bc2c]" />
                    Kemasan Pintar GENT
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#1e6238] bg-[#f0efc0] px-2 py-0.5 rounded-md border border-[#c4cb38]/30">
                    Curcumin-DES
                  </span>
                </div>

                {/* Product image */}
                <div className="rounded-2xl overflow-hidden bg-[#faf9ea] border border-slate-200 shadow-inner">
                  <img 
                    src={`${import.meta.env.BASE_URL}assets/gent-packaging-ref.png`}
                    alt="Produk Kemasan Pintar GENT — Stiker Indikator Kesegaran Daging" 
                    className="w-full h-auto max-h-[320px] sm:max-h-[380px] object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                    }}
                  />
                </div>

                {/* Caption */}
                <div className="mt-3 px-1">
                  <p className="text-center text-xs text-slate-500 font-medium">
                    Stiker indikator kolorimetri GENT pada kemasan daging sapi &amp; ayam
                  </p>
                  {/* Color legend */}
                  <div className="flex items-center justify-center gap-3 mt-2">
                    {[
                      { hex: '#eab308', label: 'Segar' },
                      { hex: '#ea580c', label: 'Waspada' },
                      { hex: '#7f1d1d', label: 'Rusak' },
                    ].map(({ hex, label }) => (
                      <div key={label} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }} />
                        <span className="text-[10px] text-slate-500 font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
