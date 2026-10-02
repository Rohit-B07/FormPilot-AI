import { GoogleGenAI } from '@google/genai';
import config from '../../config/index.js';

/**
 * GeminiService — Central AI engine for FormPilot.
 *
 * All Gemini interactions are funnelled through this single service.
 * The API key never leaves the server. Responses are always parsed
 * into structured JSON before being returned to callers.
 */
class GeminiService {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: config.gemini.apiKey || 'mock-key' });
    this.model = config.gemini.model;
    this.confidenceThreshold = config.ai.confidenceThreshold;
  }

  // ───────── helpers ─────────────────────────────────────────
  async _generate(prompt, { systemInstruction, json = true, temperature = 0.3 } = {}) {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    });
    const text = response.text;
    if (json) {
      try {
        return JSON.parse(text);
      } catch {
        // If Gemini wraps JSON in markdown fences, strip them
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
      }
    }
    return text;
  }

  async _generateMultimodal(parts, { systemInstruction, json = true, temperature = 0.3 } = {}) {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction,
        temperature,
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    });
    const text = response.text;
    if (json) {
      try {
        return JSON.parse(text);
      } catch {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
      }
    }
    return text;
  }

  // ───────── Form Understanding ──────────────────────────────
  /**
   * Understand a form from an uploaded image/PDF buffer.
   * Returns structured schema with fields, types, requirements.
   */
  async understandForm(fileBuffer, mimeType, fileName) {
    const systemInstruction = `You are FormPilot AI, an expert document analyst. 
Analyze the uploaded form document and extract a complete structured schema.
For every field you find, determine:
- A unique field_key (snake_case)
- The human-readable label
- A plain-English description of what the field asks for
- The data type (text, number, date, email, phone, currency, checkbox, select, textarea)
- Whether it is required
- If it is a select/checkbox, list the options
- A confidence score (0.0 to 1.0) for your extraction accuracy
- The section of the form the field belongs to

Return valid JSON only.`;

    const parts = [
      { inlineData: { mimeType, data: fileBuffer.toString('base64') } },
      { text: `Analyze this form document "${fileName}" and extract all fields as structured JSON with this schema:
{
  "formTitle": "string",
  "formType": "string (scholarship, government, banking, healthcare, hr, business, other)",
  "totalPages": number,
  "sections": ["string"],
  "fields": [
    {
      "field_key": "string",
      "label": "string",
      "description": "string",
      "field_type": "text|number|date|email|phone|currency|checkbox|select|textarea",
      "required": boolean,
      "options": ["string"] | null,
      "section": "string",
      "confidence": number
    }
  ],
  "requiredDocuments": ["string"],
  "instructions": "string"
}` },
    ];

    return this._generateMultimodal(parts, { systemInstruction });
  }

  /**
   * Extract fields from raw text content (e.g. after OCR).
   */
  async extractFields(textContent, formTitle) {
    const prompt = `You are FormPilot AI. Given the following text content extracted from a form titled "${formTitle}", 
identify all fillable fields and produce a structured JSON array.

TEXT CONTENT:
${textContent}

Return JSON:
{
  "fields": [
    {
      "field_key": "string",
      "label": "string",
      "description": "string",
      "field_type": "text|number|date|email|phone|currency|checkbox|select|textarea",
      "required": boolean,
      "options": null,
      "section": "string",
      "confidence": number
    }
  ]
}`;

    return this._generate(prompt, {
      systemInstruction: 'Extract form fields from text. Return valid JSON only.',
    });
  }

  // ───────── Field Explanation ────────────────────────────────
  /**
   * Explain a specific field to the user in plain language.
   */
  async explainField(fieldLabel, fieldDescription, formContext) {
    const prompt = `A user is filling out a form and wants to understand this field:

Field: "${fieldLabel}"
Description: "${fieldDescription || 'Not provided'}"
Form context: "${formContext || 'General application form'}"

Provide a clear, helpful explanation. Return JSON:
{
  "meaning": "What this field is asking for in plain English",
  "why_required": "Why this information is typically needed",
  "what_to_provide": "What information the user should enter",
  "example": "An example valid answer",
  "warning": "Any important notes or common mistakes (or null)"
}`;

    return this._generate(prompt, {
      systemInstruction: 'You are a helpful form assistant. Explain form fields in simple, accessible language. Never invent requirements not implied by the field.',
    });
  }

  // ───────── Answer Mapping ──────────────────────────────────
  /**
   * Map a user's natural-language answer to the correct form field(s).
   */
  async mapAnswerToField(userText, fields, existingAnswers = {}) {
    const fieldsJson = JSON.stringify(fields.map(f => ({
      field_key: f.field_key,
      label: f.label,
      description: f.description,
      field_type: f.field_type,
      section: f.section,
    })));

    const prompt = `A user said: "${userText}"

The form has these fields:
${fieldsJson}

Already-filled answers:
${JSON.stringify(existingAnswers)}

Determine which field(s) the user is answering. Extract the normalized value.
The user may speak in English, Hindi, Hinglish, or a mix.

Return JSON:
{
  "mappings": [
    {
      "field_key": "string",
      "field_label": "string",
      "raw_value": "string (what the user literally said)",
      "normalized_value": "string (structured value for the form)",
      "formatted_value": "string (human-readable display)",
      "confidence": number,
      "requires_confirmation": boolean,
      "reason": "string"
    }
  ]
}`;

    return this._generate(prompt, {
      systemInstruction: `You are FormPilot AI's answer-mapping engine.
Map natural-language answers (English, Hindi, Hinglish) to form fields.
Be precise with numbers, dates, and currencies. INR = ₹, 1 lakh = 100000.
Set requires_confirmation=true if confidence < ${this.confidenceThreshold}.`,
    });
  }

  /**
   * Normalize a single raw answer for a known field.
   */
  async normalizeAnswer(rawAnswer, fieldLabel, fieldType) {
    const prompt = `Normalize this user answer for a form field.

Field: "${fieldLabel}" (type: ${fieldType})
User answer: "${rawAnswer}"

Return JSON:
{
  "normalized_value": "string",
  "formatted_value": "string",
  "confidence": number,
  "requires_confirmation": boolean
}`;

    return this._generate(prompt, {
      systemInstruction: 'Normalize form answers. Handle multilingual input (English/Hindi/Hinglish). Be precise.',
    });
  }

  // ───────── Validation ──────────────────────────────────────
  /**
   * Semantic validation — catch issues deterministic rules can't.
   */
  async validateForm(fields, answers) {
    const prompt = `Review these form fields and their answers for semantic consistency.

Fields & Answers:
${JSON.stringify(fields.map(f => ({
  label: f.label,
  field_key: f.field_key,
  type: f.field_type,
  required: f.required,
  value: f.mapped_value || f.extracted_value || null,
})))}

Additional answers:
${JSON.stringify(answers)}

Check for:
1. Contradictions between fields (e.g. DOB vs Age)
2. Implausible values
3. Missing critical information
4. Format issues
5. Logical inconsistencies

Return JSON:
{
  "issues": [
    {
      "field_key": "string",
      "severity": "info|warning|error",
      "issue_type": "MISSING|FORMAT|INCONSISTENCY|IMPLAUSIBLE|DUPLICATE",
      "message": "string"
    }
  ],
  "overall_confidence": number
}`;

    return this._generate(prompt, {
      systemInstruction: 'You are a form validation engine. Flag only genuine issues. Do not invent problems.',
    });
  }

  // ───────── Missing Information Detection ───────────────────
  async detectMissingInformation(formSchema, answers, documents) {
    const prompt = `Given this form schema, current answers, and uploaded documents, identify what is still missing.

Form schema:
${JSON.stringify(formSchema)}

Current answers:
${JSON.stringify(answers)}

Uploaded documents:
${JSON.stringify(documents)}

Return JSON:
{
  "missing_fields": [
    { "field_key": "string", "label": "string", "reason": "string" }
  ],
  "missing_documents": [
    { "document_type": "string", "reason": "string" }
  ],
  "suggestions": ["string"]
}`;

    return this._generate(prompt, {
      systemInstruction: 'Identify missing information. Only flag genuinely missing items based on the form requirements.',
    });
  }

  // ───────── Submission Summary ──────────────────────────────
  async generateSubmissionSummary(formTitle, fields, answers) {
    const prompt = `Generate a concise submission summary for the form "${formTitle}".

Completed fields:
${JSON.stringify(fields.filter(f => f.mapped_value).map(f => ({ label: f.label, value: f.mapped_value })))}

Return JSON:
{
  "summary": "string (2-3 sentence overview)",
  "readiness": "INCOMPLETE|NEEDS_REVIEW|READY",
  "readiness_score": number (0-100),
  "highlights": ["string"],
  "concerns": ["string"]
}`;

    return this._generate(prompt);
  }

  // ───────── Conversational Chat ─────────────────────────────
  async chat(userMessage, formContext, conversationHistory = []) {
    const messages = [
      ...conversationHistory.map(m => `${m.role}: ${m.content}`),
      `User: ${userMessage}`,
    ].join('\n');

    const prompt = `You are FormPilot AI, helping a user fill out a form.

Form context: ${JSON.stringify(formContext)}

Conversation:
${messages}

Help the user. If they provide an answer, indicate which field it maps to.
Be concise, helpful, and friendly. Support English, Hindi, and Hinglish.

Return JSON:
{
  "response": "string",
  "detected_answer": {
    "field_key": "string or null",
    "value": "string or null",
    "confidence": number or null
  } | null
}`;

    return this._generate(prompt, {
      systemInstruction: 'You are FormPilot AI assistant. Be helpful and concise.',
      temperature: 0.5,
    });
  }
}

// Singleton export
export default new GeminiService();
