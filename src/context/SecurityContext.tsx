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

const defaultAuthorizedUsers: AuthorizedUser[] = [];

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
