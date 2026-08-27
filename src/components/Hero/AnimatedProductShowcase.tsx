import React from 'react';
import { Eye, ChevronRight } from 'lucide-react';

interface AnimatedProductShowcaseProps {
  onScanClick: () => void;
}

export const AnimatedProductShowcase: React.FC<AnimatedProductShowcaseProps> = ({ onScanClick }) => {
  return (
    <div
      className="relative overflow-hidden pt-10 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b"
      style={{
        background: 'linear-gradient(160deg, var(--color-bg) 0%, #fff0f9 60%, var(--color-accent) 100%)',
        borderColor: 'var(--color-accent-mid)',
      }}
    >
      <div className="max-w-6xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* Left Column */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">

            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--color-primary)' }}>
              Smart Packaging · Kurkumin-DES · Jerami Padi
            </p>

            <h1
              className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ color: 'var(--color-primary-dark)' }}
            >
              Pemindai Kesegaran Daging{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)' }}
              >
                GENT-Vision
              </span>
            </h1>

            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Baca spektrum warna stiker kurkumin-DES GENT secara instan.
              Kalibrasi <strong style={{ color: 'var(--color-primary-dark)' }}>Von Kries</strong> dan
              averaging <strong style={{ color: 'var(--color-primary-dark)' }}>10 frame</strong> memastikan
              hasil akurat di semua kondisi pencahayaan.
            </p>

            <button
              onClick={onScanClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                boxShadow: '0 8px 28px rgba(194,24,91,0.30)',
              }}
            >
              <Eye className="w-5 h-5" />
              <span>Mulai Pemindaian</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Product Image — clean, no header/footer labels */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div
                className="rounded-3xl overflow-hidden border"
                style={{
                  borderColor: 'var(--color-accent-mid)',
                  boxShadow: '0 20px 50px -8px rgba(194,24,91,0.18)',
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}assets/gent-packaging-ref.webp`}
                  alt="Kemasan daging GENT dengan stiker indikator kurkumin-DES"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
