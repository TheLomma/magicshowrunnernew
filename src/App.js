import { useReducer, useEffect, useRef, useCallback, useState } from "react";

// ============================================================
// CONSTANTS & HELPERS
// ============================================================
const IDB_NAME = 'ShowRunnerDB';
const IDB_STORE = 'backups';
const IDB_VERSION = 1;

function openIDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject('No IDB');
    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE))
        db.createObjectStore(IDB_STORE, { keyPath: 'key' });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}
async function idbWrite(key, value) {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put({ key, value, savedAt: new Date().toISOString() });
      tx.oncomplete = resolve; tx.onerror = reject;
    });
  } catch(e) {}
}
async function idbRead(key) {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = (e) => resolve(e.target.result?.value ?? null);
      req.onerror = reject;
    });
  } catch(e) { return null; }
}

const AudioEngine = {
  ctx: null,
  getCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this.ctx;
  },
  beep(vol = 0.5, freq = 880, dur = 0.15) {
    try {
      const c = this.getCtx(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.frequency.value = freq; g.gain.value = vol;
      o.start(); o.stop(c.currentTime + dur);
    } catch(e) {}
  },
  speak(text, lang = 'de-DE', rate = 1, pitch = 1, voiceURI = null) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = rate; u.pitch = pitch;
    const voices = window.speechSynthesis.getVoices();
    const v = voiceURI
      ? voices.find(v => v.voiceURI === voiceURI)
      : voices.find(v => v.lang.startsWith(lang.slice(0,2)));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }
};

const vibrate = (p = [200]) => { try { if ('vibrate' in navigator) navigator.vibrate(p); } catch(e) {} };
const fmt = (s) => { s = Math.abs(Math.floor(s)); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; };

// ============================================================
// THEME & TRANSLATION DATA
// ============================================================
const THEMES = {
  light: { name:'☀️ Hell', bg:'bg-gradient-to-br from-indigo-50 to-purple-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-indigo-600', accentHover:'hover:bg-indigo-700', border:'border-gray-200', input:'bg-white border-gray-300 text-gray-800', planCard:'bg-white shadow', badgeBg:'bg-indigo-100', badgeText:'text-indigo-700', headText:'text-indigo-900', subText:'text-indigo-600' },
  dark:  { name:'🌙 Dunkel', bg:'bg-gradient-to-br from-gray-900 to-gray-800', card:'bg-gray-800', text:'text-gray-100', textSub:'text-gray-400', accent:'bg-indigo-500', accentHover:'hover:bg-indigo-600', border:'border-gray-700', input:'bg-gray-700 border-gray-600 text-gray-100', planCard:'bg-gray-800 shadow-lg', badgeBg:'bg-indigo-900', badgeText:'text-indigo-300', headText:'text-indigo-300', subText:'text-indigo-400' },
  black: { name:'⚫ Schwarz', bg:'bg-black', card:'bg-gray-950', text:'text-gray-200', textSub:'text-gray-600', accent:'bg-indigo-600', accentHover:'hover:bg-indigo-700', border:'border-gray-800', input:'bg-gray-900 border-gray-800 text-gray-200', planCard:'bg-gray-950 border border-gray-800 shadow-lg', badgeBg:'bg-indigo-950', badgeText:'text-indigo-400', headText:'text-indigo-400', subText:'text-indigo-500' },
  ocean: { name:'🌊 Ozean', bg:'bg-gradient-to-br from-cyan-50 to-blue-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-cyan-600', accentHover:'hover:bg-cyan-700', border:'border-cyan-200', input:'bg-white border-cyan-300 text-gray-800', planCard:'bg-white shadow', badgeBg:'bg-cyan-100', badgeText:'text-cyan-700', headText:'text-cyan-900', subText:'text-cyan-600' },
  forest:{ name:'🌲 Wald', bg:'bg-gradient-to-br from-green-50 to-emerald-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-emerald-600', accentHover:'hover:bg-emerald-700', border:'border-emerald-200', input:'bg-white border-emerald-300 text-gray-800', planCard:'bg-white shadow', badgeBg:'bg-emerald-100', badgeText:'text-emerald-700', headText:'text-emerald-900', subText:'text-emerald-600' },
  royal: { name:'👑 Royal', bg:'bg-gradient-to-br from-purple-50 to-fuchsia-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-purple-600', accentHover:'hover:bg-purple-700', border:'border-purple-200', input:'bg-white border-purple-300 text-gray-800', planCard:'bg-white shadow', badgeBg:'bg-purple-100', badgeText:'text-purple-700', headText:'text-purple-900', subText:'text-purple-600' },
};

const PERFORM_THEMES = {
  light: { name:'☀️ Hell', bg:'bg-gradient-to-br from-indigo-50 to-purple-100', card:'bg-white', text:'text-gray-800', timerText:'text-indigo-700', warnBg:'bg-red-50 border-2 border-red-300', warnTimer:'text-red-600' },
  dark:  { name:'🌙 Dunkel', bg:'bg-gradient-to-br from-gray-900 to-gray-800', card:'bg-gray-800', text:'text-gray-100', timerText:'text-indigo-400', warnBg:'bg-red-950 border-2 border-red-700', warnTimer:'text-red-500' },
  black: { name:'⚫ Schwarz', bg:'bg-black', card:'bg-gray-950 border border-gray-800', text:'text-gray-300', timerText:'text-indigo-400', warnBg:'bg-black border-2 border-red-800', warnTimer:'text-red-500' },
};

