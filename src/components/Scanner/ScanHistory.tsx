import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  Download,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ColorAnalysisResult, UserMode } from '../../types';
import { getFefoRecommendation } from './fefoRecommendations';

interface ScanHistoryProps {
  history: ColorAnalysisResult[];
  userMode: UserMode;
  onDelete: (id: string) => void;
  onClear: () => void;
}

/** FEFO priority score: spoiled=0 (highest urgency), warning=1, fresh=2 */
function fefoPriority(status: ColorAnalysisResult['status']): number {
  return { spoiled: 0, warning: 1, fresh: 2 }[status];
}

function statusTheme(status: ColorAnalysisResult['status']) {
  return {
    fresh: {
      border: '#a5d6a7',
      headerBg: '#f1f8e9',
      badgeBg: '#e8f5e9',
      badgeText: '#2e7d32',
      accent: '#2e7d32',
      icon: <CheckCircle2 className="w-4 h-4" style={{ color: '#2e7d32' }} />,
      label: 'Hijau — Aman',
      priorityLabel: 'PRIORITAS 3',
    },
    warning: {
      border: '#ffcc80',
      headerBg: '#fff8e1',
      badgeBg: '#fff3e0',
      badgeText: '#e65100',
      accent: '#e65100',
      icon: <AlertTriangle className="w-4 h-4" style={{ color: '#e65100' }} />,
      label: 'Kuning — Waspada',
      priorityLabel: 'PRIORITAS 2',
    },
    spoiled: {
      border: '#f48fb1',
      headerBg: '#fce4ec',
      badgeBg: '#fce4ec',
      badgeText: '#c2185b',
      accent: '#c2185b',
      icon: <XCircle className="w-4 h-4" style={{ color: '#c2185b' }} />,
      label: 'Merah — Kritis',
      priorityLabel: 'PRIORITAS 1',
    },
  }[status];
}

