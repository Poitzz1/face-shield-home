import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'alert';
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  label?: string;
}

export function StatusIndicator({ 
  status, 
  size = 'md', 
  showPulse = true,
  label 
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    active: 'bg-green-400',
    inactive: 'bg-muted-foreground',
    alert: 'bg-red-400',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={cn(sizeClasses[size], colorClasses[status], 'rounded-full')} />
        {showPulse && status !== 'inactive' && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full',
              colorClasses[status]
            )}
            animate={{ 
              scale: [1, 2, 1], 
              opacity: [0.5, 0, 0.5] 
            }}
            transition={{ 
              duration: status === 'alert' ? 1 : 2, 
              repeat: Infinity 
            }}
          />
        )}
      </div>
      {label && (
        <span className={cn(
          'text-sm font-medium',
          status === 'active' && 'text-green-400',
          status === 'inactive' && 'text-muted-foreground',
          status === 'alert' && 'text-red-400'
        )}>
          {label}
        </span>
      )}
    </div>
  );
}