const T = {
  appTitle:'🎩✨ Magic Showrunner', appVersion:'v2.0',
  save:'💾 Speichern', load:'📂 Laden', backup:'📥 Backup', settings:'⚙️ Einstellungen',
  newPart:'➕ Neuer Teil', startShow:'🎭 Show starten', testMode:'🧪 Testmodus',
  parts:'Teile', totalTime:'Gesamtzeit', settingsTitle:'⚙️ Einstellungen',
  tabDesign:'🎨 Design', tabAudio:'🔊 Audio', tabTTS:'🗣️ Stimme', tabFont:'🔤 Schrift', tabLicense:'🔑 Lizenz',
  licenseTitle:'🔑 Freischaltcode', licenseRedeem:'🔑 Einlösen',
  licenseSuccess:'✅ Code eingelöst!', licenseError:'❌ Ungültiger Code.', licenseAlready:'ℹ️ Bereits aktiv.',
  licenseReset:'🗑 Lizenz zurücksetzen', licenseActive:'✅ Aktive Features:', licenseNone:'Keine Features freigeschaltet.',
  licensePlaceholder:'z.B. MAGIC-PRO-2026',
  planTheme:'Planungs-Theme', performTheme:'Perform-Theme',
  beeps:'🔔 Signaltöne', vibration:'📳 Vibration', volume:'🔊 Lautstärke',
  testTone:'🔊 Testton', testDuration:'⏱ Testmodus-Dauer pro Teil',
  titleLabel:'Titel', durationLabel:'Dauer (Sek.)', introLabel:'Intro-Ansage (TTS)',
  preAnnounceLabel:'Vorankündigung (Sek.)', preAnnounceText:'Vorankündigungs-Text',
  notesLabel:'Notizen', musicUrl:'Musik-URL', vol:'Vol', fadeIn:'Fade In', fadeOut:'Fade Out',
  saveBtn:'💾 Speichern', cancelBtn:'Abbrechen', testBtn:'🔊 Test',
  saveShowTitle:'💾 Show speichern', showName:'Show-Name', overwrite:'Überschreiben:',
  loadShowTitle:'📂 Show laden', noSaved:'Keine gespeicherten Shows.',
  perform_pause:'⏸ Pause', perform_resume:'▶ Weiter', perform_stop:'⏹ Stop',
  perform_prev:'← Zurück', perform_next:'Weiter →', perform_notes:'📝 Notizen',
  perform_remaining:'verbleibend', perform_part:'Teil', perform_of:'/', perform_total:'Gesamt',
  ttsVoice:'Stimme', ttsRate:'Geschwindigkeit', ttsPitch:'Tonhöhe', ttsPreview:'🔊 Vorschau',
  ttsApply:'✅ Übernehmen', fontApply:'✅ Übernehmen', fontPreview:'Vorschau:',
  fontSize:'Schriftgröße', fontFamily:'Schriftart', animations:'Animationen',
  dragHint:'☰ Halten & ziehen zum Umsortieren',
  partColor:'Farbe', duplicatePart:'📋 Duplizieren',
  endedMsg:'Die Show ist beendet. Vielen Dank!',
  idbSaved:'🗄️ IDB-Backup gespeichert', idbRestored:'🗄️ Daten aus IDB wiederhergestellt',
  addPart:'➕ Neuer Teil', editPart:'✏️ Teil bearbeiten',
  noStats:'Noch keine Shows.', shows:'Shows', clearHistory:'🗑 Verlauf löschen',
  statsTitle:'📊 Statistiken', stageTitle:'🎪 Bühnenplan',
  wakelock:'📱 Bildschirm aktiv halten',
};

const PART_COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6','#64748b'];

const EMPTY_PART = {
  title:'', duration:300, introText:'', preAnnounceSec:10, announceNextText:'',
  notes:'', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#6366f1',
};

