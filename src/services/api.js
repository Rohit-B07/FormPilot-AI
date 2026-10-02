/**
 * FormPilot AI — Frontend API Client
 * Connects the React UI to the Express + Gemini + Supabase backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Helper to perform authenticated/unauthenticated API calls.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('formpilot_token') || sessionStorage.getItem('formpilot_token');

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // If body is not FormData, default to JSON
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(json.error?.message || 'An error occurred during API request');
    error.code = json.error?.code;
    error.status = response.status;
    throw error;
  }

  return json.data;
}

export const api = {
  // ── Auth ─────────────────────────────────────────────────────────────
  auth: {
    getMe: () => request('/auth/me'),
    updateProfile: (profile) => request('/auth/profile', { method: 'POST', body: profile }),
  },

  // ── Forms ────────────────────────────────────────────────────────────
  forms: {
    upload: (file, title, formType) => {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (formType) formData.append('form_type', formType);

      return request('/forms/upload', {
        method: 'POST',
        body: formData,
      });
    },
    list: (limit = 50, offset = 0) => request(`/forms?limit=${limit}&offset=${offset}`),
    get: (id) => request(`/forms/${id}`),
    delete: (id) => request(`/forms/${id}`, { method: 'DELETE' }),
    getStatus: (id) => request(`/forms/${id}/status`),
    reprocess: (id) => request(`/forms/${id}/process`, { method: 'POST' }),
    getFields: (id) => request(`/forms/${id}/fields`),
    updateField: (id, fieldId, data) => request(`/forms/${id}/fields/${fieldId}`, { method: 'PATCH', body: data }),
    createAnswer: (id, data) => request(`/forms/${id}/answers`, { method: 'POST', body: data }),
    updateAnswer: (id, answerId, data) => request(`/forms/${id}/answers/${answerId}`, { method: 'PATCH', body: data }),
  },

  // ── AI Engine ────────────────────────────────────────────────────────
  ai: {
    explainField: (fieldLabel, fieldDescription, formContext, formId) =>
      request('/ai/explain-field', {
        method: 'POST',
        body: {
          field_label: fieldLabel,
          field_description: fieldDescription,
          form_context: formContext,
          form_id: formId,
        },
      }),

    mapAnswer: (formId, text, source = 'voice') =>
      request('/ai/map-answer', {
        method: 'POST',
        body: {
          form_id: formId,
          text,
          source,
        },
      }),

    validateForm: (formId) =>
      request('/ai/validate', {
        method: 'POST',
        body: { form_id: formId },
      }),

    chat: (message, formId, history = []) =>
      request('/ai/chat', {
        method: 'POST',
        body: {
          message,
          form_id: formId,
          history,
        },
      }),
  },

  // ── Documents ────────────────────────────────────────────────────────
  documents: {
    upload: (file, formId, documentType) => {
      const formData = new FormData();
      formData.append('file', file);
      if (formId) formData.append('form_id', formId);
      if (documentType) formData.append('document_type', documentType);

      return request('/documents/upload', {
        method: 'POST',
        body: formData,
      });
    },
    listForForm: (formId) => request(`/forms/${formId}/documents`),
    delete: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
  },

  // ── Validation & Submission ──────────────────────────────────────────
  validation: {
    validate: (formId) => request(`/forms/${formId}/validation`),
    getReadiness: (formId) => request(`/forms/${formId}/readiness`),
    approve: (formId) => request(`/forms/${formId}/approve`, { method: 'POST' }),
    export: (formId) => request(`/forms/${formId}/export`, { method: 'POST' }),
  },

  // ── Health ───────────────────────────────────────────────────────────
  health: () => request('/health'),
};

export default api;
