import ValidationEngine from '../src/services/validation/ValidationEngine.js';

describe('FormPilot AI Backend Unit Tests', () => {
  describe('ValidationEngine', () => {
    test('validates email format correctly', () => {
      expect(ValidationEngine.isValidEmail('user@example.com')).toBe(true);
      expect(ValidationEngine.isValidEmail('invalid-email')).toBe(false);
    });

    test('validates phone format correctly', () => {
      expect(ValidationEngine.isValidPhone('+1 (555) 123-4567')).toBe(true);
      expect(ValidationEngine.isValidPhone('1234567890')).toBe(true);
      expect(ValidationEngine.isValidPhone('abc')).toBe(false);
    });

    test('calculates readiness score accurately', () => {
      const fields = [
        { id: '1', label: 'Full Name', required: true, mapped_value: 'Jane Doe', extracted_value: null },
        { id: '2', label: 'Email', required: true, mapped_value: 'jane@example.com', extracted_value: null },
        { id: '3', label: 'Phone', required: false, mapped_value: '', extracted_value: null },
      ];
      const validationResults = [];

      const readiness = ValidationEngine.calculateReadiness(fields, validationResults);
      expect(readiness.score).toBe(100);
      expect(readiness.status).toBe('READY');
    });

    test('flags missing required fields and reduces readiness', () => {
      const fields = [
        { id: '1', label: 'Full Name', required: true, mapped_value: null, extracted_value: null },
        { id: '2', label: 'Email', required: true, mapped_value: 'jane@example.com', extracted_value: null },
      ];
      const validationResults = [];

      const readiness = ValidationEngine.calculateReadiness(fields, validationResults);
      expect(readiness.score).toBeLessThan(100);
      expect(readiness.status).toBe('INCOMPLETE');
    });
  });
});