const DEMO_PARTS = [
  { id:1, title:'Begrüßung & Einleitung', duration:180, introText:'Meine Damen und Herren, willkommen!', preAnnounceSec:15, announceNextText:'Gleich der erste Trick!', notes:'Spotlight Mitte.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#6366f1' },
  { id:2, title:'Die verschwindende Münze', duration:300, introText:'Zum ersten Trick!', preAnnounceSec:20, announceNextText:'Gleich: Gedankenlesung!', notes:'Silbermünze, schwarzes Tuch.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#8b5cf6' },
  { id:3, title:'Mentalmagie', duration:420, introText:'Darf ich einen Freiwilligen bitten?', preAnnounceSec:15, announceNextText:'Gleich Pause.', notes:'Umschläge, Stift.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#ec4899' },
  { id:4, title:'Pause', duration:600, introText:'Zehn Minuten Pause!', preAnnounceSec:30, announceNextText:'Bitte Plätze einnehmen!', notes:'Jazz-Playlist.', musicUrl:'', musicVolume:0.5, musicFadeIn:5, musicFadeOut:5, musicLoop:true, color:'#22c55e' },
  { id:5, title:'Der unmögliche Kartentrick', duration:480, introText:'Willkommen zurück!', preAnnounceSec:20, announceNextText:'Gleich kommt das Finale!', notes:'2 Kartenspiele.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#f97316' },
  { id:6, title:'Finale – schwebende Rose', duration:360, introText:'Das große Finale!', preAnnounceSec:20, announceNextText:'Gleich Verabschiedung.', notes:'Nebelmaschine 30s vorher!', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#ef4444' },
  { id:7, title:'Verabschiedung', duration:180, introText:'Vielen Dank!', preAnnounceSec:10, announceNextText:'', notes:'Visitenkarten am Ausgang.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#14b8a6' },
];

const LICENSE_CODES = {
  'MAGIC-PRO-2026': ['pro','exportPDF','unlimitedParts'],
  'SHOW-VIP-2026':  ['pro','exportPDF','unlimitedParts','tts_pro'],
  'DEMO-TEST-CODE': ['exportPDF'],
  'CODEBREAKERS':   ['pro','exportPDF','unlimitedParts','tts_pro'],
};

const FONT_FAMILIES = [
  { label:'Inter (Standard)', value:'"Inter", system-ui, sans-serif' },
  { label:'System',           value:'system-ui, sans-serif' },
  { label:'Serif',            value:'Georgia, serif' },
  { label:'Mono',             value:'"JetBrains Mono", monospace' },
  { label:'Rounded',          value:'"Nunito", sans-serif' },
];

// ============================================================
// REDUCER
// ============================================================
const initialState = {
  // UI
  mode: 'plan', // 'plan' | 'perform' | 'settings' | 'stats' | 'stage'
  settingsTab: 'design',
  toast: null,
  showForm: false,
  editIdx: null,
  showSaveModal: false,
  showLoadModal: false,
  showTemplates: false,
  countdownNum: null,
  // Parts
  parts: (() => {
    try { const s = localStorage.getItem('ms_autosave'); if (s) { const d = JSON.parse(s); if (d.parts?.length) return d.parts; } } catch(e) {}
    return DEMO_PARTS;
  })(),
  form: { ...EMPTY_PART },
  // Perform
  isRunning: false,
  isPaused: false,
  currentPartIndex: 0,
  partElapsed: 0,
  totalElapsed: 0,
  testMode: false,
  testDuration: 10,
  preAnnounced: false,
  showEnded: false,
  // Settings
  themeMode: localStorage.getItem('ms_themeMode') || 'auto',
  performTheme: localStorage.getItem('ms_performTheme') || 'dark',
  animationsEnabled: localStorage.getItem('ms_animations') !== 'false',
  fontSize: parseInt(localStorage.getItem('ms_fontSize') || '15'),
  fontFamily: localStorage.getItem('ms_fontFamily') || FONT_FAMILIES[0].value,
  ttsRate: parseFloat(localStorage.getItem('ms_ttsRate') || '1'),
  ttsPitch: parseFloat(localStorage.getItem('ms_ttsPitch') || '1'),
  ttsVoiceURI: localStorage.getItem('ms_ttsVoice') || '',
  beepsEnabled: localStorage.getItem('ms_beeps') !== 'false',
  vibrationEnabled: localStorage.getItem('ms_vibration') !== 'false',
  volume: parseFloat(localStorage.getItem('ms_volume') || '0.5'),
  countdownAnimation: localStorage.getItem('ms_countdown') !== 'false',
  wakeLock: false,
  // License
  unlockedFeatures: (() => { try { return JSON.parse(localStorage.getItem('ms_features') || '[]'); } catch(e) { return []; } })(),
  licenseInput: '',
  licenseStatus: null,
  // Stats
  showHistory: (() => { try { return JSON.parse(localStorage.getItem('ms_history') || '[]'); } catch(e) { return []; } })(),
  // Save/Load
  savedShows: (() => { try { return JSON.parse(localStorage.getItem('ms_shows') || '[]'); } catch(e) { return []; } })(),
  saveShowName: '',
};

function reducer(state, action) {
  switch(action.type) {
    // UI
    case 'SET_MODE': return { ...state, mode: action.payload };
    case 'SET_SETTINGS_TAB': return { ...state, settingsTab: action.payload };
    case 'SET_TOAST': return { ...state, toast: action.payload };
    case 'CLEAR_TOAST': return { ...state, toast: null };
    case 'SHOW_FORM': return { ...state, showForm: true, editIdx: action.idx ?? null, form: action.form ?? { ...EMPTY_PART } };
    case 'HIDE_FORM': return { ...state, showForm: false, editIdx: null };
    case 'SET_FORM': return { ...state, form: { ...state.form, ...action.payload } };
    case 'SET_COUNTDOWN_NUM': return { ...state, countdownNum: action.payload };
    case 'TOGGLE_SAVE_MODAL': return { ...state, showSaveModal: !state.showSaveModal };
    case 'TOGGLE_LOAD_MODAL': return { ...state, showLoadModal: !state.showLoadModal };
    case 'TOGGLE_TEMPLATES': return { ...state, showTemplates: !state.showTemplates };
    case 'SET_SAVE_NAME': return { ...state, saveShowName: action.payload };
    // Parts
    case 'SET_PARTS': return { ...state, parts: action.payload };
    case 'ADD_PART': {
      const np = [...state.parts, { ...state.form, id: Date.now() }];
      return { ...state, parts: np, showForm: false };
    }
    case 'UPDATE_PART': {
      const np = state.parts.map((p,i) => i === state.editIdx ? { ...p, ...state.form } : p);
      return { ...state, parts: np, showForm: false, editIdx: null };
    }
    case 'DELETE_PART': {
      const np = state.parts.filter((_,i) => i !== action.idx);
      return { ...state, parts: np };
    }
    case 'DUPLICATE_PART': {
      const p = state.parts[action.idx];
      const np = [...state.parts];
      np.splice(action.idx + 1, 0, { ...p, id: Date.now(), title: p.title + ' (Kopie)' });
      return { ...state, parts: np };
    }
    case 'REORDER_PARTS': {
      const np = [...state.parts];
      const [dragged] = np.splice(action.from, 1);
      np.splice(action.to, 0, dragged);
      return { ...state, parts: np };
    }
    // Perform
    case 'START_SHOW': return { ...state, isRunning: true, isPaused: false, currentPartIndex: 0, partElapsed: 0, totalElapsed: 0, preAnnounced: false, showEnded: false, mode: 'perform' };
    case 'STOP_SHOW': return { ...state, isRunning: false, isPaused: false, mode: 'plan', showEnded: false };
    case 'TOGGLE_PAUSE': return { ...state, isPaused: !state.isPaused };
    case 'TICK': return { ...state, partElapsed: state.partElapsed + 1, totalElapsed: state.totalElapsed + 1 };
    case 'NEXT_PART': return { ...state, currentPartIndex: state.currentPartIndex + 1, partElapsed: 0, preAnnounced: false };
    case 'PREV_PART': return { ...state, currentPartIndex: Math.max(0, state.currentPartIndex - 1), partElapsed: 0, preAnnounced: false };
    case 'SET_PRE_ANNOUNCED': return { ...state, preAnnounced: true };
    case 'SET_SHOW_ENDED': return { ...state, showEnded: true, isRunning: false };
    case 'SET_TEST_MODE': return { ...state, testMode: action.payload };
    case 'SET_TEST_DURATION': return { ...state, testDuration: action.payload };
    // Settings
    case 'SET_THEME_MODE': return { ...state, themeMode: action.payload };
    case 'SET_PERFORM_THEME': return { ...state, performTheme: action.payload };
    case 'SET_ANIMATIONS': return { ...state, animationsEnabled: action.payload };
    case 'SET_FONT_SIZE': return { ...state, fontSize: action.payload };
    case 'SET_FONT_FAMILY': return { ...state, fontFamily: action.payload };
    case 'SET_TTS_RATE': return { ...state, ttsRate: action.payload };
    case 'SET_TTS_PITCH': return { ...state, ttsPitch: action.payload };
    case 'SET_TTS_VOICE': return { ...state, ttsVoiceURI: action.payload };
    case 'SET_BEEPS': return { ...state, beepsEnabled: action.payload };
    case 'SET_VIBRATION': return { ...state, vibrationEnabled: action.payload };
    case 'SET_VOLUME': return { ...state, volume: action.payload };
    case 'SET_COUNTDOWN': return { ...state, countdownAnimation: action.payload };
    case 'SET_WAKE_LOCK': return { ...state, wakeLock: action.payload };
    // License
    case 'SET_LICENSE_INPUT': return { ...state, licenseInput: action.payload };
    case 'SET_LICENSE_STATUS': return { ...state, licenseStatus: action.payload };
    case 'SET_FEATURES': return { ...state, unlockedFeatures: action.payload };
    // Stats
    case 'ADD_HISTORY': return { ...state, showHistory: [action.payload, ...state.showHistory].slice(0, 50) };
    case 'CLEAR_HISTORY': return { ...state, showHistory: [] };
    // Save/Load
    case 'SAVE_SHOW': {
      const existing = state.savedShows.filter(s => s.name !== state.saveShowName);
      const updated = [{ name: state.saveShowName, parts: state.parts, savedAt: new Date().toISOString() }, ...existing];
      return { ...state, savedShows: updated, showSaveModal: false };
    }
    case 'LOAD_SHOW': {
      const show = state.savedShows[action.idx];
      return show ? { ...state, parts: show.parts, showLoadModal: false } : state;
    }
    case 'DELETE_SHOW': {
      const updated = state.savedShows.filter((_,i) => i !== action.idx);
      return { ...state, savedShows: updated };
    }
    case 'SET_SAVED_SHOWS': return { ...state, savedShows: action.payload };
    default: return state;
  }
}

// ============================================================
// SMALL SHARED COMPONENTS
// ============================================================
function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-gray-400'}`} />
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium animate-bounce-once pointer-events-none">
      {message}
    </div>
  );
}

