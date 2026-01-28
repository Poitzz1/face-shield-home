import { motion } from 'framer-motion';
import { 
  Shield, 
  Camera, 
  Users, 
  AlertTriangle, 
  Activity,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSecurity } from '@/context/SecurityContext';
import { StatusIndicator } from '@/components/security/StatusIndicator';
import { AlertBanner } from '@/components/security/AlertBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { 
    isSystemActive, 
    setIsSystemActive,
    authorizedUsers, 
    alerts,
    currentDetection 
  } = useSecurity();

  const recentAlerts = alerts.slice(0, 5);
  const unauthorizedCount = alerts.filter(a => a.type === 'unauthorized').length;
  const authorizedCount = alerts.filter(a => a.type === 'authorized').length;

  const stats = [
    {
      title: 'System Status',
      value: isSystemActive ? 'Active' : 'Inactive',
      icon: Shield,
      color: isSystemActive ? 'text-green-400' : 'text-red-400',
      bgColor: isSystemActive ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      title: 'Authorized Users',
      value: authorizedUsers.length.toString(),
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Today\'s Detections',
      value: alerts.length.toString(),
      icon: Camera,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Security Alerts',
      value: unauthorizedCount.toString(),
      icon: AlertTriangle,
      color: unauthorizedCount > 0 ? 'text-red-400' : 'text-green-400',
      bgColor: unauthorizedCount > 0 ? 'bg-red-500/10' : 'bg-green-500/10',
    },
  ];

  return (
    <DashboardLayout>
      <AlertBanner />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Security Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor your home security in real-time</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusIndicator 
              status={isSystemActive ? 'active' : 'inactive'} 
              size="lg" 
              label={isSystemActive ? 'System Active' : 'System Inactive'}
            />
            <Button
              variant={isSystemActive ? 'outline' : 'default'}
              onClick={() => setIsSystemActive(!isSystemActive)}
              className={isSystemActive ? 'border-destructive text-destructive hover:bg-destructive/10' : ''}
            >
              {isSystemActive ? 'Disable System' : 'Enable System'}
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-panel border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="glass-panel border-border/50 h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/monitoring">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    <span>Open Live Monitoring</span>
                  </Button>
                </Link>
                <Link to="/users">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <Users className="w-5 h-5 text-primary" />
                    <span>Manage Authorized Users</span>
                  </Button>
                </Link>
                <Link to="/alerts">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <span>View All Alerts</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass-panel border-border/50 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <Link to="/alerts">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No recent activity</p>
                    <p className="text-sm mt-1">Detections will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAlerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-3 rounded-lg ${
                          alert.type === 'authorized' 
                            ? 'bg-green-500/5 border border-green-500/20' 
                            : 'bg-red-500/5 border border-red-500/20'
                        }`}
                      >
                        {alert.type === 'authorized' ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${
                            alert.type === 'authorized' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {alert.type === 'authorized' 
                              ? `${alert.userName} verified` 
                              : 'Unauthorized person detected'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Current Status Banner */}
        {currentDetection !== 'none' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-xl border ${
              currentDetection === 'authorized' 
                ? 'bg-green-500/10 border-green-500/30 glow-safe' 
                : currentDetection === 'unauthorized'
                ? 'bg-red-500/10 border-red-500/30 glow-danger'
                : 'bg-cyan-500/10 border-cyan-500/30'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {currentDetection === 'authorized' && (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <div>
                      <h3 className="font-semibold text-green-400">Authorized Access</h3>
                      <p className="text-sm text-green-300/70">Person verified and granted entry</p>
                    </div>
                  </>
                )}
                {currentDetection === 'unauthorized' && (
                  <>
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                    <div>
                      <h3 className="font-semibold text-red-400">Security Alert</h3>
                      <p className="text-sm text-red-300/70">Unrecognized person detected</p>
                    </div>
                  </>
                )}
                {currentDetection === 'scanning' && (
                  <>
                    <Camera className="w-8 h-8 text-cyan-400 animate-pulse" />
                    <div>
                      <h3 className="font-semibold text-cyan-400">Scanning...</h3>
                      <p className="text-sm text-cyan-300/70">Analyzing face for recognition</p>
                    </div>
                  </>
                )}
              </div>
              <Link to="/monitoring">
                <Button variant="outline" className="border-white/20">
                  View Camera Feed
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
