import { useState, useEffect, useRef, useCallback } from "react";

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

const TRANSLATIONS = {
  de: {
    appTitle: '🎩✨ Magic Showrunner', appVersion: 'v1.7',
    appSub: 'Dein professioneller Bühnen-Assistent',
    backupReminder: '💾 Kein Backup seit {days} Tagen – jetzt sichern?',
    backupReminderBtn: '📥 Jetzt Backup erstellen', backupReminderDismiss: 'Später',
    storagePersistent: '🛡️ Speicher gesichert (persistent)',
    storageNotPersistent: '⚠️ Speicher nicht persistent – regelmäßig Backup erstellen!',
    idbSaved: '🗄️ IDB-Backup gespeichert', idbRestored: '🗄️ Daten aus IDB-Backup wiederhergestellt',
    save: '💾 Speichern', load: '📂 Laden', backup: '📥 Backup', tutorial: '📖 Tutorial',
    about: 'ℹ️ Über', importBtn: '📤 Import', settings: '⚙️ Einstellungen',
    fullscreen: '⛶ Vollbild', exitFullscreen: '⛶ Fenster', stage: '🎪 Bühne', stats: '📊 Stats',
    newPart: '➕ Neuer Teil', startShow: '🎭 Show starten', testMode: '🧪 Testmodus',
    parts: 'Teile', totalTime: 'Gesamtzeit', settingsTitle: '⚙️ Einstellungen',
    tabDesign: '🎨 Design', tabAudio: '🔊 Audio', tabTest: '🧪 Test', tabLanguage: '🌐 Sprache',
    tabTTS: '🗣 Stimme', tabFont: '🔤 Schrift', tabNotif: '🔔 Notif',
    countdown: '⏳ Countdown-Animation (letzte 3 Sek.)',
    pushNotif: '🔔 Push-Benachrichtigungen',
    pushNotifHint: 'Auch bei gesperrtem Bildschirm & Apple Watch / WearOS',
    enableNotif: '🔔 Benachrichtigungen aktivieren', notifActive: '✅ Benachrichtigungen aktiv',
    notifDenied: '❌ Abgelehnt – in Browser-Einstellungen aktivieren',
    onboardingBtn: '📖 Einführung erneut anzeigen', dragHint: '☰ Halten & ziehen zum Umsortieren',
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
    wakelock: '📱 Bildschirm aktiv halten', offlineReady: 'Offline bereit',
  },
  en: {
    appTitle: '🎩✨ Magic Showrunner', appVersion: 'v1.7',
    appSub: 'Your professional stage assistant',
    backupReminder: '💾 No backup for {days} days – save now?',
    backupReminderBtn: '📥 Create Backup now', backupReminderDismiss: 'Later',
    storagePersistent: '🛡️ Storage secured (persistent)',
    storageNotPersistent: '⚠️ Storage not persistent – create backups regularly!',
    idbSaved: '🗄️ IDB backup saved', idbRestored: '🗄️ Data restored from IDB backup',
    save: '💾 Save', load: '📂 Load', backup: '📥 Backup', tutorial: '📖 Tutorial',
    about: 'ℹ️ About', importBtn: '📤 Import', settings: '⚙️ Settings',
    fullscreen: '⛶ Fullscreen', exitFullscreen: '⛶ Window', stage: '🎪 Stage', stats: '📊 Stats',
    newPart: '➕ New Part', startShow: '🎭 Start Show', testMode: '🧪 Test Mode',
    parts: 'Parts', totalTime: 'Total Time', settingsTitle: '⚙️ Settings',
    tabDesign: '🎨 Design', tabAudio: '🔊 Audio', tabTest: '🧪 Test', tabLanguage: '🌐 Language',
    tabTTS: '🗣 Voice', tabFont: '🔤 Font', tabNotif: '🔔 Notif',
    countdown: '⏳ Countdown Animation (last 3 sec)',
    pushNotif: '🔔 Push Notifications',
    pushNotifHint: 'Also on locked screen & Apple Watch / WearOS',
    enableNotif: '🔔 Enable Notifications', notifActive: '✅ Notifications active',
    notifDenied: '❌ Denied – enable in browser settings',
    onboardingBtn: '📖 Show intro again', dragHint: '☰ Hold & drag to reorder',
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
    wakelock: '📱 Keep screen active', offlineReady: 'Offline ready',
  },
};

const LANG_FLAGS = { de: '🇩🇪', en: '🇬🇧' };
const LANG_NAMES = { de: 'Deutsch', en: 'English' };
const fmt = (s) => { s = Math.abs(Math.floor(s)); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; };

const PART_COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6','#64748b'];

