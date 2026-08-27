import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Thermometer, 
  Clock, 
  Activity, 
  Utensils, 
  ShieldCheck, 
  Download, 
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { ColorAnalysisResult } from '../../types';

interface ResultDetailCardProps {
  result: ColorAnalysisResult;
  onReset: () => void;
}

export const ResultDetailCard: React.FC<ResultDetailCardProps> = ({ result, onReset }) => {
  const statusTheme = {
    fresh: {
      badge: 'bg-[#f0efc0] text-[#1e6238] border-[#c4cb38]',
      border: 'border-[#c4cb38]',
      headerBg: 'bg-gradient-to-br from-[#faf9ea] to-white',
      icon: <CheckCircle2 className="w-7 h-7 text-[#1e6238] flex-shrink-0" />,
      tag: 'STATUS 1: SEGAR',
      tagColor: 'text-[#1e6238]',
      accentColor: 'text-[#1e6238]',
      glowClass: 'shadow-[#c4cb38]/20',
    },
    warning: {
      badge: 'bg-[#eaa2b2]/30 text-[#9f5472] border-[#eaa2b2]',
      border: 'border-[#eaa2b2]',
      headerBg: 'bg-gradient-to-br from-[#eaa2b2]/15 to-white',
      icon: <AlertTriangle className="w-7 h-7 text-[#9f5472] flex-shrink-0" />,
      tag: 'STATUS 2: WASPADA',
      tagColor: 'text-[#9f5472]',
      accentColor: 'text-[#9f5472]',
      glowClass: 'shadow-[#eaa2b2]/20',
    },
    spoiled: {
      badge: 'bg-[#ba2c67]/20 text-[#ba2c67] border-[#ba2c67]',
      border: 'border-[#ba2c67]',
      headerBg: 'bg-gradient-to-br from-[#ba2c67]/10 to-white',
      icon: <XCircle className="w-7 h-7 text-[#ba2c67] flex-shrink-0" />,
      tag: 'STATUS 3: BAHAYA',
      tagColor: 'text-[#ba2c67]',
      accentColor: 'text-[#ba2c67]',
      glowClass: 'shadow-[#ba2c67]/20',
    },
  }[result.status];

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GENT-Scan-${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className={`bg-white rounded-3xl border-2 ${statusTheme.border} shadow-2xl ${statusTheme.glowClass} overflow-hidden`}>
      
      {/* ── Header ── */}
      <div className={`p-4 sm:p-5 ${statusTheme.headerBg} border-b border-slate-100`}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${statusTheme.badge}`}>
            {statusTheme.tag}
          </span>
          <div className="flex items-center gap-1.5">
            {result.whiteCalibrated && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0efc0] text-[#1e6238] border border-[#c4cb38] flex items-center gap-1">
                <Check className="w-3 h-3 text-[#70bc2c]" /> Kalibrasi
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-400">{result.timestamp}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm mt-0.5 shrink-0">
            {statusTheme.icon}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {result.statusTitle}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
              {result.statusMessage}
            </p>
          </div>
        </div>
      </div>

      {/* ── Content Sections ── */}
      <div className="p-4 sm:p-5 space-y-4">

        {/* 1. Parameter Grid */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#70bc2c]" />
            Parameter Sensor
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            
            {/* pH */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-[#70bc2c]" /> pH Daging
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  result.phValue < 6.5 ? 'bg-[#f0efc0] text-[#1e6238]'
                  : result.phValue < 7.5 ? 'bg-orange-50 text-orange-600'
                  : 'bg-red-50 text-red-600'
                }`}>
                  {result.phValue < 6.5 ? 'Asam (Segar)' : result.phValue < 7.5 ? 'Netral' : 'Basa'}
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
                {result.phValue}
              </span>
              {/* Full-width gradient track, filled portion indicates where on the scale */}
              <div className="space-y-0.5">
                <div className="h-2 w-full bg-gradient-to-r from-[#70bc2c] via-[#c4cb38] via-[#ea580c] to-[#ba2c67] rounded-full relative">
                  {/* Pointer dot */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-700 shadow-md transition-all"
                    style={{ left: `calc(${Math.min(96, Math.max(2, ((result.phValue - 5.0) / 4.0) * 100))}% - 6px)` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>5.0</span><span>7.0</span><span>9.0</span>
                </div>
              </div>
            </div>

            {/* TVB-N */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-[#9f5472]" /> TVB-N
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  result.tvbnValue < 15 ? 'bg-[#f0efc0] text-[#1e6238]'
                  : result.tvbnValue < 25 ? 'bg-orange-50 text-orange-600'
                  : 'bg-red-50 text-red-600'
                }`}>
                  {result.tvbnValue < 15 ? 'Aman' : result.tvbnValue < 25 ? 'Waspada' : 'Bahaya'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{result.tvbnValue}</span>
                <span className="text-[10px] font-medium text-slate-500">mg/100g</span>
              </div>
              <div className="space-y-0.5">
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, Math.max(4, (result.tvbnValue / 40) * 100))}%`,
                      background: result.tvbnValue < 15 ? '#70bc2c' : result.tvbnValue < 25 ? '#ea580c' : '#ba2c67'
                    }}
                  />
                </div>
                <div className="text-[9px] text-slate-400 font-mono">Batas aman: &lt; 20 mg/100g</div>
              </div>
            </div>

            {/* Freshness Index */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#70bc2c]" /> Indeks
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  result.freshnessIndex >= 80 ? 'bg-[#f0efc0] text-[#1e6238]'
                  : result.freshnessIndex >= 40 ? 'bg-orange-50 text-orange-600'
                  : 'bg-red-50 text-red-600'
                }`}>
                  {result.freshnessIndex >= 80 ? 'Prima' : result.freshnessIndex >= 40 ? 'Segera' : 'Tidak Layak'}
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-[#1e6238] font-mono block">
                {result.freshnessIndex}%
              </span>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{ 
                    width: `${result.freshnessIndex}%`,
                    background: result.freshnessIndex >= 80 ? '#70bc2c'
                      : result.freshnessIndex >= 40 ? '#ea580c' : '#ba2c67'
                  }}
                />
              </div>
            </div>

            {/* Shelf Life */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#1e6238]" /> Sisa Umur
                </span>
                <span className="text-[10px] font-medium text-slate-500">Chiller 0–4°C</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">~{result.remainingShelfHours}</span>
                <span className="text-xs font-bold text-slate-600">Jam</span>
              </div>
              <div className="text-[10px] text-slate-500 border-t border-slate-200/80 pt-1.5">
                Estimasi degradasi protein
              </div>
            </div>

          </div>
        </div>

        {/* 2. Color Calibration */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 space-y-3 shadow-sm">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#70bc2c]" />
            Kalibrasi Spektrum Warna
          </span>

          <div className="grid grid-cols-2 gap-3">
            {/* Color comparison */}
            <div className="flex items-center justify-around bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-center">
                <span className="text-[9px] text-slate-500 block mb-1">Kamera (Raw)</span>
                <div className="w-9 h-9 rounded-full border-2 border-slate-200 shadow-inner mx-auto" style={{ backgroundColor: result.rawHex }} />
                <span className="text-[10px] font-mono font-bold text-slate-600 mt-1 block">{result.rawHex}</span>
              </div>
              <span className="text-slate-300 font-bold text-lg">→</span>
              <div className="text-center">
                <span className="text-[9px] text-[#1e6238] font-bold block mb-1">Terkalibrasi</span>
                <div className="w-9 h-9 rounded-full border-2 border-[#70bc2c] shadow-md mx-auto" style={{ backgroundColor: result.hex }} />
                <span className="text-[10px] font-mono font-black text-slate-900 mt-1 block">{result.hex}</span>
              </div>
            </div>

            {/* CIE Lab values */}
            <div className="grid grid-cols-3 gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
              {[
                { label: 'L*', value: result.lab.L },
                { label: 'a*', value: result.lab.a },
                { label: 'b*', value: result.lab.b },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-1.5 rounded-lg bg-[#faf9ea] border border-[#c4cb38]/20">
                  <span className="text-[9px] text-slate-500 block font-sans">{label}</span>
                  <span className="font-bold text-slate-900 text-xs font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Food safety warning */}
          {result.recommendations.foodSafetyWarning && (
            <div className="p-3 rounded-xl bg-[#ba2c67]/10 border border-[#ba2c67]/40 text-[#ba2c67] text-[11px] font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{result.recommendations.foodSafetyWarning}</span>
            </div>
          )}
        </div>

        {/* 3. Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <div className="p-3.5 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 shadow-sm space-y-2">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#70bc2c]" /> Rekomendasi Kuliner
            </h4>
            <ul className="space-y-1.5">
              {result.recommendations.culinary.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-700">
                  <span className="text-[#70bc2c] font-bold mt-0.5 shrink-0">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 shadow-sm space-y-2">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1e6238]" /> Langkah Penyimpanan
            </h4>
            <ul className="space-y-1.5">
              {result.recommendations.preventiveSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-700">
                  <span className="text-[#1e6238] font-bold mt-0.5 shrink-0">•</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* 4. Action Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1e6238] hover:bg-[#174e2c] text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Pindai Baru
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Simpan Laporan
          </button>
        </div>

      </div>
    </div>
  );
};
