import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Camera, 
  Users, 
  AlertTriangle, 
  Settings, 
  LayoutDashboard,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSecurity } from '@/context/SecurityContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/monitoring', label: 'Live Monitoring', icon: Camera },
  { path: '/users', label: 'Authorized Users', icon: Users },
  { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Navbar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isSystemActive, alerts } = useSecurity();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unauthorizedAlerts = alerts.filter(a => a.type === 'unauthorized').length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary" />
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="font-bold text-lg hidden sm:block">SecureVision</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const showBadge = item.path === '/alerts' && unauthorizedAlerts > 0;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'nav-link flex items-center gap-2 rounded-lg relative',
                    isActive && 'active bg-white/5'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {unauthorizedAlerts}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* System Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
              <div className={cn(
                'w-2 h-2 rounded-full',
                isSystemActive ? 'bg-green-400' : 'bg-red-400'
              )}>
                <motion.div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isSystemActive ? 'bg-green-400' : 'bg-red-400'
                  )}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {isSystemActive ? 'System Active' : 'System Inactive'}
              </span>
            </div>

            {/* User */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden glass-panel border-t border-white/5"
        >
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const showBadge = item.path === '/alerts' && unauthorizedAlerts > 0;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative',
                    isActive ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {showBadge && (
                    <span className="ml-auto w-6 h-6 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {unauthorizedAlerts}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start gap-3 text-muted-foreground"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