const EMPTY = { title:'', duration:300, introText:'', preAnnounceSec:10, announceNextText:'', notes:'', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#6366f1', isGroup:false, groupName:'' };

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

const TEMPLATES = {
  kinder: {
    name: '🎈 Kinder-Show', icon: '🎈',
    parts: [
      { id:1, title:'Begrüßung & Zauberhut', duration:120, introText:'Hallo Kinder! Seid ihr bereit für Magie?', preAnnounceSec:10, announceNextText:'Gleich kommt ein toller Trick!', notes:'Laut und fröhlich!', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#f97316', isGroup:false },
      { id:2, title:'Die bunte Tuchmagie', duration:180, introText:'Schaut alle her – jetzt wird es bunt!', preAnnounceSec:15, announceNextText:'Gleich: Münzentrick!', notes:'Bunte Tücher bereit.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#ec4899', isGroup:false },
      { id:3, title:'Münze aus dem Ohr', duration:150, introText:'Wer hat eine Münze im Ohr?', preAnnounceSec:10, announceNextText:'Gleich: Mitmachzauber!', notes:'Silbermünze.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#eab308', isGroup:false },
      { id:4, title:'Mitmach-Zauberei', duration:240, introText:'Jetzt seid ihr dran – alle mitmachen!', preAnnounceSec:20, announceNextText:'Gleich Verabschiedung!', notes:'Kinder einbeziehen.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#22c55e', isGroup:false },
      { id:5, title:'Verabschiedung', duration:90, introText:'Vielen Dank, ihr wart super!', preAnnounceSec:10, announceNextText:'', notes:'Luftballons verteilen.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#6366f1', isGroup:false },
    ]
  },
  abend: {
    name: '🎭 Abendshow', icon: '🎭',
    parts: [
      { id:1, title:'Einlass & Musik', duration:600, introText:'', preAnnounceSec:30, announceNextText:'Bitte nehmen Sie Platz!', notes:'Hintergrundmusik läuft.', musicUrl:'', musicVolume:0.3, musicFadeIn:5, musicFadeOut:5, musicLoop:true, color:'#64748b', isGroup:false },
      { id:2, title:'Begrüßung', duration:180, introText:'Herzlich willkommen zur heutigen Abendshow!', preAnnounceSec:15, announceNextText:'Gleich der erste Akt!', notes:'Spotlight Mitte.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#6366f1', isGroup:false },
      { id:3, title:'Akt 1 – Kartenmagie', duration:480, introText:'Zum ersten Akt!', preAnnounceSec:20, announceNextText:'Gleich: Mentalmagie!', notes:'2 Kartenspiele.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#8b5cf6', isGroup:false },
      { id:4, title:'Pause', duration:900, introText:'15 Minuten Pause!', preAnnounceSec:60, announceNextText:'Bitte Plätze einnehmen!', notes:'Bar geöffnet.', musicUrl:'', musicVolume:0.4, musicFadeIn:3, musicFadeOut:3, musicLoop:true, color:'#22c55e', isGroup:false },
      { id:5, title:'Akt 2 – Großillusion', duration:600, introText:'Das Finale beginnt!', preAnnounceSec:30, announceNextText:'Gleich Abschluss!', notes:'Nebelmaschine!', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#ef4444', isGroup:false },
      { id:6, title:'Abschluss & Verbeugung', duration:180, introText:'Vielen Dank für Ihren Applaus!', preAnnounceSec:10, announceNextText:'', notes:'Visitenkarten am Ausgang.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#14b8a6', isGroup:false },
    ]
  },
  kurz: {
    name: '⚡ Kurzauftritt', icon: '⚡',
    parts: [
      { id:1, title:'Einstieg', duration:60, introText:'Hallo! Darf ich Ihnen etwas Erstaunliches zeigen?', preAnnounceSec:10, announceNextText:'Gleich der Haupttrick!', notes:'Kurz und knackig.', musicUrl:'', musicVolume:0.5, musicFadeIn:1, musicFadeOut:1, musicLoop:false, color:'#6366f1', isGroup:false },
      { id:2, title:'Haupttrick', duration:180, introText:'Bitte wählen Sie eine Karte!', preAnnounceSec:15, announceNextText:'Gleich Abschluss!', notes:'Signature-Trick.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false, color:'#f97316', isGroup:false },
      { id:3, title:'Abschluss', duration:60, introText:'Vielen Dank!', preAnnounceSec:10, announceNextText:'', notes:'Visitenkarte überreichen.', musicUrl:'', musicVolume:0.5, musicFadeIn:1, musicFadeOut:1, musicLoop:false, color:'#22c55e', isGroup:false },
    ]
  },
};

const FONT_FAMILIES = [
  { label: 'Inter (Standard)', value: '"Inter", "Segoe UI", system-ui, sans-serif' },
  { label: 'System', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: '"JetBrains Mono", monospace' },
  { label: 'Rounded', value: '"Nunito", "Varela Round", sans-serif' },
];

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
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [backupReminderDays, setBackupReminderDays] = useState(0);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [countdownAnimation, setCountdownAnimation] = useState(() => localStorage.getItem('ms_countdown') !== 'false');
  const [countdownNum, setCountdownNum] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('ms_onboarded'));
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [notifPermission, setNotifPermission] = useState(() => typeof Notification !== 'undefined' ? Notification.permission : 'denied');
  const [offlineReady] = useState(false);
  const dragItem = useRef(null);
  const dragOver = useRef(null);
  const wakeLockRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchDragItem = useRef(null);

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
  useEffect(() => { localStorage.setItem('ms_countdown', countdownAnimation ? 'true' : 'false'); }, [countdownAnimation]);

  const requestNotifPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  };

  const sendNotification = useCallback((title, body) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    try {
      const n = new Notification(title, { body, icon: '/icons/icon-192.png', tag: 'showrunner', renotify: true });
      setTimeout(() => n.close(), 8000);
    } catch(e) {}
  }, []);

  const triggerCountdown = useCallback((sec = 3) => {
    if (!countdownAnimation) return;
    let n = sec;
    setCountdownNum(n);
    const tick = () => { n--; if (n > 0) { setCountdownNum(n); setTimeout(tick, 1000); } else setCountdownNum(null); };
    setTimeout(tick, 1000);
  }, [countdownAnimation]);

  const handleDragStart = (i) => { dragItem.current = i; };
  const handleDragEnter = (i) => { dragOver.current = i; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) return;
    const np = [...parts];
    const dragged = np.splice(dragItem.current, 1)[0];
    np.splice(dragOver.current, 0, dragged);
    setParts(np);
    dragItem.current = null; dragOver.current = null;
    showToast('🔀 Reihenfolge geändert');
  };
  const handleTouchDragStart = (i) => { touchDragItem.current = i; };
  const handleTouchDragEnd = (i) => {
    if (touchDragItem.current === null || touchDragItem.current === i) { touchDragItem.current = null; return; }
    const np = [...parts];
    const dragged = np.splice(touchDragItem.current, 1)[0];
    np.splice(i, 0, dragged);
    setParts(np);
    touchDragItem.current = null;
    showToast('🔀 Reihenfolge geändert');
  };

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
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [tutorialTopic, setTutorialTopic] = useState(null);
  const [stageForm, setStageForm] = useState({ name:'', icon:'🎭', side:'audience' });
  const [editStageIdx, setEditStageIdx] = useState(null);
  const intervalRef = useRef(null);
  const musicRef = useRef(null);
  const containerRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false);

  useEffect(() => { localStorage.setItem('ms_lang', lang); }, [lang]);

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); }, []);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockRef.current.addEventListener('release', () => setWakeLockActive(false));
      }
    } catch(e) {}
  };
  const releaseWakeLock = () => { wakeLockRef.current?.release?.(); wakeLockRef.current = null; setWakeLockActive(false); };

  useEffect(() => { if (isRunning) requestWakeLock(); else releaseWakeLock(); return () => releaseWakeLock(); }, [isRunning]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; };
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

  useEffect(() => {
    localStorage.setItem('ms_autosave', JSON.stringify({ parts, savedAt: new Date().toISOString() }));
    setAutosaveTime(new Date());
  }, [parts]);
  useEffect(() => { localStorage.setItem('ms_stageItems', JSON.stringify(stageItems)); }, [stageItems]);
  useEffect(() => { localStorage.setItem('ms_showHistory', JSON.stringify(showHistory)); }, [showHistory]);

  useEffect(() => {
    const h = (e) => { if (isRunning) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isRunning]);

  useEffect(() => {
    const lastBackup = localStorage.getItem('ms_last_backup');
    if (!lastBackup) { setShowBackupReminder(true); setBackupReminderDays(999); return; }
    const days = Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000);
    if (days >= 5) { setShowBackupReminder(true); setBackupReminderDays(days); }
  }, []);

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
    const rows = parts.map((p,i) => `<tr><td>${i+1}</td><td>${p.title}</td><td>${fmt(p.duration)}</td><td>${p.notes||''}</td></tr>`).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>Show Ablauf</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th{background:#4f46e5;color:white;padding:8px}td{padding:8px;border-bottom:1px solid #ddd}@media print{button{display:none}}</style></head><body><h1>🎩 Magic Showrunner</h1><table><thead><tr><th>#</th><th>Titel</th><th>Dauer</th><th>Notizen</th></tr></thead><tbody>${rows}</tbody></table><br><button onclick="window.print()">🖨️ Drucken</button></body></html>`);
    win.document.close();
    showToast('📄 PDF-Ansicht geöffnet');
  };

  const generateQR = () => {
    const text = parts.map((p,i) => `${i+1}. ${p.title} (${fmt(p.duration)})`).join('\n');
    setQrData(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`);
    setShowQR(true);
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
    const url = part.musicUrl;
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('spotify.com')) {
      showToast('🎵 YouTube/Spotify: Bitte manuell öffnen.');
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
    const cp = effectiveParts[currentPartIndex];
    if (!cp || cp.isGroup) { if(cp?.isGroup) { setCurrentPartIndex(p=>p+1); setPartElapsed(0); } return; }
    const rem = cp.duration - partElapsed;
    if (!introAnnounced && partElapsed === 0) {
      if (cp.introText) AudioEngine.speak(cp.introText, t.speechLang, ttsRate, ttsPitch, ttsVoiceURI || null);
      if (beepEnabled) AudioEngine.beep(volume, 660, 0.2);
      if (vibrationEnabled) vibrate([200]);
      playMusic(cp);
      setIntroAnnounced(true);
    }
    if (countdownAnimation && rem <= 3 && rem > 0) setCountdownNum(rem);
    else if (rem > 3) setCountdownNum(null);
    if (!preAnnounced && rem <= cp.preAnnounceSec && rem > 0) {
      sendNotification(`⏰ ${cp.title}`, cp.announceNextText || `Noch ${cp.preAnnounceSec} Sekunden!`);
      if (cp.announceNextText) AudioEngine.speak(cp.announceNextText, t.speechLang, ttsRate, ttsPitch, ttsVoiceURI || null);
      if (beepEnabled) AudioEngine.beep(volume, 440, 0.3);
      if (vibrationEnabled) vibrate([200, 100, 200]);
      setPreAnnounced(true);
    }
    if (partElapsed >= cp.duration) {
      setCountdownNum(null); stopMusic();
      if (currentPartIndex < effectiveParts.length - 1) {
        const nextP = effectiveParts[currentPartIndex + 1];
        if (nextP) sendNotification(`🎭 ${nextP.title}`, `Jetzt startet: ${nextP.title}`);
        setCurrentPartIndex(p => p+1); setPartElapsed(0); setPreAnnounced(false); setIntroAnnounced(false);
      } else {
        AudioEngine.speak(t.endedMsg, t.speechLang, ttsRate, ttsPitch, ttsVoiceURI || null);
        if (beepEnabled) AudioEngine.beep(volume, 880, 0.5);
        if (vibrationEnabled) vibrate([300, 100, 300, 100, 300]);
        setIsRunning(false); setIsPaused(false);
        setShowHistory(prev => [...prev, { date: new Date().toISOString(), parts: parts.length, duration: totalDuration }]);
      }
    }
  }, [partElapsed, isRunning, isPaused]);

  const startShow = () => {
    if (!parts.length) return;
    sendNotification('🎭 Show gestartet!', `${parts.length} Teile • ${fmt(totalDuration)}`);
    triggerCountdown(3);
    setCurrentPartIndex(0); setPartElapsed(0); setTotalElapsed(0);
    setPreAnnounced(false); setIntroAnnounced(false);
    setIsRunning(true); setIsPaused(false); setMode('perform');
  };

  const togglePause = () => setIsPaused(p => !p);

  const stopShow = () => {
    setIsRunning(false); setIsPaused(false); stopMusic();
    window.speechSynthesis?.cancel();
    if (isFullscreen) document.exitFullscreen?.();
    setMode('plan'); setShowLeaveConfirm(false);
  };

  const handleStop = () => { if (isRunning) setShowLeaveConfirm(true); else stopShow(); };

  const jumpToPart = (index) => {
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
    setParts(np); showToast('📋 Teil dupliziert');
  };

  const addGroup = () => {
    setParts([...parts, { ...EMPTY, id: Date.now(), title: 'Neue Gruppe', isGroup: true, color: '#64748b' }]);
    showToast('📁 Gruppe hinzugefügt');
  };

  const openEdit = (i) => { setEditIdx(i); setForm({ ...EMPTY, ...parts[i] }); setShowForm(true); };
  const openAdd = () => { setEditIdx(null); setForm({ ...EMPTY, id: Date.now() }); setShowForm(true); };

  const saveForm = () => {
    if (!form.title.trim()) { showToast('⚠️ Titel erforderlich'); return; }
    if (editIdx !== null) { const np = [...parts]; np[editIdx] = { ...form }; setParts(np); }
    else setParts([...parts, { ...form, id: Date.now() }]);
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

  const Modal = ({ title, onClose, children, wide }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)'}}>
      <div className={`${th.card} ${th.text} rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-screen overflow-y-auto`}>
        <div className={`flex items-center justify-between p-4 border-b ${th.border}`}>
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none opacity-60 hover:opacity-100">×</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );

  // ── ONBOARDING ──
  const onboardingSteps = [
    { title: '👋 Willkommen!', desc: 'Magic Showrunner hilft dir, deine Show professionell zu managen.' },
    { title: '➕ Teile hinzufügen', desc: 'Klicke auf "Neuer Teil" um Acts, Pausen und Gruppen zu erstellen.' },
    { title: '🎭 Show starten', desc: 'Klicke "Show starten" – der Timer läuft, TTS-Ansagen und Signaltöne werden automatisch ausgelöst.' },
    { title: '💾 Speichern & Backup', desc: 'Speichere Shows und erstelle regelmäßig Backups über den Export-Button.' },
    { title: '⚙️ Einstellungen', desc: 'Passe Themes, Sprache, Stimme, Schrift und Töne in den Einstellungen an.' },
  ];

  if (showOnboarding) {
    const step = onboardingSteps[onboardingStep];
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">{step.title.split(' ')[0]}</div>
          <h2 className="text-2xl font-black text-indigo-900 mb-3">{step.title.slice(step.title.indexOf(' ')+1)}</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{step.desc}</p>
          <div className="flex justify-center gap-2 mb-6">
            {onboardingSteps.map((_,i) => <div key={i} className={`w-2 h-2 rounded-full ${i===onboardingStep ? 'bg-indigo-600' : 'bg-gray-300'}`} />)}
          </div>
          <div className="flex gap-3 justify-center">
            {onboardingStep > 0 && <button onClick={() => setOnboardingStep(s=>s-1)} className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 font-bold">← Zurück</button>}
            {onboardingStep < onboardingSteps.length - 1
              ? <button onClick={() => setOnboardingStep(s=>s+1)} className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold">Weiter →</button>
              : <button onClick={() => { setShowOnboarding(false); localStorage.setItem('ms_onboarded','1'); }} className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold">Los geht's! 🎩</button>
            }
          </div>
          <button onClick={() => { setShowOnboarding(false); localStorage.setItem('ms_onboarded','1'); }} className="mt-4 text-sm text-gray-400 underline">Überspringen</button>
        </div>
      </div>
    );
  }

  // ── PERFORM MODE ──
  if (mode === 'perform' || mode === 'test') {
    const performBg = isWarn ? pth.warnBg : pth.bg;
    return (
      <div ref={containerRef} className={`min-h-screen ${performBg} ${pth.text} flex flex-col ${anim}`}
        style={{fontFamily, fontSize: effectiveFontSize + 'px'}}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Countdown overlay */}
        {countdownNum && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="text-9xl font-black text-white drop-shadow-2xl animate-bounce">{countdownNum}</div>
          </div>
        )}
        {/* Leave Confirm */}
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.8)'}}>
            <div className={`${pth.card} rounded-2xl p-6 max-w-sm w-full mx-4 text-center`}>
              <div className="text-4xl mb-3">⚠️</div>
              <p className="font-bold text-lg mb-4">{t.leaveConfirm}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowLeaveConfirm(false)} className="px-5 py-2 rounded-xl bg-gray-600 text-white font-bold">Abbrechen</button>
                <button onClick={stopShow} className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold">Beenden</button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className={`${pth.card} px-4 py-3 flex items-center justify-between shadow-lg`}>
          <div>
            <div className="font-black text-lg">{t.appTitle}</div>
            {mode === 'test' && <div className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold inline-block">🧪 TESTMODUS</div>}
          </div>
          <div className="flex gap-2">
            <button onClick={toggleFullscreen} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm font-bold">{isFullscreen ? t.exitFullscreen : t.fullscreen}</button>
            <button onClick={handleStop} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-bold">{t.perform_stop}</button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 bg-black/20">
          <div className={`h-full bg-indigo-500 ${anim}`} style={{width: totalProgressPct + '%'}} />
        </div>
        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4">
          {cp ? (
            <>
              <div className={`${pth.card} rounded-2xl p-6 w-full max-w-lg shadow-xl text-center`}>
                <div className="text-xs opacity-60 mb-1">{t.perform_part} {currentPartIndex + 1} {t.perform_of} {effectiveParts.length}</div>
                <div className="w-3 h-3 rounded-full mx-auto mb-3" style={{background: cp.color || '#6366f1'}} />
                <h2 className={`text-2xl font-black mb-4 ${largeFontMode ? 'text-4xl' : ''}`}>{cp.title}</h2>
                <div className={`font-mono font-black ${isWarn ? pth.warnTimer : pth.timerText} ${largeFontMode ? 'text-8xl' : 'text-6xl'}`}>
                  {fmt(partRem)}
                </div>
                <div className="text-sm opacity-60 mt-2">{t.perform_remaining}</div>
                {/* Part Progress */}
                <div className="mt-4 h-2 rounded-full bg-black/10">
                  <div className={`h-full rounded-full bg-indigo-500 ${anim}`} style={{width: progressPct + '%'}} />
                </div>
              </div>
              {/* Notes */}
              {cp.notes && (
                <div className={`${pth.card} rounded-xl p-4 w-full max-w-lg text-sm opacity-80`}>
                  <div className="font-bold mb-1">📝 Notizen:</div>
                  <div>{cp.notes}</div>
                </div>
              )}
              {/* Total */}
              <div className={`${pth.card} rounded-xl px-5 py-3 w-full max-w-lg flex justify-between text-sm`}>
                <span>{t.perform_total}: <b>{fmt(effectiveTotal)}</b></span>
                <span>{t.perform_remaining2}: <b>{fmt(totalRem)}</b></span>
              </div>
              {/* Pause/Prev/Next */}
              <div className="flex gap-3 flex-wrap justify-center">
                <button onClick={() => jumpToPart(currentPartIndex - 1)} disabled={currentPartIndex === 0} className="px-4 py-2.5 rounded-xl bg-white/10 font-bold disabled:opacity-30 text-sm">{t.perform_prev}</button>
                <button onClick={togglePause} className={`px-6 py-2.5 rounded-xl font-bold text-sm ${isPaused ? 'bg-green-600 text-white' : 'bg-yellow-500 text-black'}`}>
                  {isPaused ? t.perform_resume : t.perform_pause}
                </button>
                <button onClick={() => jumpToPart(currentPartIndex + 1)} disabled={currentPartIndex >= effectiveParts.length - 1} className="px-4 py-2.5 rounded-xl bg-white/10 font-bold disabled:opacity-30 text-sm">{t.perform_next}</button>
              </div>
              {/* Test Announce/Music */}
              <div className="flex gap-2 flex-wrap justify-center">
                <button onClick={() => { if(cp.introText) AudioEngine.speak(cp.introText, t.speechLang, ttsRate, ttsPitch, ttsVoiceURI||null); }} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold">{t.perform_testAnnounce}</button>
                <button onClick={() => playMusic(cp)} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold">{t.perform_testMusic}</button>
                <button onClick={() => setLargeFontMode(l => !l)} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold">{t.largeStageFontMode}</button>
              </div>
            </>
          ) : (
            <div className="text-center text-2xl font-black opacity-60">{t.endedMsg}</div>
          )}
        </div>
        {/* Part list mini */}
        <div className={`${pth.card} px-3 py-2 flex gap-2 overflow-x-auto`}>
          {effectiveParts.map((p,i) => (
            !p.isGroup && (
              <button key={p.id||i} onClick={() => jumpToPart(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${i===currentPartIndex ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-transparent bg-white/10'}`}>
                {i+1}. {p.title.slice(0,12)}{p.title.length>12?'…':''}
              </button>
            )
          ))}
        </div>
      </div>
    );
  }

  // ── PLAN MODE ──
  return (
    <div ref={containerRef} className={`min-h-screen ${th.bg} ${th.text} ${anim}`}
      style={{fontFamily, fontSize: fontSize+'px'}}>
      <input type="file" id="import-file-hdr" accept=".json" className="hidden" onChange={importBackup} />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-2xl shadow-xl text-sm font-bold animate-bounce">
          {toast}
        </div>
      )}

      {/* Countdown Overlay */}
      {countdownNum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-9xl font-black text-indigo-500 drop-shadow-2xl">{countdownNum}</div>
        </div>
      )}

      {/* Backup Reminder */}
      {showBackupReminder && (
        <div className={`${th.card} border-l-4 border-yellow-500 mx-4 mt-4 rounded-xl p-3 flex items-center justify-between gap-2`}>
          <span className="text-sm">{t.backupReminder.replace('{days}', backupReminderDays >= 999 ? '?' : backupReminderDays)}</span>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={exportBackup} className="px-3 py-1 rounded-lg bg-yellow-500 text-black text-xs font-bold">{t.backupReminderBtn}</button>
            <button onClick={() => setShowBackupReminder(false)} className="px-3 py-1 rounded-lg bg-gray-400 text-white text-xs font-bold">{t.backupReminderDismiss}</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`${th.card} px-4 py-3 shadow-md border-b ${th.border}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className={`font-black text-xl ${th.headText} flex items-baseline gap-2`}>
              {t.appTitle}
              <span className={`text-xs font-normal opacity-40`}>v1.7</span>
            </h1>
            <p className={`text-xs ${th.textSub}`}>{t.appSub}</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Language */}
            <select value={lang} onChange={e=>setLang(e.target.value)} className={`px-2 py-1 rounded-lg text-sm border ${th.input} ${th.border}`}>
              {Object.entries(LANG_FLAGS).map(([k,f]) => <option key={k} value={k}>{f} {LANG_NAMES[k]}</option>)}
            </select>
            <button onClick={toggleFullscreen} className={`px-3 py-1.5 rounded-xl text-sm font-bold ${th.accent} text-white`}>{isFullscreen ? '⛶' : '⛶'}</button>
            <button onClick={() => setShowSettings(true)} className={`px-3 py-1.5 rounded-xl text-sm font-bold ${th.accent} text-white`}>⚙️</button>
            {/* Undo/Redo */}
            <button onClick={undo} disabled={historyIndex <= 0} className={`px-2 py-1.5 rounded-xl text-sm font-bold bg-white/10 disabled:opacity-30 ${th.text}`}>↩️</button>
            <button onClick={redo} disabled={historyIndex >= history.length-1} className={`px-2 py-1.5 rounded-xl text-sm font-bold bg-white/10 disabled:opacity-30 ${th.text}`}>↪️</button>
          </div>
        </div>
        {/* Toolbar */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button onClick={() => setShowSaveMenu(true)} className={`px-3 py-1.5 rounded-xl text-sm font-bold ${th.accent} text-white`}>{t.save}</button>
          <button onClick={() => setShowLoadMenu(true)} className={`px-3 py-1.5 rounded-xl text-sm font-bold ${th.accent} text-white`}>{t.load}</button>
          <button onClick={exportBackup} className={`px-3 py-1.5 rounded-xl text-sm font-bold ${th.accent} text-white`}>{t.backup}</button>
          <button onClick={() => document.getElementById('import-file-hdr').click()} className={`px-3 py-1.5 rounded-xl text-sm font-bold ${th.accent} text-white`}>{t.importBtn}</button>
          <button onClick={() => setShowTemplates(true)} className={`px-3 py-1.5 rounded-xl text-sm font-bold bg-white/10 ${th.text}`}>📋 Templates</button>
          <button onClick={() => setShowStageplan(true)} className={`px-3 py-1.5 rounded-xl text-sm font-bold bg-white/10 ${th.text}`}>{t.stage}</button>
          <button onClick={() => setShowStats(true)} className={`px-3 py-1.5 rounded-xl text-sm font-bold bg-white/10 ${th.text}`}>{t.stats}</button>
          <button onClick={exportCSV} className={`px-3 py-1.5 rounded-xl text-sm font-bold bg-white/10 ${th.text}`}>{t.exportCSV}</button>
          <button onClick={exportPDF} className={`px-3 py-1.5 rounded-xl text-sm font-bold bg-white/10 ${th.text}`}>{t.exportPDF}</button>
          <button onClick={generateQR} className={`px-3 py-1.5 rounded-xl text-sm font-bold bg-white/10 ${th.text}`}>{t.shareQR}</button>
          <button onClick={() => setShowTutorial(true)} className={`px-3 py-1.5 rounded-xl text-sm font-bold bg-white/10 ${th.text}`}>{t.tutorial}</button>
          <button onClick={() => setShowAbout(true)} className={`px-3 py-1.5 rounded-xl text-sm font-bold bg-white/10 ${th.text}`}>{t.about}</button>
        </div>
      </div>

      {/* Summary bar */}
      <div className={`px-4 py-2 flex gap-4 text-sm ${th.textSub} border-b ${th.border} flex-wrap`}>
        <span>📋 {parts.filter(p=>!p.isGroup).length} {t.parts}</span>
        <span>⏱ {fmt(totalDuration)} {t.totalTime}</span>
        {autosaveTime && <span>💾 {t.autosaveLabel}: {autosaveTime.toLocaleTimeString()}</span>}
        {wakeLockActive && <span>📱 {t.wakelock}</span>}
        {offlineReady && <span>✅ {t.offlineReady}</span>}
      </div>

      {/* Parts list */}
      <div className="px-4 py-4 space-y-2 max-w-3xl mx-auto">
        {parts.map((part, i) => (
          <div key={part.id || i}
            draggable onDragStart={() => handleDragStart(i)} onDragEnter={() => handleDragEnter(i)} onDragEnd={handleDragEnd}
            onTouchStart={() => handleTouchDragStart(i)} onTouchEnd={() => handleTouchDragEnd(i)}
            className={`${th.planCard} rounded-xl p-3 border ${th.border} ${anim} cursor-grab active:cursor-grabbing`}>
            {part.isGroup ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{background: part.color}} />
                <span className="font-black text-sm opacity-70">📁 {part.title}</span>
                <div className="flex-1" />
                <button onClick={() => openEdit(i)} className="text-xs px-2 py-1 rounded-lg bg-black/10 font-bold">✏️</button>
                <button onClick={() => deletePart(i)} className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white font-bold">🗑</button>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{background: part.color, minWidth:4}} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{i+1}. {part.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${th.badgeBg} ${th.badgeText} font-mono`}>{fmt(part.duration)}</span>
                    {part.musicUrl && <span className="text-xs">🎵</span>}
                    {part.notes && <span className="text-xs opacity-50">📝</span>}
                  </div>
                  {part.notes && <div className="text-xs opacity-50 mt-0.5 truncate">{part.notes}</div>}
                </div>
                <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                  <button onClick={() => movePart(i,-1)} disabled={i===0} className="text-xs px-1.5 py-1 rounded-lg bg-black/10 disabled:opacity-30">↑</button>
                  <button onClick={() => movePart(i,1)} disabled={i===parts.length-1} className="text-xs px-1.5 py-1 rounded-lg bg-black/10 disabled:opacity-30">↓</button>
                  <button onClick={() => openEdit(i)} className="text-xs px-2 py-1 rounded-lg bg-black/10 font-bold">✏️</button>
                  <button onClick={() => duplicatePart(i)} className="text-xs px-2 py-1 rounded-lg bg-black/10 font-bold">📋</button>
                  <button onClick={() => deletePart(i)} className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white font-bold">🗑</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {parts.length === 0 && (
          <div className={`text-center py-12 ${th.textSub}`}>
            <div className="text-5xl mb-3">🎩</div>
            <div className="font-bold">Noch keine Teile – füge einen neuen Teil hinzu!</div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className={`sticky bottom-0 ${th.card} border-t ${th.border} px-4 py-3 flex gap-2 flex-wrap justify-center shadow-lg`}>
        <button onClick={openAdd} className={`px-4 py-2 rounded-xl font-bold text-sm ${th.accent} text-white`}>{t.newPart}</button>
        <button onClick={addGroup} className={`px-4 py-2 rounded-xl font-bold text-sm bg-white/10 ${th.text}`}>{t.addGroup}</button>
        <button onClick={startShow} disabled={!parts.filter(p=>!p.isGroup).length} className="px-5 py-2 rounded-xl font-bold text-sm bg-green-600 text-white disabled:opacity-40">{t.startShow}</button>
        <button onClick={() => { setMode('test'); startShow(); }} disabled={!parts.filter(p=>!p.isGroup).length} className="px-4 py-2 rounded-xl font-bold text-sm bg-yellow-500 text-black disabled:opacity-40">{t.testMode}</button>
      </div>

      {/* ── MODALS ── */}

      {/* Part Form */}
      {showForm && (
        <Modal title={editIdx !== null ? t.editPart : t.addPart} onClose={() => setShowForm(false)} wide>
          <div className="space-y-3">
            {/* Title & Color */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className={`text-xs font-bold ${th.textSub}`}>{t.titleLabel}</label>
                <input className={`w-full mt-1 px-3 py-2 rounded-xl border ${th.input} ${th.border} text-sm`}
                  value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Titel" />
              </div>
              <div>
                <label className={`text-xs font-bold ${th.textSub}`}>{t.partColor}</label>
                <div className="flex gap-1 mt-1 flex-wrap max-w-40">
                  {PART_COLORS.map(c => (
                    <button key={c} onClick={() => setForm({...form,color:c})}
                      className={`w-6 h-6 rounded-full border-2 ${form.color===c ? 'border-white scale-125' : 'border-transparent'}`}
                      style={{background:c}} />
                  ))}
                </div>
              </div>
            </div>
            <Toggle checked={form.isGroup||false} onChange={v=>setForm({...form,isGroup:v})} label="Gruppe" />
            {!form.isGroup && (
              <>
                <div>
                  <label className={`text-xs font-bold ${th.textSub}`}>{t.durationLabel}</label>
                  <input type="number" className={`w-full mt-1 px-3 py-2 rounded-xl border ${th.input} ${th.border} text-sm`}
                    value={form.duration} onChange={e=>setForm({...form,duration:parseInt(e.target.value)||0})} />
                </div>
                <div>
                  <label className={`text-xs font-bold ${th.textSub}`}>{t.introLabel}</label>
                  <textarea className={`w-full mt-1 px-3 py-2 rounded-xl border ${th.input} ${th.border} text-sm`} rows={2}
                    value={form.introText} onChange={e=>setForm({...form,introText:e.target.value})} />
                  <button onClick={() => AudioEngine.speak(form.introText, t.speechLang, ttsRate, ttsPitch, ttsVoiceURI||null)} className={`mt-1 px-3 py-1 rounded-lg text-xs font-bold ${th.accent} text-white`}>{t.testBtn}</button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className={`text-xs font-bold ${th.textSub}`}>{t.preAnnounceLabel}</label>
                    <input type="number" className={`w-full mt-1 px-3 py-2 rounded-xl border ${th.input} ${th.border} text-sm`}
                      value={form.preAnnounceSec} onChange={e=>setForm({...form,preAnnounceSec:parseInt(e.target.value)||0})} />
                  </div>
                  <div className="flex-1">
                    <label className={`text-xs font-bold ${th.textSub}`}>{t.preAnnounceText}</label>
                    <input className={`w-full mt-1 px-3 py-2 rounded-xl border ${th.input} ${th.border} text-sm`}
                      value={form.announceNextText} onChange={e=>setForm({...form,announceNextText:e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-bold ${th.textSub}`}>{t.notesLabel}</label>
                  <textarea className={`w-full mt-1 px-3 py-2 rounded-xl border ${th.input} ${th.border} text-sm`} rows={2}
                    value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
                </div>
                <div>
                  <label className={`text-xs font-bold ${th.textSub}`}>{t.musicUrl}</label>
                  <input className={`w-full mt-1 px-3 py-2 rounded-xl border ${th.input} ${th.border} text-sm`}
                    value={form.musicUrl} onChange={e=>setForm({...form,musicUrl:e.target.value})} placeholder="https://..." />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div>
                    <label className={`text-xs font-bold ${th.textSub}`}>{t.vol} ({Math.round(form.musicVolume*100)}%)</label>
                    <input type="range" min="0" max="1" step="0.05" className="w-full mt-1"
                      value={form.musicVolume} onChange={e=>setForm({...form,musicVolume:parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub}`}>{t.fadeIn} ({form.musicFadeIn}s)</label>
                    <input type="range" min="0" max="10" step="0.5" className="w-full mt-1"
                      value={form.musicFadeIn} onChange={e=>setForm({...form,musicFadeIn:parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className={`text-xs font-bold ${th.textSub}`}>{t.fadeOut} ({form.musicFadeOut}s)</label>
                    <input type="range" min="0" max="10" step="0.5" className="w-full mt-1"
                      value={form.musicFadeOut} onChange={e=>setForm({...form,musicFadeOut:parseFloat(e.target.value)})} />
                  </div>
                  <Toggle checked={form.musicLoop||false} onChange={v=>setForm({...form,musicLoop:v})} label="Loop" />
                </div>
                <button onClick={() => playMusic(form)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${th.accent} text-white`}>{t.perform_testMusic}</button>
              </>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-xl text-sm font-bold bg-gray-400 text-white`}>{t.cancelBtn}</button>
              <button onClick={saveForm} className={`px-4 py-2 rounded-xl text-sm font-bold ${th.accent} text-white`}>{t.saveBtn}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Save Show */}
      {showSaveMenu && (
        <Modal title={t.saveShowTitle} onClose={() => setShowSaveMenu(false)}>
          <div className="space-y-3">
            <input className={`w-full px-3 py-2 rounded-xl border ${th.input} ${th.border} text-sm`}
              placeholder={t.showName} value={saveName} onChange={e=>setSaveName(e.target.value)} />
            <button onClick={() => saveName.trim() && saveShow(saveName.trim())} className={`w-full py-2 rounded-xl font-bold text-sm ${th.accent} text-white`}>{t.saveBtn}</button>
            {savedShows.length > 0 && (
              <div>
                <div className={`text-xs font-bold mb-2 ${th.textSub}`}>{t.overwrite}</div>
                <div className="space-y-1">
                  {savedShows.map(s => (
                    <button key={s.id} onClick={() => saveShow(s.name)} className={`w-full text-left px-3 py-2 rounded-xl text-sm border ${th.border} ${th.planCard} hover:bg-black/10`}>
                      📌 {s.name} <span className={`text-xs ${th.textSub}`}>({new Date(s.savedAt).toLocaleDateString()})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Load Show */}
      {showLoadMenu && (
        <Modal title={t.loadShowTitle} onClose={() => setShowLoadMenu(false)}>
          {savedShows.length === 0 ? (
            <div className={`text-center py-8 ${th.textSub}`}>{t.noSaved}</div>
          ) : (
            <div className="space-y-2">
              {savedShows.map(s => (
                <div key={s.id} className={`flex items-center gap-2 border ${th.border} rounded-xl px-3 py-2`}>
                  <button onClick={() => loadShow(s)} className="flex-1 text-left text-sm font-bold">
                    📌 {s.name} <span className={`text-xs font-normal ${th.textSub}`}>({new Date(s.savedAt).toLocaleDateString()} • {s.parts?.length} {t.parts})</span>
                  </button>
                  <button onClick={() => deleteShow(s.id)} className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white font-bold">🗑</button>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Settings */}
      {showSettings && (
        <Modal title={t.settingsTitle} onClose={() => setShowSettings(false)} wide>
          <div className="flex gap-1 flex-wrap mb-4">
            {['design','audio','test','language','tts','font','notif'].map(tab => (
              <button key={tab} onClick={() => setSettingsTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${settingsTab===tab ? th.accent+' text-white' : 'bg-black/10 '+th.text}`}>
                {t['tab'+tab.charAt(0).toUpperCase()+tab.slice(1)]}
              </button>
            ))}
          </div>
          {settingsTab === 'design' && (
            <div className="space-y-4">
              <div>
                <div className={`text-xs font-bold mb-2 ${th.textSub}`}>{t.planTheme}</div>
                <div className="grid grid-cols-2 gap-2">
                  {['auto',...Object.keys(THEMES)].map(k => (
                    <button key={k} onClick={() => setThemeMode(k)}
                      className={`px-3 py-2 rounded-xl text-sm font-bold border ${themeMode===k ? 'border-indigo-500 bg-indigo-500 text-white' : th.border+' '+th.text} ${th.card}`}>
                      {k==='auto' ? t.autoSystem : THEMES[k].name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={`text-xs font-bold mb-2 ${th.textSub}`}>{t.performTheme}</div>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(PERFORM_THEMES).map(k => (
                    <button key={k} onClick={() => setPerformTheme(k)}
                      className={`px-3 py-2 rounded-xl text-sm font-bold border ${performTheme===k ? 'border-indigo-500 bg-indigo-500 text-white' : th.border+' '+th.text}`}>
                      {PERFORM_THEMES[k].name}
                    </button>
                  ))}
                </div>
              </div>
              <Toggle checked={animationsEnabled} onChange={setAnimationsEnabled} label={t.animations} />
              <Toggle checked={countdownAnimation} onChange={setCountdownAnimation} label={t.countdown} />
              <button onClick={() => { setShowSettings(false); setShowOnboarding(true); setOnboardingStep(0); }} className={`px-3 py-2 rounded-xl text-sm font-bold ${th.accent} text-white w-full`}>{t.onboardingBtn}</button>
            </div>
          )}
          {settingsTab === 'audio' && (
            <div className="space-y-4">
              <Toggle checked={beepEnabled} onChange={setBeepEnabled} label={t.beeps} />
              <Toggle checked={vibrationEnabled} onChange={setVibrationEnabled} label={t.vibration} />
              <div>
                <label className={`text-xs font-bold ${th.textSub}`}>{t.volume} ({Math.round(volume*100)}%)</label>
                <input type="range" min="0" max="1" step="0.05" className="w-full mt-1" value={volume} onChange={e=>setVolume(parseFloat(e.target.value))} />
              </div>
              <button onClick={() => AudioEngine.beep(volume, 880, 0.3)} className={`px-4 py-2 rounded-xl text-sm font-bold ${th.accent} text-white`}>{t.testTone}</button>
            </div>
          )}
          {settingsTab === 'test' && (
            <div className="space-y-4">
              <div>
                <label className={`text-xs font-bold ${th.textSub}`}>{t.testDuration} ({testSpeed}s)</label>
                <input type="range" min="3" max="60" step="1" className="w-full mt-1" value={testSpeed} onChange={e=>setTestSpeed(parseInt(e.target.value))} />
                <div className={`text-xs mt-1 ${th.textSub}`}>{t.testHint}</div>
              </div>
            </div>
          )}
          {settingsTab === 'language' && (
            <div className="space-y-2">
              {Object.entries(LANG_FLAGS).map(([k,f]) => (
                <button key={k} onClick={() => setLang(k)}
                  className={`w-full px-4 py-3 rounded-xl text-left font-bold border ${lang===k ? 'border-indigo-500 bg-indigo-500 text-white' : th.border+' '+th.text}`}>
                  {f} {LANG_NAMES[k]}
                </button>
              ))}
            </div>
          )}
          {settingsTab === 'tts' && (
            <div className="space-y-4">
              <div>
                <label className={`text-xs font-bold ${th.textSub}`}>{t.ttsVoice}</label>
                <select className={`w-full mt-1 px-3 py-2 rounded-xl border ${th.input} ${th.border} text-sm`}
                  value={ttsVoiceURI} onChange={e=>setTtsVoiceURI(e.target.value)}>
                  <option value="">Auto</option>
                  {availableVoices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
                </select>
              </div>
              <div>
                <label className={`text-xs font-bold ${th.textSub}`}>{t.ttsRate} ({ttsRate.toFixed(1)}x)</label>
                <input type="range" min="0.5" max="2" step="0.1" className="w-full mt-1" value={ttsRate} onChange={e=>setTtsRate(parseFloat(e.target.value))} />
              </div>
              <div>
                <label className={`text-xs font-bold ${th.textSub}`}>{t.ttsPitch} ({ttsPitch.toFixed(1)})</label>
                <input type="range" min="0.5" max="2" step="0.1" className="w-full mt-1" value={ttsPitch} onChange={e=>setTtsPitch(parseFloat(e.target.value))} />
              </div>
              <button onClick={() => AudioEngine.speak(t.ttsPreviewText, t.speechLang, ttsRate, ttsPitch, ttsVoiceURI||null)} className={`px-4 py-2 rounded-xl text-sm font-bold ${th.accent} text-white`}>{t.ttsPreview}</button>
            </div>
          )}
          {settingsTab === 'font' && (
            <div className="space-y-4">
              <div>
                <label className={`text-xs font-bold ${th.textSub}`}>{t.fontSize} ({fontSize}px)</label>
                <input type="range" min="12" max="24" step="1" className="w-full mt-1" value={fontSize} onChange={e=>setFontSize(parseInt(e.target.value))} />
              </div>
              <div>
                <label className={`text-xs font-bold ${th.textSub} mb-2 block`}>{t.fontFamily}</label>
                <div className="space-y-1">
                  {FONT_FAMILIES.map(f => (
                    <button key={f.value} onClick={() => setFontFamily(f.value)}
                      className={`w-full px-3 py-2 rounded-xl text-left text-sm border ${fontFamily===f.value ? 'border-indigo-500 bg-indigo-500 text-white' : th.border+' '+th.text}`}
                      style={{fontFamily: f.value}}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <Toggle checked={largeFontMode} onChange={setLargeFontMode} label={t.largeStageFontMode} />
            </div>
          )}
          {settingsTab === 'notif' && (
            <div className="space-y-4">
              <div className={`text-sm ${th.textSub}`}>{t.pushNotifHint}</div>
              {notifPermission === 'granted'
                ? <div className="text-green-500 font-bold">{t.notifActive}</div>
                : notifPermission === 'denied'
                  ? <div className="text-red-500 font-bold">{t.notifDenied}</div>
                  : <button onClick={requestNotifPermission} className={`px-4 py-2 rounded-xl font-bold text-sm ${th.accent} text-white`}>{t.enableNotif}</button>
              }
            </div>
          )}
        </Modal>
      )}

      {/* Templates */}
      {showTemplates && (
        <Modal title="📋 Templates" onClose={() => setShowTemplates(false)}>
          <div className="space-y-3">
            {Object.entries(TEMPLATES).map(([key, tpl]) => (
              <div key={key} className={`border ${th.border} rounded-xl p-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{tpl.name}</div>
                    <div className={`text-xs ${th.textSub}`}>{tpl.parts.length} Teile • {fmt(tpl.parts.reduce((s,p)=>s+p.duration,0))}</div>
                  </div>
                  <button onClick={() => { setParts(tpl.parts.map(p=>({...p,id:Date.now()+Math.random()}))); setShowTemplates(false); showToast(`📋 ${tpl.name} geladen`); }}
                    className={`px-3 py-2 rounded-xl text-sm font-bold ${th.accent} text-white`}>
                    Laden
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Stats */}
      {showStats && (
        <Modal title={t.statsTitle} onClose={() => setShowStats(false)}>
          {showHistory.length === 0 ? (
            <div className={`text-center py-8 ${th.textSub}`}>{t.noStats}</div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className={`${th.planCard} rounded-xl p-3 text-center`}>
                  <div className="text-2xl font-black">{showHistory.length}</div>
                  <div className={`text-xs ${th.textSub}`}>{t.shows}</div>
                </div>
                <div className={`${th.planCard} rounded-xl p-3 text-center`}>
                  <div className="text-2xl font-black">{fmt(showHistory.reduce((s,h)=>s+h.duration,0))}</div>
                  <div className={`text-xs ${th.textSub}`}>{t.totalTimeLabel}</div>
                </div>
                <div className={`${th.planCard} rounded-xl p-3 text-center`}>
                  <div className="text-2xl font-black">{Math.round(showHistory.reduce((s,h)=>s+h.parts,0)/showHistory.length)}</div>
                  <div className={`text-xs ${th.textSub}`}>{t.avgParts}</div>
                </div>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {[...showHistory].reverse().map((h,i) => (
                  <div key={i} className={`text-xs ${th.textSub} flex justify-between border-b ${th.border} py-1`}>
                    <span>{new Date(h.date).toLocaleString()}</span>
                    <span>{h.parts} {t.parts} • {fmt(h.duration)}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowHistory([]); localStorage.removeItem('ms_showHistory'); showToast(t.deletedHistory); }}
                className="w-full py-2 rounded-xl bg-red-500 text-white font-bold text-sm">{t.clearHistory}</button>
            </div>
          )}
        </Modal>
      )}

      {/* Stage Plan */}
      {showStageplan && (
        <Modal title={t.stageTitle} onClose={() => setShowStageplan(false)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {['audience','backstage'].map(side => (
                <div key={side} className={`border ${th.border} rounded-xl p-3`}>
                  <div className="font-bold mb-2 capitalize">{side === 'audience' ? t.audience : t.backstage}</div>
                  <div className="space-y-1 min-h-16">
                    {stageItems.filter(i=>i.side===side).map((item,idx) => (
                      <div key={idx} className={`flex items-center gap-2 text-sm ${th.planCard} px-2 py-1 rounded-lg`}>
                        <span>{item.icon}</span><span className="flex-1">{item.name}</span>
                        <button onClick={() => setStageItems(prev=>prev.filter((_,i)=>i!==stageItems.indexOf(item)))} className="text-red-400 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={`border ${th.border} rounded-xl p-3 flex gap-2 flex-wrap`}>
              <input className={`flex-1 px-3 py-1.5 rounded-xl border ${th.input} ${th.border} text-sm`} placeholder={t.itemName}
                value={stageForm.name} onChange={e=>setStageForm({...stageForm,name:e.target.value})} />
              <input className={`w-16 px-3 py-1.5 rounded-xl border ${th.input} ${th.border} text-sm text-center`} placeholder={t.itemIcon}
                value={stageForm.icon} onChange={e=>setStageForm({...stageForm,icon:e.target.value})} />
              <select className={`px-2 py-1.5 rounded-xl border ${th.input} ${th.border} text-sm`}
                value={stageForm.side} onChange={e=>setStageForm({...stageForm,side:e.target.value})}>
                <option value="audience">{t.audience}</option>
                <option value="backstage">{t.backstage}</option>
              </select>
              <button onClick={() => { if(stageForm.name.trim()) { setStageItems(prev=>[...prev,{...stageForm}]); setStageForm({name:'',icon:'🎭',side:'audience'}); } }}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold ${th.accent} text-white`}>{t.addItem}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* QR */}
      {showQR && (
        <Modal title={t.shareQR} onClose={() => setShowQR(false)}>
          <div className="text-center">
            <img src={qrData} alt="QR Code" className="mx-auto rounded-xl" />
            <div className={`text-xs mt-2 ${th.textSub}`}>Show-Ablauf als QR-Code</div>
          </div>
        </Modal>
      )}

      {/* Tutorial */}
      {showTutorial && (
        <Modal title={t.tutorialTitle} onClose={() => setShowTutorial(false)}>
          {!tutorialTopic ? (
            <div className="space-y-2">
              {[
                { key:'basics', title:t.tutoBasicsTitle, desc:t.tutoBasicsDesc },
                { key:'perform', title:t.tutoPerformTitle, desc:t.tutoPerformDesc },
                { key:'save', title:t.tutoSaveTitle, desc:t.tutoSaveDesc },
                { key:'themes', title:t.tutoThemesTitle, desc:t.tutoThemesDesc },
              ].map(topic => (
                <button key={topic.key} onClick={() => setTutorialTopic(topic.key)}
                  className={`w-full text-left px-4 py-3 rounded-xl border ${th.border} ${th.planCard} hover:bg-black/10`}>
                  <div className="font-bold">{topic.title}</div>
                  <div className={`text-xs ${th.textSub}`}>{topic.desc}</div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button onClick={() => setTutorialTopic(null)} className={`mb-3 text-xs ${th.textSub} underline`}>← Zurück</button>
              {tutorialTopic === 'basics' && <div className="space-y-2 text-sm"><p>1. Klicke <b>➕ Neuer Teil</b> um einen Teil hinzuzufügen.</p><p>2. Gib Titel, Dauer, Ansagetext und Notizen ein.</p><p>3. Nutze 📁 Gruppe für Abschnitte.</p><p>4. Sortiere per Drag & Drop oder ↑↓-Pfeile.</p></div>}
              {tutorialTopic === 'perform' && <div className="space-y-2 text-sm"><p>1. Klicke <b>🎭 Show starten</b>.</p><p>2. Der Timer zählt automatisch, TTS-Ansagen werden ausgelöst.</p><p>3. Swipe links/rechts auf dem Handy zum Navigieren.</p><p>4. ⏸ Pause / ▶ Weiter zum Pausieren.</p></div>}
              {tutorialTopic === 'save' && <div className="space-y-2 text-sm"><p>1. <b>💾 Speichern</b> sichert die aktuelle Show mit einem Namen.</p><p>2. <b>📥 Backup</b> lädt eine JSON-Datei herunter.</p><p>3. <b>📤 Import</b> lädt ein Backup wieder ein.</p><p>4. Regelmäßige Backups empfohlen!</p></div>}
              {tutorialTopic === 'themes' && <div className="space-y-2 text-sm"><p>1. In ⚙️ Einstellungen → 🎨 Design kannst du das Theme wählen.</p><p>2. Perform-Theme gilt nur im Bühnen-Modus.</p><p>3. Auto erkennt das System-Theme automatisch.</p><p>4. Schriftgröße und -art sind anpassbar.</p></div>}
            </div>
          )}
        </Modal>
      )}

      {/* About */}
      {showAbout && (
        <Modal title={t.aboutTitle} onClose={() => setShowAbout(false)}>
          <div className="text-center space-y-3">
            <div className="text-5xl">🎩✨</div>
            <div className="font-black text-xl">{t.appTitle}</div>
            <div className={`text-sm ${th.textSub}`}>v1.7</div>
            <div className={`text-sm ${th.textSub}`}>{t.appSub}</div>
            <div className="border-t border-gray-300 pt-3">
              <div className="font-bold">{t.developer}</div>
              <div className={`text-sm ${th.textSub}`}>{t.devRole}</div>
            </div>
            <div className={`text-xs ${th.textSub}`}>{t.rights}</div>
          </div>
        </Modal>
      )}
    </div>
  );
}
