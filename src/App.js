import { useReducer, useEffect, useRef, useCallback, useState } from "react";

// ============================================================
// CONSTANTS & HELPERS
// ============================================================
// ============================================================
// LANGUAGE / TRANSLATIONS
// ============================================================
const LANG_FLAGS = { de:'🇩🇪', en:'🇬🇧', fr:'🇫🇷', es:'🇪🇸', it:'🇮🇹', nl:'🇳🇱' };
const LANG_NAMES = { de:'Deutsch', en:'English', fr:'Français', es:'Español', it:'Italiano', nl:'Nederlands' };

const TRANSLATIONS = {
  de: {
    appTitle:'🎩✨ Magic Showrunner', appVersion:'v2.0',
    save:'💾 Speichern', load:'📂 Laden', backup:'📥 Backup', settings:'⚙️ Einstellungen',
    newPart:'➕ Neuer Teil', startShow:'🎭 Show starten', testMode:'🧪 Testmodus',
    parts:'Teile', totalTime:'Gesamtzeit', settingsTitle:'⚙️ Einstellungen',
    tabDesign:'🎨 Design', tabAudio:'🔊 Audio', tabTTS:'🗣️ Stimme', tabFont:'🔤 Schrift', tabLicense:'🔑 Lizenz', tabLang:'🌐 Sprache',
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
    fullscreen:'⛶ Vollbild', exitFullscreen:'✕ Vollbild beenden',
    exportPDF:'📄 PDF Export', exportCSV:'📊 CSV Export',
    stageAdd:'➕ Element hinzufügen', stageClear:'🗑 Alles löschen', stageHint:'Klicke auf die Bühne um Elemente zu platzieren',
    langTitle:'🌐 Sprache wählen',
    deleteShow:'🗑 Löschen', loadShow:'📂 Laden',
  },
  en: {
    appTitle:'🎩✨ Magic Showrunner', appVersion:'v2.0',
    save:'💾 Save', load:'📂 Load', backup:'📥 Backup', settings:'⚙️ Settings',
    newPart:'➕ New Part', startShow:'🎭 Start Show', testMode:'🧪 Test Mode',
    parts:'Parts', totalTime:'Total Time', settingsTitle:'⚙️ Settings',
    tabDesign:'🎨 Design', tabAudio:'🔊 Audio', tabTTS:'🗣️ Voice', tabFont:'🔤 Font', tabLicense:'🔑 License', tabLang:'🌐 Language',
    licenseTitle:'🔑 Activation Code', licenseRedeem:'🔑 Redeem',
    licenseSuccess:'✅ Code redeemed!', licenseError:'❌ Invalid code.', licenseAlready:'ℹ️ Already active.',
    licenseReset:'🗑 Reset License', licenseActive:'✅ Active Features:', licenseNone:'No features unlocked.',
    licensePlaceholder:'e.g. MAGIC-PRO-2026',
    planTheme:'Plan Theme', performTheme:'Perform Theme',
    beeps:'🔔 Beeps', vibration:'📳 Vibration', volume:'🔊 Volume',
    testTone:'🔊 Test Tone', testDuration:'⏱ Test Mode Duration per Part',
    titleLabel:'Title', durationLabel:'Duration (sec)', introLabel:'Intro Announcement (TTS)',
    preAnnounceLabel:'Pre-Announce (sec)', preAnnounceText:'Pre-Announce Text',
    notesLabel:'Notes', musicUrl:'Music URL', vol:'Vol', fadeIn:'Fade In', fadeOut:'Fade Out',
    saveBtn:'💾 Save', cancelBtn:'Cancel', testBtn:'🔊 Test',
    saveShowTitle:'💾 Save Show', showName:'Show Name', overwrite:'Overwrite:',
    loadShowTitle:'📂 Load Show', noSaved:'No saved shows.',
    perform_pause:'⏸ Pause', perform_resume:'▶ Resume', perform_stop:'⏹ Stop',
    perform_prev:'← Back', perform_next:'Next →', perform_notes:'📝 Notes',
    perform_remaining:'remaining', perform_part:'Part', perform_of:'/', perform_total:'Total',
    ttsVoice:'Voice', ttsRate:'Speed', ttsPitch:'Pitch', ttsPreview:'🔊 Preview',
    ttsApply:'✅ Apply', fontApply:'✅ Apply', fontPreview:'Preview:',
    fontSize:'Font Size', fontFamily:'Font Family', animations:'Animations',
    dragHint:'☰ Hold & drag to reorder',
    partColor:'Color', duplicatePart:'📋 Duplicate',
    endedMsg:'The show is over. Thank you!',
    idbSaved:'🗄️ IDB Backup saved', idbRestored:'🗄️ Data restored from IDB',
    addPart:'➕ New Part', editPart:'✏️ Edit Part',
    noStats:'No shows yet.', shows:'Shows', clearHistory:'🗑 Clear History',
    statsTitle:'📊 Statistics', stageTitle:'🎪 Stage Plan',
    wakelock:'📱 Keep screen awake',
    fullscreen:'⛶ Fullscreen', exitFullscreen:'✕ Exit Fullscreen',
    exportPDF:'📄 PDF Export', exportCSV:'📊 CSV Export',
    stageAdd:'➕ Add Element', stageClear:'🗑 Clear All', stageHint:'Click on the stage to place elements',
    langTitle:'🌐 Choose Language',
    deleteShow:'🗑 Delete', loadShow:'📂 Load',
  },
  fr: {
    appTitle:'🎩✨ Magic Showrunner', appVersion:'v2.0',
    save:'💾 Sauvegarder', load:'📂 Charger', backup:'📥 Sauvegarde', settings:'⚙️ Paramètres',
    newPart:'➕ Nouvelle partie', startShow:'🎭 Démarrer le show', testMode:'🧪 Mode test',
    parts:'Parties', totalTime:'Durée totale', settingsTitle:'⚙️ Paramètres',
    tabDesign:'🎨 Design', tabAudio:'🔊 Audio', tabTTS:'🗣️ Voix', tabFont:'🔤 Police', tabLicense:'🔑 Licence', tabLang:'🌐 Langue',
    licenseTitle:'🔑 Code d\'activation', licenseRedeem:'🔑 Activer',
    licenseSuccess:'✅ Code activé!', licenseError:'❌ Code invalide.', licenseAlready:'ℹ️ Déjà actif.',
    licenseReset:'🗑 Réinitialiser', licenseActive:'✅ Fonctionnalités actives:', licenseNone:'Aucune fonctionnalité activée.',
    licensePlaceholder:'ex. MAGIC-PRO-2026',
    planTheme:'Thème de planification', performTheme:'Thème de performance',
    beeps:'🔔 Bips', vibration:'📳 Vibration', volume:'🔊 Volume',
    testTone:'🔊 Ton test', testDuration:'⏱ Durée mode test par partie',
    titleLabel:'Titre', durationLabel:'Durée (sec)', introLabel:'Annonce intro (TTS)',
    preAnnounceLabel:'Pré-annonce (sec)', preAnnounceText:'Texte de pré-annonce',
    notesLabel:'Notes', musicUrl:'URL musique', vol:'Vol', fadeIn:'Fondu entrée', fadeOut:'Fondu sortie',
    saveBtn:'💾 Sauvegarder', cancelBtn:'Annuler', testBtn:'🔊 Test',
    saveShowTitle:'💾 Sauvegarder le show', showName:'Nom du show', overwrite:'Écraser:',
    loadShowTitle:'📂 Charger un show', noSaved:'Aucun show sauvegardé.',
    perform_pause:'⏸ Pause', perform_resume:'▶ Reprendre', perform_stop:'⏹ Arrêter',
    perform_prev:'← Retour', perform_next:'Suivant →', perform_notes:'📝 Notes',
    perform_remaining:'restant', perform_part:'Partie', perform_of:'/', perform_total:'Total',
    ttsVoice:'Voix', ttsRate:'Vitesse', ttsPitch:'Hauteur', ttsPreview:'🔊 Aperçu',
    ttsApply:'✅ Appliquer', fontApply:'✅ Appliquer', fontPreview:'Aperçu:',
    fontSize:'Taille police', fontFamily:'Police', animations:'Animations',
    dragHint:'☰ Maintenir & glisser pour réordonner',
    partColor:'Couleur', duplicatePart:'📋 Dupliquer',
    endedMsg:'Le show est terminé. Merci!',
    idbSaved:'🗄️ Sauvegarde IDB effectuée', idbRestored:'🗄️ Données restaurées depuis IDB',
    addPart:'➕ Nouvelle partie', editPart:'✏️ Modifier la partie',
    noStats:'Aucun show.', shows:'Shows', clearHistory:'🗑 Effacer l\'historique',
    statsTitle:'📊 Statistiques', stageTitle:'🎪 Plan de scène',
    wakelock:'📱 Garder l\'écran allumé',
    fullscreen:'⛶ Plein écran', exitFullscreen:'✕ Quitter plein écran',
    exportPDF:'📄 Export PDF', exportCSV:'📊 Export CSV',
    stageAdd:'➕ Ajouter élément', stageClear:'🗑 Tout effacer', stageHint:'Cliquez sur la scène pour placer des éléments',
    langTitle:'🌐 Choisir la langue',
    deleteShow:'🗑 Supprimer', loadShow:'📂 Charger',
  },
  es: {
    appTitle:'🎩✨ Magic Showrunner', appVersion:'v2.0',
    save:'💾 Guardar', load:'📂 Cargar', backup:'📥 Copia', settings:'⚙️ Ajustes',
    newPart:'➕ Nueva parte', startShow:'🎭 Iniciar show', testMode:'🧪 Modo prueba',
    parts:'Partes', totalTime:'Tiempo total', settingsTitle:'⚙️ Ajustes',
    tabDesign:'🎨 Diseño', tabAudio:'🔊 Audio', tabTTS:'🗣️ Voz', tabFont:'🔤 Fuente', tabLicense:'🔑 Licencia', tabLang:'🌐 Idioma',
    licenseTitle:'🔑 Código de activación', licenseRedeem:'🔑 Canjear',
    licenseSuccess:'✅ ¡Código canjeado!', licenseError:'❌ Código inválido.', licenseAlready:'ℹ️ Ya activo.',
    licenseReset:'🗑 Restablecer licencia', licenseActive:'✅ Funciones activas:', licenseNone:'Sin funciones activadas.',
    licensePlaceholder:'ej. MAGIC-PRO-2026',
    planTheme:'Tema de planificación', performTheme:'Tema de actuación',
    beeps:'🔔 Pitidos', vibration:'📳 Vibración', volume:'🔊 Volumen',
    testTone:'🔊 Tono de prueba', testDuration:'⏱ Duración modo prueba por parte',
    titleLabel:'Título', durationLabel:'Duración (seg)', introLabel:'Anuncio intro (TTS)',
    preAnnounceLabel:'Pre-anuncio (seg)', preAnnounceText:'Texto pre-anuncio',
    notesLabel:'Notas', musicUrl:'URL música', vol:'Vol', fadeIn:'Fade In', fadeOut:'Fade Out',
    saveBtn:'💾 Guardar', cancelBtn:'Cancelar', testBtn:'🔊 Prueba',
    saveShowTitle:'💾 Guardar show', showName:'Nombre del show', overwrite:'Sobrescribir:',
    loadShowTitle:'📂 Cargar show', noSaved:'Sin shows guardados.',
    perform_pause:'⏸ Pausa', perform_resume:'▶ Continuar', perform_stop:'⏹ Detener',
    perform_prev:'← Atrás', perform_next:'Siguiente →', perform_notes:'📝 Notas',
    perform_remaining:'restante', perform_part:'Parte', perform_of:'/', perform_total:'Total',
    ttsVoice:'Voz', ttsRate:'Velocidad', ttsPitch:'Tono', ttsPreview:'🔊 Vista previa',
    ttsApply:'✅ Aplicar', fontApply:'✅ Aplicar', fontPreview:'Vista previa:',
    fontSize:'Tamaño fuente', fontFamily:'Fuente', animations:'Animaciones',
    dragHint:'☰ Mantener & arrastrar para reordenar',
    partColor:'Color', duplicatePart:'📋 Duplicar',
    endedMsg:'¡El show ha terminado. Gracias!',
    idbSaved:'🗄️ Copia IDB guardada', idbRestored:'🗄️ Datos restaurados desde IDB',
    addPart:'➕ Nueva parte', editPart:'✏️ Editar parte',
    noStats:'Sin shows aún.', shows:'Shows', clearHistory:'🗑 Borrar historial',
    statsTitle:'📊 Estadísticas', stageTitle:'🎪 Plan de escenario',
    wakelock:'📱 Mantener pantalla activa',
    fullscreen:'⛶ Pantalla completa', exitFullscreen:'✕ Salir pantalla completa',
    exportPDF:'📄 Exportar PDF', exportCSV:'📊 Exportar CSV',
    stageAdd:'➕ Agregar elemento', stageClear:'🗑 Borrar todo', stageHint:'Haz clic en el escenario para colocar elementos',
    langTitle:'🌐 Elegir idioma',
    deleteShow:'🗑 Eliminar', loadShow:'📂 Cargar',
  },
  it: {
    appTitle:'🎩✨ Magic Showrunner', appVersion:'v2.0',
    save:'💾 Salva', load:'📂 Carica', backup:'📥 Backup', settings:'⚙️ Impostazioni',
    newPart:'➕ Nuova parte', startShow:'🎭 Avvia show', testMode:'🧪 Modalità test',
    parts:'Parti', totalTime:'Tempo totale', settingsTitle:'⚙️ Impostazioni',
    tabDesign:'🎨 Design', tabAudio:'🔊 Audio', tabTTS:'🗣️ Voce', tabFont:'🔤 Font', tabLicense:'🔑 Licenza', tabLang:'🌐 Lingua',
    licenseTitle:'🔑 Codice di attivazione', licenseRedeem:'🔑 Riscatta',
    licenseSuccess:'✅ Codice riscattato!', licenseError:'❌ Codice non valido.', licenseAlready:'ℹ️ Già attivo.',
    licenseReset:'🗑 Ripristina licenza', licenseActive:'✅ Funzioni attive:', licenseNone:'Nessuna funzione attivata.',
    licensePlaceholder:'es. MAGIC-PRO-2026',
    planTheme:'Tema pianificazione', performTheme:'Tema esecuzione',
    beeps:'🔔 Segnali', vibration:'📳 Vibrazione', volume:'🔊 Volume',
    testTone:'🔊 Tono test', testDuration:'⏱ Durata modalità test per parte',
    titleLabel:'Titolo', durationLabel:'Durata (sec)', introLabel:'Annuncio intro (TTS)',
    preAnnounceLabel:'Pre-annuncio (sec)', preAnnounceText:'Testo pre-annuncio',
    notesLabel:'Note', musicUrl:'URL musica', vol:'Vol', fadeIn:'Fade In', fadeOut:'Fade Out',
    saveBtn:'💾 Salva', cancelBtn:'Annulla', testBtn:'🔊 Test',
    saveShowTitle:'💾 Salva show', showName:'Nome show', overwrite:'Sovrascrivi:',
    loadShowTitle:'📂 Carica show', noSaved:'Nessuno show salvato.',
    perform_pause:'⏸ Pausa', perform_resume:'▶ Riprendi', perform_stop:'⏹ Ferma',
    perform_prev:'← Indietro', perform_next:'Avanti →', perform_notes:'📝 Note',
    perform_remaining:'rimanente', perform_part:'Parte', perform_of:'/', perform_total:'Totale',
    ttsVoice:'Voce', ttsRate:'Velocità', ttsPitch:'Tono', ttsPreview:'🔊 Anteprima',
    ttsApply:'✅ Applica', fontApply:'✅ Applica', fontPreview:'Anteprima:',
    fontSize:'Dimensione font', fontFamily:'Font', animations:'Animazioni',
    dragHint:'☰ Tieni & trascina per riordinare',
    partColor:'Colore', duplicatePart:'📋 Duplica',
    endedMsg:'Lo show è terminato. Grazie!',
    idbSaved:'🗄️ Backup IDB salvato', idbRestored:'🗄️ Dati ripristinati da IDB',
    addPart:'➕ Nuova parte', editPart:'✏️ Modifica parte',
    noStats:'Nessuno show.', shows:'Shows', clearHistory:'🗑 Cancella cronologia',
    statsTitle:'📊 Statistiche', stageTitle:'🎪 Piano palco',
    wakelock:'📱 Mantieni schermo attivo',
    fullscreen:'⛶ Schermo intero', exitFullscreen:'✕ Esci da schermo intero',
    exportPDF:'📄 Esporta PDF', exportCSV:'📊 Esporta CSV',
    stageAdd:'➕ Aggiungi elemento', stageClear:'🗑 Cancella tutto', stageHint:'Clicca sul palco per posizionare elementi',
    langTitle:'🌐 Scegli lingua',
    deleteShow:'🗑 Elimina', loadShow:'📂 Carica',
  },
  nl: {
    appTitle:'🎩✨ Magic Showrunner', appVersion:'v2.0',
    save:'💾 Opslaan', load:'📂 Laden', backup:'📥 Back-up', settings:'⚙️ Instellingen',
    newPart:'➕ Nieuw deel', startShow:'🎭 Show starten', testMode:'🧪 Testmodus',
    parts:'Delen', totalTime:'Totale tijd', settingsTitle:'⚙️ Instellingen',
    tabDesign:'🎨 Design', tabAudio:'🔊 Audio', tabTTS:'🗣️ Stem', tabFont:'🔤 Lettertype', tabLicense:'🔑 Licentie', tabLang:'🌐 Taal',
    licenseTitle:'🔑 Activatiecode', licenseRedeem:'🔑 Inwisselen',
    licenseSuccess:'✅ Code ingewisseld!', licenseError:'❌ Ongeldige code.', licenseAlready:'ℹ️ Al actief.',
    licenseReset:'🗑 Licentie resetten', licenseActive:'✅ Actieve functies:', licenseNone:'Geen functies ontgrendeld.',
    licensePlaceholder:'bijv. MAGIC-PRO-2026',
    planTheme:'Planningsthema', performTheme:'Uitvoeringsthema',
    beeps:'🔔 Piepgeluiden', vibration:'📳 Trillen', volume:'🔊 Volume',
    testTone:'🔊 Testgeluid', testDuration:'⏱ Testmodus duur per deel',
    titleLabel:'Titel', durationLabel:'Duur (sec)', introLabel:'Intro-aankondiging (TTS)',
    preAnnounceLabel:'Vooraankondiging (sec)', preAnnounceText:'Vooraankondigingstekst',
    notesLabel:'Notities', musicUrl:'Muziek-URL', vol:'Vol', fadeIn:'Fade In', fadeOut:'Fade Out',
    saveBtn:'💾 Opslaan', cancelBtn:'Annuleren', testBtn:'🔊 Test',
    saveShowTitle:'💾 Show opslaan', showName:'Shownaam', overwrite:'Overschrijven:',
    loadShowTitle:'📂 Show laden', noSaved:'Geen opgeslagen shows.',
    perform_pause:'⏸ Pauze', perform_resume:'▶ Verder', perform_stop:'⏹ Stop',
    perform_prev:'← Terug', perform_next:'Verder →', perform_notes:'📝 Notities',
    perform_remaining:'resterend', perform_part:'Deel', perform_of:'/', perform_total:'Totaal',
    ttsVoice:'Stem', ttsRate:'Snelheid', ttsPitch:'Toonhoogte', ttsPreview:'🔊 Voorbeeld',
    ttsApply:'✅ Toepassen', fontApply:'✅ Toepassen', fontPreview:'Voorbeeld:',
    fontSize:'Lettergrootte', fontFamily:'Lettertype', animations:'Animaties',
    dragHint:'☰ Vasthouden & slepen om te herordenen',
    partColor:'Kleur', duplicatePart:'📋 Dupliceren',
    endedMsg:'De show is afgelopen. Bedankt!',
    idbSaved:'🗄️ IDB-back-up opgeslagen', idbRestored:'🗄️ Gegevens hersteld uit IDB',
    addPart:'➕ Nieuw deel', editPart:'✏️ Deel bewerken',
    noStats:'Nog geen shows.', shows:'Shows', clearHistory:'🗑 Geschiedenis wissen',
    statsTitle:'📊 Statistieken', stageTitle:'🎪 Podiumplan',
    wakelock:'📱 Scherm actief houden',
    fullscreen:'⛶ Volledig scherm', exitFullscreen:'✕ Volledig scherm sluiten',
    exportPDF:'📄 PDF exporteren', exportCSV:'📊 CSV exporteren',
    stageAdd:'➕ Element toevoegen', stageClear:'🗑 Alles wissen', stageHint:'Klik op het podium om elementen te plaatsen',
    langTitle:'🌐 Taal kiezen',
    deleteShow:'🗑 Verwijderen', loadShow:'📂 Laden',
  },
};

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

