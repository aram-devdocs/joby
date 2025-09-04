// This script runs in the webview context
// It can access the DOM but has limited Node.js access

interface FormData {
  forms: any[];
  url: string;
  timestamp: number;
}

// Function to extract form data from the page
function extractForms(): FormData {
  const forms: any[] = [];

  document.querySelectorAll("form").forEach((form) => {
    const formData = {
      id: form.id,
      name: form.name,
      action: form.action,
      method: form.method,
      fields: [] as any[],
    };

    // Extract all form fields
    form.querySelectorAll("input, select, textarea").forEach((field: any) => {
      if (field.type === "hidden" || field.type === "submit") return;

      const fieldData = {
        id: field.id,
        name: field.name,
        type: field.type || field.tagName.toLowerCase(),
        placeholder: field.placeholder,
        required: field.required,
        value: field.value,
        label: null as string | null,
      };

      // Try to find associated label
      if (field.id) {
        const label = document.querySelector(`label[for="${field.id}"]`);
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
  const standaloneFields: any[] = [];
  document.querySelectorAll("input, select, textarea").forEach((field: any) => {
    if (!field.closest("form")) {
      if (field.type === "hidden" || field.type === "submit") return;

      standaloneFields.push({
        id: field.id,
        name: field.name,
        type: field.type || field.tagName.toLowerCase(),
        placeholder: field.placeholder,
        required: field.required,
        value: field.value,
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

// Set up message handler for IPC
if ((window as any).electronAPI) {
  const api = (window as any).electronAPI;

  // Send form data when requested
  api.onFormDataRequest(() => {
    return extractForms();
  });

  // Auto-detect forms on page load
  window.addEventListener("DOMContentLoaded", () => {
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
      if (mutation.type === "childList") {
        const hasFormElements = Array.from(mutation.addedNodes).some(
          (node: any) =>
            node.nodeType === 1 &&
            (node.tagName === "FORM" ||
              node.tagName === "INPUT" ||
              node.querySelector?.("form, input, select, textarea")),
        );
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
