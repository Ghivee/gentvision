import { ColorAnalysisResult, ColorLab, ColorRGB, FreshnessStatus } from '../types';

// =============================================================================
// GENT-Vision · colorimetry.ts  · High-Accuracy Engine v2.0
// Referensi: Tofu-Heal v2.0 scan pipeline
// =============================================================================
// ARSITEKTUR:
//   1. sRGB linearization (gamma decode) sebelum rata-rata
//   2. Von Kries Chromatic Adaptation (white balance fisik yang benar)
//   3. CIE XYZ → CIE L*a*b* (perceptual-uniform, standar industri)
//   4. IQR-based outlier rejection pada pixel sampling
//   5. Multi-frame temporal averaging (dilakukan di SmartColorAnalyzer)
//   6. Kurva kalibrasi piecewise-linear Curcumin-DES (literatur ilmiah)
// =============================================================================

/** sRGB D65 Reference White */
const D65 = { X: 95.047, Y: 100.0, Z: 108.883 };

// ─── Gamma Math ──────────────────────────────────────────────────────────────

/**
 * sRGB gamma decode (linearize) — wajib dilakukan sebelum rata-rata piksel.
 * Rata-rata di gamma-encoded space memberikan hasil yang bias gelap.
 */
export function sRGBToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Linear → sRGB re-encode untuk display
 */
