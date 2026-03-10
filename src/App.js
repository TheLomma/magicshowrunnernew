import { useState, useEffect, useRef, useCallback } from "react";

// ─── IndexedDB Helper (Option C: IDB-Redundanz für ms_autosave) ───
const IDB_NAME = 'ShowRunnerDB';
const IDB_STORE = 'backups';
const IDB_VERSION = 1;

function openIDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject('No IDB');
    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'key' });
      }
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
      tx.oncomplete = resolve;
      tx.onerror = reject;
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

async function ensurePersistentStorage() {
  try {
    if (navigator.storage?.persisted) {
      const already = await navigator.storage.persisted();
      if (!already && navigator.storage.persist) {
        await navigator.storage.persist();
      }
      return await navigator.storage.persisted();
    }
  } catch(e) {}
  return false;
}

// ─── Audio Engine ───
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
  speak(text, speechLang = 'de-DE', rate = 1, pitch = 1, voiceURI = null) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = speechLang; u.rate = rate; u.pitch = pitch;
    const voices = window.speechSynthesis.getVoices();
    if (voiceURI) {
      const v = voices.find(v => v.voiceURI === voiceURI);
      if (v) u.voice = v;
    } else {
      const v = voices.find(v => v.lang.startsWith(speechLang.slice(0,2)));
      if (v) u.voice = v;
    }
    window.speechSynthesis.speak(u);
  }
};

const vibrate = (p = [200]) => { try { if ('vibrate' in navigator) navigator.vibrate(p); } catch(e) {} };

// ─── Translations ───
const TRANSLATIONS = {
  de: {
    appTitle: '🎩✨ Magic Showrunner',
    appVersion: 'v1.4',
    appSub: 'Dein professioneller Bühnen-Assistent',
    backupReminder: '💾 Kein Backup seit {days} Tagen – jetzt sichern?',
    backupReminderBtn: '📥 Jetzt Backup erstellen',
    backupReminderDismiss: 'Später',
    storagePersistent: '🛡️ Speicher gesichert (persistent)',
    storageNotPersistent: '⚠️ Speicher nicht persistent – regelmäßig Backup erstellen!',
    idbSaved: '🗄️ IDB-Backup gespeichert',
    idbRestored: '🗄️ Daten aus IDB-Backup wiederhergestellt',
    save: '💾 Speichern', load: '📂 Laden', backup: '📥 Backup', tutorial: '📖 Tutorial',
    about: 'ℹ️ Über', importBtn: '📤 Import', settings: '⚙️ Einstellungen',
    fullscreen: '⛶ Vollbild', exitFullscreen: '⛶ Fenster', stage: '🎪 Bühne', stats: '📊 Stats',
    newPart: '➕ Neuer Teil', startShow: '🎭 Show starten', testMode: '🧪 Testmodus',
    parts: 'Teile', totalTime: 'Gesamtzeit', settingsTitle: '⚙️ Einstellungen',
    tabDesign: '🎨 Design', tabAudio: '🔊 Audio', tabTest: '🧪 Test', tabLanguage: '🌐 Sprache',
    tabTTS: '🗣 Stimme', tabFont: '🔤 Schrift',
    planTheme: 'Planungs-Theme', performTheme: 'Perform-Theme',
    beeps: '🔔 Signaltöne', vibration: '📳 Vibration', volume: '🔊 Lautstärke',
    testTone: '🔊 Testton', testDuration: '⏱ Testmodus-Dauer pro Teil',
    testHint: 'Im Testmodus wird jeder Teil auf diese Dauer gekürzt.',
    selectLanguage: 'Sprache wählen', tutorialTitle: '📖 Tutorial & Hilfe',
    tutorialIntro: 'Wähle ein Thema:', aboutTitle: 'ℹ️ Über Magic Showrunner',
    stageTitle: '🎪 Bühnenplan', statsTitle: '📊 Statistiken',
    noStats: 'Noch keine Shows durchgeführt.', shows: 'Shows',
    totalTimeLabel: 'Gesamtzeit', avgParts: 'Ø Teile', clearHistory: '🗑 Verlauf löschen',
    editPart: '✏️ Teil bearbeiten', addPart: '➕ Neuer Teil', titleLabel: 'Titel',
    durationLabel: 'Dauer (Sek.)', introLabel: 'Intro-Ansage (TTS)', preAnnounceLabel: 'Vorankündigung (Sek.)',
    preAnnounceText: 'Vorankündigungs-Text', notesLabel: 'Notizen', musicUrl: 'Musik-URL',
    vol: 'Vol', fadeIn: 'Fade In', fadeOut: 'Fade Out', saveBtn: '💾 Speichern',
    cancelBtn: 'Abbrechen', testBtn: '🔊 Test', saveShowTitle: '💾 Show speichern',
    showName: 'Show-Name', overwrite: 'Überschreiben:', loadShowTitle: '📂 Show laden',
    noSaved: 'Keine gespeicherten Shows.', deletedHistory: '🗑 Verlauf gelöscht',
    perform_remaining: 'verbleibend', perform_part: 'Teil', perform_of: '/',
    perform_total: 'Gesamt', perform_remaining2: 'Verbleibend',
    perform_pause: '⏸ Pause', perform_resume: '▶ Weiter', perform_stop: '⏹ Stop',
    perform_prev: '← Zurück', perform_next: 'Weiter →', perform_notes: '📝 Notizen',
    perform_testAnnounce: '🔊 Test Ansage', perform_testMusic: '🎵 Test Musik',
    audience: 'Publikum', backstage: 'Backstage', addItem: '➕ Hinzufügen',
    updateItem: '💾 Update', cancelItem: 'Abbrechen', itemName: 'Name', itemIcon: 'Icon',
    tutoBasicsTitle: 'Grundlagen', tutoBasicsDesc: 'Show erstellen, Teile hinzufügen',
    tutoPerformTitle: 'Show durchführen', tutoPerformDesc: 'Live-Modus, Timer, Steuerung',
    tutoSaveTitle: 'Speichern & Backup', tutoSaveDesc: 'Shows sichern, exportieren',
    tutoThemesTitle: 'Designs & Einstellungen', tutoThemesDesc: 'Themes, Vollbild, Lautstärke',
    developer: '👨‍💻 Entwickler', devRole: 'Magier, Entwickler & Show-Enthusiast',
    rights: 'Alle Rechte vorbehalten. React & Tailwind CSS.',
    autoSystem: '🔄 Auto (System)', endedMsg: 'Die Show ist beendet. Vielen Dank!',
    speechLang: 'de-DE', partColor: 'Farbe', duplicatePart: '📋 Duplizieren',
    addGroup: '📁 Gruppe', groupName: 'Gruppenname', fontSize: 'Schriftgröße',
    fontFamily: 'Schriftart', animations: 'Animationen', largeStageFontMode: '🔡 Großschrift-Modus',
    autosaveLabel: 'Autosave', leaveConfirm: 'Show läuft – wirklich verlassen?',
    exportPDF: '📄 PDF', exportCSV: '📊 CSV', shareQR: '🔲 QR-Code',
    shareGDrive: '☁️ Google Drive', shareICloud: '☁️ iCloud',
    ttsVoice: 'Stimme', ttsRate: 'Geschwindigkeit', ttsPitch: 'Tonhöhe', ttsPreview: '🔊 Vorschau',
    ttsPreviewText: 'Das ist eine Vorschau der Stimme.',
    wakelock: '📱 Bildschirm aktiv halten', offlineReady: 'offline',
  },
  en: {
    appTitle: '🎩✨ Magic Showrunner',
    appVersion: 'v1.4', appSub: 'Your professional stage assistant',
    backupReminder: '💾 No backup for {days} days – save now?',
    backupReminderBtn: '📥 Create Backup now',
    backupReminderDismiss: 'Later',
    storagePersistent: '🛡️ Storage secured (persistent)',
    storageNotPersistent: '⚠️ Storage not persistent – create backups regularly!',
    idbSaved: '🗄️ IDB backup saved',
    idbRestored: '🗄️ Data restored from IDB backup',
    save: '💾 Save', load: '📂 Load', backup: '📥 Backup', tutorial: '📖 Tutorial',
    about: 'ℹ️ About', importBtn: '📤 Import', settings: '⚙️ Settings',
    fullscreen: '⛶ Fullscreen', exitFullscreen: '⛶ Window', stage: '🎪 Stage', stats: '📊 Stats',
    newPart: '➕ New Part', startShow: '🎭 Start Show', testMode: '🧪 Test Mode',
    parts: 'Parts', totalTime: 'Total Time', settingsTitle: '⚙️ Settings',
    tabDesign: '🎨 Design', tabAudio: '🔊 Audio', tabTest: '🧪 Test', tabLanguage: '🌐 Language',
    tabTTS: '🗣 Voice', tabFont: '🔤 Font',
    planTheme: 'Planning Theme', performTheme: 'Perform Theme',
    beeps: '🔔 Beeps', vibration: '📳 Vibration', volume: '🔊 Volume',
    testTone: '🔊 Test Tone', testDuration: '⏱ Test mode duration per part',
    testHint: 'In test mode, each part is shortened to this duration.',
    selectLanguage: 'Select Language', tutorialTitle: '📖 Tutorial & Help',
    tutorialIntro: 'Choose a topic:', aboutTitle: 'ℹ️ About Magic Showrunner',
    stageTitle: '🎪 Stage Plan', statsTitle: '📊 Statistics',
    noStats: 'No shows performed yet.', shows: 'Shows',
    totalTimeLabel: 'Total Time', avgParts: 'Avg Parts', clearHistory: '🗑 Clear History',
    editPart: '✏️ Edit Part', addPart: '➕ New Part', titleLabel: 'Title',
    durationLabel: 'Duration (sec)', introLabel: 'Intro Announcement (TTS)',
    preAnnounceLabel: 'Pre-announcement (sec)', preAnnounceText: 'Pre-announcement Text',
    notesLabel: 'Notes', musicUrl: 'Music URL', vol: 'Vol', fadeIn: 'Fade In', fadeOut: 'Fade Out',
    saveBtn: '💾 Save', cancelBtn: 'Cancel', testBtn: '🔊 Test',
    saveShowTitle: '💾 Save Show', showName: 'Show Name', overwrite: 'Overwrite:',
    loadShowTitle: '📂 Load Show', noSaved: 'No saved shows.', deletedHistory: '🗑 History cleared',
    perform_remaining: 'remaining', perform_part: 'Part', perform_of: '/',
    perform_total: 'Total', perform_remaining2: 'Remaining',
    perform_pause: '⏸ Pause', perform_resume: '▶ Resume', perform_stop: '⏹ Stop',
    perform_prev: '← Back', perform_next: 'Next →', perform_notes: '📝 Notes',
    perform_testAnnounce: '🔊 Test Announcement', perform_testMusic: '🎵 Test Music',
    audience: 'Audience', backstage: 'Backstage', addItem: '➕ Add',
    updateItem: '💾 Update', cancelItem: 'Cancel', itemName: 'Name', itemIcon: 'Icon',
    tutoBasicsTitle: 'Basics', tutoBasicsDesc: 'Create show, add parts',
    tutoPerformTitle: 'Perform Show', tutoPerformDesc: 'Live mode, timer, controls',
    tutoSaveTitle: 'Save & Backup', tutoSaveDesc: 'Save, export, import shows',
    tutoThemesTitle: 'Designs & Settings', tutoThemesDesc: 'Themes, fullscreen, volume',
    developer: '👨‍💻 Developer', devRole: 'Magician, Developer & Show Enthusiast',
    rights: 'All rights reserved. React & Tailwind CSS.',
    autoSystem: '🔄 Auto (System)', endedMsg: 'The show is over. Thank you!',
    speechLang: 'en-US', partColor: 'Color', duplicatePart: '📋 Duplicate',
    addGroup: '📁 Group', groupName: 'Group Name', fontSize: 'Font Size',
    fontFamily: 'Font Family', animations: 'Animations', largeStageFontMode: '🔡 Large Font Mode',
    autosaveLabel: 'Autosave', leaveConfirm: 'Show is running – really leave?',
    exportPDF: '📄 PDF', exportCSV: '📊 CSV', shareQR: '🔲 QR Code',
    shareGDrive: '☁️ Google Drive', shareICloud: '☁️ iCloud',
    ttsVoice: 'Voice', ttsRate: 'Speed', ttsPitch: 'Pitch', ttsPreview: '🔊 Preview',
    ttsPreviewText: 'This is a voice preview.',
    wakelock: '📱 Keep screen active', offlineReady: 'offline',
  },
};