function Modal({ title, onClose, children, th }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className={`${th.card} ${th.text} rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto`}>
        <div className={`flex items-center justify-between p-4 border-b ${th.border}`}>
          <span className="font-bold text-lg">{title}</span>
          <button onClick={onClose} className="text-2xl leading-none opacity-60 hover:opacity-100">×</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// PART EDITOR
// ============================================================
function PartEditor({ state, dispatch, th }) {
  const { form, editIdx } = state;
  const set = (k, v) => dispatch({ type: 'SET_FORM', payload: { [k]: v } });

  const handleSave = () => {
    if (!form.title.trim()) return;
    dispatch({ type: editIdx !== null ? 'UPDATE_PART' : 'ADD_PART' });
    dispatch({ type: 'SET_TOAST', payload: editIdx !== null ? '✏️ Teil aktualisiert' : '➕ Teil hinzugefügt' });
  };

  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm ${th.input}`;

  return (
    <Modal title={editIdx !== null ? T.editPart : T.addPart} onClose={() => dispatch({ type: 'HIDE_FORM' })} th={th}>
      <div className="space-y-3">
        <div>
          <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.titleLabel}</label>
          <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="z.B. Kartenmagie" />
        </div>
        <div>
          <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.durationLabel}</label>
          <input type="number" className={inputCls} value={form.duration} min={5} onChange={e => set('duration', parseInt(e.target.value) || 60)} />
          <span className={`text-xs ${th.textSub}`}>{fmt(form.duration)}</span>
        </div>
        <div>
          <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.introLabel}</label>
          <textarea className={inputCls} rows={2} value={form.introText} onChange={e => set('introText', e.target.value)} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.preAnnounceLabel}</label>
            <input type="number" className={inputCls} value={form.preAnnounceSec} min={0} onChange={e => set('preAnnounceSec', parseInt(e.target.value) || 0)} />
          </div>
          <div className="flex-1">
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.preAnnounceText}</label>
            <input className={inputCls} value={form.announceNextText} onChange={e => set('announceNextText', e.target.value)} />
          </div>
        </div>
        <div>
          <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.notesLabel}</label>
          <textarea className={inputCls} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
        <div>
          <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.musicUrl}</label>
          <input className={inputCls} value={form.musicUrl} onChange={e => set('musicUrl', e.target.value)} placeholder="https://..." />
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div>
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.vol}</label>
            <input type="range" min={0} max={1} step={0.05} value={form.musicVolume} onChange={e => set('musicVolume', parseFloat(e.target.value))} className="w-24" />
          </div>
          <div>
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.fadeIn}</label>
            <input type="number" className={`${inputCls} w-16`} min={0} max={10} value={form.musicFadeIn} onChange={e => set('musicFadeIn', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.fadeOut}</label>
            <input type="number" className={`${inputCls} w-16`} min={0} max={10} value={form.musicFadeOut} onChange={e => set('musicFadeOut', parseInt(e.target.value) || 0)} />
          </div>
          <Toggle checked={form.musicLoop} onChange={v => set('musicLoop', v)} label="Loop" />
        </div>
        <div>
          <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.partColor}</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {PART_COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${form.color === c ? 'border-white scale-125' : 'border-transparent'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={handleSave} className={`flex-1 py-2 rounded-lg text-white font-semibold ${th.accent} ${th.accentHover}`}>{T.saveBtn}</button>
          <button onClick={() => dispatch({ type: 'HIDE_FORM' })} className={`flex-1 py-2 rounded-lg border ${th.border} ${th.text}`}>{T.cancelBtn}</button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// PERFORM VIEW
// ============================================================
function PerformView({ state, dispatch, pth, sendNotification, wakeLockRef }) {
  const { parts, currentPartIndex, partElapsed, totalElapsed, isRunning, isPaused, testMode, testDuration, showEnded, preAnnounced, beepsEnabled, vibrationEnabled, volume, countdownAnimation, ttsRate, ttsPitch, ttsVoiceURI } = state;
  const intervalRef = useRef(null);
  const part = parts[currentPartIndex];
  const effectiveDuration = testMode ? testDuration : (part?.duration || 300);
  const remaining = effectiveDuration - partElapsed;
  const totalDuration = parts.reduce((a, p) => a + (testMode ? testDuration : p.duration), 0);
  const totalRemaining = totalDuration - totalElapsed;
  const isWarning = remaining <= 30 && remaining > 0;
  const pct = Math.min(100, (partElapsed / effectiveDuration) * 100);

  const speak = useCallback((text) => {
    AudioEngine.speak(text, 'de-DE', ttsRate, ttsPitch, ttsVoiceURI || null);
  }, [ttsRate, ttsPitch, ttsVoiceURI]);

  useEffect(() => {
    if (!isRunning || isPaused) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, dispatch]);

  useEffect(() => {
    if (!isRunning || isPaused) return;
    if (remaining <= 0) {
      if (currentPartIndex < parts.length - 1) {
        if (beepsEnabled) AudioEngine.beep(volume, 880, 0.2);
        if (vibrationEnabled) vibrate([200, 100, 200]);
        dispatch({ type: 'NEXT_PART' });
        const nextPart = parts[currentPartIndex + 1];
        if (nextPart?.introText) speak(nextPart.introText);
        sendNotification('⏭ Nächster Teil', nextPart?.title || '');
      } else {
        dispatch({ type: 'SET_SHOW_ENDED' });
        if (beepsEnabled) AudioEngine.beep(volume, 440, 0.5);
        speak(T.endedMsg);
        sendNotification('🎭 Show beendet', T.endedMsg);
      }
    } else if (!preAnnounced && part?.announceNextText && remaining <= part.preAnnounceSec && part.preAnnounceSec > 0) {
      dispatch({ type: 'SET_PRE_ANNOUNCED' });
      speak(part.announceNextText);
    }
  }, [remaining, isRunning, isPaused]);

  // Wake lock
  useEffect(() => {
    if (!isRunning) return;
    const acquire = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          dispatch({ type: 'SET_WAKE_LOCK', payload: true });
        }
      } catch(e) {}
    };
    acquire();
    return () => { wakeLockRef.current?.release(); dispatch({ type: 'SET_WAKE_LOCK', payload: false }); };
  }, [isRunning]);

  if (!part) return null;

  if (showEnded) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${pth.bg} ${pth.text}`}>
      <div className="text-6xl mb-6">🎩✨</div>
      <div className="text-3xl font-bold mb-4">{T.endedMsg}</div>
      <button onClick={() => dispatch({ type: 'STOP_SHOW' })} className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold">← Zurück</button>
    </div>
  );

  return (
    <div className={`min-h-screen ${pth.bg} ${pth.text} flex flex-col`}>
      {/* Header */}
      <div className={`${pth.card} px-4 py-3 flex items-center justify-between shadow`}>
        <div className="font-bold text-lg">🎩 {T.appTitle}</div>
        <div className="flex gap-2">
          {testMode && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">TEST</span>}
          <span className="text-sm opacity-60">{T.perform_part} {currentPartIndex+1} {T.perform_of} {parts.length}</span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-700">
        <div className="h-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="w-4 h-4 rounded-full" style={{ background: part.color }} />
        <h1 className="text-3xl font-bold text-center">{part.title}</h1>
        {/* Timer */}
        <div className={`text-8xl font-mono font-bold ${isWarning ? pth.warnTimer : pth.timerText} ${isWarning ? 'animate-pulse' : ''}`}>
          {fmt(remaining)}
        </div>
        <div className="text-sm opacity-60">{T.perform_total}: {fmt(totalRemaining)}</div>
        {/* Notes */}
        {part.notes && (
          <div className={`${pth.card} rounded-xl p-4 max-w-md w-full`}>
            <div className="text-xs font-semibold opacity-60 mb-1">{T.perform_notes}</div>
            <div className="text-sm">{part.notes}</div>
          </div>
        )}
        {/* Controls */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={() => dispatch({ type: 'PREV_PART' })} disabled={currentPartIndex === 0}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white">{T.perform_prev}</button>
          <button onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
            className={`px-6 py-2 rounded-lg font-semibold text-white ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}>
            {isPaused ? T.perform_resume : T.perform_pause}
          </button>
          <button onClick={() => dispatch({ type: 'NEXT_PART' })} disabled={currentPartIndex >= parts.length - 1}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white">{T.perform_next}</button>
        </div>
        <button onClick={() => { dispatch({ type: 'STOP_SHOW' }); }} className="px-6 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold">{T.perform_stop}</button>
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS PANEL
// ============================================================
function SettingsPanel({ state, dispatch, th }) {
  const { settingsTab, themeMode, performTheme, animationsEnabled, fontSize, fontFamily,
    ttsRate, ttsPitch, ttsVoiceURI, beepsEnabled, vibrationEnabled, volume,
    countdownAnimation, unlockedFeatures, licenseInput, licenseStatus } = state;

  const [pendingFont, setPendingFont] = useState({ size: fontSize, family: fontFamily });
  const [pendingTTS, setPendingTTS] = useState({ rate: ttsRate, pitch: ttsPitch, voiceURI: ttsVoiceURI });
  const [voices, setVoices] = useState([]);
  const [fontApplied, setFontApplied] = useState(false);
  const [ttsApplied, setTtsApplied] = useState(false);

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis?.getVoices() || []);
    load();
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load);
  }, []);

  const isUnlocked = f => unlockedFeatures.includes(f);

  const redeemCode = () => {
    const features = LICENSE_CODES[licenseInput.toUpperCase().trim()];
    if (!features) { dispatch({ type: 'SET_LICENSE_STATUS', payload: 'error' }); return; }
    if (features.every(f => unlockedFeatures.includes(f))) { dispatch({ type: 'SET_LICENSE_STATUS', payload: 'already' }); return; }
    const merged = [...new Set([...unlockedFeatures, ...features])];
    dispatch({ type: 'SET_FEATURES', payload: merged });
    dispatch({ type: 'SET_LICENSE_STATUS', payload: 'success' });
    localStorage.setItem('ms_features', JSON.stringify(merged));
    dispatch({ type: 'SET_TOAST', payload: '🎉 Freischaltcode eingelöst!' });
  };

  const applyFont = () => {
    dispatch({ type: 'SET_FONT_SIZE', payload: pendingFont.size });
    dispatch({ type: 'SET_FONT_FAMILY', payload: pendingFont.family });
    localStorage.setItem('ms_fontSize', pendingFont.size);
    localStorage.setItem('ms_fontFamily', pendingFont.family);
    setFontApplied(true); setTimeout(() => setFontApplied(false), 2000);
  };

  const applyTTS = () => {
    dispatch({ type: 'SET_TTS_RATE', payload: pendingTTS.rate });
    dispatch({ type: 'SET_TTS_PITCH', payload: pendingTTS.pitch });
    dispatch({ type: 'SET_TTS_VOICE', payload: pendingTTS.voiceURI });
    localStorage.setItem('ms_ttsRate', pendingTTS.rate);
    localStorage.setItem('ms_ttsPitch', pendingTTS.pitch);
    localStorage.setItem('ms_ttsVoice', pendingTTS.voiceURI);
    setTtsApplied(true); setTimeout(() => setTtsApplied(false), 2000);
  };

  const inputCls = `w-full rounded-lg border px-3 py-2 text-sm ${th.input}`;
  const tabs = ['design','audio','tts','font','license'];
  const tabLabels = { design: T.tabDesign, audio: T.tabAudio, tts: T.tabTTS, font: T.tabFont, license: T.tabLicense };

  return (
    <div className={`${th.card} ${th.text} rounded-2xl shadow-xl max-w-xl mx-auto my-4`}>
      <div className={`p-4 border-b ${th.border} flex items-center justify-between`}>
        <span className="font-bold text-lg">{T.settingsTitle}</span>
        <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'plan' })} className="text-2xl leading-none opacity-60 hover:opacity-100">×</button>
      </div>
      {/* Tabs */}
      <div className={`flex border-b ${th.border} overflow-x-auto`}>
        {tabs.map(t => (
          <button key={t} onClick={() => dispatch({ type: 'SET_SETTINGS_TAB', payload: t })}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${settingsTab === t ? `${th.accent} text-white` : `${th.text} opacity-60 hover:opacity-100`}`}>
            {tabLabels[t]}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-4">
        {/* DESIGN */}
        {settingsTab === 'design' && <>
          <div>
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.planTheme}</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {['auto', ...Object.keys(THEMES)].map(k => (
                <button key={k} onClick={() => { dispatch({ type: 'SET_THEME_MODE', payload: k }); localStorage.setItem('ms_themeMode', k); }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${themeMode === k ? `${th.accent} text-white border-transparent` : `${th.border} ${th.text}`}`}>
                  {k === 'auto' ? '🔄 Auto' : THEMES[k].name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.performTheme}</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.keys(PERFORM_THEMES).map(k => (
                <button key={k} onClick={() => { dispatch({ type: 'SET_PERFORM_THEME', payload: k }); localStorage.setItem('ms_performTheme', k); }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${performTheme === k ? `${th.accent} text-white border-transparent` : `${th.border} ${th.text}`}`}>
                  {PERFORM_THEMES[k].name}
                </button>
              ))}
            </div>
          </div>
          <Toggle checked={animationsEnabled} onChange={v => { dispatch({ type: 'SET_ANIMATIONS', payload: v }); localStorage.setItem('ms_animations', v); }} label={T.animations} />
          <Toggle checked={countdownAnimation} onChange={v => { dispatch({ type: 'SET_COUNTDOWN', payload: v }); localStorage.setItem('ms_countdown', v); }} label="⏳ Countdown-Animation" />
        </>}
        {/* AUDIO */}
        {settingsTab === 'audio' && <>
          <Toggle checked={beepsEnabled} onChange={v => { dispatch({ type: 'SET_BEEPS', payload: v }); localStorage.setItem('ms_beeps', v); }} label={T.beeps} />
          <Toggle checked={vibrationEnabled} onChange={v => { dispatch({ type: 'SET_VIBRATION', payload: v }); localStorage.setItem('ms_vibration', v); }} label={T.vibration} />
          <div>
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.volume}: {Math.round(volume * 100)}%</label>
            <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => { dispatch({ type: 'SET_VOLUME', payload: parseFloat(e.target.value) }); localStorage.setItem('ms_volume', e.target.value); }} className="w-full mt-1" />
          </div>
          <button onClick={() => AudioEngine.beep(volume, 880, 0.2)} className={`px-4 py-2 rounded-lg ${th.accent} text-white`}>{T.testTone}</button>
        </>}
        {/* TTS */}
        {settingsTab === 'tts' && <>
          <div>
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.ttsVoice}</label>
            <select className={inputCls} value={pendingTTS.voiceURI} onChange={e => setPendingTTS(p => ({ ...p, voiceURI: e.target.value }))}>
              <option value="">Standard</option>
              {voices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
            </select>
          </div>
          <div>
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.ttsRate}: {pendingTTS.rate.toFixed(1)}</label>
            <input type="range" min={0.5} max={2} step={0.1} value={pendingTTS.rate} onChange={e => setPendingTTS(p => ({ ...p, rate: parseFloat(e.target.value) }))} className="w-full" />
          </div>
          <div>
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.ttsPitch}: {pendingTTS.pitch.toFixed(1)}</label>
            <input type="range" min={0.5} max={2} step={0.1} value={pendingTTS.pitch} onChange={e => setPendingTTS(p => ({ ...p, pitch: parseFloat(e.target.value) }))} className="w-full" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => AudioEngine.speak('Das ist eine Vorschau.', 'de-DE', pendingTTS.rate, pendingTTS.pitch, pendingTTS.voiceURI || null)}
              className={`px-4 py-2 rounded-lg ${th.accent} text-white`}>{T.ttsPreview}</button>
            <button onClick={applyTTS} className={`px-4 py-2 rounded-lg ${ttsApplied ? 'bg-green-600' : 'bg-emerald-600'} text-white`}>
              {ttsApplied ? '✅ Übernommen!' : T.ttsApply}
            </button>
          </div>
        </>}
        {/* FONT */}
        {settingsTab === 'font' && <>
          <div>
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.fontFamily}</label>
            <select className={inputCls} value={pendingFont.family} onChange={e => setPendingFont(p => ({ ...p, family: e.target.value }))}>
              {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.fontSize}: {pendingFont.size}px</label>
            <input type="range" min={12} max={22} step={1} value={pendingFont.size} onChange={e => setPendingFont(p => ({ ...p, size: parseInt(e.target.value) }))} className="w-full" />
          </div>
          <div className={`${th.card} border ${th.border} rounded-xl p-4`} style={{ fontFamily: pendingFont.family, fontSize: pendingFont.size }}>
            <div className={`text-xs ${th.textSub} mb-1`}>{T.fontPreview}</div>
            <div>Hallo! Das ist ein Beispieltext. 🎩✨ 1234567890</div>
          </div>
          <button onClick={applyFont} className={`px-4 py-2 rounded-lg ${fontApplied ? 'bg-green-600' : 'bg-emerald-600'} text-white`}>
            {fontApplied ? '✅ Übernommen!' : T.fontApply}
          </button>
        </>}
        {/* LICENSE */}
        {settingsTab === 'license' && <>
          <div className={`text-xs ${th.textSub}`}>{T.licenseTitle}</div>
          <div className="flex gap-2">
            <input className={inputCls} value={licenseInput} onChange={e => dispatch({ type: 'SET_LICENSE_INPUT', payload: e.target.value })}
              placeholder={T.licensePlaceholder} />
            <button onClick={redeemCode} className={`px-4 py-2 rounded-lg ${th.accent} text-white whitespace-nowrap`}>{T.licenseRedeem}</button>
          </div>
          {licenseStatus === 'success' && <div className="text-green-500 text-sm">{T.licenseSuccess}</div>}
          {licenseStatus === 'error' && <div className="text-red-500 text-sm">{T.licenseError}</div>}
          {licenseStatus === 'already' && <div className={`text-sm ${th.textSub}`}>{T.licenseAlready}</div>}
          <div className={`text-xs ${th.textSub} font-semibold mt-2`}>{unlockedFeatures.length ? T.licenseActive : T.licenseNone}</div>
          {unlockedFeatures.map(f => <div key={f} className="text-sm text-green-500">• {f}</div>)}
          {unlockedFeatures.length > 0 && (
            <button onClick={() => { dispatch({ type: 'SET_FEATURES', payload: [] }); localStorage.removeItem('ms_features'); dispatch({ type: 'SET_LICENSE_STATUS', payload: null }); }}
              className="text-xs text-red-500 underline">{T.licenseReset}</button>
          )}
        </>}
      </div>
    </div>
  );
}

