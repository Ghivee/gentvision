import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  Sun, 
  SwitchCamera,
  Eye,
  Pipette,
  Check,
  ChevronDown
} from 'lucide-react';
import { ColorRGB, ColorAnalysisResult } from '../../types';
import { analyzeSensorColor, rgbToHex } from '../../core/colorimetry';
import { PRESET_SAMPLE_TESTS } from '../../data/sampleData';
import { ResultDetailCard } from './ResultDetailCard';

export const SmartColorAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'preset'>('camera');
  const [selectedMeatType, setSelectedMeatType] = useState<'beef' | 'chicken' | 'fish' | 'pork' | 'custom'>('beef');
  
  // White Calibration States
  const [enableWhiteCalibration, setEnableWhiteCalibration] = useState<boolean>(true);
  const [whiteRefColor, setWhiteRefColor] = useState<ColorRGB>({ r: 245, g: 245, b: 245 });
  const [pipetteTarget, setPipetteTarget] = useState<'sensor' | 'white'>('sensor');

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Canvas refs — separated: hidden for camera capture, visible for upload
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const uploadCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Image state
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [lastRawRgb, setLastRawRgb] = useState<ColorRGB | null>(null);

  // Analysis result state
  const [analysisResult, setAnalysisResult] = useState<ColorAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showCaptureFlash, setShowCaptureFlash] = useState<boolean>(false);

  // Live color preview from camera center ROI
  const [livePreviewColor, setLivePreviewColor] = useState<ColorRGB | null>(null);
  const livePreviewIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll target ref
  const resultRef = useRef<HTMLDivElement | null>(null);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
          aspectRatio: { ideal: 1.0 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setCameraError('Akses kamera tidak aktif atau tidak diizinkan. Gunakan tab Upload Foto atau Sampel Preset.');
      setIsCameraActive(false);
    }
  }, [facingMode]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (livePreviewIntervalRef.current) {
      clearInterval(livePreviewIntervalRef.current);
      livePreviewIntervalRef.current = null;
    }
    setIsCameraActive(false);
    setLivePreviewColor(null);
  }, []);

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => { stopCamera(); };
  }, [activeTab, startCamera, stopCamera]);

  // Make sure stream is attached to the video element once it is rendered
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(e => console.warn('Video play error:', e));
    }
  }, [isCameraActive]);

  // Live preview from center ROI
  useEffect(() => {
    if (!isCameraActive) return;

    const sample = () => {
      const video = videoRef.current;
      const canvas = hiddenCanvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = Math.min(video.videoWidth || 320, video.videoHeight || 320);
      canvas.width = size;
      canvas.height = size;
      const offsetX = ((video.videoWidth || size) - size) / 2;
      const offsetY = ((video.videoHeight || size) - size) / 2;
      ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

      const cx = size / 2, cy = size / 2, r = size * 0.08;
      const imgData = ctx.getImageData(cx - r, cy - r, r * 2, r * 2);
      let totalR = 0, totalG = 0, totalB = 0, count = 0;
      for (let y = 0; y < r * 2; y++) {
        for (let x = 0; x < r * 2; x++) {
          const dx = x - r, dy = y - r;
          if (dx * dx + dy * dy <= r * r) {
            const idx = (Math.round(y) * Math.round(r * 2) + Math.round(x)) * 4;
            totalR += imgData.data[idx];
            totalG += imgData.data[idx + 1];
            totalB += imgData.data[idx + 2];
            count++;
          }
        }
      }
      if (count > 0) {
        setLivePreviewColor({
          r: Math.round(totalR / count),
          g: Math.round(totalG / count),
          b: Math.round(totalB / count),
        });
      }
    };

    livePreviewIntervalRef.current = setInterval(sample, 500);
    return () => {
      if (livePreviewIntervalRef.current) clearInterval(livePreviewIntervalRef.current);
    };
  }, [isCameraActive]);

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Auto-scroll to result after analysis
  const scrollToResult = () => {
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Perform Analysis with White Reference
  const executeAnalysis = (sensorRgb: ColorRGB, customWhite?: ColorRGB) => {
    setLastRawRgb(sensorRgb);
    setIsAnalyzing(true);
    const whitePoint = enableWhiteCalibration ? (customWhite || whiteRefColor) : undefined;

    setTimeout(() => {
      const result = analyzeSensorColor(sensorRgb, selectedMeatType, whitePoint);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      scrollToResult(); // 🔑 Auto-scroll to result
    }, 500);
  };

  // Capture frame from camera
  const captureAndAnalyzeCamera = () => {
    if (!videoRef.current || !hiddenCanvasRef.current) return;
    const video = videoRef.current;
    const canvas = hiddenCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flash effect
    setShowCaptureFlash(true);
    setTimeout(() => setShowCaptureFlash(false), 400);

    // Haptic feedback if supported
    if ('vibrate' in navigator) navigator.vibrate(40);

    const size = Math.min(video.videoWidth || 600, video.videoHeight || 600);
    canvas.width = size;
    canvas.height = size;

    const offsetX = Math.max(0, ((video.videoWidth || size) - size) / 2);
    const offsetY = Math.max(0, ((video.videoHeight || size) - size) / 2);
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.14;

    const imgData = ctx.getImageData(Math.round(centerX - radius), Math.round(centerY - radius), Math.round(radius * 2), Math.round(radius * 2));
    let totalR = 0, totalG = 0, totalB = 0, count = 0;

    for (let y = 0; y < radius * 2; y++) {
      for (let x = 0; x < radius * 2; x++) {
        const dx = x - radius;
        const dy = y - radius;
        if (dx * dx + dy * dy <= radius * radius) {
          const idx = (y * Math.round(radius * 2) + x) * 4;
          totalR += imgData.data[idx];
          totalG += imgData.data[idx + 1];
          totalB += imgData.data[idx + 2];
          count++;
        }
      }
    }

    const sensorRgb: ColorRGB = {
      r: Math.round(totalR / Math.max(count, 1)),
      g: Math.round(totalG / Math.max(count, 1)),
      b: Math.round(totalB / Math.max(count, 1)),
    };

    // Sample surrounding white reference area
    const whiteStartX = Math.round(centerX - radius * 1.5);
    const whiteStartY = Math.max(0, Math.round(centerY - radius * 2.2));
    const whiteWidth = Math.round(radius * 3);
    const whiteHeight = Math.round(radius * 0.6);

    const whiteData = ctx.getImageData(whiteStartX, whiteStartY, whiteWidth, whiteHeight);
    let wTotalR = 0, wTotalG = 0, wTotalB = 0, wCount = 0;

    for (let i = 0; i < whiteData.data.length; i += 4) {
      wTotalR += whiteData.data[i];
      wTotalG += whiteData.data[i + 1];
      wTotalB += whiteData.data[i + 2];
      wCount++;
    }

    const detectedWhite: ColorRGB = {
      r: Math.round(wTotalR / Math.max(wCount, 1)),
      g: Math.round(wTotalG / Math.max(wCount, 1)),
      b: Math.round(wTotalB / Math.max(wCount, 1)),
    };

    setWhiteRefColor(detectedWhite);
    executeAnalysis(sensorRgb, detectedWhite);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setUploadedImageSrc(src);

      const img = new Image();
      img.onload = () => {
        const canvas = uploadCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 600;
        ctx.drawImage(img, 0, 0);

        const startX = Math.round(canvas.width / 2);
        const startY = Math.round(canvas.height / 2);
        const pixel = ctx.getImageData(startX, startY, 1, 1).data;
        const sensorRgb = { r: pixel[0], g: pixel[1], b: pixel[2] };
        executeAnalysis(sensorRgb);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  // Canvas Click for Pipette Sampling
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = uploadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const sampledRgb: ColorRGB = { r: pixel[0], g: pixel[1], b: pixel[2] };

    if (pipetteTarget === 'white') {
      setWhiteRefColor(sampledRgb);
      setPipetteTarget('sensor');
      if (lastRawRgb) {
        executeAnalysis(lastRawRgb, sampledRgb);
      }
    } else {
      executeAnalysis(sampledRgb, whiteRefColor);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = uploadCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setHoverColor(rgbToHex({ r: pixel[0], g: pixel[1], b: pixel[2] }));
  };

  const liveHex = livePreviewColor ? rgbToHex(livePreviewColor) : null;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 pb-24 lg:pb-10">
      
      {/* Section Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f0efc0]/80 border border-[#c4cb38]/50 text-[#1e6238] text-xs font-bold shadow-sm">
          <Eye className="w-4 h-4 text-[#70bc2c]" />
          <span>Pemindai Presisi Spektrum Warna Stiker GENT</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          Analisis Kolorimetri Kesegaran Daging
        </h2>
        <p className="max-w-2xl mx-auto text-slate-600 text-xs sm:text-sm">
          Posisikan sensor stiker GENT pada area pemindai bundar. Sistem akan otomatis scroll ke hasil setelah analisis selesai.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-[#c4cb38]/40 shadow-md space-y-3">
        
        {/* Row 1: Tab selector + White calibration toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          
          {/* Tab Selector — mobile scrollable */}
          <div className="flex bg-[#faf9ea] p-1 rounded-2xl border border-[#c4cb38]/30 overflow-x-auto tab-scroll gap-1 shrink-0">
            {([
              { key: 'camera', icon: Camera, label: 'Kamera' },
              { key: 'upload', icon: Upload, label: 'Upload' },
              { key: 'preset', icon: Sparkles, label: 'Preset' },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === key
                    ? 'bg-[#1e6238] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Meat Type Selector */}
            <div className="relative flex-1 min-w-[140px]">
              <select
                value={selectedMeatType}
                onChange={(e) => setSelectedMeatType(e.target.value as typeof selectedMeatType)}
                className="w-full appearance-none bg-[#faf9ea] text-slate-800 font-semibold text-xs px-3.5 py-2 pr-8 rounded-xl border border-[#c4cb38]/40 focus:outline-none focus:border-[#70bc2c] shadow-sm cursor-pointer"
              >
                <option value="beef">🥩 Daging Sapi</option>
                <option value="chicken">🍗 Daging Ayam</option>
                <option value="fish">🐟 Ikan / Seafood</option>
                <option value="pork">🥓 Lainnya</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* White Calibration Toggle */}
            <button
              onClick={() => {
                const nextVal = !enableWhiteCalibration;
                setEnableWhiteCalibration(nextVal);
                if (lastRawRgb) {
                  executeAnalysis(lastRawRgb, nextVal ? whiteRefColor : undefined);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                enableWhiteCalibration
                  ? 'bg-[#f0efc0] text-[#1e6238] border-[#c4cb38]'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-[#70bc2c]" />
              <span>{enableWhiteCalibration ? '✓ Kalibrasi' : 'Kalibrasi'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: White reference status */}
        {enableWhiteCalibration && (
          <div className="p-2.5 rounded-2xl bg-[#faf9ea] border border-[#c4cb38]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium text-[11px]">Titik Putih Stiker GENT:</span>
              <div 
                className="w-4 h-4 rounded-md border border-slate-300 shadow-inner shrink-0" 
                style={{ backgroundColor: rgbToHex(whiteRefColor) }} 
              />
              <span className="font-mono text-slate-800 font-bold text-[11px]">
                RGB({whiteRefColor.r}, {whiteRefColor.g}, {whiteRefColor.b})
              </span>
            </div>

            {activeTab === 'upload' && uploadedImageSrc && (
              <div className="flex items-center gap-1.5">
                <Pipette className="w-3.5 h-3.5 text-[#70bc2c]" />
                <span className="text-slate-500 font-medium text-[11px]">Mode Pipet:</span>
                <button
                  onClick={() => setPipetteTarget('sensor')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    pipetteTarget === 'sensor' ? 'bg-[#1e6238] text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  🎯 Sensor
                </button>
                <button
                  onClick={() => setPipetteTarget('white')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    pipetteTarget === 'white' ? 'bg-[#9f5472] text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  ⚪ Putih
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Scanner + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Scanner Viewport */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-3xl border border-[#c4cb38]/40 shadow-xl space-y-4">
          
          {/* TAB 1: Camera */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="relative w-full aspect-square max-w-sm sm:max-w-md mx-auto bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover"
                    />

                    {/* Capture Flash Overlay */}
                    {showCaptureFlash && (
                      <div className="absolute inset-0 bg-white animate-capture-flash rounded-3xl pointer-events-none z-20" />
                    )}

                    {/* Overlay UI */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-[85%] h-[85%] rounded-2xl border-2 border-dashed border-white/40 relative flex items-center justify-center">
                        
                        <div className="absolute top-2 text-[10px] font-bold text-[#1e6238] bg-[#f0efc0]/95 px-3 py-0.5 rounded-full shadow-sm border border-[#c4cb38]/50">
                          ⚪ Area Putih Stiker
                        </div>

                        {/* Circular scan target */}
                        <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full border-4 border-[#70bc2c] shadow-[0_0_30px_rgba(112,188,44,0.7)] relative flex items-center justify-center animate-pulse-glow">
                          
                          {/* Live color preview dot */}
                          {livePreviewColor && (
                            <div className="absolute inset-0 rounded-full flex items-center justify-center">
                              <div
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/80 shadow-xl transition-colors duration-300"
                                style={{ backgroundColor: liveHex ?? undefined }}
                              />
                            </div>
                          )}

                          {/* Radar sweep */}
                          <div className="absolute inset-0 rounded-full border-2 border-[#70bc2c]/30 animate-spin" style={{ animationDuration: '4s' }} />

                          {/* Bottom label */}
                          <div className="absolute -bottom-7 text-[9px] sm:text-[10px] font-mono font-bold text-[#1e6238] bg-white/95 px-3 py-0.5 rounded-full shadow-md border border-[#c4cb38]/50 whitespace-nowrap">
                            Sensor Bulat GENT di Sini
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Live color badge */}
                    {livePreviewColor && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-sm border border-white/20 z-10">
                        <div
                          className="w-3 h-3 rounded-full border border-white/60"
                          style={{ backgroundColor: liveHex ?? undefined }}
                        />
                        <span className="text-[10px] font-mono text-white font-bold">{liveHex}</span>
                      </div>
                    )}

                    {/* Camera switch */}
                    <button
                      onClick={toggleCameraFacing}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm cursor-pointer z-10 border border-white/20 transition-all"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-3 bg-[#faf9ea] text-slate-800 w-full h-full flex flex-col items-center justify-center">
                    <Camera className="w-12 h-12 text-[#1e6238]/40 mx-auto animate-bounce" />
                    <p className="text-xs text-slate-600 max-w-[200px]">
                      {cameraError || 'Menghubungkan ke kamera...'}
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 rounded-xl bg-[#1e6238] hover:bg-[#174e2c] text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Coba Ulang
                    </button>
                  </div>
                )}
              </div>

              {/* Scan button — prominent, sticky feel on mobile */}
              <button
                onClick={captureAndAnalyzeCamera}
                disabled={!isCameraActive || isAnalyzing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1e6238] to-[#70bc2c] hover:from-[#174e2c] hover:to-[#5ea322] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm sm:text-base shadow-lg shadow-[#1e6238]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Menganalisis Sensor...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Pindai &amp; Analisis Stiker GENT</span>
                  </>
                )}
              </button>

              {/* Hidden canvas for camera capture */}
              <canvas ref={hiddenCanvasRef} className="hidden" />
            </div>
          )}

          {/* TAB 2: Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              {!uploadedImageSrc ? (
                <label className="border-2 border-dashed border-[#c4cb38] hover:border-[#70bc2c] rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center gap-3 bg-[#faf9ea] hover:bg-[#f0efc0]/40 cursor-pointer transition-all aspect-square max-w-sm sm:max-w-md mx-auto">
                  <div className="p-4 rounded-2xl bg-[#f0efc0] text-[#1e6238]">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="font-bold text-slate-900 text-sm block">Pilih Foto Kemasan Stiker GENT</span>
                    <span className="text-xs text-slate-500">JPG, PNG, WEBP didukung</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-2.5">
                  <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center aspect-square max-w-sm sm:max-w-md mx-auto p-1.5">
                    <canvas
                      ref={uploadCanvasRef}
                      onClick={handleCanvasClick}
                      onMouseMove={handleCanvasMouseMove}
                      className="max-w-full max-h-full object-contain rounded-2xl cursor-crosshair"
                    />
                    
                    {hoverColor && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: hoverColor }} />
                        <span className="text-slate-800">{hoverColor}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Pipette className="w-3.5 h-3.5 text-[#70bc2c]" />
                      {pipetteTarget === 'white' ? '⚪ Klik area putih stiker' : '🎯 Klik sensor warna stiker'}
                    </span>
                    <label className="text-[#1e6238] font-bold cursor-pointer underline text-[11px]">
                      Ganti Foto
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Preset */}
          {activeTab === 'preset' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#f0efc0]/70 rounded-2xl border border-[#c4cb38]/50 text-xs text-[#1e6238] font-semibold">
                Pilih sampel tervalidasi lab untuk menguji algoritma analisis kolorimetri:
              </div>

              <div className="space-y-2.5 sm:grid sm:grid-cols-1 sm:gap-2.5">
                {PRESET_SAMPLE_TESTS.map((preset) => {
                  const statusStyle = preset.colorHex.toLowerCase().startsWith('#ea5') || preset.colorHex.toLowerCase().startsWith('#f5')
                    ? 'border-orange-200 bg-orange-50'
                    : preset.colorHex.toLowerCase().startsWith('#7f') || preset.colorHex.toLowerCase().startsWith('#9')
                    ? 'border-red-200 bg-red-50'
                    : 'border-[#c4cb38]/30 bg-[#faf9ea]';

                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedMeatType(preset.meatType);
                        executeAnalysis(preset.rgb);
                      }}
                      className={`w-full p-4 rounded-2xl border hover:border-[#70bc2c] hover:bg-white transition-all text-left space-y-2 cursor-pointer group shadow-sm hover:shadow-md ${statusStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full shadow-md border-2 border-white transition-transform group-hover:scale-110 shrink-0" 
                          style={{ backgroundColor: preset.colorHex }} 
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#1e6238] transition-colors leading-snug">
                            {preset.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {preset.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">{preset.colorHex}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Result Card — with auto-scroll ref */}
        <div className="lg:col-span-6" ref={resultRef}>
          {analysisResult ? (
            <div className="animate-fadeInUp">
              <ResultDetailCard
                result={analysisResult}
                onReset={() => {
                  setAnalysisResult(null);
                  if (activeTab === 'camera') startCamera();
                }}
              />
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-[#c4cb38]/40 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[380px] shadow-xl">
              {isAnalyzing ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-[#f0efc0] border-2 border-[#c4cb38] flex items-center justify-center animate-pulse">
                    <RefreshCw className="w-8 h-8 text-[#1e6238] animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-extrabold text-base">Menganalisis Spektrum Warna...</h3>
                    <p className="text-xs text-slate-500 mt-1">Menghitung pH, TVB-N, dan indeks kesegaran</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-[#f0efc0] border border-[#c4cb38]/50 flex items-center justify-center shadow-sm">
                    <Eye className="w-8 h-8 text-[#1e6238] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-extrabold text-base">Siap Menganalisis Sensor GENT</h3>
                    <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                      Gunakan kamera, upload foto, atau pilih sampel preset. Hasil akan otomatis muncul di sini.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#1e6238] font-semibold bg-[#f0efc0]/70 px-3 py-1.5 rounded-full border border-[#c4cb38]/40">
                    <Check className="w-3.5 h-3.5" />
                    Auto-scroll ke hasil aktif
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
