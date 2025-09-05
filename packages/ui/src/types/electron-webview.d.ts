// Type definitions for Electron's webview element
// These types are used in the BrowserView component

declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<WebviewHTMLAttributes, WebviewElement>;
    }
  }
}

export interface WebviewHTMLAttributes
  extends React.HTMLAttributes<WebviewElement> {
  src?: string;
  partition?: string;
  allowpopups?: boolean | string;
  webpreferences?: string;
  httpreferrer?: string;
  useragent?: string;
  nodeintegration?: string;
  nodeintegrationinsubframes?: string;
  plugins?: string;
  preload?: string;
  enableremotemodule?: string;
}

export interface WebviewElement extends HTMLElement {
  // Properties
  src: string;

  // Navigation methods
  loadURL(url: string): void;
  reload(): void;
  goBack(): void;
  goForward(): void;
  stop(): void;
  getURL(): string;
  getTitle(): string;

  // Script execution
  executeJavaScript<T = unknown>(code: string): Promise<T>;

  // Event methods (inherited from HTMLElement but typed for clarity)
  addEventListener(
    type:
      | 'dom-ready'
      | 'did-start-loading'
      | 'did-stop-loading'
      | 'did-fail-load',
    listener: () => void,
  ): void;
  addEventListener(
    type: 'did-navigate' | 'did-navigate-in-page',
    listener: (event: NavigationEvent) => void,
  ): void;
  addEventListener(
    type: 'page-title-updated',
    listener: (event: PageTitleEvent) => void,
  ): void;

  removeEventListener(
    type:
      | 'dom-ready'
      | 'did-start-loading'
      | 'did-stop-loading'
      | 'did-fail-load',
    listener: () => void,
  ): void;
  removeEventListener(
    type: 'did-navigate' | 'did-navigate-in-page',
    listener: (event: NavigationEvent) => void,
  ): void;
  removeEventListener(
    type: 'page-title-updated',
    listener: (event: PageTitleEvent) => void,
  ): void;
}

export interface NavigationEvent {
  url: string;
  isMainFrame?: boolean;
  frameProcessId?: number;
  frameRoutingId?: number;
}

export interface PageTitleEvent {
  title: string;
  explicitSet: boolean;
}