// ============================================================
// STATS VIEW
// ============================================================
function StatsView({ state, dispatch, th }) {
  const { showHistory } = state;
  return (
    <div className={`${th.card} ${th.text} rounded-2xl shadow-xl max-w-xl mx-auto my-4 p-4`}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-lg">{T.statsTitle}</span>
        <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'plan' })} className="text-2xl opacity-60 hover:opacity-100">×</button>
      </div>
      {showHistory.length === 0 ? (
        <div className={`text-center py-8 ${th.textSub}`}>{T.noStats}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`${th.planCard} rounded-xl p-3 text-center`}>
              <div className="text-2xl font-bold">{showHistory.length}</div>
              <div className={`text-xs ${th.textSub}`}>{T.shows}</div>
            </div>
            <div className={`${th.planCard} rounded-xl p-3 text-center`}>
              <div className="text-2xl font-bold">{fmt(showHistory.reduce((a,s) => a + (s.duration||0), 0))}</div>
              <div className={`text-xs ${th.textSub}`}>{T.totalTime}</div>
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {showHistory.map((s,i) => (
              <div key={i} className={`${th.planCard} rounded-xl p-3 flex justify-between items-center`}>
                <div>
                  <div className="font-semibold text-sm">{s.name || 'Show'}</div>
                  <div className={`text-xs ${th.textSub}`}>{s.date}</div>
                </div>
                <div className="text-sm font-mono">{fmt(s.duration)}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { dispatch({ type: 'CLEAR_HISTORY' }); localStorage.setItem('ms_history', '[]'); }}
            className="mt-4 text-xs text-red-500 underline">{T.clearHistory}</button>
        </>
      )}
    </div>
  );
}

