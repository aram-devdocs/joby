import { BrowserView } from '../features/browser/BrowserView';
import { InteractiveFormPanel } from '../organisms/InteractiveFormPanel';
import { SplitPanel } from '../organisms/layout/SplitPanel';
import { useBrowserContext } from '../contexts/browser/BrowserContext';
import { useFormFieldSelection } from '../hooks/useFormFieldSelection';
import { useFieldSync } from '../hooks/useFieldSync';

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

export interface BrowserPageProps {
  onGetLLMStatus?: () => Promise<{
    status:
      | 'disconnected'
      | 'connecting'
      | 'connected'
      | 'processing'
      | 'error';
    message?: string;
  }>;
  onGetEnhancementDetails?: (fieldId: string) => Promise<
    | {
        prompt?: string;
        response?: string;
        confidence?: number;
        fieldType?: string;
      }
    | undefined
  >;
}

export function BrowserPage({
  onGetLLMStatus,
  onGetEnhancementDetails,
}: BrowserPageProps = {}) {
  const {
    detectedForms,
    setDetectedForms,
    clearForms,
    initializeInteractiveFields,
  } = useBrowserContext();
  // These hooks are initialized but not used yet - they will be connected
  // when we add click handling and manual sync controls
  useFormFieldSelection({
    autoFocusOnSelect: true,
  });
  useFieldSync({
    autoSync: true,
    debounceMs: 500,
  });

  const handleFormDetected = (forms: Form[]) => {
    setDetectedForms(forms);
    // Initialize interactive fields for the detected forms
    const allFields = forms.flatMap((form) => form.fields);
    initializeInteractiveFields(allFields);
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
        right={
          <InteractiveFormPanel
            forms={detectedForms}
            onGetLLMStatus={onGetLLMStatus}
            onGetEnhancementDetails={onGetEnhancementDetails}
          />
        }
        defaultSplit={65}
        minSize={30}
      />
    </div>
  );
}
