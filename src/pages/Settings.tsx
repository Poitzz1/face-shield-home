import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Camera, 
  Volume2, 
  VolumeX,
  Gauge,
  Power,
  Info
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertBanner } from '@/components/security/AlertBanner';
import { useSecurity } from '@/context/SecurityContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function Settings() {
  const {
    isSystemActive,
    setIsSystemActive,
    isAlarmEnabled,
    setIsAlarmEnabled,
    isCameraEnabled,
    setIsCameraEnabled,
    detectionSensitivity,
    setDetectionSensitivity,
  } = useSecurity();

  const settings = [
    {
      id: 'system',
      title: 'System Status',
      description: 'Enable or disable the entire security system',
      icon: Power,
      enabled: isSystemActive,
      onToggle: setIsSystemActive,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      id: 'camera',
      title: 'Camera Access',
      description: 'Allow the system to access your camera for face detection',
      icon: Camera,
      enabled: isCameraEnabled,
      onToggle: setIsCameraEnabled,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      id: 'alarm',
      title: 'Alarm Sound',
      description: 'Play an alarm sound when unauthorized person is detected',
      icon: isAlarmEnabled ? Volume2 : VolumeX,
      enabled: isAlarmEnabled,
      onToggle: setIsAlarmEnabled,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <DashboardLayout>
      <AlertBanner />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your security system preferences
          </p>
        </div>

        {/* Main Settings */}
        <div className="space-y-4">
          {settings.map((setting, index) => (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-panel border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${setting.bgColor}`}>
                        <setting.icon className={`w-6 h-6 ${setting.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{setting.title}</h3>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={setting.onToggle}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detection Sensitivity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                Detection Sensitivity
              </CardTitle>
              <CardDescription>
                Adjust how sensitive the face detection should be
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Sensitivity Level</Label>
                  <span className="mono-text text-primary font-medium">{detectionSensitivity}%</span>
                </div>
                <Slider
                  value={[detectionSensitivity]}
                  onValueChange={(value) => setDetectionSensitivity(value[0])}
                  min={25}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low (More False Negatives)</span>
                  <span>High (More Accurate)</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">About Detection Sensitivity</p>
                    <p>Higher sensitivity means the system will be more accurate but may take longer to process. Lower sensitivity is faster but may miss some detections.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-panel border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-mono font-medium text-foreground">v1.0.0</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Detection Engine</p>
                  <p className="font-mono font-medium text-foreground">Face-API.js</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Camera Status</p>
                  <p className={`font-medium ${isCameraEnabled ? 'text-green-400' : 'text-red-400'}`}>
                    {isCameraEnabled ? 'Connected' : 'Disabled'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">System Status</p>
                  <p className={`font-medium ${isSystemActive ? 'text-green-400' : 'text-red-400'}`}>
                    {isSystemActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
