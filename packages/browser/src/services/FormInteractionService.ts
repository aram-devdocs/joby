import { EventEmitter } from 'events';
import { cssEscape } from '@packages/shared';
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

    // Server-side validation before generating update script
    const validationError = this.validateFieldValue(field, value);
    if (validationError) {
      // Return error script instead of update
      return `
        (function() {
          throw new Error('Validation failed: ${validationError}');
        })();
      `;
    }

    return `
      (async function updateField() {
        const selector = ${JSON.stringify(selector)};
        const value = ${JSON.stringify(value)};
        const options = ${JSON.stringify(opts)};
        const fieldType = ${JSON.stringify(field.type || field.inputType)};
        
        // Find the element
        const element = document.querySelector(selector);
        if (!element) {
          throw new Error('Field not found: ' + selector);
        }
        
        // Helper to dispatch events with React compatibility
        function dispatchReactEvent(el, eventType, extraProps = {}) {
          const event = new Event(eventType, {
            bubbles: true,
            cancelable: true
          });
          
          // Add React-compatible properties
          Object.defineProperty(event, 'target', {
            value: el,
            enumerable: true
          });
          Object.defineProperty(event, 'currentTarget', {
            value: el,
            enumerable: true
          });
          
          // Add extra properties
          Object.keys(extraProps).forEach(key => {
            Object.defineProperty(event, key, {
              value: extraProps[key],
              enumerable: true
            });
          });
          
          el.dispatchEvent(event);
        }
        
        // Focus the element
        if (options.simulateFocus) {
          element.focus();
          dispatchReactEvent(element, 'focus');
          dispatchReactEvent(element, 'focusin');
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Handle different field types
        const tagName = element.tagName.toLowerCase();
        const inputType = element.type || tagName;
        
        if (tagName === 'select') {
          // Handle select dropdowns
          if (value) {
            // Try to find option by value first, then by text
            let optionFound = false;
            
            for (let i = 0; i < element.options.length; i++) {
              const option = element.options[i];
              if (option.value === value || option.text === value || option.text.toLowerCase() === value.toLowerCase()) {
                element.selectedIndex = i;
                optionFound = true;
                break;
              }
            }
            
            if (!optionFound && !isNaN(parseInt(value))) {
              // Try setting by index if value is numeric
              const index = parseInt(value);
              if (index >= 0 && index < element.options.length) {
                element.selectedIndex = index;
                optionFound = true;
              }
            }
            
            if (!optionFound) {
              throw new Error('Option not found: ' + value);
            }
          }
          
          dispatchReactEvent(element, 'change');
          
        } else if (inputType === 'radio') {
          // Handle radio buttons
          if (element.name) {
            // Find the radio button with matching value
            const radioButtons = document.querySelectorAll('input[type="radio"][name="' + element.name + '"]');
            let targetRadio = null;
            
            for (const radio of radioButtons) {
              if (radio.value === value || radio.value.toLowerCase() === value.toLowerCase()) {
                targetRadio = radio;
                break;
              }
            }
            
            if (targetRadio) {
              // Uncheck all radio buttons in the group
              radioButtons.forEach(radio => { radio.checked = false; });
              
              // Check the target radio button
              targetRadio.checked = true;
              dispatchReactEvent(targetRadio, 'change');
            } else {
              throw new Error('Radio option not found: ' + value);
            }
          } else {
            // Single radio button
            element.checked = (value === 'true' || value === '1' || value.toLowerCase() === 'yes');
            dispatchReactEvent(element, 'change');
          }
          
        } else if (inputType === 'checkbox') {
          // Handle checkboxes
          const shouldCheck = (value === 'true' || value === '1' || value.toLowerCase() === 'yes' || value.toLowerCase() === 'on');
          element.checked = shouldCheck;
          dispatchReactEvent(element, 'change');
          
        } else if (inputType === 'range') {
          // Handle range sliders
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            element.value = numValue.toString();
            dispatchReactEvent(element, 'input');
            dispatchReactEvent(element, 'change');
          } else {
            throw new Error('Invalid range value: ' + value);
          }
          
        } else if (inputType === 'date' || inputType === 'datetime-local' || inputType === 'time' || inputType === 'month' || inputType === 'week') {
          // Handle date/time inputs
          element.value = value;
          dispatchReactEvent(element, 'input');
          dispatchReactEvent(element, 'change');
          
        } else {
          // Handle text-like inputs (text, email, tel, url, password, number, etc.) and textareas
          
          // Clear field if requested
          if (options.clearFirst && element.value) {
            element.select();
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // For text inputs and textareas, simulate typing for realism
          if (fieldType === 'text' || fieldType === 'email' || fieldType === 'tel' || fieldType === 'url' || tagName === 'textarea') {
            // Use native setter for React compatibility - handle both input and textarea elements
            const nativeValueSetter = tagName === 'textarea'
              ? Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
              : Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            
            nativeValueSetter.call(element, '');
            
            // Type character by character
            for (let i = 0; i < value.length; i++) {
              const char = value[i];
              
              nativeValueSetter.call(element, element.value + char);
              
              dispatchReactEvent(element, 'input', {
                data: char,
                inputType: 'insertText'
              });
              
              // Add small delay between keystrokes
              if (i < value.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 
                  options.minDelay + Math.random() * (options.maxDelay - options.minDelay)
                ));
              }
            }
          } else {
            // For other inputs, set value directly
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              'value'
            ).set;
            nativeInputValueSetter.call(element, value);
            
            dispatchReactEvent(element, 'input', {
              inputType: 'insertText'
            });
          }
          
          dispatchReactEvent(element, 'change');
        }
        
        // Blur the element
        if (options.simulateBlur) {
          await new Promise(resolve => setTimeout(resolve, 100));
          dispatchReactEvent(element, 'blur');
          dispatchReactEvent(element, 'focusout');
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
      return `#${cssEscape(field.id)}`;
    }

    // Fallback to name attribute
    if (field.name) {
      return `[name="${cssEscape(field.name)}"]`;
    }

    // Build selector from attributes
    if (field.attributes) {
      const testId =
        field.attributes['data-testid'] ||
        field.attributes['data-qa'] ||
        field.attributes['data-test'];
      if (testId) {
        return `[data-testid="${cssEscape(testId)}"]`;
      }
    }

    // Last resort: type and placeholder
    if (field.type && field.placeholder) {
      return `input[type="${field.type}"][placeholder="${cssEscape(field.placeholder)}"]`;
    }

    throw new Error('Unable to generate selector for field');
  }

  /**
   * Validate field value on the server side before sending to browser
   */
  private validateFieldValue(field: FormField, value: string): string | null {
    // Skip validation for empty values (unless required)
    if (!value && !field.required) {
      return null;
    }

    // Required field validation
    if (field.required && !value.trim()) {
      return 'This field is required';
    }

    // Email validation
    if (field.inputType === 'email' && value) {
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(value)) {
        return 'Invalid email format';
      }
    }

    // Phone validation
    if (field.inputType === 'tel' && value) {
      const phoneDigits = value.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        return 'Phone number must be exactly 10 digits';
      }
      if (phoneDigits[0] === '0' || phoneDigits[0] === '1') {
        return 'Invalid phone number format';
      }
    }

    // URL validation
    if (field.inputType === 'url' && value) {
      try {
        new URL(value);
      } catch {
        return 'Invalid URL format';
      }
    }

    // Number validation
    if (field.inputType === 'number' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return 'Must be a valid number';
      }

      if (field.min !== undefined && numValue < Number(field.min)) {
        return `Value must be at least ${field.min}`;
      }

      if (field.max !== undefined && numValue > Number(field.max)) {
        return `Value must be at most ${field.max}`;
      }
    }

    // Pattern validation
    if (field.pattern && value) {
      try {
        const regex = new RegExp(field.pattern);
        if (!regex.test(value)) {
          return `Value does not match required pattern`;
        }
      } catch {
        // Invalid pattern, skip validation
      }
    }

    return null; // No validation errors
  }

  /**
   * Calculate typing pattern to mimic human behavior using advanced techniques
   */
  generateTypingPattern(text: string): number[] {
    const delays: number[] = [];
    const baseDelay = 85; // Base typing speed in ms (slightly slower for realism)

    // Generate a unique fingerprint for this typing session using multiple entropy sources
    const sessionSalt =
      Math.random() * 1000000 + Date.now() + Math.random() * text.length;
    const fingerprintSeed = this.generateSessionFingerprint(text, sessionSalt);

    // Character difficulty mapping (harder to type = longer delay)
    const charDifficulty: Record<string, number> = {
      // Numbers and symbols require more precision
      '1': 1.2,
      '2': 1.2,
      '3': 1.2,
      '4': 1.2,
      '5': 1.2,
      '6': 1.2,
      '7': 1.2,
      '8': 1.2,
      '9': 1.2,
      '0': 1.2,
      '!': 1.4,
      '@': 1.4,
      '#': 1.4,
      $: 1.4,
      '%': 1.4,
      '^': 1.4,
      '&': 1.4,
      '*': 1.4,
      '(': 1.3,
      ')': 1.3,
      '-': 1.1,
      _: 1.3,
      '=': 1.2,
      '+': 1.3,
      '[': 1.3,
      ']': 1.3,
      '{': 1.4,
      '}': 1.4,
      '\\': 1.4,
      '|': 1.4,
      ';': 1.2,
      ':': 1.3,
      "'": 1.1,
      '"': 1.3,
      ',': 1.1,
      '.': 1.1,
      '<': 1.3,
      '>': 1.3,
      '/': 1.2,
      '?': 1.3,
      '`': 1.3,
      '~': 1.4,
    };

    // Common bigram patterns (two-character combinations) and their speed modifiers
    const bigramSpeed: Record<string, number> = {
      th: 0.85,
      he: 0.85,
      in: 0.85,
      er: 0.85,
      an: 0.85,
      ed: 0.85,
      nd: 0.85,
      to: 0.85,
      en: 0.85,
      ti: 0.85,
      es: 0.85,
      or: 0.85,
      te: 0.85,
      of: 0.85,
      be: 0.85,
      qu: 1.2,
      x: 1.3,
      z: 1.2, // Less common combinations are slower
    };

    // Simulate fatigue - typing gets slightly slower over time
    const fatigueRate = 0.002; // Small increase in delay per character

    for (let i = 0; i < text.length - 1; i++) {
      let delay = baseDelay;
      const currentChar = text[i]?.toLowerCase();
      const nextChar = text[i + 1]?.toLowerCase();

      if (!currentChar) continue; // Skip if character is undefined

      const bigram = currentChar + (nextChar || '');

      // Apply unique fingerprint variation for this character position
      const positionFingerprint = this.getPositionFingerprint(
        fingerprintSeed,
        i,
        text.length,
      );
      delay *= 0.85 + positionFingerprint * 0.3; // Vary base delay by ±15%

      // Apply character difficulty
      const originalChar = text[i];
      if (originalChar && charDifficulty[originalChar]) {
        delay *= charDifficulty[originalChar];
      }

      // Apply bigram speed adjustment
      if (bigramSpeed[bigram]) {
        delay *= bigramSpeed[bigram];
      }

      // Longer pause after punctuation (natural reading rhythm)
      if (originalChar && /[.!?]/.test(originalChar)) {
        delay += 150 + Math.random() * 100;
      }

      // Moderate pause after commas and semicolons
      if (originalChar && /[,;]/.test(originalChar)) {
        delay += 80 + Math.random() * 60;
      }

      // Longer pause after spaces (word boundaries)
      if (originalChar === ' ') {
        delay += 40 + Math.random() * 80;
      }

      // Pause before capital letters (shift key coordination)
      const nextOriginalChar = text[i + 1];
      if (
        nextChar &&
        nextOriginalChar &&
        nextOriginalChar !== nextOriginalChar.toLowerCase() &&
        originalChar !== ' '
      ) {
        delay += 20 + Math.random() * 30;
      }

      // Faster for repeated characters (muscle memory)
      if (originalChar === text[i + 1]) {
        delay *= 0.75;
      }

      // Occasional hesitation/thinking pauses (more realistic distribution)
      const hesitationChance = Math.random();
      if (hesitationChance < 0.05) {
        // 5% chance of long pause
        delay += 300 + Math.random() * 500;
      } else if (hesitationChance < 0.15) {
        // 10% chance of medium pause
        delay += 100 + Math.random() * 200;
      }

      // Apply fatigue effect
      delay += i * fatigueRate;

      // Natural rhythm variation using sine wave for more organic feel
      const rhythmVariation = Math.sin(i * 0.3) * 15;
      delay += rhythmVariation;

      // Apply unique wave pattern based on session fingerprint
      const uniqueWave = this.generateUniqueWave(
        fingerprintSeed,
        i,
        text.length,
      );
      delay += uniqueWave * 35; // Add unique wave variation

      // Final random variation with normal distribution approximation
      const randomVar1 = Math.random();
      const randomVar2 = Math.random();
      const normalRandom =
        Math.sqrt(-2 * Math.log(randomVar1)) *
        Math.cos(2 * Math.PI * randomVar2);
      delay += normalRandom * 25; // Standard deviation of 25ms

      // Add micro-jitter based on character content and position for true uniqueness
      const microJitter = this.generateMicroJitter(
        originalChar || '',
        i,
        fingerprintSeed,
      );
      delay += microJitter;

      // Ensure realistic bounds (humans can't type faster than ~20ms between keys)
      delays.push(Math.max(20, Math.min(delay, 2000)));
    }

    return delays;
  }

  /**
   * Generate a unique session fingerprint based on multiple entropy sources
   */
  private generateSessionFingerprint(text: string, salt: number): number {
    // Combine multiple sources of entropy
    const textHash = this.simpleHash(text);
    const timeComponent = Date.now() % 1000000;
    const randomComponent = Math.random() * 1000000;
    const lengthComponent = text.length * 137; // Prime multiplier

    return (
      (textHash + timeComponent + randomComponent + lengthComponent + salt) %
      1000000
    );
  }

  /**
   * Get position-specific fingerprint variation
   */
  private getPositionFingerprint(
    seed: number,
    position: number,
    textLength: number,
  ): number {
    // Create deterministic but unique variation for each position
    const positionSeed = (seed + position * 17 + textLength * 23) % 1000000;
    return (Math.sin(positionSeed * 0.001) + 1) / 2; // Normalize to 0-1
  }

  /**
   * Generate unique wave pattern for this typing session
   */
  private generateUniqueWave(
    seed: number,
    position: number,
    _textLength: number,
  ): number {
    // Multiple overlapping waves with different frequencies based on session fingerprint
    const wave1 = Math.sin((position + seed * 0.001) * 0.2) * 0.4;
    const wave2 = Math.sin((position + seed * 0.002) * 0.7) * 0.3;
    const wave3 = Math.sin((position + seed * 0.003) * 1.3) * 0.2;
    const wave4 = Math.cos((position + seed * 0.001) * 0.5) * 0.1;

    return wave1 + wave2 + wave3 + wave4;
  }

  /**
   * Generate micro-jitter based on character and position
   */
  private generateMicroJitter(
    char: string,
    position: number,
    seed: number,
  ): number {
    // Character-specific jitter
    const charCode = char.charCodeAt(0) || 0;
    const charJitter = Math.sin(charCode * 0.1 + seed * 0.001) * 8;

    // Position-specific jitter with prime number spacing
    const positionJitter = Math.cos(position * 0.31 + seed * 0.002) * 6;

    // Combined entropy jitter
    const entropyJitter = Math.sin((charCode + position + seed) * 0.001) * 4;

    return charJitter + positionJitter + entropyJitter;
  }

  /**
   * Simple hash function for text content
   */
  private simpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
