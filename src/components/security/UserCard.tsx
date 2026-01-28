import { motion } from 'framer-motion';
import { Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AuthorizedUser } from '@/context/SecurityContext';

interface UserCardProps {
  user: AuthorizedUser;
  onRemove?: (id: string) => void;
  showRemove?: boolean;
}

export function UserCard({ user, onRemove, showRemove = true }: UserCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel rounded-xl p-4 relative group"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={user.imageUrl}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-green-500/30"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-card">
            <Check className="w-3 h-3 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{user.name}</h3>
          <p className="text-sm text-muted-foreground">
            Added {user.addedAt.toLocaleDateString()}
          </p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            Authorized
          </span>
        </div>
        {showRemove && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(user.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
