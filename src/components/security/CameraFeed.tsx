import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, RefreshCw, User, UserX, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSecurity } from '@/context/SecurityContext';
import { cn } from '@/lib/utils';

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function CameraFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionBox, setDetectionBox] = useState<DetectionBox | null>(null);
  
  const {
    isCameraEnabled,
    isSystemActive,
    currentDetection,
    setCurrentDetection,
    detectedUserName,
    setDetectedUserName,
    authorizedUsers,
    addAlert,
  } = useSecurity();

  const startCamera = useCallback(async () => {
    if (!isCameraEnabled || !isSystemActive) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please grant permission.');
    } finally {
      setIsLoading(false);
    }
  }, [isCameraEnabled, isSystemActive]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    if (isCameraEnabled && isSystemActive) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isCameraEnabled, isSystemActive]);

  // Simulated face detection
  useEffect(() => {
    if (!stream || !isSystemActive) return;

    const simulateDetection = () => {
      // Simulate random face detection
      const shouldDetect = Math.random() > 0.3;
      
      if (shouldDetect) {
        setCurrentDetection('scanning');
        
        // Simulate scanning
        setTimeout(() => {
          const isAuthorized = Math.random() > 0.3;
          
          if (isAuthorized) {
            const randomUser = authorizedUsers[Math.floor(Math.random() * authorizedUsers.length)];
            setDetectedUserName(randomUser?.name || 'Unknown');
            setCurrentDetection('authorized');
            addAlert({ type: 'authorized', userName: randomUser?.name });
          } else {
            setDetectedUserName(null);
            setCurrentDetection('unauthorized');
            addAlert({ type: 'unauthorized' });
          }

          // Set detection box
          setDetectionBox({
            x: 30 + Math.random() * 20,
            y: 20 + Math.random() * 10,
            width: 30 + Math.random() * 10,
            height: 40 + Math.random() * 10,
          });

          // Clear detection after some time
          setTimeout(() => {
            setCurrentDetection('none');
            setDetectionBox(null);
            setDetectedUserName(null);
          }, 5000);
        }, 1500);
      }
    };

    const interval = setInterval(simulateDetection, 8000);
    // Initial detection after 2 seconds
    setTimeout(simulateDetection, 2000);
    
    return () => clearInterval(interval);
  }, [stream, isSystemActive, authorizedUsers]);

  const renderDetectionLabel = () => {
    if (currentDetection === 'scanning') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="security-scanning border rounded-lg px-4 py-2 flex items-center gap-2"
        >
          <Scan className="w-4 h-4 animate-pulse" />
          <span className="font-medium">Scanning...</span>
        </motion.div>
      );
    }

    if (currentDetection === 'authorized') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="security-safe border rounded-lg px-4 py-2 flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          <span className="font-medium">Authorized: {detectedUserName}</span>
        </motion.div>
      );
    }

    if (currentDetection === 'unauthorized') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="security-danger border rounded-lg px-4 py-2 flex items-center gap-2"
        >
          <UserX className="w-4 h-4" />
          <span className="font-medium">Unauthorized Person Detected!</span>
        </motion.div>
      );
    }

    return null;
  };

  if (!isSystemActive) {
    return (
      <div className="camera-frame aspect-video flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <CameraOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">System Inactive</p>
          <p className="text-sm">Enable the system to start monitoring</p>
        </div>
      </div>
    );
  }

  if (!isCameraEnabled) {
    return (
      <div className="camera-frame aspect-video flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <CameraOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Camera Disabled</p>
          <p className="text-sm">Enable camera access in settings</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="camera-frame aspect-video flex items-center justify-center">
        <div className="text-center">
          <CameraOff className="w-12 h-12 mx-auto mb-3 text-destructive opacity-70" />
          <p className="font-medium text-destructive mb-3">{error}</p>
          <Button onClick={startCamera} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-frame aspect-video relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
          <div className="text-center text-muted-foreground">
            <Camera className="w-12 h-12 mx-auto mb-3 animate-pulse" />
            <p className="font-medium">Initializing Camera...</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Scanning line */}
      {currentDetection === 'scanning' && (
        <div className="scan-line" />
      )}
      
      {/* Detection box overlay */}
      <AnimatePresence>
        {detectionBox && currentDetection !== 'none' && currentDetection !== 'scanning' && (
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
            }}
          >
            {/* Corner markers */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-inherit rounded-tl" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-inherit rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-inherit rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-inherit rounded-br" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detection label */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center">
        <AnimatePresence mode="wait">
          {renderDetectionLabel()}
        </AnimatePresence>
      </div>

      {/* Timestamp */}
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
        <span className="mono-text text-sm text-white/80">
          {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Recording indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm text-white/80 font-medium">LIVE</span>
      </div>
    </div>
  );
}
