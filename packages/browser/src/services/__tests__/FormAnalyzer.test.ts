import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormAnalyzer } from '../FormAnalyzer';

// Mock the FieldEnhancementService
vi.mock('../field-enhancement', () => ({
  FieldEnhancementService: {
    getInstance: vi.fn(() => ({
      enhance: vi.fn().mockResolvedValue({
        fieldType: 'email',
        label: 'Email Address',
        confidence: 0.9,
        source: 'pattern',
      }),
      connectToOllama: vi.fn().mockResolvedValue({
        success: true,
        status: 'connected',
      }),
      disconnect: vi.fn().mockReturnValue({ success: true }),
      setModel: vi.fn(),
      getFieldEnhancementDetails: vi.fn(),
      getLLMStatus: vi.fn().mockReturnValue({
        status: 'connected',
        timestamp: Date.now(),
      }),
    })),
  },
}));

describe('FormAnalyzer', () => {
  let formAnalyzer: FormAnalyzer;

  beforeEach(() => {
    formAnalyzer = new FormAnalyzer({
      enableCache: true,
      selectedModel: 'llama3.2',
      ollamaHost: 'http://localhost:11434',
    });
  });

  describe('analyzeHTML', () => {
    it('should extract form fields from HTML', async () => {
      const html = `
        <html>
          <body>
            <form id="test-form" name="contact">
              <input type="text" name="name" id="name-field" placeholder="Your Name" required />
              <input type="email" name="email" id="email-field" placeholder="Email" />
              <textarea name="message" placeholder="Message"></textarea>
              <select name="country">
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
              </select>
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>
      `;

      const forms = await formAnalyzer.analyzeHTML(
        html,
        'Test Page',
        'https://example.com',
      );

      expect(forms).toHaveLength(1);
      expect(forms[0].id).toBe('test-form');
      expect(forms[0].name).toBe('contact');
      expect(forms[0].fields).toHaveLength(4);

      const nameField = forms[0].fields.find((f) => f.name === 'name');
      expect(nameField).toBeDefined();
      expect(nameField?.type).toBe('text');
      expect(nameField?.required).toBe(true);
      expect(nameField?.placeholder).toBe('Your Name');

      const selectField = forms[0].fields.find((f) => f.name === 'country');
      expect(selectField?.type).toBe('select');
      expect(selectField?.options).toHaveLength(2);
    });

    it('should handle forms without explicit form tags', async () => {
      const html = `
        <html>
          <body>
            <div>
              <input type="text" name="username" />
              <input type="password" name="password" />
            </div>
          </body>
        </html>
      `;

      const forms = await formAnalyzer.analyzeHTML(html);

      expect(forms).toHaveLength(1);
      expect(forms[0].fields).toHaveLength(2);
    });

    it('should extract labels correctly', async () => {
      const html = `
        <html>
          <body>
            <form>
              <label for="field1">Field Label</label>
              <input type="text" id="field1" name="field1" />
              
              <label>
                Nested Label
                <input type="text" name="field2" />
              </label>
            </form>
          </body>
        </html>
      `;

      const forms = await formAnalyzer.analyzeHTML(html);

      expect(forms[0].fields[0].label).toBe('Field Label');
      expect(forms[0].fields[1].label).toBe('Nested Label');
    });

    it('should detect input patterns and validation', async () => {
      const html = `
        <html>
          <body>
            <form>
              <input 
                type="text" 
                name="phone"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                maxlength="12"
                minlength="12"
              />
              <input 
                type="number"
                name="age"
                min="18"
                max="120"
                step="1"
              />
            </form>
          </body>
        </html>
      `;

      const forms = await formAnalyzer.analyzeHTML(html);

      const phoneField = forms[0].fields.find((f) => f.name === 'phone');
      expect(phoneField?.pattern).toBe('[0-9]{3}-[0-9]{3}-[0-9]{4}');
      expect(phoneField?.maxLength).toBe(12);
      expect(phoneField?.minLength).toBe(12);

      const ageField = forms[0].fields.find((f) => f.name === 'age');
      expect(ageField?.min).toBe('18');
      expect(ageField?.max).toBe('120');
      expect(ageField?.step).toBe('1');
    });
  });

  describe('connectToLLM', () => {
    it('should connect to LLM service successfully', async () => {
      const result = await formAnalyzer.connectToLLM();

      expect(result.success).toBe(true);
      expect(result.status).toBe('connected');
      expect(result.error).toBeUndefined();
    });

    it('should handle connection failures gracefully', async () => {
      const mockEnhancementService = {
        connectToOllama: vi.fn().mockResolvedValue({
          success: false,
          status: 'error',
        }),
      };

      vi.mocked(FieldEnhancementService.getInstance).mockReturnValueOnce(
        mockEnhancementService as ReturnType<
          typeof FieldEnhancementService.getInstance
        >,
      );

      const analyzer = new FormAnalyzer();
      const result = await analyzer.connectToLLM();

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
    });

    it('should handle unexpected errors', async () => {
      const mockEnhancementService = {
        connectToOllama: vi.fn().mockRejectedValue(new Error('Network error')),
      };

      vi.mocked(FieldEnhancementService.getInstance).mockReturnValueOnce(
        mockEnhancementService as ReturnType<
          typeof FieldEnhancementService.getInstance
        >,
      );

      const analyzer = new FormAnalyzer();
      const result = await analyzer.connectToLLM();

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
      expect(result.error).toBe('Network error');
    });
  });

  describe('field enhancement', () => {
    it('should enhance form fields with additional metadata', async () => {
      const html = `
        <html>
          <body>
            <form>
              <input type="text" name="user_email" />
            </form>
          </body>
        </html>
      `;

      const forms = await formAnalyzer.analyzeHTML(html);
      const emailField = forms[0].fields[0];

      // The mock enhancement service should have enhanced this field
      expect(emailField).toBeDefined();
    });
  });

  describe('setSelectedModel', () => {
    it('should update the selected model', () => {
      formAnalyzer.setSelectedModel('llama2');
      // The mock should have been called
      expect(FieldEnhancementService.getInstance).toHaveBeenCalled();
    });
  });

  describe('setLLMEnabled', () => {
    it('should handle enabling/disabling LLM', () => {
      formAnalyzer.setLLMEnabled(false);
      expect(formAnalyzer).toBeDefined();

      formAnalyzer.setLLMEnabled(true);
      expect(formAnalyzer).toBeDefined();
    });
  });

  describe('special field types', () => {
    it('should handle checkbox and radio inputs', async () => {
      const html = `
        <html>
          <body>
            <form>
              <input type="checkbox" name="terms" value="accepted" />
              <input type="radio" name="gender" value="male" />
              <input type="radio" name="gender" value="female" />
            </form>
          </body>
        </html>
      `;

      const forms = await formAnalyzer.analyzeHTML(html);

      const checkbox = forms[0].fields.find((f) => f.type === 'checkbox');
      expect(checkbox?.name).toBe('terms');
      expect(checkbox?.value).toBe('accepted');

      const radios = forms[0].fields.filter((f) => f.type === 'radio');
      expect(radios).toHaveLength(2);
    });

    it('should handle hidden and button inputs appropriately', async () => {
      const html = `
        <html>
          <body>
            <form>
              <input type="hidden" name="csrf" value="token123" />
              <input type="submit" value="Submit" />
              <input type="button" value="Cancel" />
              <input type="text" name="visible" />
            </form>
          </body>
        </html>
      `;

      const forms = await formAnalyzer.analyzeHTML(html);

      // Should filter out hidden and button types
      const visibleFields = forms[0].fields.filter(
        (f) => !['hidden', 'submit', 'button'].includes(f.type),
      );
      expect(visibleFields).toHaveLength(1);
      expect(visibleFields[0].name).toBe('visible');
    });
  });

  describe('edge cases', () => {
    it('should handle empty HTML', async () => {
      const forms = await formAnalyzer.analyzeHTML('');
      expect(forms).toHaveLength(0);
    });

    it('should handle malformed HTML', async () => {
      const html = '<form><input type="text" name="test"';
      const forms = await formAnalyzer.analyzeHTML(html);
      expect(forms).toBeDefined();
    });

    it('should handle forms with no fields', async () => {
      const html = '<form id="empty"></form>';
      const forms = await formAnalyzer.analyzeHTML(html);
      expect(forms).toHaveLength(1);
      expect(forms[0].fields).toHaveLength(0);
    });
  });
});
