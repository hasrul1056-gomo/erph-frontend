import { useState, useRef, useCallback, useEffect } from 'react';

const LANG_OPTIONS = [
  { code: 'ms-MY', label: 'BM' },
  { code: 'ar-SA', label: 'AR' },
  { code: 'en-MY', label: 'EN' },
];

export const isVoiceSupported = () =>
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

export function useVoiceInput() {
  const [activeField, setActiveField]   = useState(null);
  const [lang, setLang]                 = useState('ms-MY');
  const [isListening, setIsListening]   = useState(false);
  const [interim, setInterim]           = useState('');

  const recognitionRef  = useRef(null);
  const isListeningRef  = useRef(false);   // ref supaya onend sentiasa baca nilai terkini
  const langRef         = useRef('ms-MY'); // ref supaya onend guna lang terkini

  // ── Ref-based state untuk nilai field semasa ──────────
  // PUNCA BUG ASAL: closure dalam onResultRef menyimpan
  // currentValue lama. Kini kita simpan dalam ref yang
  // sentiasa dikemas kini oleh VoiceTextarea.
  const currentValueRef = useRef('');   // nilai teks TERKINI dalam field
  const onUpdateRef     = useRef(null); // fungsi setState terkini

  // Sync ref dengan state (dipanggil dari luar via updateRefs)
  const updateRefs = useCallback((currentValue, onUpdate) => {
    currentValueRef.current = currentValue;
    onUpdateRef.current     = onUpdate;
  }, []);

  // Sync langRef bila lang berubah
  useEffect(() => { langRef.current = lang; }, [lang]);

  // ── Bina recognition instance ─────────────────────────
  const buildRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const r = new SR();
    r.continuous      = true;
    r.interimResults  = true;
    r.lang            = langRef.current;
    r.maxAlternatives = 1;

    r.onresult = (event) => {
      let finalText   = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t;
        else interimText += t;
      }

      setInterim(interimText);

      if (finalText && onUpdateRef.current) {
        // Baca currentValueRef.current — SENTIASA NILAI TERKINI
        const prev    = currentValueRef.current;
        const updated = prev ? prev.trimEnd() + ' ' + finalText.trim() : finalText.trim();

        // Kemas kini ref terus supaya rakam berikutnya ada nilai betul
        currentValueRef.current = updated;
        onUpdateRef.current(updated);
      }
    };

    r.onerror = (e) => {
      if (e.error === 'no-speech') return; // bukan ralat sebenar, abaikan
      console.error('Speech error:', e.error);
      isListeningRef.current = false;
      setIsListening(false);
      setInterim('');
      setActiveField(null);
    };

    r.onend = () => {
      // Guna ref — bukan closure state yang lapuk
      if (isListeningRef.current) {
        // Masih dalam mod listening — restart automatik
        try {
          // Buat instance baru supaya lang juga dikemas kini
          const next = buildRecognition();
          if (next) {
            recognitionRef.current = next;
            next.start();
          }
        } catch {}
      } else {
        setIsListening(false);
        setInterim('');
      }
    };

    return r;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // sengaja kosong — guna refs sahaja dalam fungsi ini

  // ── Mula rakam ────────────────────────────────────────
  const startListening = useCallback((fieldKey, currentValue, onUpdate) => {
    if (!isVoiceSupported()) return;

    // Stop rakam lama tanpa trigger onend restart
    if (recognitionRef.current) {
      isListeningRef.current = false; // beritahu onend jangan restart
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    // Simpan nilai & callback terkini dalam ref
    currentValueRef.current = currentValue;
    onUpdateRef.current     = onUpdate;

    const r = buildRecognition();
    if (!r) return;

    r.lang = lang; // pastikan lang terkini
    recognitionRef.current = r;
    isListeningRef.current = true;

    try {
      r.start();
      setActiveField(fieldKey);
      setIsListening(true);
      setInterim('');
    } catch (err) {
      console.error('Cannot start recognition:', err);
      isListeningRef.current = false;
    }
  }, [buildRecognition, lang]);

  // ── Berhenti rakam ────────────────────────────────────
  const stopListening = useCallback(() => {
    isListeningRef.current = false; // beritahu onend jangan restart
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterim('');
    setActiveField(null);
  }, []);

  // ── Toggle untuk satu field ───────────────────────────
  const toggleField = useCallback((fieldKey, currentValue, onUpdate) => {
    if (activeField === fieldKey && isListeningRef.current) {
      stopListening();
    } else {
      startListening(fieldKey, currentValue, onUpdate);
    }
  }, [activeField, startListening, stopListening]);

  // ── Cleanup bila unmount ──────────────────────────────
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  return {
    activeField,
    isListening,
    interim,
    lang,
    setLang,
    langOptions: LANG_OPTIONS,
    toggleField,
    stopListening,
    updateRefs,    // ← eksport supaya VoiceTextarea boleh sync ref setiap render
    supported: isVoiceSupported(),
  };
}
