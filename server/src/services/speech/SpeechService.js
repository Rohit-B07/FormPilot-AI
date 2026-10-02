/**
 * SpeechService — abstraction for speech-to-text processing.
 *
 * Architecture:
 *   SpeechService
 *   ├── BrowserSpeech  (frontend Web Speech API — no backend needed)
 *   ├── WhisperProvider (future — OpenAI Whisper)
 *   └── GoogleSTT      (future — Google Cloud Speech-to-Text)
 *
 * For the MVP, voice recording happens in the browser and is sent
 * as text after the browser's Web Speech API transcribes it.
 * This service handles the case where raw audio is sent to the server.
 */

class SpeechService {
  /**
   * Transcribe audio buffer to text.
   * MVP: placeholder — real implementation would call Whisper/Google STT.
   * The frontend currently uses the Web Speech API directly.
   */
  async transcribe(audioBuffer, mimeType, language = 'en') {
    // In the MVP, the browser sends already-transcribed text.
    // This method exists so a dedicated STT provider can be plugged in later.
    throw new Error(
      'Server-side transcription not configured. ' +
      'Use the browser Web Speech API or configure a provider (Whisper, Google STT).'
    );
  }

  /**
   * Return supported languages for voice input.
   */
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi' },
      { code: 'hi-en', name: 'Hinglish' },
    ];
  }
}

export default new SpeechService();