export function linearToSRGB(c: number): number {
  return c <= 0.0031308
    ? Math.round(Math.min(255, c * 12.92 * 255))
    : Math.round(Math.min(255, (1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255));
}

// ─── Color Space Conversions ─────────────────────────────────────────────────

/** RGB (linear 0-1) → XYZ D65. Matriks standar IEC 61966-2-1 */
export function rgbToXyz(rgb: ColorRGB): { x: number; y: number; z: number } {
  const r = sRGBToLinear(rgb.r);
  const g = sRGBToLinear(rgb.g);
  const b = sRGBToLinear(rgb.b);
  return {
    x: (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
    y: (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100,
    z: (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100,
  };
}

function labF(t: number): number {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
}

/** XYZ → CIE L*a*b* (D65 illuminant) */
export function xyzToLab(xyz: { x: number; y: number; z: number }): ColorLab {
  const fx = labF(xyz.x / D65.X);
  const fy = labF(xyz.y / D65.Y);
  const fz = labF(xyz.z / D65.Z);
  return {
    L: Number((116 * fy - 16).toFixed(2)),
    a: Number((500 * (fx - fy)).toFixed(2)),
    b: Number((200 * (fy - fz)).toFixed(2)),
  };
}

export function rgbToLab(rgb: ColorRGB): ColorLab {
  return xyzToLab(rgbToXyz(rgb));
}

export function rgbToHex(rgb: ColorRGB): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function hexToRgb(hex: string): ColorRGB {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** HSV untuk validasi spektrum kurkumin */
export function rgbToHsv(rgb: ColorRGB): { h: number; s: number; v: number } {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  if (d !== 0) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(max * 100) };
}

export function calculateHueAngle(lab: ColorLab): number {
  let hue = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
  if (hue < 0) hue += 360;
  return hue;
}

export function calculateDeltaE(lab1: ColorLab, lab2: ColorLab): number {
  return Number(Math.sqrt((lab1.L - lab2.L) ** 2 + (lab1.a - lab2.a) ** 2 + (lab1.b - lab2.b) ** 2).toFixed(2));
}

// ─── IQR-based Robust Stats ─────────────────────────────────────────────────

/**
 * Hitung rata-rata piksel dengan IQR outlier rejection (hapus 20% terbawah & 20% teratas).
 * Menghilangkan efek bayangan, specular highlight, dan noise kamera.
 */
export function robustMean(pixels: ColorRGB[]): { mean: ColorRGB; noise: number } {
  if (pixels.length === 0) return { mean: { r: 1, g: 1, b: 1 }, noise: 0 };

  // Urutkan berdasarkan luminance
  const sorted = pixels.slice().sort(
    (a, b) => (0.299 * a.r + 0.587 * a.g + 0.114 * a.b) - (0.299 * b.r + 0.587 * b.g + 0.114 * b.b)
  );

  const q1 = Math.floor(sorted.length * 0.20);
  const q3 = Math.floor(sorted.length * 0.80);
  const trimmed = sorted.slice(q1, q3);
  const n = trimmed.length || 1;

  let sumR = 0, sumG = 0, sumB = 0;
  for (const p of trimmed) { sumR += p.r; sumG += p.g; sumB += p.b; }

  const mean: ColorRGB = {
    r: Math.round(sumR / n),
    g: Math.round(sumG / n),
    b: Math.round(sumB / n),
  };

  let vr = 0, vg = 0, vb = 0;
  for (const p of trimmed) {
    vr += (p.r - mean.r) ** 2;
    vg += (p.g - mean.g) ** 2;
    vb += (p.b - mean.b) ** 2;
  }
  const noise = Math.sqrt((vr + vg + vb) / (n * 3));

  return { mean, noise };
}

// ─── Von Kries Chromatic Adaptation ─────────────────────────────────────────

/**
 * Von Kries white balance — scaling per-channel di linear light space.
 * Secara fisik lebih benar daripada scaling di gamma space.
 *
 * Prinsip: jika "titik putih" seharusnya equal-energy (R=G=B di linear),
 * maka setiap channel dinormalisasi dengan (1 / white_linear_channel).
 *
 * @param sensorGamma - {r,g,b} piksel sensor di sRGB (0–255)
 * @param whiteGamma  - {r,g,b} referensi putih di sRGB (0–255)
 * @returns {r,g,b}  - kalibrasi sRGB (0–255), device-independent
 */
export function vonKriesCalibrate(sensorGamma: ColorRGB, whiteGamma: ColorRGB): ColorRGB {
  const sLin = {
    r: sRGBToLinear(sensorGamma.r),
    g: sRGBToLinear(sensorGamma.g),
    b: sRGBToLinear(sensorGamma.b),
  };
  const wLin = {
    r: sRGBToLinear(Math.max(1, whiteGamma.r)),
    g: sRGBToLinear(Math.max(1, whiteGamma.g)),
    b: sRGBToLinear(Math.max(1, whiteGamma.b)),
  };

  // Faktor scale dibatasi ±3x untuk keamanan (hindari over-amplification)
  const scale = {
    r: Math.min(3.0, 1.0 / Math.max(wLin.r, 0.01)),
    g: Math.min(3.0, 1.0 / Math.max(wLin.g, 0.01)),
    b: Math.min(3.0, 1.0 / Math.max(wLin.b, 0.01)),
  };

  return {
    r: linearToSRGB(Math.min(1, sLin.r * scale.r)),
    g: linearToSRGB(Math.min(1, sLin.g * scale.g)),
    b: linearToSRGB(Math.min(1, sLin.b * scale.b)),
  };
}

// ─── Curcumin pH Curve ───────────────────────────────────────────────────────

/**
 * Kurva kalibrasi Curcumin-DES: Hue° → pH estimasi
 * Berdasarkan: Jayaprakasha & Bhimanagouda, Molecules 2011; Wang et al., Food Chemistry 2016
 *
 * Kurkumin:
 *   Hue ~50–65° → kuning cerah   → pH < 6.5 (asam, segar)
 *   Hue ~35–49° → jingga         → pH 6.5–7.5 (transisi, waspada)
 *   Hue ~10–34° → merah-jingga   → pH 7.5–9.0 (basa, busuk)
 *   Hue ~330–10° → merah gelap   → pH > 9.0 (sangat busuk)
 */
export const CURCUMIN_PH_CURVE = [
  { hue: 58, ph: 5.0 },
  { hue: 54, ph: 5.5 },
  { hue: 50, ph: 6.0 },
  { hue: 45, ph: 6.5 },
  { hue: 40, ph: 7.0 },
  { hue: 33, ph: 7.5 },
  { hue: 25, ph: 8.0 },
  { hue: 18, ph: 8.5 },
  { hue: 12, ph: 9.0 },
  { hue:  5, ph: 9.5 },
];

/**
 * Estimasi pH dari Hue menggunakan piecewise linear interpolation
 */
export function estimatePh(hue: number, saturation: number, value: number): {
  ph: number; confidence: number; status: FreshnessStatus;
} {
  let workHue = hue;
  if (hue > 300) workHue = hue - 360; // merah wrap di sekitar 0°

  const sorted = [...CURCUMIN_PH_CURVE].sort((a, b) => b.hue - a.hue);

  let ph: number;
  if (workHue >= sorted[0].hue) {
    const p0 = sorted[0], p1 = sorted[1];
    const slope = (p1.ph - p0.ph) / (p1.hue - p0.hue);
    ph = p0.ph + slope * (workHue - p0.hue);
  } else if (workHue <= sorted[sorted.length - 1].hue) {
    const p0 = sorted[sorted.length - 2], p1 = sorted[sorted.length - 1];
    const slope = (p1.ph - p0.ph) / (p1.hue - p0.hue);
    ph = p1.ph + slope * (workHue - p1.hue);
  } else {
    ph = 7.0;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (workHue <= sorted[i].hue && workHue >= sorted[i + 1].hue) {
        const t = (workHue - sorted[i + 1].hue) / (sorted[i].hue - sorted[i + 1].hue);
        ph = sorted[i + 1].ph + t * (sorted[i].ph - sorted[i + 1].ph);
        break;
      }
    }
  }

  ph = Math.max(4.0, Math.min(10.0, ph));

  // Confidence: faktor saturasi, kecerahan, dan in-range
  const satFactor = Math.min(1.0, saturation / 60);
  const valFactor = value >= 20 && value <= 95 ? 1.0 : 0.6;
  const inRange = workHue >= sorted[sorted.length - 1].hue && workHue <= sorted[0].hue;
  const confidence = Math.round(satFactor * valFactor * (inRange ? 1.0 : 0.7) * 100);

  let status: FreshnessStatus;
  if (ph < 6.5) status = 'fresh';
  else if (ph <= 7.4) status = 'warning';
  else status = 'spoiled';

  return { ph, confidence, status };
}

// ─── Calibration Anchors ─────────────────────────────────────────────────────

export const SENSOR_CALIBRATION = {
  freshBaseline:   { L: 82.0, a:  4.5, b: 78.0 },
  warningBaseline: { L: 60.0, a: 36.0, b: 54.0 },
  spoiledBaseline: { L: 34.0, a: 44.0, b: 22.0 },
};

// ─── Main Analyzer ───────────────────────────────────────────────────────────

/**
 * Analisis warna sensor Curcumin-DES GENT.
 * Menerima rawRgb (rata-rata multi-frame, sudah di-Von Kries) dan whiteRef.
 */
export function analyzeSensorColor(
  rawRgb: ColorRGB,
  sampleType: 'beef' | 'chicken' | 'fish' | 'pork' | 'custom' = 'beef',
  whiteRefRgb?: ColorRGB
): ColorAnalysisResult {
  // Kalibrate dengan Von Kries (jika white tersedia)
  const calibratedRgb = whiteRefRgb ? vonKriesCalibrate(rawRgb, whiteRefRgb) : rawRgb;

  const hex = rgbToHex(calibratedRgb);
  const rawHex = rgbToHex(rawRgb);
  const lab = rgbToLab(calibratedRgb);
  const hsv = rgbToHsv(calibratedRgb);

  const deltaE_Fresh   = calculateDeltaE(lab, SENSOR_CALIBRATION.freshBaseline);
  const deltaE_Warning = calculateDeltaE(lab, SENSOR_CALIBRATION.warningBaseline);
  const deltaE_Spoiled = calculateDeltaE(lab, SENSOR_CALIBRATION.spoiledBaseline);
  const hueAngle = calculateHueAngle(lab);

  // Estimasi pH dari hue HSV
  const { ph: phValue, confidence, status: phStatus } = estimatePh(hsv.h, hsv.s, hsv.v);

  // Tentukan status dari CIE Lab (lebih akurat untuk gradasi warna kurkumin)
  let status: FreshnessStatus;
  if (lab.a <= 18 && (hueAngle >= 65 || lab.b > 45)) {
    status = 'fresh';
  } else if (
    (lab.a > 18 && lab.a <= 38) ||
    (hueAngle >= 40 && hueAngle < 65) ||
    (deltaE_Warning < deltaE_Fresh && deltaE_Warning <= deltaE_Spoiled)
  ) {
    status = 'warning';
  } else {
    status = 'spoiled';
  }

  let statusTitle: string;
  let statusMessage: string;
  let tvbnValue: number;
  let freshnessIndex: number;
  let remainingShelfHours: number;

  if (status === 'fresh') {
    statusTitle = 'Daging dalam Kondisi Optimal / Sangat Segar';
    statusMessage = 'Sensor menunjukkan warna kuning cerah. Gas TVB-N sangat rendah dan kurkumin berada dalam bentuk netral terprotonasi (pH stabil).';
    const p = Math.max(0, Math.min(1, lab.a / 18));
    tvbnValue = Number((4.5 + p * 8.0).toFixed(1));
    freshnessIndex = Math.round(100 - p * 20);
    remainingShelfHours = Math.round(72 - p * 24);
  } else if (status === 'warning') {
    statusTitle = 'Peringatan: Kualitas Menurun — Segera Konsumsi';
    statusMessage = 'Sensor bertransformasi ke warna jingga. Terjadi deprotonasi parsial gugus fenol kurkumin akibat akumulasi uap basa volatil amonia & amina.';
    const p = Math.max(0, Math.min(1, (lab.a - 18) / 20));
    tvbnValue = Number((14.0 + p * 10.5).toFixed(1));
    freshnessIndex = Math.round(79 - p * 40);
    remainingShelfHours = Math.max(4, Math.round(24 - p * 18));
  } else {
    statusTitle = 'BAHAYA: Jangan Dikonsumsi! Tingkat Pembusukan Tinggi';
    statusMessage = 'Sensor menunjukkan warna merah kecokelatan akibat pergeseran batokromik maksimum dan pembentukan ion enolat stabil. TVB-N melewati ambang aman.';
    const p = Math.max(0, Math.min(1, (lab.a - 35) / 25));
    tvbnValue = Number((26.0 + p * 32.0).toFixed(1));
    freshnessIndex = Math.max(0, Math.round(35 - p * 35));
    remainingShelfHours = 0;
  }

  const recommendations = {
    culinary:
      status === 'fresh'
        ? [
            'Sangat aman untuk diolah menjadi hidangan apa saja (Steak Medium-Rare, Sate, Sup, Shabu-shabu).',
            'Kualitas tekstur, aroma, dan nutrisi daging berada pada puncak kesegaran terbaik.',
            'Aman untuk marinasi atau penyimpanan beku ulang (freezer -18°C).',
          ]
        : status === 'warning'
        ? [
            'Wajib dimasak hari ini juga hingga MATANG SEMPURNA (Well-Done / suhu internal >71°C).',
            'Disarankan dimasak dengan perebusan lama atau bumbu pekat (Rendang, Semur, Gulai, Sup Pedas).',
            'DILARANG dikonsumsi mentah, setengah matang, atau steak medium-rare!',
          ]
        : [
            'DILARANG DIKONSUMSI DALAM BENTUK APA PUN.',
            'Memasak atau mencuci daging TIDAK MENGHILANGKAN toksin bakteri (histamin, enterotoksin).',
            'Segera bungkus rapat dan buang ke tempat sampah organik terpisah.',
          ],
    freezerSafe: status === 'fresh',
    preventiveSteps:
      status === 'fresh'
        ? [
            'Simpan di chiller pendingin pada suhu 0°C – 4°C.',
            'Pastikan kemasan plastik tertutup rapat dan kedap udara.',
            'Bisa dibekukan kembali di freezer jika tidak langsung dimasak.',
          ]
        : status === 'warning'
        ? [
            'JANGAN DIBEKUKAN ULANG — merusak serat daging dan tidak menghentikan degradasi protein.',
            'Evaluasi suhu kulkas Anda (indikasi suhu kurang dingin).',
            'Gunakan pisau dan talenan terpisah untuk mencegah kontaminasi silang.',
          ]
        : [
            'Segera lakukan disinfeksi pada rak kulkas tempat daging disimpan.',
            'Cuci tangan dengan sabun setelah memegang kemasan rusak.',
            'Jauhkan dari kontak silang dengan bahan makanan lain.',
          ],
    retailAction:
      status === 'fresh'
        ? 'Display pada rak chilled utama (0-2°C). Pertahankan harga reguler.'
        : status === 'warning'
        ? 'Terapkan diskon kilat (Mark-down Price 25% - 40%) agar cepat terjual.'
        : 'RECALL SEGERA! Tarik seluruh batch dari display dan lakukan karantina produk.',
    foodSafetyWarning:
      status === 'spoiled'
        ? 'PERINGATAN BAHAYA TOKSIN: Emisi TVB-N > 25 mg/100g menandakan pembusukan mikrobiologis yang dapat memicu keracunan makanan akut!'
        : undefined,
  };

  return {
    id: `GENT-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    rawRgb,
    calibratedRgb,
    hex,
    rawHex,
    lab,
    deltaE: deltaE_Fresh,
    status,
    statusTitle,
    statusMessage,
    phValue: Number(phValue.toFixed(2)),
    tvbnValue,
    freshnessIndex,
    remainingShelfHours,
    whiteCalibrated: !!whiteRefRgb,
    whiteRefRgb,
    calibrationGain: whiteRefRgb ? { r: 1, g: 1, b: 1 } : undefined,
    recommendations,
    sampleType,
    confidenceScore: confidence,
  };
}
