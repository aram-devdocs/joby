import React, { createContext, useContext, useState, useCallback } from 'react';

export interface FormField {
  name?: string;
  type: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
}

export interface FormData {
  fields: FormField[];
}

export interface BrowserAPI {
  detectJobSite?: (url: string) => Promise<string | null>;
}

interface BrowserContextValue {
  detectedForms: FormData[];
  setDetectedForms: (forms: FormData[]) => void;
  clearForms: () => void;
  browserAPI?: BrowserAPI;
  setBrowserAPI: (api: BrowserAPI) => void;
}

const BrowserContext = createContext<BrowserContextValue | undefined>(
  undefined,
);

export function BrowserProvider({
  children,
  browserAPI: initialAPI,
}: {
  children: React.ReactNode;
  browserAPI?: BrowserAPI;
}) {
  const [detectedForms, setDetectedForms] = useState<FormData[]>([]);
  const [browserAPI, setBrowserAPI] = useState<BrowserAPI | undefined>(
    initialAPI,
  );

  const clearForms = useCallback(() => {
    setDetectedForms([]);
  }, []);

  const value: BrowserContextValue = {
    detectedForms,
    setDetectedForms,
    clearForms,
    ...(browserAPI && { browserAPI }),
    setBrowserAPI,
  };

  return (
    <BrowserContext.Provider value={value}>{children}</BrowserContext.Provider>
  );
}

export function useBrowserContext() {
  const context = useContext(BrowserContext);
  if (!context) {
    throw new Error('useBrowserContext must be used within a BrowserProvider');
  }
  return context;
}
