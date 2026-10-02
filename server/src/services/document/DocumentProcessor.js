import GeminiService from '../gemini/GeminiService.js';
import StorageService from '../storage/StorageService.js';

/**
 * DocumentProcessor — Abstraction layer for document processing.
 *
 * Architecture:
 *   DocumentProcessor
 *   ├── GeminiVisionProcessor  (primary — uses Gemini multimodal)
 *   ├── OCRProcessor           (future — dedicated OCR provider)
 *   └── LayoutProcessor        (future — page layout analysis)
 *
 * Current MVP: uses Gemini's vision capabilities for form understanding.
 * The abstraction allows swapping in dedicated OCR later without changing callers.
 */
class DocumentProcessor {
  /**
   * Process an uploaded form document.
   *
   * @param {Buffer} fileBuffer - Raw file contents
   * @param {string} mimeType  - MIME type of the file
   * @param {string} fileName  - Original filename
   * @returns {Object} Structured form schema
   */
  async processForm(fileBuffer, mimeType, fileName) {
    // For PDFs, convert to image if needed or use Gemini multimodal directly
    // Gemini can handle PDFs natively
    return this._processWithGeminiVision(fileBuffer, mimeType, fileName);
  }

  /**
   * Primary processor — Gemini Vision multimodal.
   * Sends the raw document to Gemini and gets structured field data back.
   */
  async _processWithGeminiVision(fileBuffer, mimeType, fileName) {
    try {
      const schema = await GeminiService.understandForm(fileBuffer, mimeType, fileName);

      // Validate the response has the expected shape
      if (!schema || !schema.fields || !Array.isArray(schema.fields)) {
        throw new Error('Gemini returned an invalid form schema structure.');
      }

      // Normalize confidence scores
      schema.fields = schema.fields.map((field, index) => ({
        ...field,
        field_key: field.field_key || `field_${index}`,
        confidence: Math.min(1, Math.max(0, field.confidence || 0.5)),
        position: index,
      }));

      return schema;
    } catch (error) {
      console.error('[DocumentProcessor] Gemini vision processing failed:', error.message);
      throw new Error(`Document processing failed: ${error.message}`);
    }
  }

  /**
   * Fallback OCR processor — placeholder for future dedicated OCR integration.
   */
  async _processWithOCR(fileBuffer, mimeType) {
    // Future: integrate with Google Cloud Vision, Tesseract, etc.
    throw new Error('Dedicated OCR processor not yet configured. Using Gemini Vision.');
  }

  /**
   * Classify a document type (identity proof, certificate, etc.)
   */
  async classifyDocument(fileBuffer, mimeType, fileName) {
    try {
      const result = await GeminiService._generateMultimodal(
        [
          { inlineData: { mimeType, data: fileBuffer.toString('base64') } },
          { text: `Classify this document. Return JSON: { "document_type": "string", "confidence": number, "details": "string" }` },
        ],
        { systemInstruction: 'Classify uploaded documents (identity proof, income certificate, marksheet, passport, etc.)' }
      );
      return result;
    } catch (error) {
      return { document_type: 'unknown', confidence: 0, details: 'Classification failed.' };
    }
  }
}

export default new DocumentProcessor();