// T is resolved dynamically from TRANSLATIONS based on current lang (see App)

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
// PDF & CSV EXPORT HELPERS
// ============================================================
function exportCSV(parts, lang) {
  const T = TRANSLATIONS[lang] || TRANSLATIONS.de;
  const header = ['#', T.titleLabel, T.durationLabel, T.introLabel, T.notesLabel].join(';');
  const rows = parts.map((p, i) =>
    [i+1, `"${p.title}"`, p.duration, `"${p.introText || ''}"`, `"${p.notes || ''}"`].join(';')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'showrunner_export.csv'; a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(parts, lang) {
  const T = TRANSLATIONS[lang] || TRANSLATIONS.de;
  const totalSec = parts.reduce((a, p) => a + p.duration, 0);
  const fmt2 = (s) => { s = Math.abs(Math.floor(s)); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; };
  const rows = parts.map((p, i) =>
    `<tr style="background:${i%2===0?'#f9f9f9':'#fff'}">
      <td style="padding:6px 10px;border:1px solid #ddd">${i+1}</td>
      <td style="padding:6px 10px;border:1px solid #ddd"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:6px"></span>${p.title}</td>
      <td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${fmt2(p.duration)}</td>
      <td style="padding:6px 10px;border:1px solid #ddd">${p.introText || ''}</td>
      <td style="padding:6px 10px;border:1px solid #ddd">${p.notes || ''}</td>
    </tr>`
  ).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Magic Showrunner Export</title>
  <style>body{font-family:sans-serif;padding:30px;color:#222}h1{color:#4f46e5}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#4f46e5;color:#fff;padding:8px 10px;border:1px solid #4f46e5;text-align:left}.footer{margin-top:20px;font-size:12px;color:#888}</style></head>
  <body><h1>🎩✨ Magic Showrunner</h1><p>${new Date().toLocaleString()}</p>
  <table><thead><tr><th>#</th><th>${T.titleLabel}</th><th>${T.durationLabel}</th><th>${T.introLabel}</th><th>${T.notesLabel}</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="footer">${T.totalTime}: ${fmt2(totalSec)} · ${parts.length} ${T.parts}</div></body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}

// ============================================================
// REDUCER
// ============================================================
const initialState = {
  // UI
  lang: localStorage.getItem('ms_lang') || 'de',
  isFullscreen: false,
  mode: 'plan', // 'plan' | 'perform' | 'settings' | 'stats' | 'stage'
  settingsTab: 'design',
  toast: null,
  showForm: false,
  editIdx: null,
  showSaveModal: false,
  showLoadModal: false,
  showTemplates: false,
  countdownNum: null,
  // Stage
  stageItems: (() => { try { return JSON.parse(localStorage.getItem('ms_stage') || '[]'); } catch(e) { return []; } })(),
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
    case 'SET_LANG': return { ...state, lang: action.payload };
    case 'SET_FULLSCREEN': return { ...state, isFullscreen: action.payload };
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
    // Stage
    case 'SET_STAGE_ITEMS': return { ...state, stageItems: action.payload };
    case 'ADD_STAGE_ITEM': return { ...state, stageItems: [...state.stageItems, action.payload] };
    case 'UPDATE_STAGE_ITEM': {
      const items = state.stageItems.map((it, i) => i === action.idx ? { ...it, ...action.payload } : it);
      return { ...state, stageItems: items };
    }
    case 'DELETE_STAGE_ITEM': return { ...state, stageItems: state.stageItems.filter((_,i) => i !== action.idx) };
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
  const T = TRANSLATIONS[state.lang] || TRANSLATIONS.de;
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
  const [timerSize, setTimerSize] = React.useState('large'); // 'large' | 'medium' | 'small'
  const T = TRANSLATIONS[state.lang] || TRANSLATIONS.de;
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
        <div
          className={`font-mono font-bold leading-none tabular-nums ${isWarning ? pth.warnTimer : pth.timerText} ${isWarning ? 'animate-pulse' : ''}`}
          style={{
            fontSize: timerSize === 'large'
              ? 'clamp(5rem, 28vw, 20rem)'
              : timerSize === 'medium'
                ? 'clamp(2.5rem, 14vw, 10rem)'
                : 'clamp(1.25rem, 7vw, 5rem)'
          }}
        >
          {fmt(remaining)}
        </div>
        {/* Timer size switcher */}
        <div className="flex gap-2">
          {[['large','XL'],['medium','M'],['small','S']].map(([size, label]) => (
            <button
              key={size}
              onClick={() => setTimerSize(size)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                timerSize === size
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-transparent border-gray-500 opacity-50 hover:opacity-80'
              }`}
            >{label}</button>
          ))}
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
  const T = TRANSLATIONS[state.lang] || TRANSLATIONS.de;
  const { settingsTab, themeMode, performTheme, animationsEnabled, fontSize, fontFamily,
    ttsRate, ttsPitch, ttsVoiceURI, beepsEnabled, vibrationEnabled, volume,
    countdownAnimation, unlockedFeatures, licenseInput, licenseStatus, lang } = state;

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
  const tabs = ['design','audio','tts','font','license','lang'];
  const tabLabels = { design: T.tabDesign, audio: T.tabAudio, tts: T.tabTTS, font: T.tabFont, license: T.tabLicense, lang: T.tabLang };

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
        {/* LANG */}
        {settingsTab === 'lang' && <>
          <div className={`text-sm font-semibold mb-3 ${th.textSub}`}>{T.langTitle}</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(TRANSLATIONS).map(l => (
              <button key={l} onClick={() => { dispatch({ type: 'SET_LANG', payload: l }); localStorage.setItem('ms_lang', l); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${lang === l ? `${th.accent} text-white border-transparent` : `${th.border} ${th.text}`}`}>
                <span className="text-lg">{LANG_FLAGS[l]}</span>
                <span>{LANG_NAMES[l]}</span>
              </button>
            ))}
          </div>
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
// STAGE VIEW
// ============================================================
const STAGE_ELEMENT_TYPES = [
  { type:'mic',   icon:'🎤', label:'Mikrofon' },
  { type:'spot',  icon:'💡', label:'Spotlight' },
  { type:'table', icon:'🪄', label:'Tisch' },
  { type:'chair', icon:'🪑', label:'Stuhl' },
  { type:'box',   icon:'📦', label:'Box/Prop' },
  { type:'person',icon:'🧍', label:'Person' },
  { type:'exit',  icon:'🚪', label:'Ausgang' },
  { type:'cam',   icon:'📷', label:'Kamera' },
];

function StageView({ state, dispatch, th }) {
  const T = TRANSLATIONS[state.lang] || TRANSLATIONS.de;
  const { stageItems } = state;
  const [selectedType, setSelectedType] = useState('mic');
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x:0, y:0 });
  const stageRef = useRef(null);

  const handleStageClick = (e) => {
    if (e.target !== stageRef.current && !e.target.classList.contains('stage-bg')) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    const el = STAGE_ELEMENT_TYPES.find(t => t.type === selectedType);
    const newItem = { id: Date.now(), type: selectedType, icon: el?.icon || '📦', label: el?.label || '', x: parseFloat(x), y: parseFloat(y) };
    const updated = [...stageItems, newItem];
    dispatch({ type: 'SET_STAGE_ITEMS', payload: updated });
    localStorage.setItem('ms_stage', JSON.stringify(updated));
  };

  const handleMouseDown = (e, idx) => {
    e.stopPropagation();
    const rect = stageRef.current.getBoundingClientRect();
    const item = stageItems[idx];
    setDraggingIdx(idx);
    setDragOffset({
      x: e.clientX - rect.left - (item.x / 100 * rect.width),
      y: e.clientY - rect.top - (item.y / 100 * rect.height),
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (draggingIdx === null || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left - dragOffset.x) / rect.width * 100)));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top - dragOffset.y) / rect.height * 100)));
    const updated = stageItems.map((it, i) => i === draggingIdx ? { ...it, x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) } : it);
    dispatch({ type: 'SET_STAGE_ITEMS', payload: updated });
  }, [draggingIdx, dragOffset, stageItems]);

  const handleMouseUp = useCallback(() => {
    if (draggingIdx !== null) {
      localStorage.setItem('ms_stage', JSON.stringify(stageItems));
      setDraggingIdx(null);
    }
  }, [draggingIdx, stageItems]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className={`${th.card} ${th.text} rounded-2xl shadow-xl max-w-2xl mx-auto my-4 p-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-lg">{T.stageTitle}</span>
        <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'plan' })} className="text-2xl opacity-60 hover:opacity-100">×</button>
      </div>
      {/* Element picker */}
      <div className="flex flex-wrap gap-2 mb-3">
        {STAGE_ELEMENT_TYPES.map(el => (
          <button key={el.type} onClick={() => setSelectedType(el.type)}
            className={`px-2 py-1 rounded-lg text-sm border transition-colors ${selectedType === el.type ? `${th.accent} text-white border-transparent` : `${th.border} ${th.text}`}`}>
            {el.icon} {el.label}
          </button>
        ))}
      </div>
      <div className={`text-xs ${th.textSub} mb-2`}>{T.stageHint}</div>
      {/* Stage canvas */}
      <div
        ref={stageRef}
        className="stage-bg relative w-full rounded-xl border-2 border-dashed cursor-crosshair select-none"
        style={{ height: 320, background: 'linear-gradient(to bottom, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)', borderColor: '#6366f1' }}
        onClick={handleStageClick}
      >
        {/* Stage label */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/40 text-xs font-semibold tracking-widest pointer-events-none">STAGE</div>
        {/* Stage front line */}
        <div className="absolute bottom-8 left-4 right-4 border-t border-white/20 pointer-events-none" />
        {stageItems.map((item, idx) => (
          <div key={item.id}
            className="absolute flex flex-col items-center cursor-move group"
            style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)', zIndex: draggingIdx === idx ? 10 : 1 }}
            onMouseDown={(e) => handleMouseDown(e, idx)}
          >
            <span className="text-2xl drop-shadow-lg">{item.icon}</span>
            <span className="text-white text-xs mt-0.5 bg-black/40 px-1 rounded">{item.label}</span>
            <button
              className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center leading-none"
              onClick={(e) => { e.stopPropagation(); const updated = stageItems.filter((_,i) => i !== idx); dispatch({ type: 'SET_STAGE_ITEMS', payload: updated }); localStorage.setItem('ms_stage', JSON.stringify(updated)); }}
            >×</button>
          </div>
        ))}
      </div>
      {/* Clear */}
      <div className="flex justify-end mt-3">
        <button onClick={() => { dispatch({ type: 'SET_STAGE_ITEMS', payload: [] }); localStorage.setItem('ms_stage', '[]'); }}
          className="text-xs text-red-500 underline">{T.stageClear}</button>
      </div>
    </div>
  );
}

// ============================================================
// STATS VIEW
// ============================================================
function StatsView({ state, dispatch, th }) {
  const T = TRANSLATIONS[state.lang] || TRANSLATIONS.de;
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
// FULLSCREEN HOOK
// ============================================================
function useFullscreen(dispatch) {
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) dispatch({ type: 'SET_FULLSCREEN', payload: false });
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [dispatch]);

  const toggleFullscreen = useCallback(async (ref) => {
    try {
      if (!document.fullscreenElement) {
        await (ref?.current || document.documentElement).requestFullscreen();
        dispatch({ type: 'SET_FULLSCREEN', payload: true });
      } else {
        await document.exitFullscreen();
        dispatch({ type: 'SET_FULLSCREEN', payload: false });
      }
    } catch(e) {}
  }, [dispatch]);

  return toggleFullscreen;
}

// ============================================================
// PLAN VIEW (main part list)
// ============================================================
function PlanView({ state, dispatch, th }) {
  const T = TRANSLATIONS[state.lang] || TRANSLATIONS.de;
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
      {/* Export buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => exportCSV(parts, state.lang)}
          className={`px-3 py-1.5 rounded-lg text-sm border ${th.border} ${th.text} hover:opacity-80`}>{T.exportCSV}</button>
        <button onClick={() => exportPDF(parts, state.lang)}
          className={`px-3 py-1.5 rounded-lg text-sm border ${th.border} ${th.text} hover:opacity-80`}>{T.exportPDF}</button>
        <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'stage' })}
          className={`px-3 py-1.5 rounded-lg text-sm border ${th.border} ${th.text} hover:opacity-80`}>{T.stageTitle}</button>
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
  const T = TRANSLATIONS[state.lang] || TRANSLATIONS.de;
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
  const appRef = useRef(null);
  const T = TRANSLATIONS[state.lang] || TRANSLATIONS.de;
  const toggleFullscreen = useFullscreen(state.isFullscreen, dispatch);

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
