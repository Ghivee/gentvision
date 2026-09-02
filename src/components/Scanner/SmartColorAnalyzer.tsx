import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  SwitchCamera,
  Eye,
  Pipette,
  ChevronDown,
  X,
  Zap,
} from 'lucide-react';
import { ColorRGB, ColorAnalysisResult, UserMode } from '../../types';
import {
  analyzeSensorColor,
  rgbToHex,
  vonKriesCalibrate,
  robustMean,
  sRGBToLinear,
  linearToSRGB,
} from '../../core/colorimetry';
import { PRESET_SAMPLE_TESTS } from '../../data/sampleData';
import { ResultDetailCard } from './ResultDetailCard';

// ─────────────────────────────────────────────────────────────────────────────
// Engine constants — High-Accuracy multi-frame pipeline
// ─────────────────────────────────────────────────────────────────────────────
const FRAME_COUNT = 10;
const FRAME_INTERVAL_MS = 80;
const STABILITY_MAX_STD_HUE = 12;

// Circular stencil radii (relative to min(wrapW, wrapH))
const OUTER_RADIUS_RATIO = 0.36;   // area putih (outer ring)
const INNER_RADIUS_RATIO = 0.18;   // sensor warna (inner circle)

interface CircleParams {
  cX: number; cY: number;
  outerR: number; innerR: number;
  wrapW: number; wrapH: number;
}

const MEAT_LABELS: Record<string, string> = {
  beef: 'Daging Sapi',
  chicken: 'Daging Ayam',
  fish: 'Ikan / Seafood',
  pork: 'Lainnya',
};

interface SmartColorAnalyzerProps {
  userMode: UserMode;
  onScanComplete: (result: ColorAnalysisResult) => void;
}

