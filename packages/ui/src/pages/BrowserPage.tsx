import { BrowserView } from '../features/browser/BrowserView';
import { FormAnalysisPanel } from '../features/browser/FormAnalysisPanel';
import { SplitPanel } from '../organisms/layout/SplitPanel';
import { useBrowserContext } from '../contexts/browser/BrowserContext';

interface FormField {
  name: string;
  type: string;
  id: string;
  placeholder: string;
  required: boolean;
}

interface Form {
  fields: FormField[];
}

export function BrowserPage() {
  const { detectedForms, setDetectedForms, clearForms } = useBrowserContext();

  const handleFormDetected = (forms: Form[]) => {
    setDetectedForms(forms);
  };

  const handleNavigationChange = () => {
    clearForms();
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
}