const LANG_FLAGS = { de: '🇩🇪', en: '🇬🇧' };
const LANG_NAMES = { de: 'Deutsch', en: 'English' };

const fmt = (s) => { s = Math.abs(Math.floor(s)); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; };

const PART_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316',
  '#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6','#64748b'
];

const EMPTY = {
  title:'', duration:300, introText:'', preAnnounceSec:10, announceNextText:'',
  notes:'', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2,
  musicLoop:false, color:'#6366f1', isGroup:false, groupName:''
};

const DEMO = [
  { id:1, title:'Begrüßung & Einleitung', duration:180, introText:'Meine Damen und Herren, willkommen!', preAnnounceSec:15, announceNextText:'Gleich der erste Trick!', notes:'Spotlight Mitte.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#6366f1', isGroup:false },
  { id:2, title:'Die verschwindende Münze', duration:300, introText:'Zum ersten Trick!', preAnnounceSec:20, announceNextText:'Gleich: Gedankenlesung!', notes:'Silbermünze, schwarzes Tuch.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#8b5cf6', isGroup:false },
  { id:3, title:'Mentalmagie', duration:420, introText:'Darf ich einen Freiwilligen bitten?', preAnnounceSec:15, announceNextText:'Gleich Pause.', notes:'Umschläge, Stift.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#ec4899', isGroup:false },
  { id:4, title:'Pause', duration:600, introText:'Zehn Minuten Pause!', preAnnounceSec:30, announceNextText:'Bitte Plätze einnehmen!', notes:'Jazz-Playlist.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:true, color:'#22c55e', isGroup:false },
  { id:5, title:'Der unmögliche Kartentrick', duration:480, introText:'Willkommen zurück!', preAnnounceSec:20, announceNextText:'Gleich kommt das Finale!', notes:'2 Kartenspiele.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#f97316', isGroup:false },
  { id:6, title:'Die schwebende Rose', duration:360, introText:'Das große Finale!', preAnnounceSec:20, announceNextText:'Gleich Verabschiedung.', notes:'Nebelmaschine 30s vorher!', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#ef4444', isGroup:false },
  { id:7, title:'Verabschiedung', duration:180, introText:'Vielen Dank!', preAnnounceSec:10, announceNextText:'', notes:'Visitenkarten am Ausgang.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#14b8a6', isGroup:false },
];

const THEMES = {
  light: { name:'☀️ Hell', bg:'bg-gradient-to-br from-indigo-50 to-purple-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-indigo-600', accentHover:'hover:bg-indigo-700', border:'border-gray-200', input:'bg-white border-gray-300 text-gray-800', planCard:'bg-white shadow', badgeBg:'bg-indigo-100', badgeText:'text-indigo-700', headText:'text-indigo-900', subText:'text-indigo-600' },
  dark: { name:'🌙 Dunkel', bg:'bg-gradient-to-br from-gray-900 to-gray-800', card:'bg-gray-800', text:'text-gray-100', textSub:'text-gray-400', accent:'bg-indigo-500', accentHover:'hover:bg-indigo-600', border:'border-gray-700', input:'bg-gray-700 border-gray-600 text-gray-100', planCard:'bg-gray-800 shadow-lg', badgeBg:'bg-indigo-900', badgeText:'text-indigo-300', headText:'text-indigo-300', subText:'text-indigo-400' },
  black: { name:'⚫ Schwarz', bg:'bg-black', card:'bg-gray-950', text:'text-gray-200', textSub:'text-gray-600', accent:'bg-indigo-600', accentHover:'hover:bg-indigo-700', border:'border-gray-800', input:'bg-gray-900 border-gray-800 text-gray-200', planCard:'bg-gray-950 border border-gray-800 shadow-lg', badgeBg:'bg-indigo-950', badgeText:'text-indigo-400', headText:'text-indigo-400', subText:'text-indigo-500' },
  ocean: { name:'🌊 Ozean', bg:'bg-gradient-to-br from-cyan-50 to-blue-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-cyan-600', accentHover:'hover:bg-cyan-700', border:'border-cyan-200', input:'bg-white border-cyan-300 text-gray-800', planCard:'bg-white shadow', badgeBg:'bg-cyan-100', badgeText:'text-cyan-700', headText:'text-cyan-900', subText:'text-cyan-600' },
  oceanDark: { name:'🌊 Ozean Dunkel', bg:'bg-gradient-to-br from-cyan-950 to-blue-950', card:'bg-cyan-900', text:'text-cyan-100', textSub:'text-cyan-400', accent:'bg-cyan-500', accentHover:'hover:bg-cyan-600', border:'border-cyan-800', input:'bg-cyan-900 border-cyan-700 text-cyan-100', planCard:'bg-cyan-900 shadow-lg', badgeBg:'bg-cyan-800', badgeText:'text-cyan-200', headText:'text-cyan-200', subText:'text-cyan-400' },
  forest: { name:'🌲 Wald', bg:'bg-gradient-to-br from-green-50 to-emerald-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-emerald-600', accentHover:'hover:bg-emerald-700', border:'border-emerald-200', input:'bg-white border-emerald-300 text-gray-800', planCard:'bg-white shadow', badgeBg:'bg-emerald-100', badgeText:'text-emerald-700', headText:'text-emerald-900', subText:'text-emerald-600' },
  royal: { name:'👑 Royal', bg:'bg-gradient-to-br from-purple-50 to-fuchsia-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-purple-600', accentHover:'hover:bg-purple-700', border:'border-purple-200', input:'bg-white border-purple-300 text-gray-800', planCard:'bg-white shadow', badgeBg:'bg-purple-100', badgeText:'text-purple-700', headText:'text-purple-900', subText:'text-purple-600' },
  royalDark: { name:'👑 Royal Dunkel', bg:'bg-gradient-to-br from-purple-950 to-fuchsia-950', card:'bg-purple-900', text:'text-purple-100', textSub:'text-purple-400', accent:'bg-purple-500', accentHover:'hover:bg-purple-600', border:'border-purple-800', input:'bg-purple-900 border-purple-700 text-purple-100', planCard:'bg-purple-900 shadow-lg', badgeBg:'bg-purple-800', badgeText:'text-purple-200', headText:'text-purple-200', subText:'text-purple-400' },
};

const PERFORM_THEMES = {
  light: { name:'☀️ Hell', bg:'bg-gradient-to-br from-indigo-50 to-purple-100', card:'bg-white', text:'text-gray-800', timerText:'text-indigo-700', warnBg:'bg-red-50 border-2 border-red-300', warnTimer:'text-red-600' },
  dark: { name:'🌙 Dunkel', bg:'bg-gradient-to-br from-gray-900 to-gray-800', card:'bg-gray-800', text:'text-gray-100', timerText:'text-indigo-400', warnBg:'bg-red-950 border-2 border-red-700', warnTimer:'text-red-500' },
  black: { name:'⚫ Schwarz', bg:'bg-black', card:'bg-gray-950 border border-gray-800', text:'text-gray-300', timerText:'text-indigo-400', warnBg:'bg-black border-2 border-red-800', warnTimer:'text-red-500' },
};

const FONT_FAMILIES = [
  { label: 'Inter (Standard)', value: '"Inter", "Segoe UI", system-ui, sans-serif' },
  { label: 'System', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: '"JetBrains Mono", monospace' },
  { label: 'Rounded', value: '"Nunito", "Varela Round", sans-serif' },
];

const isDarkTheme = (k) => ['dark','black','oceanDark','royalDark'].includes(k);

export default function ShowRunner() {
  const getSystemTheme = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('ms_themeMode') || 'auto');
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const [performTheme, setPerformTheme] = useState(() => localStorage.getItem('ms_performTheme') || 'dark');
  const [animationsEnabled, setAnimationsEnabled] = useState(() => localStorage.getItem('ms_animations') !== 'false');
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('ms_fontSize') || '15'));
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('ms_fontFamily') || FONT_FAMILIES[0].value);
  const [largeFontMode, setLargeFontMode] = useState(false);
  const [ttsRate, setTtsRate] = useState(() => parseFloat(localStorage.getItem('ms_ttsRate') || '1'));
  const [ttsPitch, setTtsPitch] = useState(() => parseFloat(localStorage.getItem('ms_ttsPitch') || '1'));
  const [ttsVoiceURI, setTtsVoiceURI] = useState(() => localStorage.getItem('ms_ttsVoice') || '');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [autosaveTime, setAutosaveTime] = useState(null);
  const [storagePersistent, setStoragePersistent] = useState(null);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [backupReminderDays, setBackupReminderDays] = useState(0);
  const BACKUP_REMINDER_DAYS = 5;
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const wakeLockRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    const load = () => setAvailableVoices(window.speechSynthesis?.getVoices() || []);
    load();
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const h = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => { localStorage.setItem('ms_themeMode', themeMode); }, [themeMode]);
  useEffect(() => { localStorage.setItem('ms_performTheme', performTheme); }, [performTheme]);
  useEffect(() => { localStorage.setItem('ms_animations', animationsEnabled ? 'true' : 'false'); }, [animationsEnabled]);
  useEffect(() => { localStorage.setItem('ms_fontSize', String(fontSize)); }, [fontSize]);
  useEffect(() => { localStorage.setItem('ms_fontFamily', fontFamily); }, [fontFamily]);
  useEffect(() => { localStorage.setItem('ms_ttsRate', String(ttsRate)); }, [ttsRate]);
  useEffect(() => { localStorage.setItem('ms_ttsPitch', String(ttsPitch)); }, [ttsPitch]);
  useEffect(() => { localStorage.setItem('ms_ttsVoice', ttsVoiceURI); }, [ttsVoiceURI]);

  const resolvedTheme = themeMode === 'auto' ? systemTheme : themeMode;
  const th = THEMES[resolvedTheme] || THEMES.light;
  const pth = PERFORM_THEMES[performTheme] || PERFORM_THEMES.dark;

  const [mode, setMode] = useState('plan');
  const [parts, setParts] = useState(() => {
    try { const s = localStorage.getItem('ms_autosave'); if (s) { const d = JSON.parse(s); if (d.parts?.length) return d.parts; } } catch(e) {}
    return DEMO;
  });
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({...EMPTY});
  const [showForm, setShowForm] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [partElapsed, setPartElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [preAnnounced, setPreAnnounced] = useState(false);
  const [introAnnounced, setIntroAnnounced] = useState(false);
  const [beepEnabled, setBeepEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [testSpeed, setTestSpeed] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [savedShows, setSavedShows] = useState(() => { try { return JSON.parse(localStorage.getItem('ms_shows') || '[]'); } catch(e) { return []; } });
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('design');
  const [showStats, setShowStats] = useState(false);
  const [showStageplan, setShowStageplan] = useState(false);
  const [stageItems, setStageItems] = useState(() => { try { return JSON.parse(localStorage.getItem('ms_stageItems') || '[]'); } catch(e) { return []; } });
  const [showHistory, setShowHistory] = useState(() => { try { return JSON.parse(localStorage.getItem('ms_showHistory') || '[]'); } catch(e) { return []; } });
  const [saveName, setSaveName] = useState('');
  const [toast, setToast] = useState('');
  const [lang, setLang] = useState(() => localStorage.getItem('ms_lang') || 'de');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.de;
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingStop, setPendingStop] = useState(false);
  const intervalRef = useRef(null);
  const musicRef = useRef(null);
  const containerRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false);

  useEffect(() => { localStorage.setItem('ms_lang', lang); }, [lang]);

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); }, []);

  // WakeLock
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener('release', () => setWakeLockActive(false));
      }
    } catch(e) {}
  };
  const releaseWakeLock = () => {
    wakeLockRef.current?.release?.();
    wakeLockRef.current = null;
    setWakeLockActive(false);
  };

  useEffect(() => {
    if (isRunning) requestWakeLock();
    else releaseWakeLock();
    return () => releaseWakeLock();
  }, [isRunning]);

  // Swipe gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50 && isRunning) {
      if (dx < 0) jumpToPart(currentPartIndex + 1);
      else jumpToPart(currentPartIndex - 1);
    }
    touchStartX.current = null; touchStartY.current = null;
  };

  // Undo/Redo
  const pushHistory = useCallback((newParts) => {
    if (isUndoRedo.current) { isUndoRedo.current = false; return; }
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const next = [...trimmed, JSON.stringify(newParts)];
      return next.length > 50 ? next.slice(1) : next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  useEffect(() => { pushHistory(parts); }, [parts]);

  const undo = () => {
    if (historyIndex <= 0) return;
    isUndoRedo.current = true;
    setParts(JSON.parse(history[historyIndex - 1]));
    setHistoryIndex(h => h - 1);
    showToast('↩️ Rückgängig');
  };
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    isUndoRedo.current = true;
    setParts(JSON.parse(history[historyIndex + 1]));
    setHistoryIndex(h => h + 1);
    showToast('↪️ Wiederhergestellt');
  };

  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  // Autosave
  useEffect(() => {
    localStorage.setItem('ms_autosave', JSON.stringify({ parts, savedAt: new Date().toISOString() }));
    setAutosaveTime(new Date());
  }, [parts]);
  useEffect(() => { localStorage.setItem('ms_stageItems', JSON.stringify(stageItems)); }, [stageItems]);
  useEffect(() => { localStorage.setItem('ms_showHistory', JSON.stringify(showHistory)); }, [showHistory]);

  // Leave confirm
  useEffect(() => {
    const h = (e) => { if (isRunning) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isRunning]);

  const saveShow = (name) => {
    const show = { name, parts: JSON.parse(JSON.stringify(parts)), savedAt: new Date().toISOString(), id: Date.now() };
    const updated = [...savedShows.filter(s => s.name !== name), show];
    setSavedShows(updated);
    localStorage.setItem('ms_shows', JSON.stringify(updated));
    setShowSaveMenu(false); setSaveName('');
    showToast(`💾 "${name}" gespeichert`);
  };
  const loadShow = (show) => { setParts(show.parts.map(p => ({ ...EMPTY, ...p }))); setShowLoadMenu(false); showToast(`📂 "${show.name}" geladen`); };
  const deleteShow = (id) => { const u = savedShows.filter(s => s.id !== id); setSavedShows(u); localStorage.setItem('ms_shows', JSON.stringify(u)); showToast('🗑 Show gelöscht'); };

  const exportBackup = () => {
    localStorage.setItem('ms_last_backup', new Date().toISOString());
    setShowBackupReminder(false);
    const data = { version: 3, exportedAt: new Date().toISOString(), shows: savedShows, currentShow: parts, settings: { themeMode, performTheme, beepEnabled, vibrationEnabled, volume, testSpeed, fontSize, fontFamily, ttsRate, ttsPitch, ttsVoiceURI } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `showrunner-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Backup heruntergeladen');
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.shows) { const merged = [...savedShows]; data.shows.forEach(s => { if (!merged.find(m => m.id === s.id)) merged.push(s); }); setSavedShows(merged); localStorage.setItem('ms_shows', JSON.stringify(merged)); }
        if (data.currentShow) setParts(data.currentShow.map(p => ({ ...EMPTY, ...p })));
        showToast('📤 Backup importiert');
      } catch(err) { showToast('❌ Ungültige Datei'); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const exportCSV = () => {
    const header = 'Nr,Titel,Dauer (s),Intro-Text,Vorankündigung (s),Notizen\n';
    const rows = parts.map((p,i) => `${i+1},"${p.title}",${p.duration},"${p.introText}",${p.preAnnounceSec},"${p.notes}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `show-ablauf-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('📊 CSV exportiert');
  };

  const exportPDF = () => {
    const win = window.open('', '_blank');
    if (!win) { showToast('❌ Popup blockiert'); return; }
    const rows = parts.map((p,i) => `<tr style="border-bottom:1px solid #ddd"><td style="padding:8px;font-weight:bold">${i+1}</td><td style="padding:8px">${p.title}</td><td style="padding:8px">${fmt(p.duration)}</td><td style="padding:8px;font-size:12px">${p.notes || ''}</td></tr>`).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>Show Ablauf</title><style>body{font-family:sans-serif;padding:20px}h1{color:#4f46e5}table{width:100%;border-collapse:collapse}th{background:#4f46e5;color:white;padding:10px;text-align:left}tr:nth-child(even){background:#f5f3ff}@media print{button{display:none}}</style></head><body><h1>🎩 Magic Showrunner – Show Ablauf</h1><p>Erstellt: ${new Date().toLocaleString()}</p><table><thead><tr><th>#</th><th>Titel</th><th>Dauer</th><th>Notizen</th></tr></thead><tbody>${rows}</tbody></table><br><button onclick="window.print()">🖨️ Drucken</button></body></html>`);
    win.document.close();
    showToast('📄 PDF-Ansicht geöffnet');
  };

  const generateQR = () => {
    const text = parts.map((p,i) => `${i+1}. ${p.title} (${fmt(p.duration)})`).join('\n');
    const encoded = encodeURIComponent(text);
    setQrData(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`);
    setShowQR(true);
  };

  const shareGoogleDrive = () => {
    showToast('☁️ Google Drive: Backup herunterladen und manuell hochladen.');
    exportBackup();
  };
  const shareICloud = () => {
    showToast('☁️ iCloud: Backup herunterladen und in iCloud Drive ablegen.');
    exportBackup();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { (containerRef.current || document.documentElement).requestFullscreen?.(); }
    else { document.exitFullscreen?.(); }
  };
  useEffect(() => { const h = () => setIsFullscreen(!!document.fullscreenElement); document.addEventListener('fullscreenchange', h); return () => document.removeEventListener('fullscreenchange', h); }, []);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      const a = musicRef.current;
      const fo = () => { if (a.volume > 0.05) { a.volume = Math.max(0, a.volume - 0.05); setTimeout(fo, 100); } else { try { a.pause(); } catch(e){} } };
      fo(); musicRef.current = null;
    }
  }, []);

  const playMusic = useCallback((part) => {
    stopMusic();
    if (!part.musicUrl) return;
    let url = part.musicUrl;
    // YouTube/Spotify: show toast, can't autoplay
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('spotify.com')) {
      showToast('🎵 YouTube/Spotify: Bitte manuell öffnen – Autoplay nicht möglich.');
      window.open(url, '_blank');
      return;
    }
    try {
      const a = new Audio(url); a.loop = part.musicLoop || false; a.volume = 0;
      const tv = part.musicVolume || 0.5; const ft = (part.musicFadeIn || 2) * 10; let s = 0;
      a.play().then(() => { const fi = () => { s++; if (s <= ft) { a.volume = Math.min(tv, (s/ft)*tv); setTimeout(fi, 100); } }; fi(); }).catch(() => showToast('⚠️ Musik konnte nicht geladen werden'));
      musicRef.current = a;
    } catch(e) {}
  }, [stopMusic, showToast]);

  const effectiveParts = mode === 'test' ? parts.map(p => ({...p, duration:testSpeed, preAnnounceSec:Math.min(p.preAnnounceSec, Math.floor(testSpeed/2))})) : parts;
  const totalDuration = parts.reduce((s,p) => s + (p.isGroup ? 0 : p.duration), 0);
  const effectiveTotal = effectiveParts.reduce((s,p) => s + (p.isGroup ? 0 : p.duration), 0);

  useEffect(() => {
    if (isRunning && !isPaused) { intervalRef.current = setInterval(() => { setPartElapsed(p => p+1); setTotalElapsed(p => p+1); }, 1000); }
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const cp = effectiveParts[currentPartIndex]; if (!cp || cp.isGroup) { if(cp?.isGroup) { setCurrentPartIndex(p=>p+1); setPartElapsed(0); } return; }
    const rem = cp.duration - partElapsed;
    if (!introAnnounced && partElapsed === 0) {
      if (cp.introText) AudioEngine.speak(cp.introText, t.speechLang, ttsRate, ttsPitch, ttsVoiceURI || null);
      if (beepEnabled) AudioEngine.beep(volume, 660, 0.2);
      if (vibrationEnabled) vibrate([200]);
      playMusic(cp);
      setIntroAnnounced(true);
    }
    if (!preAnnounced && rem <= cp.preAnnounceSec && rem > 0) {
      if (cp.announceNextText) AudioEngine.speak(cp.announceNextText, t.speechLang, ttsRate, ttsPitch, ttsVoiceURI || null);
      if (beepEnabled) AudioEngine.beep(volume, 440, 0.3);
      if (vibrationEnabled) vibrate([200, 100, 200]);
      setPreAnnounced(true);
    }
    if (partElapsed >= cp.duration) {
      stopMusic();
      if (currentPartIndex < effectiveParts.length - 1) {
        setCurrentPartIndex(p => p+1); setPartElapsed(0); setPreAnnounced(false); setIntroAnnounced(false);
      } else {
        AudioEngine.speak(t.endedMsg, t.speechLang, ttsRate, ttsPitch, ttsVoiceURI || null);
        if (beepEnabled) AudioEngine.beep(volume, 880, 0.5);
        if (vibrationEnabled) vibrate([300, 100, 300, 100, 300]);
        setIsRunning(false); setIsPaused(false);
        setShowHistory(prev => [...prev, { date: new Date().toISOString(), parts: parts.length, duration: totalDuration }]);
      }
    }
  }, [partElapsed, isRunning, isPaused, currentPartIndex, effectiveParts, preAnnounced, introAnnounced, beepEnabled, volume, vibrationEnabled, playMusic, stopMusic, ttsRate, ttsPitch, ttsVoiceURI]);

  const startShow = () => {
    if (!parts.length) return;
    setCurrentPartIndex(0); setPartElapsed(0); setTotalElapsed(0);
    setPreAnnounced(false); setIntroAnnounced(false);
    setIsRunning(true); setIsPaused(false);
    setMode('perform');
  };

  const togglePause = () => setIsPaused(p => !p);

  const stopShow = () => {
    setIsRunning(false); setIsPaused(false); stopMusic();
    window.speechSynthesis?.cancel();
    if (isFullscreen) document.exitFullscreen?.();
    setMode('plan');
    setShowLeaveConfirm(false);
  };

  const handleStop = () => {
    if (isRunning) { setShowLeaveConfirm(true); }
    else stopShow();
  };

  const jumpToPart = (index) => {
    const nonGroup = effectiveParts.filter(p => !p.isGroup);
    if (index < 0 || index >= effectiveParts.length) return;
    stopMusic();
    setCurrentPartIndex(index); setPartElapsed(0); setPreAnnounced(false); setIntroAnnounced(false);
  };

  const movePart = (i, dir) => {
    const np = [...parts]; const j = i + dir;
    if (j < 0 || j >= np.length) return;
    [np[i], np[j]] = [np[j], np[i]]; setParts(np);
  };

  const deletePart = (i) => { setParts(parts.filter((_,idx) => idx !== i)); };

  const duplicatePart = (i) => {
    const np = [...parts];
    const copy = { ...np[i], id: Date.now(), title: np[i].title + ' (Kopie)' };
    np.splice(i + 1, 0, copy);
    setParts(np);
    showToast('📋 Teil dupliziert');
  };

  const addGroup = () => {
    const grp = { ...EMPTY, id: Date.now(), title: 'Neue Gruppe', isGroup: true, color: '#64748b' };
    setParts([...parts, grp]);
    showToast('📁 Gruppe hinzugefügt');
  };

  const openEdit = (i) => {
    setEditIdx(i);
    setForm({ ...EMPTY, ...parts[i] });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditIdx(null);
    setForm({ ...EMPTY, id: Date.now() });
    setShowForm(true);
  };

  const saveForm = () => {
    if (!form.title.trim()) { showToast('⚠️ Titel erforderlich'); return; }
    if (editIdx !== null) {
      const np = [...parts]; np[editIdx] = { ...form }; setParts(np);
    } else {
      setParts([...parts, { ...form, id: Date.now() }]);
    }
    setShowForm(false);
  };

  const cp = effectiveParts[currentPartIndex];
  const partRem = cp ? Math.max(0, cp.duration - partElapsed) : 0;
  const totalRem = Math.max(0, effectiveTotal - totalElapsed);
  const isWarn = partRem <= (cp?.preAnnounceSec || 10) && partRem > 0 && isRunning;
  const progressPct = cp ? Math.min(100, (partElapsed / cp.duration) * 100) : 0;
  const totalProgressPct = Math.min(100, (totalElapsed / effectiveTotal) * 100);

  const anim = animationsEnabled ? 'transition-all duration-300' : '';

  const effectiveFontSize = largeFontMode ? Math.max(fontSize, 22) : fontSize;

  // ─── RENDER ───
  return (
    <div
      ref={containerRef}
      className={`min-h-screen ${th.bg} ${th.text}`}
      style={{ fontFamily, fontSize: effectiveFontSize + 'px' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ─── Backup Reminder Banner (Option C) ─── */}
      {showBackupReminder && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-4">
          <div className="bg-amber-500 text-black rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <span className="text-2xl">💾</span>
              <p className="text-sm font-bold leading-snug">
                {(t.backupReminder || '').replace('{days}', backupReminderDays)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { exportBackup(); }}
                className="flex-1 bg-black text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-gray-900">
                {t.backupReminderBtn}
              </button>
              <button
                onClick={() => setShowBackupReminder(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-black/20 hover:bg-black/30">
                {t.backupReminderDismiss}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl text-white bg-gray-900 text-sm font-medium ${animationsEnabled ? 'animate-bounce' : ''}`}>
          {toast}
        </div>
      )}

      {/* Leave Confirm Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className={`${th.card} rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center`}>
            <div className="text-4xl mb-4">⚠️</div>
            <p className={`text-lg font-bold mb-2 ${th.text}`}>{t.leaveConfirm}</p>
            <div className="flex gap-3 mt-6 justify-center">
              <button onClick={stopShow} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold">{t.perform_stop}</button>
              <button onClick={() => setShowLeaveConfirm(false)} className={`px-5 py-2 rounded-xl font-bold border ${th.border} ${th.text}`}>{t.cancelBtn}</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className={`${th.card} rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center`}>
            <h2 className={`text-xl font-bold mb-4 ${th.headText}`}>🔲 QR-Code – Show Ablauf</h2>
            {qrData && <img src={qrData} alt="QR Code" className="mx-auto rounded-xl mb-4 w-48 h-48 object-contain bg-white p-2" />}
            <p className={`text-xs mb-4 ${th.textSub}`}>QR-Code enthält den Show-Ablauf als Text</p>
            <button onClick={() => setShowQR(false)} className={`px-5 py-2 rounded-xl border ${th.border} ${th.text} font-bold`}>{t.cancelBtn}</button>
          </div>
        </div>
      )}

      {/* PERFORM MODE */}
      {(mode === 'perform' || mode === 'test') && isRunning && (
        <div className={`min-h-screen ${pth.bg} ${pth.text} flex flex-col`} style={{ fontFamily, fontSize: effectiveFontSize + 'px' }}>
          {/* Top bar */}
          <div className={`flex items-center justify-between px-4 py-3 ${pth.card} shadow`}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">🎩</span>
              {wakeLockActive && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">📱 Wach</span>}
              {mode === 'test' && <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">🧪 TEST</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setLargeFontMode(l => !l)} className={`text-xs px-2 py-1 rounded-lg border ${pth.text} ${largeFontMode ? 'bg-yellow-500 text-black' : ''}`}>🔡</button>
              <button onClick={toggleFullscreen} className={`text-xs px-2 py-1 rounded-lg border ${pth.text}`}>{isFullscreen ? t.exitFullscreen : t.fullscreen}</button>
              <button onClick={handleStop} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm">{t.perform_stop}</button>
            </div>
          </div>

          {/* Main perform content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4">
            {/* Progress bars */}
            <div className="w-full max-w-lg">
              <div className="flex justify-between text-xs mb-1 opacity-60">
                <span>{t.perform_total}: {fmt(effectiveTotal)}</span>
                <span>{t.perform_remaining2}: {fmt(totalRem)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/20 mb-3">
                <div className={`h-2 rounded-full bg-indigo-400 ${anim}`} style={{ width: totalProgressPct + '%' }} />
              </div>
            </div>

            {/* Part card */}
            <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${isWarn ? pth.warnBg : pth.card} ${anim}`}
              style={{ borderLeft: cp ? `6px solid ${cp.color || '#6366f1'}` : undefined }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm opacity-60">{t.perform_part} {currentPartIndex + 1} {t.perform_of} {effectiveParts.length}</span>
                {cp?.isGroup && <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full">📁 Gruppe</span>}
              </div>
              <h2 className={`font-bold mb-4 leading-tight ${largeFontMode ? 'text-4xl' : 'text-2xl'}`}>{cp?.title}</h2>

              {/* Part progress bar */}
              <div className="w-full h-3 rounded-full bg-white/20 mb-4">
                <div className={`h-3 rounded-full ${anim}`} style={{ width: progressPct + '%', backgroundColor: cp?.color || '#6366f1' }} />
              </div>

              {/* Timer */}
              <div className={`font-mono font-black mb-2 ${largeFontMode ? 'text-8xl' : 'text-6xl'} ${isWarn ? pth.warnTimer : pth.timerText}`}>
                {fmt(partRem)}
              </div>
              <div className="text-sm opacity-60">{t.perform_remaining}</div>

              {/* Notes */}
              {cp?.notes && (
                <div className={`mt-4 p-3 rounded-xl text-sm opacity-80 bg-white/10`}>
                  📝 {cp.notes}
                </div>
              )}

              {/* Next part preview */}
              {effectiveParts[currentPartIndex + 1] && (
                <div className="mt-3 text-xs opacity-50">
                  ⏭ {t.perform_next}: {effectiveParts[currentPartIndex + 1].title}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3 flex-wrap justify-center mt-2">
              <button onClick={() => jumpToPart(currentPartIndex - 1)} disabled={currentPartIndex === 0} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 font-bold">{t.perform_prev}</button>
              <button onClick={togglePause} className={`px-6 py-2 rounded-xl font-bold text-white ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}>
                {isPaused ? t.perform_resume : t.perform_pause}
              </button>
              <button onClick={() => jumpToPart(currentPartIndex + 1)} disabled={currentPartIndex >= effectiveParts.length - 1} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 font-bold">{t.perform_next}</button>
            </div>

            {/* Part list mini */}
            <div className="w-full max-w-lg mt-2 flex gap-1 flex-wrap justify-center">
              {effectiveParts.map((p, i) => (
                <button key={p.id || i} onClick={() => jumpToPart(i)}
                  className={`w-7 h-7 rounded-full text-xs font-bold border-2 ${i === currentPartIndex ? 'scale-125 border-white' : 'border-transparent opacity-50'}`}
                  style={{ backgroundColor: p.color || '#6366f1', color: 'white' }}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PLAN MODE */}
      {(mode === 'plan' || !isRunning) && (
        <div className="max-w-4xl mx-auto px-3 py-4">
          {/* Header */}
          <div className={`${th.card} rounded-2xl shadow-lg p-4 mb-4 flex flex-col gap-3`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h1 className={`font-black text-xl ${th.headText} flex items-baseline gap-2`}>
                  {t.appTitle}
                  <span className={`text-xs font-normal opacity-40 ${th.textSub}`}>v1.4</span>
                </h1>
                <p className={`text-xs ${th.textSub}`}>{t.appSub}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Storage-Status + Autosave indicator */}
                {storagePersistent === true && (
                  <span className="text-xs text-green-500 flex items-center gap-1" title={t.storagePersistent}>🛡️</span>
                )}
                {storagePersistent === false && (
                  <span className="text-xs text-amber-400 flex items-center gap-1" title={t.storageNotPersistent}>⚠️</span>
                )}
                {autosaveTime && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    ✅ {autosaveTime.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                  </span>
                )}
                <button onClick={() => { setShowSettings(true); setSettingsTab('design'); }} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>{t.settings}</button>
                <button onClick={toggleFullscreen} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>{isFullscreen ? t.exitFullscreen : t.fullscreen}</button>
                <select value={lang} onChange={e => setLang(e.target.value)} className={`text-xs px-2 py-1.5 rounded-lg border ${th.border} ${th.input}`}>
                  {Object.keys(LANG_FLAGS).map(k => <option key={k} value={k}>{LANG_FLAGS[k]} {LANG_NAMES[k]}</option>)}
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowSaveMenu(true)} className={`text-xs px-3 py-1.5 rounded-lg ${th.accent} text-white hover:opacity-90`}>{t.save}</button>
              <button onClick={() => setShowLoadMenu(true)} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>{t.load}</button>
              <button onClick={exportBackup} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>{t.backup}</button>
              <label className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80 cursor-pointer`}>
                {t.importBtn}<input type="file" accept=".json" onChange={importBackup} className="hidden" />
              </label>
              <button onClick={exportCSV} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>{t.exportCSV}</button>
              <button onClick={exportPDF} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>{t.exportPDF}</button>
              <button onClick={generateQR} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>{t.shareQR}</button>
              <button onClick={shareGoogleDrive} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>{t.shareGDrive}</button>
              <button onClick={shareICloud} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>{t.shareICloud}</button>
              <button onClick={() => setShowStats(true)} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>{t.stats}</button>
              <button onClick={undo} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>↩️</button>
              <button onClick={redo} className={`text-xs px-3 py-1.5 rounded-lg border ${th.border} ${th.text} hover:opacity-80`}>↪️</button>
            </div>

            {/* Summary */}
            <div className="flex gap-4 flex-wrap">
              <div className={`${th.badgeBg} ${th.badgeText} rounded-lg px-3 py-1 text-xs font-bold`}>{parts.filter(p=>!p.isGroup).length} {t.parts}</div>
              <div className={`${th.badgeBg} ${th.badgeText} rounded-lg px-3 py-1 text-xs font-bold`}>⏱ {fmt(totalDuration)}</div>
            </div>
          </div>

          {/* Part list */}
          <div className="flex flex-col gap-2 mb-4">
            {parts.map((part, i) => (
              <div key={part.id || i}
                className={`${anim} ${part.isGroup ? 'border-2 rounded-xl' : `${th.planCard} rounded-xl`} overflow-hidden`}
                style={{ borderColor: part.isGroup ? (part.color || '#64748b') : undefined }}>
                {part.isGroup ? (
                  <div className="px-4 py-2 flex items-center gap-2 font-bold text-sm" style={{ backgroundColor: (part.color || '#64748b') + '22', color: part.color || '#64748b' }}>
                    <span>📁</span>
                    <span>{part.title}</span>
                    <div className="ml-auto flex gap-1">
                      <button onClick={() => openEdit(i)} className="text-xs px-2 py-0.5 rounded bg-white/20 hover:bg-white/40">✏️</button>
                      <button onClick={() => deletePart(i)} className="text-xs px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-600">🗑</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3">
                    {/* Color dot */}
                    <div className="w-3 h-full self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: part.color || '#6366f1', minHeight: 40, width: 5, borderRadius: 4 }} />
                    {/* Index */}
                    <span className={`text-sm font-bold w-6 text-center ${th.textSub}`}>{i + 1}</span>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{part.title}</div>
                      <div className={`text-xs ${th.textSub} truncate`}>{fmt(part.duration)} {part.notes ? `· ${part.notes.slice(0,40)}` : ''}</div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => movePart(i, -1)} disabled={i===0} className="text-xs px-1.5 py-1 rounded opacity-50 hover:opacity-100 disabled:opacity-20">↑</button>
                      <button onClick={() => movePart(i, 1)} disabled={i===parts.length-1} className="text-xs px-1.5 py-1 rounded opacity-50 hover:opacity-100 disabled:opacity-20">↓</button>
                      <button onClick={() => openEdit(i)} className={`text-xs px-2 py-1 rounded-lg border ${th.border} hover:opacity-80`}>✏️</button>
                      <button onClick={() => duplicatePart(i)} className={`text-xs px-2 py-1 rounded-lg border ${th.border} hover:opacity-80`}>📋</button>
                      <button onClick={() => deletePart(i)} className="text-xs px-2 py-1 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 hover:text-red-700">🗑</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add buttons */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={openAdd} className={`px-4 py-2 rounded-xl ${th.accent} text-white font-bold text-sm hover:opacity-90`}>{t.newPart}</button>
            <button onClick={addGroup} className={`px-4 py-2 rounded-xl border ${th.border} ${th.text} font-bold text-sm hover:opacity-80`}>{t.addGroup}</button>
          </div>

          {/* Start buttons */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={startShow} disabled={!parts.length} className={`flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-lg disabled:opacity-40 ${anim}`}>{t.startShow}</button>
            <button onClick={() => { setMode('test'); startShow(); }} disabled={!parts.length} className={`px-4 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-sm disabled:opacity-40 ${anim}`}>{t.testMode}</button>
          </div>
        </div>
      )}

      {/* ─── SETTINGS MODAL ─── */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 overflow-y-auto py-4 px-2">
          <div className={`${th.card} rounded-2xl shadow-2xl w-full max-w-lg`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200/20">
              <h2 className={`font-bold text-lg ${th.headText}`}>{t.settingsTitle}</h2>
              <button onClick={() => setShowSettings(false)} className="text-2xl leading-none opacity-60 hover:opacity-100">×</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200/20 overflow-x-auto">
              {[['design',t.tabDesign],['audio',t.tabAudio],['tts',t.tabTTS],['font',t.tabFont],['test',t.tabTest],['lang',t.tabLanguage]].map(([k,label]) => (
                <button key={k} onClick={() => setSettingsTab(k)}
                  className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 ${settingsTab===k ? 'border-indigo-500 text-indigo-500' : 'border-transparent opacity-60'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-4">
              {settingsTab === 'design' && (
                <>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.planTheme}</label>
                    <select value={themeMode} onChange={e => setThemeMode(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${th.input}`}>
                      <option value="auto">{t.autoSystem}</option>
                      {Object.entries(THEMES).map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.performTheme}</label>
                    <select value={performTheme} onChange={e => setPerformTheme(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${th.input}`}>
                      {Object.entries(PERFORM_THEMES).map(([k,v]) => <option key={k} value={k}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="anim" checked={animationsEnabled} onChange={e => setAnimationsEnabled(e.target.checked)} className="w-4 h-4" />
                    <label htmlFor="anim" className={`text-sm ${th.text}`}>{t.animations}</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="largefont" checked={largeFontMode} onChange={e => setLargeFontMode(e.target.checked)} className="w-4 h-4" />
                    <label htmlFor="largefont" className={`text-sm ${th.text}`}>{t.largeStageFontMode}</label>
                  </div>
                </>
              )}

              {settingsTab === 'font' && (
                <>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.fontSize}: {fontSize}px</label>
                    <input type="range" min={12} max={32} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full" />
                    <div className="flex justify-between text-xs opacity-50 mt-1"><span>12px</span><span>32px</span></div>
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.fontFamily}</label>
                    <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${th.input}`}>
                      {FONT_FAMILIES.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
                    </select>
                  </div>
                  <div className={`p-3 rounded-lg border ${th.border} text-sm`} style={{ fontFamily, fontSize: fontSize + 'px' }}>
                    Vorschau: Das ist ein Beispieltext für die Show.
                  </div>
                </>
              )}

              {settingsTab === 'audio' && (
                <>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="beep" checked={beepEnabled} onChange={e => setBeepEnabled(e.target.checked)} className="w-4 h-4" />
                    <label htmlFor="beep" className={`text-sm ${th.text}`}>{t.beeps}</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="vib" checked={vibrationEnabled} onChange={e => setVibrationEnabled(e.target.checked)} className="w-4 h-4" />
                    <label htmlFor="vib" className={`text-sm ${th.text}`}>{t.vibration}</label>
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.volume}: {Math.round(volume * 100)}%</label>
                    <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => setVolume(Number(e.target.value))} className="w-full" />
                  </div>
                  <button onClick={() => AudioEngine.beep(volume, 880, 0.3)} className={`px-4 py-2 rounded-lg border ${th.border} text-sm ${th.text}`}>{t.testTone}</button>
                </>
              )}

              {settingsTab === 'tts' && (
                <>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.ttsVoice}</label>
                    <select value={ttsVoiceURI} onChange={e => setTtsVoiceURI(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${th.input}`}>
                      <option value="">🔄 Auto</option>
                      {availableVoices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.ttsRate}: {ttsRate.toFixed(1)}x</label>
                    <input type="range" min={0.5} max={2} step={0.1} value={ttsRate} onChange={e => setTtsRate(Number(e.target.value))} className="w-full" />
                    <div className="flex justify-between text-xs opacity-50 mt-1"><span>0.5x</span><span>2x</span></div>
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.ttsPitch}: {ttsPitch.toFixed(1)}</label>
                    <input type="range" min={0.5} max={2} step={0.1} value={ttsPitch} onChange={e => setTtsPitch(Number(e.target.value))} className="w-full" />
                    <div className="flex justify-between text-xs opacity-50 mt-1"><span>0.5</span><span>2.0</span></div>
                  </div>
                  <button onClick={() => AudioEngine.speak(t.ttsPreviewText, t.speechLang, ttsRate, ttsPitch, ttsVoiceURI || null)}
                    className={`w-full py-2 rounded-lg border ${th.border} text-sm font-bold ${th.text}`}>{t.ttsPreview}</button>
                </>
              )}

              {settingsTab === 'test' && (
                <>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.testDuration}: {testSpeed}s</label>
                    <input type="range" min={3} max={60} value={testSpeed} onChange={e => setTestSpeed(Number(e.target.value))} className="w-full" />
                  </div>
                  <p className={`text-xs ${th.textSub}`}>{t.testHint}</p>
                </>
              )}

              {settingsTab === 'lang' && (
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(LANG_FLAGS).map(k => (
                    <button key={k} onClick={() => setLang(k)}
                      className={`px-3 py-2 rounded-xl border text-sm font-bold ${lang === k ? `${th.accent} text-white` : `${th.border} ${th.text}`}`}>
                      {LANG_FLAGS[k]} {LANG_NAMES[k]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── PART FORM MODAL ─── */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 overflow-y-auto py-4 px-2">
          <div className={`${th.card} rounded-2xl shadow-2xl w-full max-w-lg`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200/20">
              <h2 className={`font-bold text-lg ${th.headText}`}>{editIdx !== null ? t.editPart : t.addPart}</h2>
              <button onClick={() => setShowForm(false)} className="text-2xl leading-none opacity-60 hover:opacity-100">×</button>
            </div>
            <div className="p-4 space-y-3">
              {/* Group toggle */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isgrp" checked={!!form.isGroup} onChange={e => setForm(f => ({...f, isGroup: e.target.checked}))} className="w-4 h-4" />
                <label htmlFor="isgrp" className={`text-sm font-bold ${th.text}`}>📁 Ist Gruppe</label>
              </div>

              <div>
                <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.titleLabel}</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className={`w-full px-3 py-2 rounded-lg border text-sm ${th.input}`} placeholder={form.isGroup ? 'Gruppenname' : 'Titel...'} />
              </div>

              {!form.isGroup && (
                <>
                  {/* Color picker */}
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-2`}>{t.partColor}</label>
                    <div className="flex gap-2 flex-wrap">
                      {PART_COLORS.map(c => (
                        <button key={c} onClick={() => setForm(f => ({...f, color: c}))}
                          className={`w-7 h-7 rounded-full border-2 ${anim}`}
                          style={{ backgroundColor: c, borderColor: form.color === c ? 'white' : 'transparent', transform: form.color === c ? 'scale(1.2)' : 'scale(1)' }} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.durationLabel}</label>
                    <input type="number" min={1} value={form.duration} onChange={e => setForm(f => ({...f, duration: Number(e.target.value)}))} className={`w-full px-3 py-2 rounded-lg border text-sm ${th.input}`} />
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.introLabel}</label>
                    <textarea value={form.introText} onChange={e => setForm(f => ({...f, introText: e.target.value}))} rows={2} className={`w-full px-3 py-2 rounded-lg border text-sm ${th.input}`} />
                    <button onClick={() => AudioEngine.speak(form.introText || t.ttsPreviewText, t.speechLang, ttsRate, ttsPitch, ttsVoiceURI || null)} className={`mt-1 text-xs px-3 py-1 rounded border ${th.border} ${th.text}`}>{t.testBtn}</button>
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.preAnnounceLabel}</label>
                    <input type="number" min={0} value={form.preAnnounceSec} onChange={e => setForm(f => ({...f, preAnnounceSec: Number(e.target.value)}))} className={`w-full px-3 py-2 rounded-lg border text-sm ${th.input}`} />
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.preAnnounceText}</label>
                    <textarea value={form.announceNextText} onChange={e => setForm(f => ({...f, announceNextText: e.target.value}))} rows={2} className={`w-full px-3 py-2 rounded-lg border text-sm ${th.input}`} />
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.notesLabel}</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} className={`w-full px-3 py-2 rounded-lg border text-sm ${th.input}`} />
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.musicUrl}</label>
                    <input value={form.musicUrl} onChange={e => setForm(f => ({...f, musicUrl: e.target.value}))} className={`w-full px-3 py-2 rounded-lg border text-sm ${th.input}`} placeholder="https://... oder Spotify/YouTube URL" />
                    <p className="text-xs opacity-50 mt-1">💡 Spotify & YouTube: wird im Browser geöffnet (Autoplay nicht möglich)</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.vol}</label>
                      <input type="range" min={0} max={1} step={0.05} value={form.musicVolume} onChange={e => setForm(f => ({...f, musicVolume: Number(e.target.value)}))} className="w-full" />
                    </div>
                    <div>
                      <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.fadeIn}</label>
                      <input type="number" min={0} value={form.musicFadeIn} onChange={e => setForm(f => ({...f, musicFadeIn: Number(e.target.value)}))} className={`w-full px-2 py-1 rounded border text-sm ${th.input}`} />
                    </div>
                    <div>
                      <label className={`text-xs font-bold ${th.textSub} block mb-1`}>{t.fadeOut}</label>
                      <input type="number" min={0} value={form.musicFadeOut} onChange={e => setForm(f => ({...f, musicFadeOut: Number(e.target.value)}))} className={`w-full px-2 py-1 rounded border text-sm ${th.input}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="loop" checked={!!form.musicLoop} onChange={e => setForm(f => ({...f, musicLoop: e.target.checked}))} className="w-4 h-4" />
                    <label htmlFor="loop" className={`text-sm ${th.text}`}>🔁 Loop</label>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 p-4 border-t border-gray-200/20">
              <button onClick={saveForm} className={`flex-1 py-2 rounded-xl ${th.accent} text-white font-bold`}>{t.saveBtn}</button>
              <button onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-xl border ${th.border} ${th.text}`}>{t.cancelBtn}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SAVE MODAL ─── */}
      {showSaveMenu && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div className={`${th.card} rounded-2xl shadow-2xl w-full max-w-sm p-6`}>
            <h2 className={`font-bold text-lg mb-4 ${th.headText}`}>{t.saveShowTitle}</h2>
            <input value={saveName} onChange={e => setSaveName(e.target.value)} placeholder={t.showName} className={`w-full px-3 py-2 rounded-lg border mb-3 text-sm ${th.input}`} />
            <div className="flex gap-3">
              <button onClick={() => saveName.trim() && saveShow(saveName.trim())} className={`flex-1 py-2 rounded-xl ${th.accent} text-white font-bold`}>{t.saveBtn}</button>
              <button onClick={() => setShowSaveMenu(false)} className={`px-4 py-2 rounded-xl border ${th.border} ${th.text}`}>{t.cancelBtn}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── LOAD MODAL ─── */}
      {showLoadMenu && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div className={`${th.card} rounded-2xl shadow-2xl w-full max-w-sm p-6`}>
            <h2 className={`font-bold text-lg mb-4 ${th.headText}`}>{t.loadShowTitle}</h2>
            {savedShows.length === 0 && <p className={`text-sm ${th.textSub}`}>{t.noSaved}</p>}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedShows.map(s => (
                <div key={s.id} className={`flex items-center gap-2 p-2 rounded-lg border ${th.border}`}>
                  <button onClick={() => loadShow(s)} className="flex-1 text-left text-sm font-bold">{s.name}</button>
                  <span className={`text-xs ${th.textSub}`}>{new Date(s.savedAt).toLocaleDateString()}</span>
                  <button onClick={() => deleteShow(s.id)} className="text-red-500 text-xs px-1">🗑</button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowLoadMenu(false)} className={`mt-4 w-full py-2 rounded-xl border ${th.border} ${th.text}`}>{t.cancelBtn}</button>
          </div>
        </div>
      )}

      {/* ─── STATS MODAL ─── */}
      {showStats && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div className={`${th.card} rounded-2xl shadow-2xl w-full max-w-sm p-6`}>
            <h2 className={`font-bold text-lg mb-4 ${th.headText}`}>{t.statsTitle}</h2>
            {showHistory.length === 0 ? (
              <p className={`text-sm ${th.textSub}`}>{t.noStats}</p>
            ) : (
              <>
                <div className="flex gap-3 mb-4">
                  <div className={`flex-1 ${th.badgeBg} ${th.badgeText} rounded-lg p-3 text-center`}>
                    <div className="text-2xl font-black">{showHistory.length}</div>
                    <div className="text-xs">{t.shows}</div>
                  </div>
                  <div className={`flex-1 ${th.badgeBg} ${th.badgeText} rounded-lg p-3 text-center`}>
                    <div className="text-lg font-black">{fmt(showHistory.reduce((s,h) => s+h.duration,0))}</div>
                    <div className="text-xs">{t.totalTimeLabel}</div>
                  </div>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {[...showHistory].reverse().map((h,i) => (
                    <div key={i} className={`flex justify-between text-xs p-2 rounded border ${th.border}`}>
                      <span>{new Date(h.date).toLocaleString()}</span>
                      <span>{h.parts} Teile · {fmt(h.duration)}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setShowHistory([]); showToast(t.deletedHistory); }} className="mt-3 w-full py-2 text-sm rounded-xl border border-red-400 text-red-500">{t.clearHistory}</button>
              </>
            )}
            <button onClick={() => setShowStats(false)} className={`mt-3 w-full py-2 rounded-xl border ${th.border} ${th.text}`}>{t.cancelBtn}</button>
          </div>
        </div>
      )}
    </div>
  );
}
