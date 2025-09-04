// This script runs in the webview context
// It can access the DOM but has limited Node.js access

interface FormField {
  id: string;
  name: string;
  type: string;
  placeholder?: string | undefined;
  required: boolean;
  value: string;
  label?: string | null;
}

interface FormInfo {
  id?: string;
  name?: string;
  action?: string;
  method?: string;
  fields: FormField[];
}

interface FormData {
  forms: FormInfo[];
  url: string;
  timestamp: number;
}

// Function to extract form data from the page
function extractForms(): FormData {
  const forms: FormInfo[] = [];

  document.querySelectorAll('form').forEach((form) => {
    const formData = {
      id: form.id,
      name: form.name,
      action: form.action,
      method: form.method,
      fields: [] as FormField[],
    };

    // Extract all form fields
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      const htmlField = field as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement;
      const fieldType =
        htmlField instanceof HTMLInputElement
          ? htmlField.type
          : htmlField.tagName.toLowerCase();
      if (fieldType === 'hidden' || fieldType === 'submit') return;

      const fieldData: FormField = {
        id: htmlField.id,
        name: htmlField.name,
        type: fieldType,
        placeholder:
          htmlField instanceof HTMLInputElement ||
          htmlField instanceof HTMLTextAreaElement
            ? htmlField.placeholder || undefined
            : undefined,
        required: htmlField.required,
        value: htmlField.value,
        label: null,
      };

      // Try to find associated label
      if (htmlField.id) {
        const label = document.querySelector(`label[for="${htmlField.id}"]`);
        if (label) {
          fieldData.label = label.textContent?.trim() || null;
        }
      }

      formData.fields.push(fieldData);
    });

    if (formData.fields.length > 0) {
      forms.push(formData);
    }
  });

  // Also check for standalone inputs (common in SPAs)
  const standaloneFields: FormField[] = [];
  document.querySelectorAll('input, select, textarea').forEach((field) => {
    const htmlField = field as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    if (!htmlField.closest('form')) {
      const fieldType =
        htmlField instanceof HTMLInputElement
          ? htmlField.type
          : htmlField.tagName.toLowerCase();
      if (fieldType === 'hidden' || fieldType === 'submit') return;

      standaloneFields.push({
        id: htmlField.id,
        name: htmlField.name,
        type: fieldType,
        placeholder:
          htmlField instanceof HTMLInputElement ||
          htmlField instanceof HTMLTextAreaElement
            ? htmlField.placeholder || undefined
            : undefined,
        required: htmlField.required,
        value: htmlField.value,
        label: null,
      });
    }
  });

  if (standaloneFields.length > 0) {
    forms.push({
      fields: standaloneFields,
    });
  }

  return {
    forms,
    url: window.location.href,
    timestamp: Date.now(),
  };
}

interface ElectronAPI {
  onFormDataRequest: (callback: () => FormData) => void;
  sendFormData: (data: FormData) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// Set up message handler for IPC
if (window.electronAPI) {
  const api = window.electronAPI;

  // Send form data when requested
  api.onFormDataRequest(() => {
    return extractForms();
  });

  // Auto-detect forms on page load
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const formData = extractForms();
      if (formData.forms.length > 0) {
        api.sendFormData(formData);
      }
    }, 1000); // Small delay to ensure dynamic content loads
  });

  // Monitor for form changes (for SPAs)
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const hasFormElements = Array.from(mutation.addedNodes).some((node) => {
          const element = node as Element;
          return (
            element.nodeType === 1 &&
            (element.tagName === 'FORM' ||
              element.tagName === 'INPUT' ||
              element.querySelector?.('form, input, select, textarea'))
          );
        });
        if (hasFormElements) {
          shouldCheck = true;
          break;
        }
      }
    }

    if (shouldCheck) {
      setTimeout(() => {
        const formData = extractForms();
        api.sendFormData(formData);
      }, 500);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Export for testing
export { extractForms };