// ============================================================
// PLAN VIEW (main part list)
// ============================================================
function PlanView({ state, dispatch, th }) {
  const { parts, testMode, testDuration } = state;
  const totalDuration = parts.reduce((a, p) => a + p.duration, 0);
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) return;
    dispatch({ type: 'REORDER_PARTS', from: dragItem.current, to: dragOver.current });
    dragItem.current = null; dragOver.current = null;
    dispatch({ type: 'SET_TOAST', payload: '🔀 Reihenfolge geändert' });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => dispatch({ type: 'SHOW_FORM', form: { ...EMPTY_PART } })}
            className={`px-4 py-2 rounded-lg text-white font-semibold ${th.accent} ${th.accentHover}`}>{T.newPart}</button>
          <button onClick={() => dispatch({ type: 'TOGGLE_TEMPLATES' })}
            className={`px-4 py-2 rounded-lg border ${th.border} ${th.text}`}>📋 Templates</button>
        </div>
        <div className={`text-sm ${th.textSub}`}>{parts.length} {T.parts} · {fmt(totalDuration)}</div>
      </div>
      {/* Test mode */}
      <div className={`flex items-center gap-3 ${th.card} rounded-xl p-3 border ${th.border}`}>
        <Toggle checked={testMode} onChange={v => dispatch({ type: 'SET_TEST_MODE', payload: v })} label={T.testMode} />
        {testMode && <>
          <span className={`text-xs ${th.textSub}`}>{T.testDuration}:</span>
          <input type="number" min={3} max={60} value={testDuration}
            onChange={e => dispatch({ type: 'SET_TEST_DURATION', payload: parseInt(e.target.value) || 10 })}
            className={`w-16 rounded border px-2 py-1 text-sm ${th.input}`} />
          <span className={`text-xs ${th.textSub}`}>Sek.</span>
        </>}
      </div>
      {/* Parts list */}
      <div className="space-y-2">
        {parts.map((part, idx) => (
          <div key={part.id}
            draggable
            onDragStart={() => dragItem.current = idx}
            onDragEnter={() => dragOver.current = idx}
            onDragEnd={handleDragEnd}
            className={`${th.planCard} rounded-xl p-4 flex items-center gap-3 cursor-grab active:cursor-grabbing border-l-4`}
            style={{ borderLeftColor: part.color }}>
            <div className="flex-shrink-0 text-gray-400 cursor-grab">☰</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{part.title}</div>
              <div className={`text-xs ${th.textSub} flex gap-2 mt-0.5`}>
                <span>⏱ {fmt(part.duration)}</span>
                {part.introText && <span>🗣</span>}
                {part.musicUrl && <span>🎵</span>}
                {part.notes && <span>📝</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => dispatch({ type: 'SHOW_FORM', idx, form: { ...part } })}
                className={`px-2 py-1 rounded text-xs border ${th.border} ${th.text}`}>✏️</button>
              <button onClick={() => dispatch({ type: 'DUPLICATE_PART', idx })}
                className={`px-2 py-1 rounded text-xs border ${th.border} ${th.text}`}>📋</button>
              <button onClick={() => { if (window.confirm(`"${part.title}" löschen?`)) dispatch({ type: 'DELETE_PART', idx }); }}
                className="px-2 py-1 rounded text-xs border border-red-400 text-red-500">🗑</button>
            </div>
          </div>
        ))}
      </div>
      {/* Start button */}
      {parts.length > 0 && (
        <button onClick={() => dispatch({ type: 'START_SHOW' })}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg">
          🎭 {T.startShow}
        </button>
      )}
    </div>
  );
}

