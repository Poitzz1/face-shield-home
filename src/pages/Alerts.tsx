import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  Volume2,
  VolumeX,
  Filter
} from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertBanner } from '@/components/security/AlertBanner';
import { useSecurity } from '@/context/SecurityContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FilterType = 'all' | 'authorized' | 'unauthorized';

export default function Alerts() {
  const { alerts, clearAlerts, isAlarmEnabled, setIsAlarmEnabled } = useSecurity();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.type === filter;
  });

  const unauthorizedCount = alerts.filter(a => a.type === 'unauthorized').length;
  const authorizedCount = alerts.filter(a => a.type === 'authorized').length;

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
              <AlertTriangle className="w-8 h-8 text-warning" />
              Security Alerts
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage all security notifications
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAlarmEnabled(!isAlarmEnabled)}
              className={isAlarmEnabled ? '' : 'border-muted-foreground/50 text-muted-foreground'}
            >
              {isAlarmEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Alarm On
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Alarm Off
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={clearAlerts}
              disabled={alerts.length === 0}
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Active Alert Banner */}
        {unauthorizedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="security-danger border rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </motion.div>
              <div>
                <p className="font-semibold text-red-400">
                  {unauthorizedCount} Unauthorized Access Attempt{unauthorizedCount > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-red-300/70">
                  Review the alerts below for security incidents
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="glass-panel border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted/50">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-panel border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{authorizedCount}</p>
                  <p className="text-sm text-muted-foreground">Authorized</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-panel border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-500/10">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{unauthorizedCount}</p>
                  <p className="text-sm text-muted-foreground">Unauthorized</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="glass-panel border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
                <SelectTrigger className="w-48 bg-muted/50 border-border">
                  <SelectValue placeholder="Filter alerts" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="authorized">Authorized Only</SelectItem>
                  <SelectItem value="unauthorized">Unauthorized Only</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {filteredAlerts.length} of {alerts.length} alerts
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Detection History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-lg font-medium text-muted-foreground">No alerts to display</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {filter !== 'all' ? 'Try changing the filter' : 'Detection alerts will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      alert.type === 'authorized'
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      alert.type === 'authorized' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {alert.type === 'authorized' ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-medium ${
                        alert.type === 'authorized' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {alert.type === 'authorized'
                          ? `Authorized Access - ${alert.userName}`
                          : 'Unauthorized Person Detected'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {alert.type === 'authorized'
                          ? 'User successfully verified and granted access'
                          : '⚠ Security alert triggered - Unknown person detected'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="mono-text text-sm text-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
