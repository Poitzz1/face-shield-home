import { motion } from 'framer-motion';
import { Camera, Activity, Users, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CameraFeed } from '@/components/security/CameraFeed';
import { AlertBanner } from '@/components/security/AlertBanner';
import { useSecurity } from '@/context/SecurityContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusIndicator } from '@/components/security/StatusIndicator';

export default function LiveMonitoring() {
  const { 
    isSystemActive, 
    currentDetection, 
    detectedUserName,
    alerts,
    authorizedUsers 
  } = useSecurity();

  const recentDetections = alerts.slice(0, 5);

  return (
    <DashboardLayout>
      <AlertBanner />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Camera className="w-8 h-8 text-primary" />
              Live Monitoring
            </h1>
            <p className="text-muted-foreground mt-1">Real-time camera feed with face detection</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusIndicator 
              status={isSystemActive ? (currentDetection === 'unauthorized' ? 'alert' : 'active') : 'inactive'} 
              size="lg" 
              label={
                !isSystemActive 
                  ? 'System Inactive' 
                  : currentDetection === 'scanning' 
                    ? 'Scanning...' 
                    : currentDetection === 'authorized'
                      ? 'Authorized'
                      : currentDetection === 'unauthorized'
                        ? 'ALERT'
                        : 'Monitoring'
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <Card className="glass-panel border-border/50 overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Live Camera Feed
                  </CardTitle>
                  <span className="mono-text text-sm text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CameraFeed />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Current Detection Status */}
            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Detection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-xl border ${
                  currentDetection === 'none' 
                    ? 'bg-muted/30 border-border' 
                    : currentDetection === 'scanning'
                      ? 'security-scanning border'
                      : currentDetection === 'authorized'
                        ? 'security-safe border'
                        : 'security-danger border'
                }`}>
                  <div className="text-center">
                    {currentDetection === 'none' && (
                      <>
                        <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium text-muted-foreground">No Detection</p>
                        <p className="text-sm text-muted-foreground/70">Waiting for face detection</p>
                      </>
                    )}
                    {currentDetection === 'scanning' && (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Camera className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                        </motion.div>
                        <p className="font-medium text-cyan-400">Scanning Face...</p>
                        <p className="text-sm text-cyan-300/70">Analyzing for recognition</p>
                      </>
                    )}
                    {currentDetection === 'authorized' && (
                      <>
                        <Users className="w-8 h-8 mx-auto mb-2 text-green-400" />
                        <p className="font-medium text-green-400">Authorized User</p>
                        <p className="text-sm text-green-300/70">{detectedUserName}</p>
                      </>
                    )}
                    {currentDetection === 'unauthorized' && (
                      <>
                        <motion.div
                          animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <Activity className="w-8 h-8 mx-auto mb-2 text-red-400" />
                        </motion.div>
                        <p className="font-medium text-red-400">Unauthorized!</p>
                        <p className="text-sm text-red-300/70">Unknown person detected</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Detections */}
            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Detections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentDetections.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No recent detections</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentDetections.map((detection) => (
                      <div
                        key={detection.id}
                        className={`p-3 rounded-lg text-sm ${
                          detection.type === 'authorized'
                            ? 'bg-green-500/10 border border-green-500/20'
                            : 'bg-red-500/10 border border-red-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={detection.type === 'authorized' ? 'text-green-400' : 'text-red-400'}>
                            {detection.type === 'authorized' ? detection.userName : 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {detection.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Authorized Users Count */}
            <Card className="glass-panel border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{authorizedUsers.length}</p>
                    <p className="text-sm text-muted-foreground">Authorized Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
