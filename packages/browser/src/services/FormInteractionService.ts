import { EventEmitter } from 'events';
import type { FormField } from './BrowserService';

export interface FieldUpdate {
  selector: string;
  value: string;
  fieldId?: string;
}

export interface TypingOptions {
  minDelay?: number; // Minimum delay between keystrokes (ms)
  maxDelay?: number; // Maximum delay between keystrokes (ms)
  clearFirst?: boolean; // Clear field before typing
  simulateFocus?: boolean; // Simulate focus events
  simulateBlur?: boolean; // Simulate blur events
}

export class FormInteractionService extends EventEmitter {
  private typingDefaults: TypingOptions = {
    minDelay: 50,
    maxDelay: 150,
    clearFirst: true,
    simulateFocus: true,
    simulateBlur: true,
  };

  /**
   * Generate JavaScript code to safely update a form field
   * This code will be executed in the webview context
   */
  generateFieldUpdateScript(
    field: FormField,
    value: string,
    options: TypingOptions = {},
  ): string {
    const opts = { ...this.typingDefaults, ...options };
    const selector = this.getBestSelector(field);

    return `
      (async function updateField() {
        const selector = ${JSON.stringify(selector)};
        const value = ${JSON.stringify(value)};
        const options = ${JSON.stringify(opts)};
        
        // Find the element
        const element = document.querySelector(selector);
        if (!element) {
          throw new Error('Field not found: ' + selector);
        }
        
        // Helper to dispatch realistic events
        function dispatchEvent(el, eventType, options = {}) {
          const event = new Event(eventType, {
            bubbles: true,
            cancelable: true,
            ...options
          });
          el.dispatchEvent(event);
        }
        
        // Helper to dispatch keyboard events
        function dispatchKeyEvent(el, eventType, key) {
          const event = new KeyboardEvent(eventType, {
            key: key,
            code: 'Key' + key.toUpperCase(),
            keyCode: key.charCodeAt(0),
            bubbles: true,
            cancelable: true
          });
          el.dispatchEvent(event);
        }
        
        // Simulate human-like typing
        async function typeText(el, text, delays) {
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Dispatch keydown
            dispatchKeyEvent(el, 'keydown', char);
            
            // Update value incrementally
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              'value'
            ).set;
            nativeInputValueSetter.call(el, el.value + char);
            
            // Dispatch input event
            dispatchEvent(el, 'input', {
              data: char,
              inputType: 'insertText'
            });
            
            // Dispatch keyup
            dispatchKeyEvent(el, 'keyup', char);
            
            // Random delay between keystrokes
            if (i < text.length - 1) {
              await new Promise(resolve => setTimeout(resolve, delays[i]));
            }
          }
        }
        
        // Generate random delays for each character
        const delays = Array.from({ length: value.length }, () => 
          options.minDelay + Math.random() * (options.maxDelay - options.minDelay)
        );
        
        // Focus the element
        if (options.simulateFocus) {
          element.focus();
          dispatchEvent(element, 'focus');
          dispatchEvent(element, 'focusin');
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Clear field if requested
        if (options.clearFirst && element.value) {
          // Select all text
          element.select();
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Delete selected text
          dispatchKeyEvent(element, 'keydown', 'Delete');
          element.value = '';
          dispatchEvent(element, 'input', { inputType: 'deleteContentBackward' });
          dispatchKeyEvent(element, 'keyup', 'Delete');
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Type the new value
        await typeText(element, value, delays);
        
        // Dispatch change event
        dispatchEvent(element, 'change');
        
        // Blur the element
        if (options.simulateBlur) {
          await new Promise(resolve => setTimeout(resolve, 100));
          dispatchEvent(element, 'blur');
          dispatchEvent(element, 'focusout');
          element.blur();
        }
        
        return {
          success: true,
          selector: selector,
          value: element.value
        };
      })();
    `;
  }

  /**
   * Generate JavaScript to focus a field
   */
  generateFieldFocusScript(field: FormField): string {
    const selector = this.getBestSelector(field);

    return `
      (function focusField() {
        const selector = ${JSON.stringify(selector)};
        const element = document.querySelector(selector);
        
        if (!element) {
          throw new Error('Field not found: ' + selector);
        }
        
        // Simulate mouse click first
        const rect = element.getBoundingClientRect();
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2
        });
        element.dispatchEvent(clickEvent);
        
        // Then focus
        element.focus();
        element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
        element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        
        // Scroll into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        return {
          success: true,
          selector: selector,
          focused: document.activeElement === element
        };
      })();
    `;
  }

  /**
   * Generate JavaScript to get current field value
   */
  generateFieldValueScript(field: FormField): string {
    const selector = this.getBestSelector(field);

    return `
      (function getFieldValue() {
        const selector = ${JSON.stringify(selector)};
        const element = document.querySelector(selector);
        
        if (!element) {
          throw new Error('Field not found: ' + selector);
        }
        
        return {
          success: true,
          selector: selector,
          value: element.value,
          type: element.type || element.tagName.toLowerCase(),
          focused: document.activeElement === element
        };
      })();
    `;
  }

  /**
   * Generate JavaScript to monitor field changes
   */
  generateFieldMonitorScript(fields: FormField[]): string {
    const selectors = fields.map((f) => this.getBestSelector(f));

    return `
      (function monitorFields() {
        const selectors = ${JSON.stringify(selectors)};
        const fieldStates = {};
        
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            fieldStates[selector] = {
              value: element.value,
              focused: document.activeElement === element,
              disabled: element.disabled,
              readonly: element.readOnly
            };
          }
        }
        
        return fieldStates;
      })();
    `;
  }

  /**
   * Get the best selector for a field, with fallbacks
   */
  private getBestSelector(field: FormField): string {
    // Use provided selector if available
    if (field.selector) {
      return field.selector;
    }

    // Fallback to ID
    if (field.id) {
      return `#${CSS.escape(field.id)}`;
    }

    // Fallback to name attribute
    if (field.name) {
      return `[name="${CSS.escape(field.name)}"]`;
    }

    // Build selector from attributes
    if (field.attributes) {
      const testId =
        field.attributes['data-testid'] ||
        field.attributes['data-qa'] ||
        field.attributes['data-test'];
      if (testId) {
        return `[data-testid="${CSS.escape(testId)}"]`;
      }
    }

    // Last resort: type and placeholder
    if (field.type && field.placeholder) {
      return `input[type="${field.type}"][placeholder="${CSS.escape(field.placeholder)}"]`;
    }

    throw new Error('Unable to generate selector for field');
  }

  /**
   * Calculate typing pattern to mimic human behavior
   */
  generateTypingPattern(text: string): number[] {
    const delays: number[] = [];
    const baseDelay = 80; // Base typing speed in ms

    for (let i = 0; i < text.length - 1; i++) {
      // Add variation for more realistic typing
      let delay = baseDelay;

      // Longer pause after spaces
      if (text[i] === ' ') {
        delay += Math.random() * 50;
      }

      // Occasional longer pauses (thinking)
      if (Math.random() < 0.1) {
        delay += Math.random() * 200;
      }

      // Faster for repeated characters
      if (text[i] === text[i + 1]) {
        delay *= 0.8;
      }

      // Add random variation
      delay += (Math.random() - 0.5) * 40;

      // Ensure minimum delay
      delays.push(Math.max(30, delay));
    }

    return delays;
  }
}
