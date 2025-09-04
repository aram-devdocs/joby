// Core components (atomic design - atoms)
export * from "./core";

// Layout components
export { SplitPanel } from "./components/layout/SplitPanel";
export { Sidebar } from "./components/layout/Sidebar";
export type { SidebarItem } from "./components/layout/Sidebar";

// Features
export * from "./features/browser";

// Pages
export { BrowserPage } from "./pages/BrowserPage";
export { OllamaPage } from "./pages/OllamaPage";
export type { OllamaPageProps } from "./pages/OllamaPage";

// Templates
export { DashboardTemplate } from "./templates/DashboardTemplate";

// Legacy components (to be refactored)
export { Button as LegacyButton } from "./components/Button";
export type { ButtonProps as LegacyButtonProps } from "./components/Button";

export { HelloWorld } from "./components/HelloWorld";
export type { HelloWorldProps } from "./components/HelloWorld";

export { Input as LegacyInput } from "./components/Input";
export type { InputProps as LegacyInputProps } from "./components/Input";

export { Select } from "./components/Select";
export type { SelectProps, SelectOption } from "./components/Select";

export { TextArea } from "./components/TextArea";
export type { TextAreaProps } from "./components/TextArea";

export { Card as LegacyCard } from "./components/Card";
export type { CardProps as LegacyCardProps } from "./components/Card";

export { OllamaChat } from "./components/OllamaChat";
export type { OllamaChatProps } from "./components/OllamaChat";

// Utils
export { cn } from "./lib/utils";
