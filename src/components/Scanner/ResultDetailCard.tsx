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
  Printer,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { ColorAnalysisResult } from '../../types';

interface ResultDetailCardProps {
  result: ColorAnalysisResult;
  onReset: () => void;
}

export const ResultDetailCard: React.FC<ResultDetailCardProps> = ({ result, onReset }) => {
  const theme = {
    fresh: {
      border: '#a5d6a7',
      headerBg: '#f1f8e9',
      badgeBg: '#e8f5e9',
      badgeText: '#2e7d32',
      icon: <CheckCircle2 className="w-6 h-6" style={{ color: '#2e7d32' }} />,
      tag: 'STATUS 1 — SEGAR',
      accentColor: '#2e7d32',
      barColor: '#43a047',
    },
    warning: {
      border: '#ffcc80',
      headerBg: '#fff8e1',
      badgeBg: '#fff3e0',
      badgeText: '#e65100',
      icon: <AlertTriangle className="w-6 h-6" style={{ color: '#e65100' }} />,
      tag: 'STATUS 2 — WASPADA',
      accentColor: '#e65100',
      barColor: '#fb8c00',
    },
    spoiled: {
      border: '#f48fb1',
      headerBg: '#fce4ec',
      badgeBg: '#fce4ec',
      badgeText: '#c2185b',
      icon: <XCircle className="w-6 h-6" style={{ color: '#c2185b' }} />,
      tag: 'STATUS 3 — BAHAYA',
      accentColor: '#c2185b',
      barColor: '#e91e8c',
    },
  }[result.status];

  const handlePrintPDF = () => {
    const statusLabel = { fresh: 'SEGAR ✓', warning: 'WASPADA ⚠', spoiled: 'BAHAYA ✗' }[result.status];
    const statusColor = { fresh: '#2e7d32', warning: '#e65100', spoiled: '#c2185b' }[result.status];
    const win = window.open('', '_blank', 'width=700,height=900');
    if (!win) return;
    win.document.write(`
<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
<title>Laporan GENT-Vision — ${result.id}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1a1a1a; padding: 40px; }
  .header { display:flex; align-items:center; justify-content:space-between; border-bottom: 2px solid #f48fb1; padding-bottom:16px; margin-bottom:24px; }
  .brand { font-size:22px; font-weight:900; color:#880e4f; }
  .brand span { color:#c2185b; }
  .id { font-size:11px; color:#999; font-family:monospace; }
  .status-badge { display:inline-block; padding:8px 20px; border-radius:999px; font-weight:900; font-size:14px; color:${statusColor}; background:${statusColor}18; border:2px solid ${statusColor}40; margin-bottom:16px; }
  h2 { font-size:18px; font-weight:800; margin-bottom:6px; color:#3e0020; }
  .msg { font-size:12px; color:#7d3453; margin-bottom:24px; line-height:1.6; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
  .card { background:#fff8fb; border:1px solid #f8bbd0; border-radius:12px; padding:14px; }
  .card-label { font-size:10px; font-weight:700; color:#7d3453; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
  .card-value { font-size:28px; font-weight:900; color:#3e0020; font-family:monospace; }
  .card-unit { font-size:11px; color:#999; }
  .bar-track { height:6px; background:#f8bbd0; border-radius:3px; margin-top:8px; overflow:hidden; }
  .section-title { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; color:#c2185b; margin:20px 0 8px; }
  .colors { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
  .swatch { width:40px; height:40px; border-radius:50%; border:2px solid #eee; }
  .swatch-label { font-size:10px; color:#999; }
  .swatch-hex { font-size:11px; font-family:monospace; font-weight:700; color:#3e0020; }
  ul { padding-left:16px; }
  ul li { font-size:12px; color:#555; margin-bottom:4px; line-height:1.5; }
  .footer { margin-top:32px; padding-top:16px; border-top:1px solid #f8bbd0; display:flex; justify-content:space-between; font-size:10px; color:#bbb; }
  .warning-box { background:#fff0f0; border:1px solid #f48fb1; border-radius:10px; padding:12px; font-size:11px; color:#c2185b; font-weight:600; margin-top:12px; }
  @media print { body{padding:20px} }
</style></head><body>
<div class="header">
  <div class="brand">GENT<span>-Vision</span> <span style="font-size:13px;font-weight:400;color:#999">Laporan Analisis Kolorimetri</span></div>
  <div class="id">${result.id} · ${result.timestamp}</div>
</div>
<div class="status-badge">${statusLabel}</div>
<h2>${result.statusTitle}</h2>
<p class="msg">${result.statusMessage}</p>
<div class="grid">
  <div class="card"><div class="card-label">pH Daging</div><div class="card-value">${result.phValue}<span class="card-unit" style="font-size:14px"></span></div><div class="bar-track"><div style="height:100%;width:${Math.min(100,(result.phValue-5)/4*100)}%;background:${statusColor};border-radius:3px"></div></div></div>
  <div class="card"><div class="card-label">TVB-N</div><div class="card-value">${result.tvbnValue}<span class="card-unit"> mg/100g</span></div><div class="bar-track"><div style="height:100%;width:${Math.min(100,result.tvbnValue/40*100)}%;background:${statusColor};border-radius:3px"></div></div></div>
  <div class="card"><div class="card-label">Indeks Kesegaran</div><div class="card-value" style="color:${statusColor}">${result.freshnessIndex}%</div><div class="bar-track"><div style="height:100%;width:${result.freshnessIndex}%;background:${statusColor};border-radius:3px"></div></div></div>
  <div class="card"><div class="card-label">Sisa Umur Simpan</div><div class="card-value">~${result.remainingShelfHours}<span class="card-unit" style="font-size:14px"> Jam</span></div></div>
</div>
<p class="section-title">Kalibrasi Spektrum (Von Kries)</p>
<div class="colors">
  <div><div class="swatch" style="background:${result.rawHex}"></div><div class="swatch-label">Raw</div><div class="swatch-hex">${result.rawHex}</div></div>
  <div style="font-size:18px;color:#ccc">→</div>
  <div><div class="swatch" style="background:${result.hex}"></div><div class="swatch-label">Kalibrasi</div><div class="swatch-hex">${result.hex}</div></div>
  <div style="margin-left:12px"><div class="swatch-label">CIE L*a*b*</div><div class="swatch-hex">L:${result.lab.L} · a:${result.lab.a} · b:${result.lab.b}</div><div class="swatch-label" style="margin-top:4px">Kepercayaan: ${result.confidenceScore}%</div></div>
</div>
<p class="section-title">Rekomendasi Kuliner</p>
<ul>${result.recommendations.culinary.map(t=>`<li>${t}</li>`).join('')}</ul>
<p class="section-title">Langkah Penyimpanan</p>
<ul>${result.recommendations.preventiveSteps.map(s=>`<li>${s}</li>`).join('')}</ul>
${result.recommendations.foodSafetyWarning ? `<div class="warning-box">⚠ ${result.recommendations.foodSafetyWarning}</div>` : ''}
<div class="footer"><span>© 2026 GENT-Vision Platform</span><span>Dicetak: ${new Date().toLocaleString('id-ID')}</span></div>
</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  return (
    <div
      className="rounded-3xl border-2 overflow-hidden"
      style={{ borderColor: theme.border, boxShadow: `0 8px 30px -4px ${theme.border}60` }}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b" style={{ background: theme.headerBg, borderColor: theme.border }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="text-[11px] font-black px-3 py-1 rounded-full border"
            style={{ background: theme.badgeBg, color: theme.badgeText, borderColor: theme.border }}
          >
            {theme.tag}
          </span>
          <div className="flex items-center gap-2">
            {result.whiteCalibrated && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border"
                style={{ color: theme.accentColor, borderColor: theme.border }}
              >
                ✓ Von Kries
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-400">{result.timestamp}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white border shadow-sm mt-0.5 shrink-0"
            style={{ borderColor: theme.border }}
          >
            {theme.icon}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black leading-snug" style={{ color: 'var(--color-text)' }}>
              {result.statusTitle}
            </h2>
            <p className="text-[11px] sm:text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {result.statusMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-4 bg-white">

        {/* Parameter Grid */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Activity className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
            Parameter Sensor
          </h3>
          <div className="grid grid-cols-2 gap-2.5">

            {/* pH */}
            <div className="p-3 sm:p-4 rounded-2xl border space-y-2.5 shadow-sm"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent-mid)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                  <Thermometer className="w-3.5 h-3.5" style={{ color: theme.accentColor }} /> pH Daging
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: result.phValue < 6.5 ? '#e8f5e9' : result.phValue < 7.5 ? '#fff3e0' : '#fce4ec',
                    color: result.phValue < 6.5 ? '#2e7d32' : result.phValue < 7.5 ? '#e65100' : '#c2185b',
                  }}
                >
                  {result.phValue < 6.5 ? 'Asam' : result.phValue < 7.5 ? 'Netral' : 'Basa'}
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black font-mono block" style={{ color: 'var(--color-text)' }}>
                {result.phValue}
              </span>
              <div className="space-y-0.5">
                <div className="h-2 w-full rounded-full relative overflow-hidden"
                  style={{ background: 'linear-gradient(90deg, #43a047, #fb8c00, #e91e8c)' }}
                >
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
            <div className="p-3 sm:p-4 rounded-2xl border space-y-2.5 shadow-sm"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent-mid)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                  <Activity className="w-3.5 h-3.5" style={{ color: theme.accentColor }} /> TVB-N
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: result.tvbnValue < 15 ? '#e8f5e9' : result.tvbnValue < 25 ? '#fff3e0' : '#fce4ec',
                    color: result.tvbnValue < 15 ? '#2e7d32' : result.tvbnValue < 25 ? '#e65100' : '#c2185b',
                  }}
                >
                  {result.tvbnValue < 15 ? 'Aman' : result.tvbnValue < 25 ? 'Waspada' : 'Bahaya'}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black font-mono" style={{ color: 'var(--color-text)' }}>
                  {result.tvbnValue}
                </span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>mg/100g</span>
              </div>
              <div className="space-y-0.5">
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--color-accent-mid)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(4, (result.tvbnValue / 40) * 100))}%`,
                      background: result.tvbnValue < 15 ? '#43a047' : result.tvbnValue < 25 ? '#fb8c00' : '#c2185b',
                    }}
                  />
                </div>
                <div className="text-[9px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  Batas aman: &lt; 20 mg/100g
                </div>
              </div>
            </div>

            {/* Freshness Index */}
            <div className="p-3 sm:p-4 rounded-2xl border space-y-2.5 shadow-sm"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent-mid)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.accentColor }} /> Indeks
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: result.freshnessIndex >= 80 ? '#e8f5e9' : result.freshnessIndex >= 40 ? '#fff3e0' : '#fce4ec',
                    color: result.freshnessIndex >= 80 ? '#2e7d32' : result.freshnessIndex >= 40 ? '#e65100' : '#c2185b',
                  }}
                >
                  {result.freshnessIndex >= 80 ? 'Prima' : result.freshnessIndex >= 40 ? 'Segera' : 'Tidak Layak'}
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black font-mono block" style={{ color: theme.accentColor }}>
                {result.freshnessIndex}%
              </span>
              <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--color-accent-mid)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${result.freshnessIndex}%`,
                    background: result.freshnessIndex >= 80 ? '#43a047' : result.freshnessIndex >= 40 ? '#fb8c00' : '#c2185b',
                  }}
                />
              </div>
            </div>

            {/* Shelf Life */}
            <div className="p-3 sm:p-4 rounded-2xl border space-y-2 shadow-sm"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent-mid)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: theme.accentColor }} /> Sisa Umur
                </span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>0–4°C</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black font-mono" style={{ color: 'var(--color-text)' }}>
                  ~{result.remainingShelfHours}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>Jam</span>
              </div>
              <div className="text-[10px] border-t pt-1.5" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-accent-mid)' }}>
                Estimasi degradasi protein
              </div>
            </div>
          </div>
        </div>

        {/* Color Calibration */}
        <div className="p-3.5 sm:p-4 rounded-2xl border space-y-3 shadow-sm"
          style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent-mid)' }}
        >
          <span className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
            <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
            Kalibrasi Spektrum (Von Kries)
          </span>
          <div className="grid grid-cols-2 gap-3">
            {/* Color comparison */}
            <div className="flex items-center justify-around bg-white p-2.5 rounded-xl border shadow-sm"
              style={{ borderColor: 'var(--color-accent-mid)' }}
            >
              <div className="text-center">
                <span className="text-[9px] block mb-1" style={{ color: 'var(--color-text-muted)' }}>Raw</span>
                <div className="w-9 h-9 rounded-full border-2 shadow-inner mx-auto" style={{ backgroundColor: result.rawHex, borderColor: 'var(--color-accent-mid)' }} />
                <span className="text-[10px] font-mono font-bold mt-1 block" style={{ color: 'var(--color-text-muted)' }}>{result.rawHex}</span>
              </div>
              <span className="text-slate-300 font-bold text-lg">→</span>
              <div className="text-center">
                <span className="text-[9px] font-bold block mb-1" style={{ color: theme.accentColor }}>Kalibrasi</span>
                <div className="w-9 h-9 rounded-full border-2 shadow-md mx-auto" style={{ backgroundColor: result.hex, borderColor: theme.border }} />
                <span className="text-[10px] font-mono font-black mt-1 block" style={{ color: 'var(--color-text)' }}>{result.hex}</span>
              </div>
            </div>
            {/* CIE Lab */}
            <div className="grid grid-cols-3 gap-1.5 bg-white p-2.5 rounded-xl border shadow-sm"
              style={{ borderColor: 'var(--color-accent-mid)' }}
            >
              {([
                { label: 'L*', value: result.lab.L },
                { label: 'a*', value: result.lab.a },
                { label: 'b*', value: result.lab.b },
              ] as const).map(({ label, value }) => (
                <div key={label} className="text-center p-1.5 rounded-lg border"
                  style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent-mid)' }}
                >
                  <span className="text-[9px] block" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                  <span className="font-bold text-xs font-mono" style={{ color: 'var(--color-text)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Confidence Score */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              Kepercayaan Analisis:
            </span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-accent-mid)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${result.confidenceScore}%`, background: theme.barColor }}
              />
            </div>
            <span className="text-[11px] font-black" style={{ color: theme.accentColor }}>
              {result.confidenceScore}%
            </span>
          </div>

          {/* Safety warning */}
          {result.recommendations.foodSafetyWarning && (
            <div className="p-3 rounded-xl border text-[11px] font-semibold flex items-start gap-2"
              style={{ background: '#fce4ec', borderColor: '#f48fb1', color: '#c2185b' }}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{result.recommendations.foodSafetyWarning}</span>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: <Utensils className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />,
              title: 'Rekomendasi Kuliner',
              items: result.recommendations.culinary,
            },
            {
              icon: <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />,
              title: 'Langkah Penyimpanan',
              items: result.recommendations.preventiveSteps,
            },
          ].map(({ icon, title, items }) => (
            <div key={title} className="p-3.5 rounded-2xl border shadow-sm space-y-2"
              style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent-mid)' }}
            >
              <h4 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: 'var(--color-text)' }}
              >
                {icon} {title}
              </h4>
              <ul className="space-y-1.5">
                {items.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] sm:text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <span className="font-bold mt-0.5 shrink-0" style={{ color: theme.accentColor }}>•</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1 border-t"
          style={{ borderColor: 'var(--color-accent-mid)' }}
        >
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95"
            style={{ background: 'var(--color-primary)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Pindai Baru
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border shadow-sm transition-all cursor-pointer active:scale-95 bg-white"
            style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-accent-mid)' }}
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>
    </div>
  );
};
