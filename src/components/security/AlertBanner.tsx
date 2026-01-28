import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSecurity } from '@/context/SecurityContext';

export function AlertBanner() {
  const { 
    currentDetection, 
    isAlarmEnabled, 
    setIsAlarmEnabled,
    setCurrentDetection 
  } = useSecurity();

  const isAlert = currentDetection === 'unauthorized';

  return (
    <AnimatePresence>
      {isAlert && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-20 left-4 right-4 z-40 max-w-2xl mx-auto"
        >
          <div className="security-danger border rounded-xl p-4 glow-danger">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                >
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-red-400">Security Alert!</h3>
                  <p className="text-sm text-red-300/80">
                    ⚠ Unauthorized person detected! Security alert triggered.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAlarmEnabled(!isAlarmEnabled)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  {isAlarmEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentDetection('none')}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
