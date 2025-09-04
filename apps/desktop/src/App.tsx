import React, { useState } from "react";
import { BrowserView } from "./components/BrowserView";
import { FormAnalysisPanel } from "./components/FormAnalysisPanel";
import { SplitPanel } from "./components/SplitPanel";

export const App: React.FC = () => {
  const [detectedForms, setDetectedForms] = useState<any[]>([]);

  const handleFormDetected = (forms: any[]) => {
    setDetectedForms(forms);
  };

  const handleNavigationChange = () => {
    // Clear forms when navigating to a new page
    setDetectedForms([]);
  };

  return (
    <div className="h-screen bg-gray-50">
      <SplitPanel
        left={
          <BrowserView
            onFormDetected={handleFormDetected}
            onNavigationChange={handleNavigationChange}
          />
        }
        right={<FormAnalysisPanel forms={detectedForms} />}
        defaultSplit={65}
        minSize={30}
      />
    </div>
  );
};
