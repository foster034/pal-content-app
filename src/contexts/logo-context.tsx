'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LogoContextType {
  mainLogo: string;
  setMainLogo: (logo: string) => void;
  resetLogo: () => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

const DEFAULT_LOGO = '/images/pop-a-lock-logo.svg';
const LOGO_STORAGE_KEY = 'app-main-logo';

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [mainLogo, setMainLogoState] = useState<string>(DEFAULT_LOGO);

  // Load logo from localStorage on mount
  useEffect(() => {
    const savedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (savedLogo) {
      setMainLogoState(savedLogo);
    }
  }, []);

  const setMainLogo = (logo: string) => {
    setMainLogoState(logo);
    localStorage.setItem(LOGO_STORAGE_KEY, logo);
  };

  const resetLogo = () => {
    setMainLogoState(DEFAULT_LOGO);
    localStorage.removeItem(LOGO_STORAGE_KEY);
  };

  const value = {
    mainLogo,
    setMainLogo,
    resetLogo,
  };

  return (
    <LogoContext.Provider value={value}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
}