function handleDownloadPDF(result: ColorAnalysisResult, userMode: UserMode) {
  const th = statusTheme(result.status);
  const statusLabel = { fresh: 'SEGAR ✓', warning: 'WASPADA ⚠', spoiled: 'BAHAYA ✗' }[result.status];
  const fefoRec = getFefoRecommendation(result.status, userMode);
  const meatLabel = result.meatLabel || result.sampleType;
  const win = window.open('', '_blank', 'width=750,height=1000');
  if (!win) return;

  const photoSection = result.capturedImageDataUrl
    ? `<div class="photo-section">
        <div class="section-title">Foto Jepretan Kamera</div>
        <img src="${result.capturedImageDataUrl}" style="max-width:100%;max-height:160px;object-fit:contain;display:block;margin:0 auto;border-radius:8px;border:1px solid #f8bbd0;background:#fff8fb;" alt="Foto scan"/>
      </div>`
    : '';

  win.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
<title>Laporan GENT-Vision — ${result.id}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',sans-serif;background:#fff;color:#1a1a1a;padding:36px}
  .header{display:flex;align-items:center;justify-content:space-between;border-bottom:2.5px solid #f48fb1;padding-bottom:14px;margin-bottom:22px}
  .brand{font-size:20px;font-weight:900;color:#880e4f}
  .brand span{color:#c2185b}
  .id{font-size:10px;color:#aaa;font-family:monospace}
  .status-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:999px;font-weight:900;font-size:13px;color:${th.accent};background:${th.accent}15;border:2px solid ${th.accent}40;margin-bottom:14px}
  .priority-tag{display:inline-block;padding:3px 10px;border-radius:6px;font-size:10px;font-weight:800;background:${th.badgeBg};color:${th.badgeText};border:1px solid ${th.border};margin-bottom:6px}
  h2{font-size:17px;font-weight:800;margin-bottom:5px;color:#3e0020}
  .msg{font-size:11.5px;color:#7d3453;margin-bottom:20px;line-height:1.6}
  .fefo-box{background:${th.headerBg};border:1.5px solid ${th.border};border-radius:12px;padding:14px 16px;margin-bottom:18px}
  .fefo-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:${th.accent};margin-bottom:8px}
  .fefo-rec{font-size:12.5px;font-weight:700;color:#1a1a1a;padding:6px 0;border-bottom:1px dashed ${th.border}}
  .fefo-rec:last-child{border-bottom:none}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px}
  .card{background:#fff8fb;border:1px solid #f8bbd0;border-radius:10px;padding:12px}
  .card-label{font-size:9.5px;font-weight:700;color:#7d3453;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
  .card-value{font-size:26px;font-weight:900;color:#3e0020;font-family:monospace}
  .card-unit{font-size:11px;color:#999;font-weight:400}
  .bar-track{height:5px;background:#f8bbd0;border-radius:3px;margin-top:6px;overflow:hidden}
  .bar-fill{height:100%;border-radius:3px;background:${th.accent}}
  .section-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#c2185b;margin:16px 0 8px}
  .colors{display:flex;align-items:center;gap:14px;margin-bottom:16px}
  .swatch{width:44px;height:44px;border-radius:50%;border:2px solid #eee;flex-shrink:0}
  .swatch-label{font-size:9.5px;color:#999}
  .swatch-hex{font-size:10.5px;font-family:monospace;font-weight:700;color:#3e0020}
  .photo-section{margin-bottom:18px}
  ul{padding-left:16px}
  ul li{font-size:11.5px;color:#555;margin-bottom:3.5px;line-height:1.5}
  .warning-box{background:#fff0f0;border:1px solid #f48fb1;border-radius:8px;padding:10px;font-size:11px;color:#c2185b;font-weight:600;margin-top:10px}
  .footer{margin-top:28px;padding-top:14px;border-top:1px solid #f8bbd0;display:flex;justify-content:space-between;font-size:9.5px;color:#ccc}
  .meta{display:flex;gap:20px;font-size:10.5px;color:#888;margin-bottom:18px}
  .meta span{display:flex;align-items:center;gap:4px}
  @media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div class="brand">GENT<span>-Vision</span> <span style="font-size:12px;font-weight:400;color:#aaa">Laporan Analisis Kolorimetri</span></div>
  <div class="id">${result.id}<br/>${result.timestamp}</div>
</div>

<div class="priority-tag">${th.priorityLabel} · ${th.label}</div>
<div class="status-badge">◉ ${statusLabel}</div>
<h2>${result.statusTitle}</h2>
<p class="msg">${result.statusMessage}</p>

<div class="meta">
  <span>🥩 ${meatLabel}</span>
  <span>🎯 Mode: ${userMode === 'retail' ? 'Retail / Toko' : 'Konsumen'}</span>
  <span>✓ Kepercayaan: ${result.confidenceScore}%</span>
  ${result.whiteCalibrated ? '<span>🔬 Von Kries Aktif</span>' : ''}
</div>

<div class="fefo-box">
  <div class="fefo-title">🏷 Rekomendasi FEFO — Mode ${userMode === 'retail' ? 'Retail' : 'Konsumen'}</div>
  ${fefoRec.map(r => `<div class="fefo-rec">• ${r}</div>`).join('')}
</div>

${photoSection}

<div class="grid">
  <div class="card"><div class="card-label">pH Daging</div><div class="card-value">${result.phValue}<span class="card-unit"></span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,(result.phValue-5)/4*100)}%"></div></div></div>
  <div class="card"><div class="card-label">TVB-N</div><div class="card-value">${result.tvbnValue}<span class="card-unit"> mg/100g</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,result.tvbnValue/40*100)}%"></div></div></div>
  <div class="card"><div class="card-label">Indeks Kesegaran</div><div class="card-value" style="color:${th.accent}">${result.freshnessIndex}%</div><div class="bar-track"><div class="bar-fill" style="width:${result.freshnessIndex}%"></div></div></div>
  <div class="card"><div class="card-label">Sisa Umur Simpan</div><div class="card-value">~${result.remainingShelfHours}<span class="card-unit" style="font-size:13px"> Jam</span></div></div>
</div>

<div class="section-title">Kalibrasi Spektrum (Von Kries)</div>
<div class="colors">
  <div><div class="swatch" style="background:${result.rawHex}"></div><div class="swatch-label">Raw</div><div class="swatch-hex">${result.rawHex}</div></div>
  <div style="font-size:18px;color:#ddd">→</div>
  <div><div class="swatch" style="background:${result.hex};border-color:${th.border}"></div><div class="swatch-label">Kalibrasi</div><div class="swatch-hex">${result.hex}</div></div>
  <div style="margin-left:10px"><div class="swatch-label">CIE L*a*b*</div><div class="swatch-hex">L:${result.lab.L} · a:${result.lab.a} · b:${result.lab.b}</div></div>
</div>

<div class="section-title">Rekomendasi Kuliner</div>
<ul>${result.recommendations.culinary.map(t => `<li>${t}</li>`).join('')}</ul>
<div class="section-title">Langkah Penyimpanan</div>
<ul>${result.recommendations.preventiveSteps.map(s => `<li>${s}</li>`).join('')}</ul>
${result.recommendations.foodSafetyWarning ? `<div class="warning-box">⚠ ${result.recommendations.foodSafetyWarning}</div>` : ''}
<div class="footer"><span>© 2026 GENT-Vision Platform</span><span>Dicetak: ${new Date().toLocaleString('id-ID')}</span></div>
</body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  history,
  userMode,
  onDelete,
  onClear,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

  // Sort FEFO: spoiled first, warning second, fresh last
  const sorted = [...history].sort((a, b) => fefoPriority(a.status) - fefoPriority(b.status));

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--color-primary-dark)' }}>
            Riwayat Pemindaian
          </h2>
          <span
            className="text-xs font-black px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ background: 'var(--color-accent)', color: 'var(--color-primary)', borderColor: 'var(--color-accent-mid)' }}
          >
            {history.length} scan
          </span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-xl cursor-pointer transition-all shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all"
            style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-accent-mid)', background: 'white' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus Semua
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Yakin?</span>
            <button
              onClick={() => { onClear(); setConfirmClear(false); }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer"
              style={{ background: '#c2185b' }}
            >
              Ya, hapus
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer"
              style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-accent-mid)', background: 'white' }}
            >
              Batal
            </button>
          </div>
        )}
      </div>

      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Diurutkan berdasarkan prioritas FEFO — daging paling kritis ditampilkan paling atas.
      </p>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((item, idx) => {
            const th = statusTheme(item.status);
            const fefoRec = getFefoRecommendation(item.status, userMode);
            return (
              <div
                key={item.id}
                className="rounded-2xl border-2 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all"
                style={{ borderColor: th.border }}
              >
                {/* Card header */}
                <div
                  className="px-4 py-3 flex items-center justify-between border-b"
                  style={{ background: th.headerBg, borderColor: th.border }}
                >
                  <div className="flex items-center gap-2">
                    {th.icon}
                    <div>
                      <span
                        className="text-[10px] font-black block"
                        style={{ color: th.accent }}
                      >
                        {th.priorityLabel} · {th.label}
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                        #{idx + 1} · {item.timestamp}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-lg cursor-pointer hover:bg-black/5 transition-all"
                    style={{ color: 'var(--color-text-muted)' }}
                    title="Hapus item ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Photo thumbnail if available */}
                {item.capturedImageDataUrl && (
                  <div className="relative overflow-hidden" style={{ height: '100px' }}>
                    <img
                      src={item.capturedImageDataUrl}
                      alt="Foto scan"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.9) 100%)' }} />
                  </div>
                )}

                {/* Card content */}
                <div className="px-4 py-3 space-y-3">
                  {/* Status title */}
                  <div>
                    <p className="text-xs font-extrabold leading-snug" style={{ color: 'var(--color-primary-dark)' }}>
                      {item.statusTitle}
                    </p>
                    <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                      {item.statusMessage}
                    </p>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'pH', value: String(item.phValue) },
                      { label: 'TVB-N', value: `${item.tvbnValue}` },
                      { label: 'Segar', value: `${item.freshnessIndex}%` },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="text-center p-1.5 rounded-xl border"
                        style={{ background: 'var(--color-bg)', borderColor: 'var(--color-accent-mid)' }}
                      >
                        <span className="block text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                        <span className="block text-xs font-black font-mono" style={{ color: th.accent }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Color swatches */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: item.rawHex }} />
                    <span className="text-slate-300 text-sm">→</span>
                    <div className="w-7 h-7 rounded-full border-2 shadow-md" style={{ backgroundColor: item.hex, borderColor: th.border }} />
                    <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--color-text-muted)' }}>{item.hex}</span>
                    <span className="ml-auto text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>
                      ~{item.remainingShelfHours}j
                    </span>
                  </div>

                  {/* FEFO Recommendation */}
                  <div
                    className="p-2.5 rounded-xl border text-[10px] leading-relaxed space-y-1"
                    style={{ background: th.headerBg, borderColor: th.border }}
                  >
                    <p className="font-black text-[9px] uppercase tracking-wider" style={{ color: th.accent }}>
                      {userMode === 'retail' ? '🏪 Retail' : '🏠 Konsumen'}
                    </p>
                    {fefoRec.slice(0, 2).map((r, i) => (
                      <p key={i} className="font-semibold" style={{ color: '#333' }}>• {r}</p>
                    ))}
                  </div>

                  {/* Download button */}
                  <button
                    onClick={() => handleDownloadPDF(item, userMode)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
                    style={{
                      background: 'white',
                      color: th.accent,
                      borderColor: th.border,
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Laporan PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
