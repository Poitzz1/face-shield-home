import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RefreshCw, User, UserX, Scan, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSecurity } from '@/context/SecurityContext';
import { cn } from '@/lib/utils';
import * as faceapi from 'face-api.js';

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionLoopRef = useRef<NodeJS.Timeout | null>(null);

  const [isModelsLoading, setIsModelsLoading] = useState(true);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectionBox, setDetectionBox] = useState<DetectionBox | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);

  const {
    isCameraEnabled,
    isSystemActive,
    isAlarmEnabled,
    detectionSensitivity,
    currentDetection,
    setCurrentDetection,
    detectedUserName,
    setDetectedUserName,
    authorizedUsers,
    addAlert,
  } = useSecurity();

  // Map sensitivity (0–100) → face distance threshold (0.3–0.8)
  // Lower distance = stricter match. Higher sensitivity = more lenient (higher threshold).
  const matchThreshold = 0.3 + (detectionSensitivity / 100) * 0.5;

  // ─── Alarm sound via Web Audio API ────────────────────────────────────────
  const playAlarm = useCallback(() => {
    if (!isAlarmEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      // Two-tone police-style alarm: hi-lo-hi-lo
      playTone(960, 0.0, 0.18);
      playTone(640, 0.2, 0.18);
      playTone(960, 0.4, 0.18);
      playTone(640, 0.6, 0.18);
    } catch (e) {
      console.warn('Audio context unavailable:', e);
    }
  }, [isAlarmEnabled]);

  // ─── 1. Load AI Models once ───────────────────────────────────────────────
  useEffect(() => {
    const loadModels = async () => {
      setIsModelsLoading(true);
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load faceapi models:', err);
        setError('Failed to load AI models. Make sure files are in /public/models.');
      } finally {
        setIsModelsLoading(false);
      }
    };
    loadModels();
  }, []);

  // ─── 2. Build FaceMatcher when authorizedUsers changes ────────────────────
  useEffect(() => {
    if (!modelsLoaded || authorizedUsers.length === 0) {
      setFaceMatcher(null);
      return;
    }
    const buildMatcher = async () => {
      try {
        const results = await Promise.all(
          authorizedUsers.map(async (user) => {
            const img = await faceapi.fetchImage(user.imageUrl);
            const det = await faceapi
              .detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();
            if (!det) {
              console.warn(`No face found in photo for: ${user.name}`);
              return null;
            }
            return new faceapi.LabeledFaceDescriptors(user.name, [det.descriptor]);
          })
        );
        const valid = results.filter((r): r is faceapi.LabeledFaceDescriptors => r !== null);
        // Use matchThreshold so FaceMatcher respects the sensitivity setting
        setFaceMatcher(valid.length > 0 ? new faceapi.FaceMatcher(valid, matchThreshold) : null);
      } catch (err) {
        console.error('Error building face matcher:', err);
      }
    };
    buildMatcher();
  }, [authorizedUsers, modelsLoaded, matchThreshold]);

  // ─── 3. Start / stop camera ───────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (!isCameraEnabled || !isSystemActive || !modelsLoaded) return;
    setIsCameraLoading(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please grant permission.');
    } finally {
      setIsCameraLoading(false);
    }
  }, [isCameraEnabled, isSystemActive, modelsLoaded]);

  const stopCamera = useCallback(() => {
    if (detectionLoopRef.current) clearTimeout(detectionLoopRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
    setCurrentDetection('none');
    setDetectionBox(null);
  }, [setCurrentDetection]);

  useEffect(() => {
    if (isCameraEnabled && isSystemActive && modelsLoaded) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraEnabled, isSystemActive, modelsLoaded]);

  // ─── 4. Detection loop (starts only once video has real dimensions) ───────
  useEffect(() => {
    if (!cameraReady || !isSystemActive || !modelsLoaded) return;

    const detectFaces = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.paused || video.ended) {
        detectionLoopRef.current = setTimeout(detectFaces, 300);
        return;
      }

      try {
        const detection = await faceapi
          .detectSingleFace(video)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          const sw = video.videoWidth;
          const sh = video.videoHeight;
          const box = faceapi.resizeResults(detection, { width: sw, height: sh }).detection.box;

          setDetectionBox({
            x: (box.x / sw) * 100,
            y: (box.y / sh) * 100,
            width: (box.width / sw) * 100,
            height: (box.height / sh) * 100,
          });

          if (faceMatcher) {
            const best = faceMatcher.findBestMatch(detection.descriptor);
            if (best.label !== 'unknown' && best.distance < matchThreshold) {
              setDetectedUserName(best.label);
              if (currentDetection !== 'authorized') {
                setCurrentDetection('authorized');
                addAlert({ type: 'authorized', userName: best.label });
              }
            } else {
              setDetectedUserName(null);
              if (currentDetection !== 'unauthorized') {
                setCurrentDetection('unauthorized');
                addAlert({ type: 'unauthorized' });
                playAlarm();
              }
            }
          } else {
            setDetectedUserName(null);
            if (currentDetection !== 'unauthorized') {
              setCurrentDetection('unauthorized');
              addAlert({ type: 'unauthorized' });
              playAlarm();
            }
          }
        } else {
          setDetectionBox(null);
          setDetectedUserName(null);
          if (currentDetection !== 'scanning') setCurrentDetection('scanning');
        }
      } catch (err) {
        console.error('Detection error:', err);
      }

      detectionLoopRef.current = setTimeout(detectFaces, 500);
    };

    detectionLoopRef.current = setTimeout(detectFaces, 500);
    return () => {
      if (detectionLoopRef.current) clearTimeout(detectionLoopRef.current);
    };
  }, [cameraReady, isSystemActive, modelsLoaded, faceMatcher]);

  // ─── Label rendered inside the camera frame ───────────────────────────────
  const renderLabel = () => {
    if (currentDetection === 'scanning')
      return (
        <motion.div
          key="scanning"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="security-scanning border rounded-lg px-4 py-2 flex items-center gap-2"
        >
          <Scan className="w-4 h-4 animate-pulse" />
          <span className="font-medium">Scanning for faces…</span>
        </motion.div>
      );

    if (currentDetection === 'authorized')
      return (
        <motion.div
          key="authorized"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="security-safe border rounded-lg px-4 py-2 flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          <span className="font-medium">Authorized: {detectedUserName}</span>
        </motion.div>
      );

    if (currentDetection === 'unauthorized')
      return (
        <motion.div
          key="unauthorized"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="security-danger border rounded-lg px-4 py-2 flex items-center gap-2"
        >
          <UserX className="w-4 h-4" />
          <span className="font-medium">Unauthorized Person Detected!</span>
        </motion.div>
      );

    return null;
  };

  // ─── Early-exit screens ───────────────────────────────────────────────────
  if (!isSystemActive)
    return (
      <div className="camera-frame aspect-video flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <CameraOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">System Inactive</p>
          <p className="text-sm">Enable the system to start monitoring</p>
        </div>
      </div>
    );

  if (!isCameraEnabled)
    return (
      <div className="camera-frame aspect-video flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <CameraOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Camera Disabled</p>
          <p className="text-sm">Enable camera access in Settings</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="camera-frame aspect-video flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-destructive opacity-70" />
          <p className="font-medium text-destructive mb-3">{error}</p>
          <Button onClick={startCamera} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );

  // ─── Main camera view ─────────────────────────────────────────────────────
  return (
    <div className="camera-frame relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
      {/* Loading overlay – only shown while models are loading */}
      {(isModelsLoading || isCameraLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/90 z-30">
          <div className="text-center text-muted-foreground">
            <Camera className="w-12 h-12 mx-auto mb-3 animate-pulse" />
            <p className="font-medium">
              {isModelsLoading ? 'Loading AI Models…' : 'Starting Camera…'}
            </p>
            {isCameraLoading && (
              <p className="text-sm mt-2 text-cyan-400">
                Click "Allow" if prompted for camera access.
              </p>
            )}
          </div>
        </div>
      )}

      {/* The video element is always mounted so srcObject can be set */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onCanPlay={() => setCameraReady(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          display: 'block',
          transform: 'scaleX(-1)',
        }}
      />

      {/* Scanning line */}
      {cameraReady && currentDetection === 'scanning' && !detectionBox && (
        <div className="scan-line" style={{ zIndex: 5 }} />
      )}

      {/* Face bounding box */}
      <AnimatePresence>
        {cameraReady &&
          detectionBox &&
          (currentDetection === 'authorized' || currentDetection === 'unauthorized') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                'detection-box',
                currentDetection === 'authorized' ? 'detection-box-safe' : 'detection-box-danger'
              )}
              style={{
                left: `${detectionBox.x}%`,
                top: `${detectionBox.y}%`,
                width: `${detectionBox.width}%`,
                height: `${detectionBox.height}%`,
                zIndex: 10,
              }}
            >
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-inherit rounded-tl" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-inherit rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-inherit rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-inherit rounded-br" />
            </motion.div>
          )}
      </AnimatePresence>

      {/* Detection label */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center" style={{ zIndex: 20 }}>
        <AnimatePresence mode="wait">{renderLabel()}</AnimatePresence>
      </div>

      {/* Timestamp */}
      <div
        className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm"
        style={{ zIndex: 20 }}
      >
        <span className="mono-text text-sm text-white/80">{new Date().toLocaleTimeString()}</span>
      </div>

      {/* Recording indicator */}
      <div
        className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm"
        style={{ zIndex: 20 }}
      >
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm text-white/80 font-medium">LIVE</span>
      </div>
    </div>
  );
}
