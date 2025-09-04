import { useState, useCallback } from 'react';

export interface BrowserNavigationState {
  currentUrl: string;
  inputUrl: string;
  pageTitle: string;
  isLoading: boolean;
  jobSite: string | null;
}

export interface BrowserNavigationActions {
  setCurrentUrl: (url: string) => void;
  setInputUrl: (url: string) => void;
  setPageTitle: (title: string) => void;
  setIsLoading: (loading: boolean) => void;
  setJobSite: (site: string | null) => void;
  handleUrlSubmit: (url: string) => string;
}

export function useBrowserNavigation(
  initialUrl = 'https://www.google.com',
): [BrowserNavigationState, BrowserNavigationActions] {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jobSite, setJobSite] = useState<string | null>(null);

  const handleUrlSubmit = useCallback((url: string): string => {
    let processedUrl = url;
    if (
      !processedUrl.startsWith('http://') &&
      !processedUrl.startsWith('https://')
    ) {
      processedUrl = `https://${processedUrl}`;
    }
    setCurrentUrl(processedUrl);
    setInputUrl(processedUrl);
    return processedUrl;
  }, []);

  const state: BrowserNavigationState = {
    currentUrl,
    inputUrl,
    pageTitle,
    isLoading,
    jobSite,
  };

  const actions: BrowserNavigationActions = {
    setCurrentUrl,
    setInputUrl,
    setPageTitle,
    setIsLoading,
    setJobSite,
    handleUrlSubmit,
  };

  return [state, actions];
}
