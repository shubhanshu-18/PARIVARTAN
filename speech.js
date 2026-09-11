export class SpeechHelper {
  static activeRecognition = null;

  static isSpeechRecognitionSupported() {
    return (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    );
  }

  static isSpeechSynthesisSupported() {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof window.SpeechSynthesisUtterance === "function"
    );
  }

  static startListening({ onResult, onError, onEnd, lang = 'hi-IN' }) {
    if (!this.isSpeechRecognitionSupported()) {
      onError && onError('Speech recognition is not supported in this browser.');
      return null;
    }

    this.stopListening();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = lang === "en" || lang === "en-IN" ? "en-IN" : "hi-IN";

    recognition.onresult = (event) => {
      const result = event.results?.[0]?.[0];
      if (result?.transcript) {
        onResult?.(result.transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      const messages = {
        "not-allowed": "Microphone permission was denied.",
        "service-not-allowed": "Speech recognition is blocked by this browser.",
        "audio-capture": "No microphone was found.",
        "no-speech": "No speech was detected. Please try again.",
        network: "Speech recognition needs an internet connection.",
      };
      onError?.(messages[event.error] || `Speech recognition error: ${event.error || "unknown"}`);
    };
    recognition.onend = () => {
      if (this.activeRecognition === recognition) {
        this.activeRecognition = null;
      }
      onEnd?.();
    };

    try {
      recognition.start();
      this.activeRecognition = recognition;
      return recognition;
    } catch (error) {
      onError?.(error.message || "Could not start speech recognition.");
      return null;
    }
  }

  static stopListening() {
    if (!this.activeRecognition) return;
    this.activeRecognition.onend = null;
    this.activeRecognition.onerror = null;
    this.activeRecognition.onresult = null;
    this.activeRecognition.abort();
    this.activeRecognition = null;
  }

  static speak(text, { lang = 'hi', onStart, onEnd } = {}) {
    if (!this.isSpeechSynthesisSupported() || !String(text || "").trim()) {
      onEnd?.();
      return false;
    }

    window.speechSynthesis.cancel();

    const cleanText = String(text)
      .replace(/[*_#•\n]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "en" || lang === "en-IN" ? "en-IN" : "hi-IN";
    utterance.rate = 0.95;
    utterance.volume = 1;

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
    return true;
  }

  static stopSpeaking() {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}