export const SmartColorAnalyzer: React.FC<SmartColorAnalyzerProps> = ({ userMode, onScanComplete }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'preset'>('camera');
  const [selectedMeatType, setSelectedMeatType] = useState<'beef' | 'chicken' | 'fish' | 'pork' | 'custom'>('beef');

  // Camera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraViewOpen, setCameraViewOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Circular stencil geometry
  const [circleParams, setCircleParams] = useState<CircleParams | null>(null);

  // Upload
  const uploadCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [pipetteTarget, setPipetteTarget] = useState<'sensor' | 'white'>('sensor');
  const [lastRawRgb, setLastRawRgb] = useState<ColorRGB | null>(null);
  const [whiteRefColor, setWhiteRefColor] = useState<ColorRGB>({ r: 245, g: 245, b: 245 });

  // Multi-frame
  const frameBufferRef = useRef<{ white: ColorRGB; sensor: ColorRGB }[]>([]);
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Analysis
  const [analysisResult, setAnalysisResult] = useState<ColorAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [showCaptureFlash, setShowCaptureFlash] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);
  /** Foto jepretan kamera terakhir saat scan (data URL) */
  const capturedPhotoRef = useRef<string | null>(null);

  // ── Toast ────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4500);
  };

  // ── Camera ───────────────────────────────────────────────────────────────
  const startCamera = useCallback(async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setTimeout(() => {
          updateCircleParams();
          setupResizeObserver();
        }, 600);
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      setCameraError('Akses kamera ditolak. Berikan izin kamera di browser.');
      setIsCameraActive(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    captureIntervalRef.current && clearInterval(captureIntervalRef.current);
    captureIntervalRef.current = null;
    setIsCameraActive(false);
    setIsFlashOn(false);
  }, []);

  const openCameraView = () => { setCameraViewOpen(true); startCamera(); };
  const closeCameraView = () => {
    stopCamera();
    setCameraViewOpen(false);
    frameBufferRef.current = [];
    setIsAnalyzing(false);
    setAnalyzeProgress(0);
  };

  // ── Circular Stencil Geometry ────────────────────────────────────────────
  const updateCircleParams = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const wrapW = wrapper.clientWidth;
    const wrapH = wrapper.clientHeight;
    const minDim = Math.min(wrapW, wrapH);
    const outerR = Math.floor(minDim * OUTER_RADIUS_RATIO);
    const innerR = Math.floor(minDim * INNER_RADIUS_RATIO);
    const cX = Math.floor(wrapW / 2);
    const cY = Math.floor(wrapH / 2);

    const cp: CircleParams = { cX, cY, outerR, innerR, wrapW, wrapH };
    setCircleParams(cp);

    // Update SVG elements
    const svg = svgRef.current;
    if (!svg) return;
    const setCircle = (id: string, r: number) => {
      const el = svg.getElementById(id) as SVGCircleElement | null;
      if (!el) return;
      el.setAttribute('cx', String(cX));
      el.setAttribute('cy', String(cY));
      el.setAttribute('r', String(r));
    };
    const setRect = (id: string, r: number) => {
      const el = svg.getElementById(id) as SVGRectElement | null;
      if (!el) return;
      el.setAttribute('x', String(cX - r));
      el.setAttribute('y', String(cY - r));
      el.setAttribute('width', String(r * 2));
      el.setAttribute('height', String(r * 2));
    };
    const setText = (id: string, y: number) => {
      const el = svg.getElementById(id) as SVGTextElement | null;
      if (!el) return;
      el.setAttribute('x', String(cX));
      el.setAttribute('y', String(y));
    };
    setRect('mask-rect-outer', outerR);
    setRect('outline-outer', outerR);
    setRect('outline-inner', innerR);
    setText('text-outer', cY - outerR + 22);
    setText('text-inner', cY - innerR + 17);
  }, []);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const setupResizeObserver = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = new ResizeObserver(() => updateCircleParams());
    resizeObserverRef.current.observe(wrapper);
  }, [updateCircleParams]);

  useEffect(() => {
    if (cameraViewOpen) setTimeout(() => { updateCircleParams(); setupResizeObserver(); }, 200);
    return () => resizeObserverRef.current?.disconnect();
  }, [cameraViewOpen, updateCircleParams, setupResizeObserver]);

  // ── Flash & Switch ────────────────────────────────────────────────────────
  const toggleFlash = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const caps = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      if (!caps.torch) { showToast('Kamera ini tidak mendukung flash.'); return; }
      const next = !isFlashOn;
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setIsFlashOn(next);
    } catch { showToast('Gagal menyalakan flash.'); }
  };

  const switchCamera = () => {
    const newMode: 'environment' | 'user' = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // ── Circular Frame Snapshot ───────────────────────────────────────────────
  /**
   * Ambil satu snapshot dari video.
   * Area PUTIH: piksel di antara innerR dan outerR (cincin putih di sekitar stiker)
   * Area SENSOR: piksel di dalam innerR (isi stiker kurkumin)
   * Keduanya menggunakan IQR-based robust mean.
   */
  const captureFrameSnapshot = useCallback((): {
    valid: boolean; reason?: string; white?: ColorRGB; sensor?: ColorRGB;
  } => {
    if (!circleParams || !videoRef.current) return { valid: false, reason: 'Kamera belum siap.' };
    const { cX, cY, outerR, innerR, wrapW, wrapH } = circleParams;

    const canvas = document.createElement('canvas');
    canvas.width = wrapW;
    canvas.height = wrapH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { valid: false, reason: 'Canvas tidak tersedia.' };

    const video = videoRef.current;
    const vW = video.videoWidth, vH = video.videoHeight;
    if (!vW || !vH) return { valid: false, reason: 'Feed kamera belum siap.' };

    const scale = Math.max(wrapW / vW, wrapH / vH);
    const drawW = vW * scale, drawH = vH * scale;
    ctx.drawImage(video, (wrapW - drawW) / 2, (wrapH - drawH) / 2, drawW, drawH);

    // Baca area bounding box lingkaran terluar
    const bboxX = Math.max(0, cX - outerR);
    const bboxY = Math.max(0, cY - outerR);
    const bboxW = Math.min(wrapW - bboxX, outerR * 2);
    const bboxH = Math.min(wrapH - bboxY, outerR * 2);

    if (bboxW <= 0 || bboxH <= 0) return { valid: false, reason: 'Resolusi kamera bermasalah.' };

    const imgData = ctx.getImageData(bboxX, bboxY, bboxW, bboxH).data;

    const whitePx: ColorRGB[] = [];
    const sensorPx: ColorRGB[] = [];

    for (let y = 0; y < bboxH; y++) {
      for (let x = 0; x < bboxW; x++) {
        const absX = bboxX + x - cX;
        const absY = bboxY + y - cY;
        const dist2 = absX * absX + absY * absY;
        const i = (y * bboxW + x) * 4;
        const px: ColorRGB = { r: imgData[i], g: imgData[i + 1], b: imgData[i + 2] };

        if (dist2 <= innerR * innerR) {
          sensorPx.push(px);
        } else if (Math.abs(absX) <= outerR && Math.abs(absY) <= outerR) {
          whitePx.push(px);
        }
      }
    }

    const { mean: whiteMean, noise: whiteNoise } = robustMean(whitePx);
    const { mean: sensorMean, noise: sensorNoise } = robustMean(sensorPx);

    // Validasi white reference
    if (whiteMean.r < 80 && whiteMean.g < 80 && whiteMean.b < 80)
      return { valid: false, reason: 'PENCAHAYAAN TERLALU GELAP: Cari sumber cahaya lebih terang.' };
    if (Math.max(whiteMean.r, whiteMean.g, whiteMean.b) - Math.min(whiteMean.r, whiteMean.g, whiteMean.b) > 55)
      return { valid: false, reason: 'KALIBRASI GAGAL: Area putih tidak netral. Pastikan cincin luar berada di atas area putih stiker.' };
    if (whiteNoise > 45 || sensorNoise > 45)
      return { valid: false, reason: 'TIDAK STABIL: Terlalu banyak gerakan — tahan HP dengan stabil.' };

    return { valid: true, white: whiteMean, sensor: sensorMean };
  }, [circleParams]);

  // ── Multi-Frame Capture Pipeline ─────────────────────────────────────────
  const runCapture = () => {
    if (!isCameraActive || isAnalyzing || !circleParams) return;
    setIsAnalyzing(true);
    setAnalyzeProgress(0);
    frameBufferRef.current = [];
    capturedPhotoRef.current = null;

    setShowCaptureFlash(true);
    setTimeout(() => setShowCaptureFlash(false), 350);
    if ('vibrate' in navigator) navigator.vibrate(40);

    // Capture foto jepretan langsung dari video feed saat tombol ditekan
    try {
      const video = videoRef.current;
      const { wrapW, wrapH } = circleParams;
      if (video && video.videoWidth) {
        const snapCanvas = document.createElement('canvas');
        const vW = video.videoWidth, vH = video.videoHeight;
        const scale = Math.max(wrapW / vW, wrapH / vH);
        snapCanvas.width = Math.round(vW * scale);
        snapCanvas.height = Math.round(vH * scale);
        const sCtx = snapCanvas.getContext('2d');
        if (sCtx) {
          sCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
          capturedPhotoRef.current = snapCanvas.toDataURL('image/jpeg', 0.82);
        }
      }
    } catch { /* ignore */ }

    let count = 0;
    captureIntervalRef.current = setInterval(() => {
      const snap = captureFrameSnapshot();
      if (!snap.valid) {
        clearInterval(captureIntervalRef.current!);
        captureIntervalRef.current = null;
        showToast(snap.reason || 'Gagal mengambil frame.');
        setIsAnalyzing(false);
        setAnalyzeProgress(0);
        frameBufferRef.current = [];
        return;
      }
      frameBufferRef.current.push({ white: snap.white!, sensor: snap.sensor! });
      count++;
      setAnalyzeProgress(Math.round((count / FRAME_COUNT) * 100));
      if (count >= FRAME_COUNT) {
        clearInterval(captureIntervalRef.current!);
        captureIntervalRef.current = null;
        runFinalAnalysis();
      }
    }, FRAME_INTERVAL_MS);
  };

  const runFinalAnalysis = () => {
    const frames = frameBufferRef.current;
    if (!frames.length) { setIsAnalyzing(false); return; }

    // Rata-rata dalam LINEAR space (gamma-accurate)
    let wLinR = 0, wLinG = 0, wLinB = 0, sLinR = 0, sLinG = 0, sLinB = 0;
    for (const f of frames) {
      wLinR += sRGBToLinear(f.white.r); wLinG += sRGBToLinear(f.white.g); wLinB += sRGBToLinear(f.white.b);
      sLinR += sRGBToLinear(f.sensor.r); sLinG += sRGBToLinear(f.sensor.g); sLinB += sRGBToLinear(f.sensor.b);
    }
    const n = frames.length;
    const avgWhite: ColorRGB = { r: linearToSRGB(wLinR / n), g: linearToSRGB(wLinG / n), b: linearToSRGB(wLinB / n) };
    const avgSensor: ColorRGB = { r: linearToSRGB(sLinR / n), g: linearToSRGB(sLinG / n), b: linearToSRGB(sLinB / n) };

    // Stabilitas check: std-dev hue antar frame
    const frameHues = frames.map(f => {
      const cal = vonKriesCalibrate(f.sensor, f.white);
      const r = cal.r / 255, g = cal.g / 255, b = cal.b / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
      if (d === 0) return 0;
      let h = 0;
      if (max === r) h = (g - b) / d;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      return Math.round(((h / 6 + 1) % 1) * 360);
    });
    const meanHue = frameHues.reduce((a, b) => a + b, 0) / frameHues.length;
    const stdHue = Math.sqrt(frameHues.map(h => (h - meanHue) ** 2).reduce((a, b) => a + b, 0) / frameHues.length);

    if (stdHue > STABILITY_MAX_STD_HUE) {
      showToast(`SINYAL TIDAK STABIL: Fluktuasi hue σ=${stdHue.toFixed(1)}°. Kurangi gerakan.`);
      setIsAnalyzing(false); setAnalyzeProgress(0); frameBufferRef.current = [];
      return;
    }

    const result = analyzeSensorColor(avgSensor, selectedMeatType, avgWhite);
    // Attach extra metadata
    const enrichedResult: ColorAnalysisResult = {
      ...result,
      userMode,
      meatLabel: MEAT_LABELS[selectedMeatType] || selectedMeatType,
      capturedImageDataUrl: capturedPhotoRef.current ?? undefined,
    };
    setWhiteRefColor(avgWhite);
    setAnalysisResult(enrichedResult);
    onScanComplete(enrichedResult);
    setIsAnalyzing(false);
    setAnalyzeProgress(0);
    frameBufferRef.current = [];
    capturedPhotoRef.current = null;
    closeCameraView();
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  };

  // ── Upload ───────────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setUploadedImageSrc(src);
      const img = new Image();
      img.onload = () => {
        const canvas = uploadCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        const cx = Math.round(canvas.width / 2), cy = Math.round(canvas.height / 2);
        const pixel = ctx.getImageData(cx, cy, 1, 1).data;
        const rgb: ColorRGB = { r: pixel[0], g: pixel[1], b: pixel[2] };
        setLastRawRgb(rgb);
        setAnalysisResult(analyzeSensorColor(rgb, selectedMeatType, whiteRefColor));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = uploadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    const px = ctx.getImageData(x, y, 1, 1).data;
    const rgb: ColorRGB = { r: px[0], g: px[1], b: px[2] };
    if (pipetteTarget === 'white') {
      setWhiteRefColor(rgb);
      setPipetteTarget('sensor');
      if (lastRawRgb) setAnalysisResult(analyzeSensorColor(lastRawRgb, selectedMeatType, rgb));
    } else {
      setLastRawRgb(rgb);
      setAnalysisResult(analyzeSensorColor(rgb, selectedMeatType, whiteRefColor));
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = uploadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    const px = ctx.getImageData(x, y, 1, 1).data;
    setHoverColor(rgbToHex({ r: px[0], g: px[1], b: px[2] }));
  };

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-full px-4">
          <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-white border shadow-xl text-sm font-semibold animate-fadeInUp"
            style={{ borderColor: 'var(--color-secondary)', color: 'var(--color-primary-dark)' }}
          >
            <span className="flex-1">{toastMsg}</span>
            <button onClick={() => setToastMsg(null)} className="shrink-0 cursor-pointer" style={{ color: 'var(--color-primary)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Full-Screen Camera View ─────────────────────────────────────── */}
      {cameraViewOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
            <button onClick={closeCameraView}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
              <span>Tutup</span>
            </button>
            <span className="text-white font-bold text-sm">Sejajarkan Stiker GENT</span>
            <div className="flex items-center gap-2">
              <button onClick={toggleFlash}
                className={`p-2.5 rounded-xl cursor-pointer transition-all ${isFlashOn ? 'bg-yellow-400 text-slate-900' : 'bg-white/15 hover:bg-white/25 text-white'}`}
              >
                <Zap className="w-4 h-4" />
              </button>
              <button onClick={switchCamera} className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white cursor-pointer transition-all">
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Camera + SVG circular stencil */}
          <div ref={wrapperRef} className="relative flex-1 overflow-hidden">
            <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-cover" />

            {/* Flash overlay */}
            {showCaptureFlash && (
              <div className="absolute inset-0 bg-white animate-capture-flash pointer-events-none z-20" />
            )}

            {/* SVG Circular Stencil */}
            <svg ref={svgRef} className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <mask id="circle-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {/* Outer rect hole */}
                  <rect id="mask-rect-outer" fill="black" rx="16" />
                </mask>
              </defs>

              {/* Dark overlay with hole */}
              <rect width="100%" height="100%" fill="rgba(10,10,20,0.82)" mask="url(#circle-mask)" />

              {/* Outer rect — area putih stiker */}
              <rect
                id="outline-outer"
                fill="none"
                stroke="rgba(255,255,255,0.90)"
                strokeWidth="2.5"
                rx="16"
              />

              {/* Inner rect — sensor warna (dashed pink) */}
              <rect
                id="outline-inner"
                fill="none"
                stroke="#f48fb1"
                strokeWidth="2.5"
                strokeDasharray="9 5"
                rx="12"
              />

              {/* Label atas: area putih */}
              <text id="text-outer" fill="rgba(255,255,255,0.85)" fontSize="12" fontWeight="700"
                textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                AREA PUTIH
              </text>

              {/* Label atas: sensor */}
              <text id="text-inner" fill="#f48fb1" fontSize="11" fontWeight="700"
                textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                SENSOR
              </text>
            </svg>

            {/* Camera error */}
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                <div className="text-center p-6 space-y-3 max-w-xs">
                  <Camera className="w-10 h-10 text-[#f48fb1] mx-auto" />
                  <p className="text-white text-sm">{cameraError}</p>
                  <button onClick={() => startCamera()}
                    className="px-5 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    Coba Ulang
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom: progress + capture button */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 px-6 pb-10 pt-4 bg-gradient-to-t from-black/70 to-transparent">
            {isAnalyzing && (
              <div className="w-full max-w-xs space-y-1.5">
                <div className="flex items-center justify-between text-xs text-white/80 font-medium">
                  <span>Mengambil {Math.round(analyzeProgress * FRAME_COUNT / 100)}/{FRAME_COUNT} frame</span>
                  <span>{analyzeProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-150"
                    style={{ width: `${analyzeProgress}%`, background: 'var(--color-secondary)' }}
                  />
                </div>
                <p className="text-center text-[10px] text-white/50">Jangan gerakkan kamera</p>
              </div>
            )}

            {/* Circular shutter button */}
            <button
              onClick={runCapture}
              disabled={!isCameraActive || isAnalyzing}
              className="relative flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {/* Outer ring */}
              <div className="w-20 h-20 rounded-full border-4 border-white/60 flex items-center justify-center">
                {/* Inner circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xs transition-all"
                  style={{
                    background: isAnalyzing
                      ? 'rgba(255,255,255,0.3)'
                      : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                    boxShadow: '0 4px 20px rgba(194,24,91,0.5)',
                  }}
                >
                  {isAnalyzing
                    ? <RefreshCw className="w-6 h-6 animate-spin" />
                    : <Camera className="w-6 h-6" />
                  }
                </div>
              </div>
            </button>

            <p className="text-center text-[10px] text-white/50 max-w-xs">
              Sensor GENT di kotak merah muda bagian dalam, area putih di kotak luar
            </p>
          </div>
        </div>
      )}

      {/* ── Main Section ──────────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 pb-12">

        {/* Section Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold" style={{ color: 'var(--color-primary-dark)' }}>
            Analisis Kolorimetri Kesegaran Daging
          </h2>
          <p className="max-w-xl mx-auto text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Sistem mengambil <strong>{FRAME_COUNT} frame</strong>, rata-rata dalam linear space,
            kalibrasi Von Kries, lalu estimasi pH &amp; TVB-N dari spektrum kurkumin-DES.
          </p>
        </div>

        {/* Control Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-3xl border shadow-sm"
          style={{ borderColor: 'var(--color-accent-mid)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Tabs */}
            <div className="flex p-1 rounded-2xl border overflow-x-auto tab-scroll gap-1 shrink-0"
              style={{ background: 'var(--color-accent)', borderColor: 'var(--color-accent-mid)' }}
            >
              {([
                { key: 'camera', icon: Camera, label: 'Kamera' },
                { key: 'upload', icon: Upload, label: 'Upload' },
                { key: 'preset', icon: Sparkles, label: 'Preset' },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                  style={activeTab === key
                    ? { background: 'var(--color-primary)', color: 'white' }
                    : { color: 'var(--color-text-muted)' }
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Meat Type */}
            <div className="relative flex-1 min-w-[140px]">
              <select
                value={selectedMeatType}
                onChange={(e) => setSelectedMeatType(e.target.value as typeof selectedMeatType)}
                className="w-full appearance-none font-semibold text-xs px-3.5 py-2 pr-8 rounded-xl border focus:outline-none shadow-sm cursor-pointer bg-white"
                style={{ color: 'var(--color-text)', borderColor: 'var(--color-accent-mid)' }}
              >
                <option value="beef">🥩 Daging Sapi</option>
                <option value="chicken">🍗 Daging Ayam</option>
                <option value="fish">🐟 Ikan / Seafood</option>
                <option value="pork">🥓 Lainnya</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Scanner Panel */}
          <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-3xl border shadow-xl space-y-4"
            style={{ borderColor: 'var(--color-accent-mid)' }}
          >

            {/* TAB: Camera */}
            {activeTab === 'camera' && (
              <div className="space-y-4">
                {/* Circular preview placeholder */}
                <div className="flex flex-col items-center gap-5 py-6">
                  {/* Circular diagram */}
                  <div className="relative">
                    {/* Outer ring (area putih) */}
                    <div
                      className="w-48 h-48 rounded-[24px] flex items-center justify-center border-4"
                      style={{ border: '4px solid rgba(255,255,255,0.5)', background: 'var(--color-accent)' }}
                    >
                      {/* Label outer */}
                      <span
                        className="absolute top-3 text-[10px] font-bold tracking-widest uppercase"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Area Putih
                      </span>

                      {/* Inner square (sensor) */}
                      <div
                        className="w-20 h-20 rounded-xl flex items-center justify-center border-2 border-dashed"
                        style={{
                          borderColor: 'var(--color-secondary)',
                          background: 'white',
                        }}
                      >
                        <Camera className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                      </div>
                    </div>
                    {/* Label inner */}
                    <span
                      className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Sensor
                    </span>
                  </div>

                  <div className="text-center space-y-1.5 px-4">
                    <p className="font-bold text-sm" style={{ color: 'var(--color-primary-dark)' }}>
                      Sejajarkan Stiker GENT
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                      Sensor kurkumin (kuning) masuk ke kotak merah muda.
                      Area putih stiker masuk ke garis kotak luar.
                    </p>
                  </div>
                </div>

                <button onClick={openCameraView}
                  className="w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                    boxShadow: '0 8px 24px rgba(194,24,91,0.28)',
                  }}
                >
                  <Camera className="w-5 h-5" />
                  <span>Buka Kamera</span>
                </button>
              </div>
            )}

            {/* TAB: Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                {!uploadedImageSrc ? (
                  <label
                    className="border-2 border-dashed rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all aspect-square max-w-sm sm:max-w-md mx-auto"
                    style={{ borderColor: 'var(--color-secondary)', background: 'var(--color-accent)' }}
                  >
                    <div className="p-4 rounded-full" style={{ background: 'var(--color-accent-mid)' }}>
                      <Upload className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="text-center space-y-1">
                      <span className="font-bold text-sm block" style={{ color: 'var(--color-primary-dark)' }}>
                        Pilih Foto Stiker GENT
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>JPG, PNG, WEBP</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                ) : (
                  <div className="space-y-2.5">
                    <div className="relative rounded-3xl overflow-hidden border flex items-center justify-center aspect-square max-w-sm sm:max-w-md mx-auto p-1.5"
                      style={{ borderColor: 'var(--color-accent-mid)', background: '#f8f8f8' }}
                    >
                      <canvas
                        ref={uploadCanvasRef}
                        onClick={handleCanvasClick}
                        onMouseMove={handleCanvasMouseMove}
                        className="max-w-full max-h-full object-contain rounded-2xl cursor-crosshair"
                      />
                      {hoverColor && (
                        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-white/95 border text-xs font-mono font-bold flex items-center gap-2 shadow-lg"
                          style={{ borderColor: 'var(--color-accent-mid)' }}
                        >
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ backgroundColor: hoverColor }} />
                          <span style={{ color: 'var(--color-text)' }}>{hoverColor}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        <Pipette className="w-3.5 h-3.5" />
                        {pipetteTarget === 'white' ? '⚪ Klik area putih' : '🎯 Klik sensor warna'}
                      </span>
                      <label className="font-bold cursor-pointer underline text-[11px]" style={{ color: 'var(--color-primary)' }}>
                        Ganti Foto
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      {(['sensor', 'white'] as const).map(mode => (
                        <button key={mode} onClick={() => setPipetteTarget(mode)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border transition-all"
                          style={pipetteTarget === mode
                            ? { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }
                            : { background: 'white', color: 'var(--color-text-muted)', borderColor: 'var(--color-accent-mid)' }
                          }
                        >
                          {mode === 'sensor' ? '🎯 Sensor' : '⚪ Putih'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Preset */}
            {activeTab === 'preset' && (
              <div className="space-y-3">
                <p className="text-xs p-3 rounded-2xl border font-medium"
                  style={{ background: 'var(--color-accent)', borderColor: 'var(--color-accent-mid)', color: 'var(--color-primary-dark)' }}
                >
                  Sampel tervalidasi lab untuk menguji algoritma kolorimetri:
                </p>
                <div className="space-y-2">
                  {PRESET_SAMPLE_TESTS.map((preset) => (
                    <button key={preset.id}
                      onClick={() => {
                        setSelectedMeatType(preset.meatType);
                        const presetResult: ColorAnalysisResult = {
                          ...analyzeSensorColor(preset.rgb, preset.meatType),
                          userMode,
                          meatLabel: MEAT_LABELS[preset.meatType] || preset.meatType,
                        };
                        setAnalysisResult(presetResult);
                        onScanComplete(presetResult);
                        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
                      }}
                      className="w-full p-4 rounded-2xl border text-left cursor-pointer group transition-all hover:shadow-md bg-white"
                      style={{ borderColor: 'var(--color-accent-mid)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full shadow-md border-2 border-white shrink-0 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: preset.colorHex }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold leading-snug" style={{ color: 'var(--color-primary-dark)' }}>
                            {preset.name}
                          </h4>
                          <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                            {preset.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                          {preset.colorHex}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-6" ref={resultRef}>
            {analysisResult ? (
              <div className="animate-fadeInUp">
                <ResultDetailCard
                  result={analysisResult}
                  userMode={userMode}
                  onReset={() => { setAnalysisResult(null); setUploadedImageSrc(null); }}
                />
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border text-center space-y-4 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[380px] shadow-xl"
                style={{ borderColor: 'var(--color-accent-mid)' }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                  style={{ background: 'var(--color-accent)', borderColor: 'var(--color-accent-mid)' }}
                >
                  <Eye className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base" style={{ color: 'var(--color-primary-dark)' }}>
                    Siap Menganalisis
                  </h3>
                  <p className="text-xs mt-1 leading-relaxed max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Gunakan kamera, upload foto, atau pilih sampel preset untuk melihat hasil analisis.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};
