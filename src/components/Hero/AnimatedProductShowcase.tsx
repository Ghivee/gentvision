import React from 'react';
import { Eye, ChevronRight, Store, User } from 'lucide-react';
import { UserMode } from '../../types';

interface AnimatedProductShowcaseProps {
  onScanClick: () => void;
  userMode: UserMode;
  onModeChange: (mode: UserMode) => void;
}

export const AnimatedProductShowcase: React.FC<AnimatedProductShowcaseProps> = ({
  onScanClick,
  userMode,
  onModeChange,
}) => {
  return (
    <div
      className="relative overflow-hidden min-h-[88vh] sm:min-h-0 flex flex-col justify-center pt-8 pb-10 sm:pt-10 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b"
      style={{
        background: 'linear-gradient(160deg, var(--color-bg) 0%, #fff0f9 60%, var(--color-accent) 100%)',
        borderColor: 'var(--color-accent-mid)',
      }}
    >
      <div className="max-w-6xl mx-auto w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 sm:gap-y-8 gap-x-8 lg:gap-14 items-center">
          
          {/* Header */}
          <div className="order-1 lg:col-span-6 lg:col-start-1 lg:row-start-1 space-y-3 sm:space-y-5">
            <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--color-primary)' }}>
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
          </div>

          {/* Product Image */}
          <div className="order-2 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:row-span-2 flex justify-center py-2 lg:py-0">
            <div className="relative w-full max-w-[240px] sm:max-w-md">
              <div
                className="rounded-3xl sm:rounded-[2rem] overflow-hidden border-2"
                style={{
                  borderColor: 'var(--color-accent-mid)',
                  boxShadow: '0 15px 35px -8px rgba(194,24,91,0.20)',
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}assets/foto.webp`}
                  alt="Kemasan daging GENT dengan stiker indikator kurkumin-DES"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="order-3 lg:col-span-6 lg:col-start-1 lg:row-start-2 flex flex-col gap-6 lg:gap-8">
            {/* Mode Toggle */}
            <div className="space-y-3">
              <p className="text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                <span>Pilih Mode Pengguna</span>
                <span className="flex-1 h-px bg-slate-200"></span>
              </p>
              <div
                className="inline-flex rounded-2xl p-1.5 border shadow-inner w-full sm:w-auto"
                style={{ background: 'var(--color-accent)', borderColor: 'var(--color-accent-mid)' }}
              >
                <button
                  onClick={() => onModeChange('retail')}
                  className="relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-3.5 sm:px-6 sm:py-3 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all duration-300 cursor-pointer overflow-hidden"
                  style={userMode === 'retail'
                    ? { background: 'var(--color-primary)', color: 'white', boxShadow: '0 4px 12px rgba(194,24,91,0.35)' }
                    : { color: 'var(--color-text-muted)', background: 'transparent' }
                  }
                >
                  {userMode === 'retail' && <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none"></div>}
                  <Store className={`w-4 h-4 ${userMode === 'retail' ? 'scale-110' : 'opacity-60'}`} />
                  Retail
                  {userMode === 'retail' && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full shadow-sm"></div>}
                </button>
                <button
                  onClick={() => onModeChange('consumer')}
                  className="relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-3.5 sm:px-6 sm:py-3 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all duration-300 cursor-pointer overflow-hidden"
                  style={userMode === 'consumer'
                    ? { background: 'var(--color-primary)', color: 'white', boxShadow: '0 4px 12px rgba(194,24,91,0.35)' }
                    : { color: 'var(--color-text-muted)', background: 'transparent' }
                  }
                >
                  {userMode === 'consumer' && <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none"></div>}
                  <User className={`w-4 h-4 ${userMode === 'consumer' ? 'scale-110' : 'opacity-60'}`} />
                  Konsumen
                  {userMode === 'consumer' && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full shadow-sm"></div>}
                </button>
              </div>
              <p className="text-[11px] sm:text-[11.5px] leading-relaxed font-semibold p-3 rounded-xl border flex items-start gap-2" 
                style={{ 
                  color: userMode === 'retail' ? 'var(--color-primary-dark)' : '#333', 
                  background: 'white', 
                  borderColor: 'var(--color-accent-mid)' 
                }}
              >
                {userMode === 'retail'
                  ? <><span>🏪</span> <span>Rekomendasi operasional untuk <strong>toko daging & supermarket</strong>.</span></>
                  : <><span>🏠</span> <span>Panduan penyimpanan & konsumsi untuk <strong>rumah tangga</strong>.</span></>}
              </p>
            </div>

            <button
              onClick={onScanClick}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl text-white font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98]"
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
        </div>
      </div>
    </div>
  );
};