// ============================================================
// SAVE / LOAD MODALS
// ============================================================
function SaveModal({ state, dispatch, th }) {
  const { saveShowName, savedShows } = state;
  const doSave = () => {
    if (!saveShowName.trim()) return;
    dispatch({ type: 'SAVE_SHOW' });
    const updated = [{ name: saveShowName, parts: state.parts, savedAt: new Date().toISOString() },
      ...savedShows.filter(s => s.name !== saveShowName)];
    localStorage.setItem('ms_shows', JSON.stringify(updated));
    dispatch({ type: 'SET_TOAST', payload: '💾 Show gespeichert' });
  };
  return (
    <Modal title={T.saveShowTitle} onClose={() => dispatch({ type: 'TOGGLE_SAVE_MODAL' })} th={th}>
      <div className="space-y-3">
        <div>
          <label className={`text-xs font-semibold ${th.textSub} uppercase`}>{T.showName}</label>
          <input className={`w-full rounded-lg border px-3 py-2 text-sm ${th.input}`} value={saveShowName}
            onChange={e => dispatch({ type: 'SET_SAVE_NAME', payload: e.target.value })} placeholder="Meine Show" />
        </div>
        {savedShows.filter(s => s.name === saveShowName).length > 0 && (
          <div className="text-xs text-yellow-500">⚠️ {T.overwrite} "{saveShowName}"</div>
        )}
        <button onClick={doSave} className={`w-full py-2 rounded-lg text-white font-semibold ${th.accent}`}>{T.saveBtn}</button>
      </div>
    </Modal>
  );
}

