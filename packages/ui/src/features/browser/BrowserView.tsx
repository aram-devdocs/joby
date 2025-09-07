import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Badge, Card, CardHeader, CardTitle } from '../../atoms';
import { Globe, CheckCircle, Loader2 } from 'lucide-react';
import {
  useBrowserContext,
  type BrowserAPI,
} from '../../contexts/browser/BrowserContext';
import type {
  WebviewElement,
  NavigationEvent,
  PageTitleEvent,
} from '../../types/electron-webview';

interface FormField {
  name: string;
  type: string;
  id: string;
  placeholder: string;
  required: boolean;
  value?: string;
  selector?: string;
}

interface Form {
  fields: FormField[];
}

interface BrowserViewProps {
  onFormDetected?: (forms: Form[]) => void;
  onNavigationChange?: () => void;
}

export const BrowserView: React.FC<BrowserViewProps> = ({
  onFormDetected,
  onNavigationChange,
}) => {
  const { browserAPI, setBrowserAPI } = useBrowserContext();
  const webviewRef = useRef<WebviewElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [currentUrl, setCurrentUrl] = useState('http://localhost:3001');
  const [inputUrl, setInputUrl] = useState('http://localhost:3001');
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jobSite, setJobSite] = useState<string | null>(null);

  // Create a stable executeScript function
  const executeScript = useCallback(async (script: string) => {
    const currentWebview = webviewRef.current;
    if (!currentWebview) throw new Error('Webview not available');
    return currentWebview.executeJavaScript(script);
  }, []);

  // Set up the executeScript function once when webview is ready
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    // Only update if executeScript is missing from the API
    if (!browserAPI?.executeScript) {
      const newBrowserAPI: BrowserAPI = {
        ...browserAPI,
        executeScript,
      };
      setBrowserAPI(newBrowserAPI);
    }
  }, [setBrowserAPI, executeScript, browserAPI]); // Only re-run if executeScript function changes

  // Set up webview event handlers
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    // Add error handling for webview
    const handleDidFailLoad = () => {
      setIsLoading(false);
    };

    const handleDOMReady = async () => {
      setIsLoading(false);

      // Use the enhanced form analyzer from main process instead of client-side script
      try {
        const html = await webview.executeJavaScript<string>(
          'document.documentElement.outerHTML',
        );
        const pageTitle =
          await webview.executeJavaScript<string>('document.title');
        const url = webview.getURL();

        // Use IPC to analyze HTML with enhancement service
        if (window.electronAPI?.browser?.analyzeHTML) {
          const { forms } = await window.electronAPI.browser.analyzeHTML(
            html,
            url,
            pageTitle,
          );

          if (forms.length > 0 && onFormDetected) {
            // Pass through all FormField data including enhancement information
            const convertedForms = forms.map((formInfo) => ({
              fields: formInfo.fields.map((field) => ({
                name: field.name || '',
                type: field.type || 'text',
                id: field.id || '',
                placeholder: field.placeholder || '',
                required: field.required || false,
                value: field.value || '',
                selector: field.selector || '',
                // Pass through all enhanced form field properties
                inputType: field.inputType,
                label: field.label,
                options: field.options,
                xpath: field.xpath,
                position: field.position,
                attributes: field.attributes,
                section: field.section,
                validationRules: field.validationRules,
                pattern: field.pattern,
                minLength: field.minLength,
                maxLength: field.maxLength,
                min: field.min,
                max: field.max,
                step: field.step,
                multiple: field.multiple,
                checked: field.checked,
                autocomplete: field.autocomplete,
                enhancement: field.enhancement, // This is the key enhancement data!
              })),
            }));
            onFormDetected(convertedForms);
          }
        } else {
          // Fallback to basic form detection if IPC not available
          const forms = await webview.executeJavaScript<Form[]>(`
            (function() {
              const forms = [];
              
              // Helper to generate CSS selector for an element
              function getSelector(element) {
                if (element.id) {
                  return '#' + CSS.escape(element.id);
                }
                if (element.name) {
                  return element.tagName.toLowerCase() + '[name="' + CSS.escape(element.name) + '"]';
                }
                // Fallback to tag and index
                const parent = element.parentElement;
                const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
                const index = siblings.indexOf(element);
                return element.tagName.toLowerCase() + ':nth-of-type(' + (index + 1) + ')';
              }
              
              document.querySelectorAll('form').forEach(form => {
                const fields = [];
                form.querySelectorAll('input, select, textarea').forEach(field => {
                  if (field.type !== 'hidden' && field.type !== 'submit' && field.type !== 'button') {
                    fields.push({
                      name: field.name || '',
                      type: field.type || field.tagName.toLowerCase(),
                      id: field.id || '',
                      placeholder: field.placeholder || '',
                      required: field.required || false,
                      value: field.value || '',
                      selector: getSelector(field)
                    });
                  }
                });
                if (fields.length > 0) {
                  forms.push({ fields });
                }
              });
              
              // Also check for fields outside forms (common in SPAs)
              const orphanFields = [];
              document.querySelectorAll('input, select, textarea').forEach(field => {
                const inForm = field.closest('form');
                if (!inForm && field.type !== 'hidden' && field.type !== 'submit' && field.type !== 'button') {
                  orphanFields.push({
                    name: field.name || '',
                    type: field.type || field.tagName.toLowerCase(),
                    id: field.id || '',
                    placeholder: field.placeholder || '',
                    required: field.required || false,
                    value: field.value || '',
                    selector: getSelector(field)
                  });
                }
              });
              
              if (orphanFields.length > 0) {
                forms.push({ fields: orphanFields });
              }
              
              return forms;
            })()
          `);

          if (forms.length > 0 && onFormDetected) {
            onFormDetected(forms);
          }
        }
      } catch {
        // If analysis fails, still continue normal page load
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleLoadStop = () => {
      setIsLoading(false);
    };

    const handleDidNavigate = (event: NavigationEvent) => {
      const url = event.url || webview.getURL();
      setCurrentUrl(url);
      setInputUrl(url);

      // Detect job site
      if (browserAPI?.detectJobSite) {
        browserAPI
          .detectJobSite(url)
          .then((site: string | null) => {
            setJobSite(site);
          })
          .catch(() => {
            // Silently handle job site detection errors
          });
      }

      if (onNavigationChange) {
        onNavigationChange();
      }
    };

    const handleDidNavigateInPage = (event: NavigationEvent) => {
      const url = event.url || webview.getURL();
      setCurrentUrl(url);
      setInputUrl(url);

      // Detect job site
      if (browserAPI?.detectJobSite) {
        browserAPI
          .detectJobSite(url)
          .then((site: string | null) => {
            setJobSite(site);
          })
          .catch(() => {
            // Silently handle job site detection errors
          });
      }

      if (onNavigationChange) {
        onNavigationChange();
      }
    };

    const handlePageTitleUpdated = (event: PageTitleEvent) => {
      setPageTitle(event.title);
      if (onNavigationChange) {
        onNavigationChange();
      }
    };

    webview.addEventListener('dom-ready', handleDOMReady);
    webview.addEventListener('did-start-loading', handleLoadStart);
    webview.addEventListener('did-stop-loading', handleLoadStop);
    webview.addEventListener('did-fail-load', handleDidFailLoad);
    webview.addEventListener('did-navigate', handleDidNavigate);
    webview.addEventListener('did-navigate-in-page', handleDidNavigateInPage);
    webview.addEventListener('page-title-updated', handlePageTitleUpdated);

    return () => {
      webview.removeEventListener('dom-ready', handleDOMReady);
      webview.removeEventListener('did-start-loading', handleLoadStart);
      webview.removeEventListener('did-stop-loading', handleLoadStop);
      webview.removeEventListener('did-fail-load', handleDidFailLoad);
      webview.removeEventListener('did-navigate', handleDidNavigate);
      webview.removeEventListener(
        'did-navigate-in-page',
        handleDidNavigateInPage,
      );
      webview.removeEventListener('page-title-updated', handlePageTitleUpdated);
    };
  }, [onFormDetected, onNavigationChange, browserAPI]);

  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (webviewRef.current) {
      let url = inputUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      webviewRef.current.src = url;
      setCurrentUrl(url);
      setInputUrl(url);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading...
        </Badge>
      );
    }

    if (jobSite) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {jobSite.charAt(0).toUpperCase() + jobSite.slice(1)} Detected
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Globe className="h-3 w-3" />
        Ready
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="border-b rounded-none">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Browser
            </CardTitle>
            {getStatusBadge()}
          </div>
          <form onSubmit={handleUrlSubmit} className="mt-2">
            <div className="flex gap-2">
              <input
                ref={urlInputRef}
                type="text"
                value={inputUrl}
                onChange={handleUrlChange}
                placeholder="Enter URL..."
                className="flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
              >
                Go
              </button>
            </div>
          </form>
          {pageTitle && (
            <p className="text-xs text-gray-600 mt-2 truncate">{pageTitle}</p>
          )}
        </CardHeader>
      </Card>

      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}
        <webview
          ref={webviewRef}
          src={currentUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          partition="persist:joby"
          webpreferences="contextIsolation=yes,nodeIntegration=no"
          {...({ allowpopups: 'true' } as Record<string, string>)}
        />
      </div>
    </div>
  );
};
