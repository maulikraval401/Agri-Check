import type { Language } from '@/i18n/translations';

// BCP-47 locale tags for speechSynthesis. Actual voice availability depends
// on the user's device/browser — not every phone ships every language.
const LOCALE_MAP: Record<Language, string> = {
  en: 'en-IN',
  gu: 'gu-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  pa: 'pa-IN',
  ta: 'ta-IN',
};

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Speaks the given text using the browser's speech synthesis.
 * Silently does nothing if the browser/device doesn't support it, or if the
 * exact language voice isn't installed (falls back to the browser default).
 */
export function speak(text: string, language: Language): void {
  if (!isVoiceSupported()) return;

  // Stop anything currently speaking before starting a new utterance.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LOCALE_MAP[language] ?? 'en-IN';
  utterance.rate = 0.9;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isVoiceSupported()) {
    window.speechSynthesis.cancel();
  }
}