function LoadModal({ state, dispatch, th }) {
  const { savedShows } = state;
  return (
    <Modal title={T.loadShowTitle} onClose={() => dispatch({ type: 'TOGGLE_LOAD_MODAL' })} th={th}>
      {savedShows.length === 0 ? (
        <div className={`text-center py-6 ${th.textSub}`}>{T.noSaved}</div>
      ) : (
        <div className="space-y-2">
          {savedShows.map((s,i) => (
            <div key={i} className={`${th.planCard} rounded-xl p-3 flex items-center justify-between`}>
              <div>
                <div className="font-semibold text-sm">{s.name}</div>
                <div className={`text-xs ${th.textSub}`}>{s.savedAt?.slice(0,10)} · {s.parts?.length} Teile</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { dispatch({ type: 'LOAD_SHOW', idx: i }); dispatch({ type: 'TOGGLE_LOAD_MODAL' }); dispatch({ type: 'SET_TOAST', payload: `📂 "${s.name}" geladen` }); }}
                  className={`px-3 py-1 rounded-lg text-sm ${th.accent} text-white`}>{T.load}</button>
                <button onClick={() => { dispatch({ type: 'DELETE_SHOW', idx: i }); const updated = savedShows.filter((_,j) => j !== i); localStorage.setItem('ms_shows', JSON.stringify(updated)); }}
                  className="px-2 py-1 rounded text-xs text-red-500 border border-red-400">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function ShowRunner() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const wakeLockRef = useRef(null);

  const { mode, parts, toast, showForm, themeMode, performTheme, fontSize, fontFamily,
    isRunning, showSaveModal, showLoadModal } = state;

  const getSystemTheme = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const h = e => setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // Autosave
  useEffect(() => {
    const data = JSON.stringify({ parts, savedAt: new Date().toISOString() });
    localStorage.setItem('ms_autosave', data);
    idbWrite('autosave', { parts });
  }, [parts]);

  // Persist history
  useEffect(() => {
    localStorage.setItem('ms_history', JSON.stringify(state.showHistory));
  }, [state.showHistory]);

  const resolvedTheme = themeMode === 'auto' ? systemTheme : themeMode;
  const th = THEMES[resolvedTheme] || THEMES.light;
  const pth = PERFORM_THEMES[performTheme] || PERFORM_THEMES.dark;

  const sendNotification = useCallback((title, body) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    try { new Notification(title, { body, tag: 'showrunner', renotify: true }); } catch(e) {}
  }, []);

  const showToast = (msg) => dispatch({ type: 'SET_TOAST', payload: msg });

  if (mode === 'perform') {
    return (
      <>
        <PerformView state={state} dispatch={dispatch} pth={pth} sendNotification={sendNotification} wakeLockRef={wakeLockRef} />
        {toast && <Toast message={toast} onClose={() => dispatch({ type: 'CLEAR_TOAST' })} />}
      </>
    );
  }

  return (
    <div className={`min-h-screen ${th.bg} ${th.text}`} style={{ fontFamily, fontSize }}>
      {/* Header */}
      <header className={`${th.card} shadow px-4 py-3 flex items-center justify-between sticky top-0 z-30`}>
        <div>
          <div className={`font-extrabold text-lg ${th.headText}`}>{T.appTitle}</div>
          <div className={`text-xs ${th.subText}`}>{T.appVersion}</div>
        </div>
        <nav className="flex gap-1 flex-wrap">
          {[
            { m:'plan',     l:'📋 Plan' },
            { m:'stats',    l:T.statsTitle },
            { m:'settings', l:T.settingsTitle },
          ].map(({ m, l }) => (
            <button key={m} onClick={() => dispatch({ type: 'SET_MODE', payload: m })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === m ? `${th.accent} text-white` : `${th.text} opacity-60 hover:opacity-100`}`}>
              {l}
            </button>
          ))}
          <button onClick={() => dispatch({ type: 'TOGGLE_SAVE_MODAL' })} className={`px-3 py-1.5 rounded-lg text-sm border ${th.border} ${th.text}`}>{T.save}</button>
          <button onClick={() => dispatch({ type: 'TOGGLE_LOAD_MODAL' })} className={`px-3 py-1.5 rounded-lg text-sm border ${th.border} ${th.text}`}>{T.load}</button>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {mode === 'plan'     && <PlanView     state={state} dispatch={dispatch} th={th} />}
        {mode === 'settings' && <SettingsPanel state={state} dispatch={dispatch} th={th} />}
        {mode === 'stats'    && <StatsView     state={state} dispatch={dispatch} th={th} />}
      </main>

      {/* Modals */}
      {showForm     && <PartEditor  state={state} dispatch={dispatch} th={th} />}
      {showSaveModal && <SaveModal  state={state} dispatch={dispatch} th={th} />}
      {showLoadModal && <LoadModal  state={state} dispatch={dispatch} th={th} />}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => dispatch({ type: 'CLEAR_TOAST' })} />}
    </div>
  );
}
