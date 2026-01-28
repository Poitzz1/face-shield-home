import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AuthorizedUser {
  id: string;
  name: string;
  imageUrl: string;
  addedAt: Date;
}

export interface AlertEntry {
  id: string;
  type: 'authorized' | 'unauthorized';
  userName?: string;
  timestamp: Date;
  imageSnapshot?: string;
}

interface SecurityContextType {
  isSystemActive: boolean;
  setIsSystemActive: (active: boolean) => void;
  isAlarmEnabled: boolean;
  setIsAlarmEnabled: (enabled: boolean) => void;
  isCameraEnabled: boolean;
  setIsCameraEnabled: (enabled: boolean) => void;
  detectionSensitivity: number;
  setDetectionSensitivity: (sensitivity: number) => void;
  authorizedUsers: AuthorizedUser[];
  addAuthorizedUser: (user: Omit<AuthorizedUser, 'id' | 'addedAt'>) => void;
  removeAuthorizedUser: (id: string) => void;
  alerts: AlertEntry[];
  addAlert: (alert: Omit<AlertEntry, 'id' | 'timestamp'>) => void;
  clearAlerts: () => void;
  currentDetection: 'none' | 'scanning' | 'authorized' | 'unauthorized';
  setCurrentDetection: (detection: 'none' | 'scanning' | 'authorized' | 'unauthorized') => void;
  detectedUserName: string | null;
  setDetectedUserName: (name: string | null) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const defaultAuthorizedUsers: AuthorizedUser[] = [
  {
    id: '1',
    name: 'John Smith',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    addedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    addedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Mike Chen',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    addedAt: new Date('2024-02-01'),
  },
];

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [isSystemActive, setIsSystemActive] = useState(true);
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [detectionSensitivity, setDetectionSensitivity] = useState(75);
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>(defaultAuthorizedUsers);
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [currentDetection, setCurrentDetection] = useState<'none' | 'scanning' | 'authorized' | 'unauthorized'>('none');
  const [detectedUserName, setDetectedUserName] = useState<string | null>(null);

  const addAuthorizedUser = useCallback((user: Omit<AuthorizedUser, 'id' | 'addedAt'>) => {
    const newUser: AuthorizedUser = {
      ...user,
      id: Date.now().toString(),
      addedAt: new Date(),
    };
    setAuthorizedUsers(prev => [...prev, newUser]);
  }, []);

  const removeAuthorizedUser = useCallback((id: string) => {
    setAuthorizedUsers(prev => prev.filter(user => user.id !== id));
  }, []);

  const addAlert = useCallback((alert: Omit<AlertEntry, 'id' | 'timestamp'>) => {
    const newAlert: AlertEntry = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <SecurityContext.Provider
      value={{
        isSystemActive,
        setIsSystemActive,
        isAlarmEnabled,
        setIsAlarmEnabled,
        isCameraEnabled,
        setIsCameraEnabled,
        detectionSensitivity,
        setDetectionSensitivity,
        authorizedUsers,
        addAuthorizedUser,
        removeAuthorizedUser,
        alerts,
        addAlert,
        clearAlerts,
        currentDetection,
        setCurrentDetection,
        detectedUserName,
        setDetectedUserName,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
