/**
 * ValidationEngine — Deterministic validation for form fields.
 *
 * This engine handles all PREDICTABLE validation rules:
 *   • Required fields
 *   • Data type checks
 *   • Format validation (email, phone, date)
 *   • Numeric range checks
 *   • Cross-field consistency
 *   • Missing documents
 *
 * AI (Gemini) is used ONLY for semantic validation that rules can't handle.
 * Deterministic checks always run FIRST to avoid unnecessary AI calls.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+]?[\d\s\-\(\)]{7,15}$/;
const DATE_REGEX = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/;

class ValidationEngine {
  /**
   * Run all deterministic validations on form fields.
   * @param {Array} fields - form_fields rows with mapped_value
   * @param {Array} documents - uploaded documents
   * @param {Array} requiredDocuments - expected document types from schema
   * @returns {Array} issues
   */
  validate(fields, documents = [], requiredDocuments = []) {
    const issues = [];

    // 1. Required field checks
    issues.push(...this._checkRequiredFields(fields));

    // 2. Data type / format checks
    issues.push(...this._checkFieldFormats(fields));

    // 3. Cross-field consistency
    issues.push(...this._checkCrossFieldConsistency(fields));

    // 4. Missing documents
    issues.push(...this._checkMissingDocuments(documents, requiredDocuments));

    return issues;
  }

  _checkRequiredFields(fields) {
    return fields
      .filter(f => f.required && !f.mapped_value && !f.extracted_value)
      .map(f => ({
        field_key: f.field_key,
        field_id: f.id,
        severity: 'error',
        issue_type: 'MISSING',
        message: `"${f.label}" is required but has no value.`,
      }));
  }

  _checkFieldFormats(fields) {
    const issues = [];

    for (const field of fields) {
      const value = field.mapped_value || field.extracted_value;
      if (!value) continue;

      switch (field.field_type) {
        case 'email':
          if (!EMAIL_REGEX.test(value)) {
            issues.push({
              field_key: field.field_key,
              field_id: field.id,
              severity: 'error',
              issue_type: 'FORMAT',
              message: `"${field.label}" does not appear to be a valid email address.`,
            });
          }
          break;

        case 'phone':
          if (!PHONE_REGEX.test(value)) {
            issues.push({
              field_key: field.field_key,
              field_id: field.id,
              severity: 'warning',
              issue_type: 'FORMAT',
              message: `"${field.label}" may not be a valid phone number.`,
            });
          }
          break;

        case 'date':
          if (!DATE_REGEX.test(value) && isNaN(Date.parse(value))) {
            issues.push({
              field_key: field.field_key,
              field_id: field.id,
              severity: 'warning',
              issue_type: 'FORMAT',
              message: `"${field.label}" does not appear to be a valid date.`,
            });
          }
          break;

        case 'number':
        case 'currency':
          // Strip formatting chars for numeric check
          const numericValue = String(value).replace(/[₹$,\s]/g, '');
          if (isNaN(Number(numericValue))) {
            issues.push({
              field_key: field.field_key,
              field_id: field.id,
              severity: 'warning',
              issue_type: 'FORMAT',
              message: `"${field.label}" does not appear to be a valid number.`,
            });
          }
          break;
      }
    }

    return issues;
  }

  _checkCrossFieldConsistency(fields) {
    const issues = [];
    const fieldMap = {};
    for (const f of fields) {
      fieldMap[f.field_key] = f.mapped_value || f.extracted_value;
    }

    // DOB vs Age consistency
    const dobField = fields.find(f => /date.*birth|dob/i.test(f.label) || /date.*birth|dob/i.test(f.field_key));
    const ageField = fields.find(f => /^age$/i.test(f.label) || /^age$/i.test(f.field_key));

    if (dobField && ageField) {
      const dobValue = dobField.mapped_value || dobField.extracted_value;
      const ageValue = ageField.mapped_value || ageField.extracted_value;

      if (dobValue && ageValue) {
        const dob = new Date(dobValue);
        const age = parseInt(ageValue, 10);
        if (!isNaN(dob.getTime()) && !isNaN(age)) {
          const calculatedAge = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          if (Math.abs(calculatedAge - age) > 1) {
            issues.push({
              field_key: ageField.field_key,
              field_id: ageField.id,
              severity: 'warning',
              issue_type: 'INCONSISTENCY',
              message: `Date of birth and age do not appear consistent. DOB suggests age ~${calculatedAge}, but "${age}" was entered.`,
            });
          }
        }
      }
    }

    // Duplicate email/phone detection
    const emails = fields.filter(f => f.field_type === 'email' && (f.mapped_value || f.extracted_value));
    const emailValues = emails.map(f => (f.mapped_value || f.extracted_value).toLowerCase());
    const uniqueEmails = new Set(emailValues);
    if (emailValues.length > 1 && uniqueEmails.size < emailValues.length) {
      issues.push({
        field_key: emails[1]?.field_key,
        field_id: emails[1]?.id,
        severity: 'info',
        issue_type: 'DUPLICATE',
        message: 'Multiple email fields have the same value. Please verify this is intentional.',
      });
    }

    return issues;
  }

  _checkMissingDocuments(uploadedDocs, requiredDocTypes) {
    if (!requiredDocTypes || requiredDocTypes.length === 0) return [];

    const uploadedTypes = uploadedDocs.map(d => (d.document_type || '').toLowerCase());

    return requiredDocTypes
      .filter(reqType => !uploadedTypes.some(ut => ut.includes(reqType.toLowerCase())))
      .map(missing => ({
        field_key: null,
        field_id: null,
        severity: 'warning',
        issue_type: 'MISSING_DOCUMENT',
        message: `Required document "${missing}" has not been uploaded.`,
      }));
  }

  /**
   * Calculate readiness score from validation issues.
   */
  calculateReadiness(fields, issues) {
    const totalRequired = fields.filter(f => f.required).length;
    const filledRequired = fields.filter(f => f.required && (f.mapped_value || f.extracted_value)).length;
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    let score = 0;
    if (totalRequired > 0) {
      score = Math.round((filledRequired / totalRequired) * 100);
    } else {
      const totalFields = fields.length;
      const filledFields = fields.filter(f => f.mapped_value || f.extracted_value).length;
      score = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    }

    // Penalize for errors and warnings
    score = Math.max(0, score - (errorCount * 10) - (warningCount * 3));

    let status;
    if (score >= 95 && errorCount === 0) {
      status = 'READY';
    } else if (score >= 60) {
      status = 'NEEDS_REVIEW';
    } else {
      status = 'INCOMPLETE';
    }

    return { score, status, errorCount, warningCount };
  }
}

export default new ValidationEngine();
