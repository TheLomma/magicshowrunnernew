

import { useState, useEffect, useRef, useCallback } from "react";

const AudioEngine = {
  ctx: null,
  getCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this.ctx;
  },
  beep(vol = 0.5, freq = 880, dur = 0.15) {
    const c = this.getCtx(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.value = freq; g.gain.value = vol;
    o.start(); o.stop(c.currentTime + dur);
  },
  speak(text, speechLang = 'de-DE') {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = speechLang;
    const v = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('de'));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }
};

const vibrate = (p = [200]) => { if ('vibrate' in navigator) navigator.vibrate(p); };

// ─── Translations ───
const TRANSLATIONS = {
  de: {
    appTitle: '🎩✨ Magic Showrunner',
    appSub: 'Dein professioneller Bühnen-Assistent',
    save: '💾 Speichern',
    load: '📂 Laden',
    backup: '📥 Backup',
    tutorial: '📖 Tutorial',
    about: 'ℹ️ Über',
    importBtn: '📤 Import',
    settings: '⚙️ Einstellungen',
    fullscreen: '⛶ Vollbild',
    exitFullscreen: '⛶ Fenster',
    stage: '🎪 Bühne',
    stats: '📊 Stats',
    newPart: '➕ Neuer Teil',
    startShow: '🎭 Show starten',
    testMode: '🧪 Testmodus',
    parts: 'Teile',
    totalTime: 'Gesamtzeit',
    settingsTitle: '⚙️ Einstellungen',
    tabDesign: '🎨 Design',
    tabAudio: '🔊 Audio',
    tabTest: '🧪 Test',
    tabLanguage: '🌐 Sprache',
    planTheme: 'Planungs-Theme',
    performTheme: 'Perform-Theme',
    beeps: '🔔 Signaltöne',
    vibration: '📳 Vibration',
    volume: '🔊 Lautstärke',
    testTone: '🔊 Testton',
    testDuration: '⏱ Testmodus-Dauer pro Teil',
    testHint: 'Im Testmodus wird jeder Teil auf diese Dauer gekürzt.',
    selectLanguage: 'Sprache wählen',
    tutorialTitle: '📖 Tutorial & Hilfe',
    tutorialIntro: 'Wähle ein Thema:',
    aboutTitle: 'ℹ️ Über Magic Showrunner',
    stageTitle: '🎪 Bühnenplan',
    statsTitle: '📊 Statistiken',
    noStats: 'Noch keine Shows durchgeführt.',
    shows: 'Shows',
    totalTimeLabel: 'Gesamtzeit',
    avgParts: 'Ø Teile',
    clearHistory: '🗑 Verlauf löschen',
    editPart: '✏️ Teil bearbeiten',
    addPart: '➕ Neuer Teil',
    titleLabel: 'Titel',
    durationLabel: 'Dauer',
    introLabel: 'Intro-Ansage (Text-to-Speech)',
    preAnnounceLabel: 'Vorankündigung',
    preAnnounceText: 'Vorankündigungs-Text',
    notesLabel: 'Notizen (Props, Technik...)',
    musicUrl: 'Musik-URL (optional)',
    vol: 'Vol',
    fadeIn: 'Fade In',
    fadeOut: 'Fade Out',
    saveBtn: '💾 Speichern',
    cancelBtn: 'Abbrechen',
    testBtn: '🔊 Test',
    saveShowTitle: '💾 Show speichern',
    showName: 'Show-Name',
    overwrite: 'Vorhandene überschreiben:',
    loadShowTitle: '📂 Show laden',
    noSaved: 'Keine gespeicherten Shows.',
    deletedHistory: '🗑 Verlauf gelöscht',
    perform_remaining: 'verbleibend',
    perform_part: 'Teil',
    perform_of: '/',
    perform_total: 'Gesamt',
    perform_remaining2: 'Verbleibend',
    perform_pause: '⏸ Pause',
    perform_resume: '▶ Weiter',
    perform_stop: '⏹ Stop',
    perform_prev: '← Zurück',
    perform_next: 'Weiter →',
    perform_notes: '📝 Notizen',
    perform_testAnnounce: '🔊 Test Ansage',
    perform_testMusic: '🎵 Test Musik',
    audience: 'Publikum',
    backstage: 'Backstage',
    addItem: '➕ Hinzufügen',
    updateItem: '💾 Update',
    cancelItem: 'Abbrechen',
    itemName: 'Name',
    itemIcon: 'Icon (Emoji)',
    tutoBasicsTitle: 'Grundlagen',
    tutoBasicsDesc: 'Show erstellen, Teile hinzufügen',
    tutoPerformTitle: 'Show durchführen',
    tutoPerformDesc: 'Live-Modus, Timer, Steuerung',
    tutoSaveTitle: 'Speichern & Backup',
    tutoSaveDesc: 'Shows sichern, exportieren',
    tutoThemesTitle: 'Designs & Einstellungen',
    tutoThemesDesc: 'Themes, Vollbild, Lautstärke',
    developer: '👨‍💻 Entwickler',
    devRole: 'Magier, Entwickler & Show-Enthusiast',
    rights: 'Alle Rechte vorbehalten. React & Tailwind CSS.',
    autoSystem: '🔄 Auto (System)',
    endedMsg: 'Die Show ist beendet. Vielen Dank!',
    speechLang: 'de-DE',
  },
  en: {
    appTitle: '🎩✨ Magic Showrunner',
    appSub: 'Your professional stage assistant',
    save: '💾 Save',
    load: '📂 Load',
    backup: '📥 Backup',
    tutorial: '📖 Tutorial',
    about: 'ℹ️ About',
    importBtn: '📤 Import',
    settings: '⚙️ Settings',
    fullscreen: '⛶ Fullscreen',
    exitFullscreen: '⛶ Window',
    stage: '🎪 Stage',
    stats: '📊 Stats',
    newPart: '➕ New Part',
    startShow: '🎭 Start Show',
    testMode: '🧪 Test Mode',
    parts: 'Parts',
    totalTime: 'Total Time',
    settingsTitle: '⚙️ Settings',
    tabDesign: '🎨 Design',
    tabAudio: '🔊 Audio',
    tabTest: '🧪 Test',
    tabLanguage: '🌐 Language',
    planTheme: 'Planning Theme',
    performTheme: 'Perform Theme',
    beeps: '🔔 Beeps',
    vibration: '📳 Vibration',
    volume: '🔊 Volume',
    testTone: '🔊 Test Tone',
    testDuration: '⏱ Test mode duration per part',
    testHint: 'In test mode, each part is shortened to this duration.',
    selectLanguage: 'Select Language',
    tutorialTitle: '📖 Tutorial & Help',
    tutorialIntro: 'Choose a topic:',
    aboutTitle: 'ℹ️ About Magic Showrunner',
    stageTitle: '🎪 Stage Plan',
    statsTitle: '📊 Statistics',
    noStats: 'No shows performed yet.',
    shows: 'Shows',
    totalTimeLabel: 'Total Time',
    avgParts: 'Avg Parts',
    clearHistory: '🗑 Clear History',
    editPart: '✏️ Edit Part',
    addPart: '➕ New Part',
    titleLabel: 'Title',
    durationLabel: 'Duration',
    introLabel: 'Intro Announcement (Text-to-Speech)',
    preAnnounceLabel: 'Pre-announcement',
    preAnnounceText: 'Pre-announcement Text',
    notesLabel: 'Notes (Props, Tech...)',
    musicUrl: 'Music URL (optional)',
    vol: 'Vol',
    fadeIn: 'Fade In',
    fadeOut: 'Fade Out',
    saveBtn: '💾 Save',
    cancelBtn: 'Cancel',
    testBtn: '🔊 Test',
    saveShowTitle: '💾 Save Show',
    showName: 'Show Name',
    overwrite: 'Overwrite existing:',
    loadShowTitle: '📂 Load Show',
    noSaved: 'No saved shows.',
    deletedHistory: '🗑 History cleared',
    perform_remaining: 'remaining',
    perform_part: 'Part',
    perform_of: '/',
    perform_total: 'Total',
    perform_remaining2: 'Remaining',
    perform_pause: '⏸ Pause',
    perform_resume: '▶ Resume',
    perform_stop: '⏹ Stop',
    perform_prev: '← Back',
    perform_next: 'Next →',
    perform_notes: '📝 Notes',
    perform_testAnnounce: '🔊 Test Announcement',
    perform_testMusic: '🎵 Test Music',
    audience: 'Audience',
    backstage: 'Backstage',
    addItem: '➕ Add',
    updateItem: '💾 Update',
    cancelItem: 'Cancel',
    itemName: 'Name',
    itemIcon: 'Icon (Emoji)',
    tutoBasicsTitle: 'Basics',
    tutoBasicsDesc: 'Create show, add parts',
    tutoPerformTitle: 'Perform Show',
    tutoPerformDesc: 'Live mode, timer, controls',
    tutoSaveTitle: 'Save & Backup',
    tutoSaveDesc: 'Save, export, import shows',
    tutoThemesTitle: 'Designs & Settings',
    tutoThemesDesc: 'Themes, fullscreen, volume',
    developer: '👨‍💻 Developer',
    devRole: 'Magician, Developer & Show Enthusiast',
    rights: 'All rights reserved. React & Tailwind CSS.',
    autoSystem: '🔄 Auto (System)',
    endedMsg: 'The show is over. Thank you!',
    speechLang: 'en-US',
  },
  fr: {
    appTitle: '🎩✨ Magic Showrunner',
    appSub: 'Votre assistant de scène professionnel',
    save: '💾 Sauvegarder',
    load: '📂 Charger',
    backup: '📥 Sauvegarde',
    tutorial: '📖 Tutoriel',
    about: 'ℹ️ À propos',
    importBtn: '📤 Importer',
    settings: '⚙️ Paramètres',
    fullscreen: '⛶ Plein écran',
    exitFullscreen: '⛶ Fenêtre',
    stage: '🎪 Scène',
    stats: '📊 Stats',
    newPart: '➕ Nouvelle partie',
    startShow: '🎭 Démarrer le show',
    testMode: '🧪 Mode test',
    parts: 'Parties',
    totalTime: 'Durée totale',
    settingsTitle: '⚙️ Paramètres',
    tabDesign: '🎨 Design',
    tabAudio: '🔊 Audio',
    tabTest: '🧪 Test',
    tabLanguage: '🌐 Langue',
    planTheme: 'Thème planification',
    performTheme: 'Thème performance',
    beeps: '🔔 Bips sonores',
    vibration: '📳 Vibration',
    volume: '🔊 Volume',
    testTone: '🔊 Ton test',
    testDuration: '⏱ Durée du mode test par partie',
    testHint: 'En mode test, chaque partie est raccourcie à cette durée.',
    selectLanguage: 'Choisir la langue',
    tutorialTitle: '📖 Tutoriel & Aide',
    tutorialIntro: 'Choisissez un sujet :',
    aboutTitle: 'ℹ️ À propos de Magic Showrunner',
    stageTitle: '🎪 Plan de scène',
    statsTitle: '📊 Statistiques',
    noStats: 'Aucun show effectué pour le moment.',
    shows: 'Shows',
    totalTimeLabel: 'Durée totale',
    avgParts: 'Parties moy.',
    clearHistory: '🗑 Effacer historique',
    editPart: '✏️ Modifier partie',
    addPart: '➕ Nouvelle partie',
    titleLabel: 'Titre',
    durationLabel: 'Durée',
    introLabel: 'Annonce intro (Text-to-Speech)',
    preAnnounceLabel: 'Pré-annonce',
    preAnnounceText: 'Texte de pré-annonce',
    notesLabel: 'Notes (Accessoires, Tech...)',
    musicUrl: 'URL musique (optionnel)',
    vol: 'Vol',
    fadeIn: 'Fondu entrant',
    fadeOut: 'Fondu sortant',
    saveBtn: '💾 Sauvegarder',
    cancelBtn: 'Annuler',
    testBtn: '🔊 Test',
    saveShowTitle: '💾 Sauvegarder le show',
    showName: 'Nom du show',
    overwrite: 'Écraser existant :',
    loadShowTitle: '📂 Charger un show',
    noSaved: 'Aucun show sauvegardé.',
    deletedHistory: '🗑 Historique supprimé',
    perform_remaining: 'restant',
    perform_part: 'Partie',
    perform_of: '/',
    perform_total: 'Total',
    perform_remaining2: 'Restant',
    perform_pause: '⏸ Pause',
    perform_resume: '▶ Reprendre',
    perform_stop: '⏹ Stop',
    perform_prev: '← Retour',
    perform_next: 'Suivant →',
    perform_notes: '📝 Notes',
    perform_testAnnounce: '🔊 Test annonce',
    perform_testMusic: '🎵 Test musique',
    audience: 'Public',
    backstage: 'Coulisses',
    addItem: '➕ Ajouter',
    updateItem: '💾 Mettre à jour',
    cancelItem: 'Annuler',
    itemName: 'Nom',
    itemIcon: 'Icône (Emoji)',
    tutoBasicsTitle: 'Bases',
    tutoBasicsDesc: 'Créer un show, ajouter des parties',
    tutoPerformTitle: 'Effectuer un show',
    tutoPerformDesc: 'Mode live, minuterie, contrôles',
    tutoSaveTitle: 'Sauvegarder & Backup',
    tutoSaveDesc: 'Sauvegarder, exporter, importer',
    tutoThemesTitle: 'Designs & Paramètres',
    tutoThemesDesc: 'Thèmes, plein écran, volume',
    developer: '👨‍💻 Développeur',
    devRole: 'Magicien, Développeur & Passionné de shows',
    rights: 'Tous droits réservés. React & Tailwind CSS.',
    autoSystem: '🔄 Auto (Système)',
    endedMsg: 'Le show est terminé. Merci !',
    speechLang: 'fr-FR',
  },
  es: {
    appTitle: '🎩✨ Magic Showrunner',
    appSub: 'Tu asistente profesional de escenario',
    save: '💾 Guardar',
    load: '📂 Cargar',
    backup: '📥 Copia de seguridad',
    tutorial: '📖 Tutorial',
    about: 'ℹ️ Acerca de',
    importBtn: '📤 Importar',
    settings: '⚙️ Ajustes',
    fullscreen: '⛶ Pantalla completa',
    exitFullscreen: '⛶ Ventana',
    stage: '🎪 Escenario',
    stats: '📊 Stats',
    newPart: '➕ Nueva parte',
    startShow: '🎭 Iniciar show',
    testMode: '🧪 Modo prueba',
    parts: 'Partes',
    totalTime: 'Tiempo total',
    settingsTitle: '⚙️ Ajustes',
    tabDesign: '🎨 Diseño',
    tabAudio: '🔊 Audio',
    tabTest: '🧪 Prueba',
    tabLanguage: '🌐 Idioma',
    planTheme: 'Tema de planificación',
    performTheme: 'Tema de actuación',
    beeps: '🔔 Pitidos',
    vibration: '📳 Vibración',
    volume: '🔊 Volumen',
    testTone: '🔊 Tono de prueba',
    testDuration: '⏱ Duración del modo prueba por parte',
    testHint: 'En el modo prueba, cada parte se acorta a esta duración.',
    selectLanguage: 'Seleccionar idioma',
    tutorialTitle: '📖 Tutorial & Ayuda',
    tutorialIntro: 'Elige un tema:',
    aboutTitle: 'ℹ️ Acerca de Magic Showrunner',
    stageTitle: '🎪 Plano del escenario',
    statsTitle: '📊 Estadísticas',
    noStats: 'Aún no se han realizado shows.',
    shows: 'Shows',
    totalTimeLabel: 'Tiempo total',
    avgParts: 'Partes prom.',
    clearHistory: '🗑 Borrar historial',
    editPart: '✏️ Editar parte',
    addPart: '➕ Nueva parte',
    titleLabel: 'Título',
    durationLabel: 'Duración',
    introLabel: 'Anuncio intro (Text-to-Speech)',
    preAnnounceLabel: 'Pre-anuncio',
    preAnnounceText: 'Texto de pre-anuncio',
    notesLabel: 'Notas (Accesorios, Técnica...)',
    musicUrl: 'URL de música (opcional)',
    vol: 'Vol',
    fadeIn: 'Fade In',
    fadeOut: 'Fade Out',
    saveBtn: '💾 Guardar',
    cancelBtn: 'Cancelar',
    testBtn: '🔊 Prueba',
    saveShowTitle: '💾 Guardar show',
    showName: 'Nombre del show',
    overwrite: 'Sobrescribir existente:',
    loadShowTitle: '📂 Cargar show',
    noSaved: 'No hay shows guardados.',
    deletedHistory: '🗑 Historial borrado',
    perform_remaining: 'restante',
    perform_part: 'Parte',
    perform_of: '/',
    perform_total: 'Total',
    perform_remaining2: 'Restante',
    perform_pause: '⏸ Pausa',
    perform_resume: '▶ Continuar',
    perform_stop: '⏹ Detener',
    perform_prev: '← Atrás',
    perform_next: 'Siguiente →',
    perform_notes: '📝 Notas',
    perform_testAnnounce: '🔊 Prueba anuncio',
    perform_testMusic: '🎵 Prueba música',
    audience: 'Público',
    backstage: 'Backstage',
    addItem: '➕ Añadir',
    updateItem: '💾 Actualizar',
    cancelItem: 'Cancelar',
    itemName: 'Nombre',
    itemIcon: 'Icono (Emoji)',
    tutoBasicsTitle: 'Conceptos básicos',
    tutoBasicsDesc: 'Crear show, añadir partes',
    tutoPerformTitle: 'Realizar show',
    tutoPerformDesc: 'Modo en vivo, temporizador, controles',
    tutoSaveTitle: 'Guardar & Backup',
    tutoSaveDesc: 'Guardar, exportar, importar shows',
    tutoThemesTitle: 'Diseños & Ajustes',
    tutoThemesDesc: 'Temas, pantalla completa, volumen',
    developer: '👨‍💻 Desarrollador',
    devRole: 'Mago, Desarrollador & Entusiasta de shows',
    rights: 'Todos los derechos reservados. React & Tailwind CSS.',
    autoSystem: '🔄 Auto (Sistema)',
    endedMsg: '¡El show ha terminado. ¡Gracias!',
    speechLang: 'es-ES',
  },
  it: {
    appTitle: '🎩✨ Magic Showrunner',
    appSub: 'Il tuo assistente professionale di scena',
    save: '💾 Salva',
    load: '📂 Carica',
    backup: '📥 Backup',
    tutorial: '📖 Tutorial',
    about: 'ℹ️ Info',
    importBtn: '📤 Importa',
    settings: '⚙️ Impostazioni',
    fullscreen: '⛶ Schermo intero',
    exitFullscreen: '⛶ Finestra',
    stage: '🎪 Palco',
    stats: '📊 Stats',
    newPart: '➕ Nuova parte',
    startShow: '🎭 Avvia show',
    testMode: '🧪 Modalità test',
    parts: 'Parti',
    totalTime: 'Durata totale',
    settingsTitle: '⚙️ Impostazioni',
    tabDesign: '🎨 Design',
    tabAudio: '🔊 Audio',
    tabTest: '🧪 Test',
    tabLanguage: '🌐 Lingua',
    planTheme: 'Tema pianificazione',
    performTheme: 'Tema esibizione',
    beeps: '🔔 Segnali sonori',
    vibration: '📳 Vibrazione',
    volume: '🔊 Volume',
    testTone: '🔊 Tono di test',
    testDuration: '⏱ Durata modalità test per parte',
    testHint: 'In modalità test, ogni parte viene ridotta a questa durata.',
    selectLanguage: 'Seleziona lingua',
    tutorialTitle: '📖 Tutorial & Aiuto',
    tutorialIntro: 'Scegli un argomento:',
    aboutTitle: 'ℹ️ Informazioni su Magic Showrunner',
    stageTitle: '🎪 Pianta del palco',
    statsTitle: '📊 Statistiche',
    noStats: 'Nessuno show eseguito finora.',
    shows: 'Show',
    totalTimeLabel: 'Durata totale',
    avgParts: 'Parti medie',
    clearHistory: '🗑 Cancella cronologia',
    editPart: '✏️ Modifica parte',
    addPart: '➕ Nuova parte',
    titleLabel: 'Titolo',
    durationLabel: 'Durata',
    introLabel: 'Annuncio intro (Text-to-Speech)',
    preAnnounceLabel: 'Pre-annuncio',
    preAnnounceText: 'Testo pre-annuncio',
    notesLabel: 'Note (Oggetti, Tecnica...)',
    musicUrl: 'URL musica (opzionale)',
    vol: 'Vol',
    fadeIn: 'Fade In',
    fadeOut: 'Fade Out',
    saveBtn: '💾 Salva',
    cancelBtn: 'Annulla',
    testBtn: '🔊 Test',
    saveShowTitle: '💾 Salva show',
    showName: 'Nome dello show',
    overwrite: 'Sovrascrivi esistente:',
    loadShowTitle: '📂 Carica show',
    noSaved: 'Nessuno show salvato.',
    deletedHistory: '🗑 Cronologia eliminata',
    perform_remaining: 'rimanente',
    perform_part: 'Parte',
    perform_of: '/',
    perform_total: 'Totale',
    perform_remaining2: 'Rimanente',
    perform_pause: '⏸ Pausa',
    perform_resume: '▶ Riprendi',
    perform_stop: '⏹ Stop',
    perform_prev: '← Indietro',
    perform_next: 'Avanti →',
    perform_notes: '📝 Note',
    perform_testAnnounce: '🔊 Test annuncio',
    perform_testMusic: '🎵 Test musica',
    audience: 'Pubblico',
    backstage: 'Backstage',
    addItem: '➕ Aggiungi',
    updateItem: '💾 Aggiorna',
    cancelItem: 'Annulla',
    itemName: 'Nome',
    itemIcon: 'Icona (Emoji)',
    tutoBasicsTitle: 'Basi',
    tutoBasicsDesc: 'Crea show, aggiungi parti',
    tutoPerformTitle: 'Esegui show',
    tutoPerformDesc: 'Modalità live, timer, controlli',
    tutoSaveTitle: 'Salva & Backup',
    tutoSaveDesc: 'Salva, esporta, importa show',
    tutoThemesTitle: 'Design & Impostazioni',
    tutoThemesDesc: 'Temi, schermo intero, volume',
    developer: '👨‍💻 Sviluppatore',
    devRole: 'Mago, Sviluppatore & Appassionato di show',
    rights: 'Tutti i diritti riservati. React & Tailwind CSS.',
    autoSystem: '🔄 Auto (Sistema)',
    endedMsg: 'Lo show è terminato. Grazie!',
    speechLang: 'it-IT',
  },
  pt: {
    appTitle: '🎩✨ Magic Showrunner',
    appSub: 'O seu assistente profissional de palco',
    save: '💾 Guardar',
    load: '📂 Carregar',
    backup: '📥 Backup',
    tutorial: '📖 Tutorial',
    about: 'ℹ️ Sobre',
    importBtn: '📤 Importar',
    settings: '⚙️ Definições',
    fullscreen: '⛶ Ecrã inteiro',
    exitFullscreen: '⛶ Janela',
    stage: '🎪 Palco',
    stats: '📊 Stats',
    newPart: '➕ Nova parte',
    startShow: '🎭 Iniciar show',
    testMode: '🧪 Modo teste',
    parts: 'Partes',
    totalTime: 'Duração total',
    settingsTitle: '⚙️ Definições',
    tabDesign: '🎨 Design',
    tabAudio: '🔊 Áudio',
    tabTest: '🧪 Teste',
    tabLanguage: '🌐 Idioma',
    planTheme: 'Tema de planeamento',
    performTheme: 'Tema de atuação',
    beeps: '🔔 Sinais sonoros',
    vibration: '📳 Vibração',
    volume: '🔊 Volume',
    testTone: '🔊 Tom de teste',
    testDuration: '⏱ Duração do modo teste por parte',
    testHint: 'No modo teste, cada parte é reduzida a esta duração.',
    selectLanguage: 'Selecionar idioma',
    tutorialTitle: '📖 Tutorial & Ajuda',
    tutorialIntro: 'Escolha um tema:',
    aboutTitle: 'ℹ️ Sobre Magic Showrunner',
    stageTitle: '🎪 Planta do palco',
    statsTitle: '📊 Estatísticas',
    noStats: 'Nenhum show realizado ainda.',
    shows: 'Shows',
    totalTimeLabel: 'Duração total',
    avgParts: 'Partes méd.',
    clearHistory: '🗑 Limpar histórico',
    editPart: '✏️ Editar parte',
    addPart: '➕ Nova parte',
    titleLabel: 'Título',
    durationLabel: 'Duração',
    introLabel: 'Anúncio intro (Text-to-Speech)',
    preAnnounceLabel: 'Pré-anúncio',
    preAnnounceText: 'Texto de pré-anúncio',
    notesLabel: 'Notas (Adereços, Técnica...)',
    musicUrl: 'URL de música (opcional)',
    vol: 'Vol',
    fadeIn: 'Fade In',
    fadeOut: 'Fade Out',
    saveBtn: '💾 Guardar',
    cancelBtn: 'Cancelar',
    testBtn: '🔊 Teste',
    saveShowTitle: '💾 Guardar show',
    showName: 'Nome do show',
    overwrite: 'Substituir existente:',
    loadShowTitle: '📂 Carregar show',
    noSaved: 'Nenhum show guardado.',
    deletedHistory: '🗑 Histórico eliminado',
    perform_remaining: 'restante',
    perform_part: 'Parte',
    perform_of: '/',
    perform_total: 'Total',
    perform_remaining2: 'Restante',
    perform_pause: '⏸ Pausa',
    perform_resume: '▶ Retomar',
    perform_stop: '⏹ Parar',
    perform_prev: '← Anterior',
    perform_next: 'Seguinte →',
    perform_notes: '📝 Notas',
    perform_testAnnounce: '🔊 Teste anúncio',
    perform_testMusic: '🎵 Teste música',
    audience: 'Público',
    backstage: 'Bastidores',
    addItem: '➕ Adicionar',
    updateItem: '💾 Atualizar',
    cancelItem: 'Cancelar',
    itemName: 'Nome',
    itemIcon: 'Ícone (Emoji)',
    tutoBasicsTitle: 'Básicos',
    tutoBasicsDesc: 'Criar show, adicionar partes',
    tutoPerformTitle: 'Realizar show',
    tutoPerformDesc: 'Modo ao vivo, temporizador, controlos',
    tutoSaveTitle: 'Guardar & Backup',
    tutoSaveDesc: 'Guardar, exportar, importar shows',
    tutoThemesTitle: 'Designs & Definições',
    tutoThemesDesc: 'Temas, ecrã inteiro, volume',
    developer: '👨‍💻 Desenvolvedor',
    devRole: 'Mágico, Desenvolvedor & Entusiasta de shows',
    rights: 'Todos os direitos reservados. React & Tailwind CSS.',
    autoSystem: '🔄 Auto (Sistema)',
    endedMsg: 'O show terminou. Obrigado!',
    speechLang: 'pt-PT',
  },
  nl: {
    appTitle: '🎩✨ Magic Showrunner',
    appSub: 'Uw professionele podiumassistent',
    save: '💾 Opslaan',
    load: '📂 Laden',
    backup: '📥 Back-up',
    tutorial: '📖 Tutorial',
    about: 'ℹ️ Over',
    importBtn: '📤 Importeren',
    settings: '⚙️ Instellingen',
    fullscreen: '⛶ Volledig scherm',
    exitFullscreen: '⛶ Venster',
    stage: '🎪 Podium',
    stats: '📊 Stats',
    newPart: '➕ Nieuw deel',
    startShow: '🎭 Show starten',
    testMode: '🧪 Testmodus',
    parts: 'Delen',
    totalTime: 'Totale tijd',
    settingsTitle: '⚙️ Instellingen',
    tabDesign: '🎨 Design',
    tabAudio: '🔊 Audio',
    tabTest: '🧪 Test',
    tabLanguage: '🌐 Taal',
    planTheme: 'Planningsthema',
    performTheme: 'Uitvoeringsthema',
    beeps: '🔔 Signaalgeluiden',
    vibration: '📳 Trillen',
    volume: '🔊 Volume',
    testTone: '🔊 Testgeluid',
    testDuration: '⏱ Testmodus duur per deel',
    testHint: 'In testmodus wordt elk deel verkort tot deze duur.',
    selectLanguage: 'Taal kiezen',
    tutorialTitle: '📖 Tutorial & Hulp',
    tutorialIntro: 'Kies een onderwerp:',
    aboutTitle: 'ℹ️ Over Magic Showrunner',
    stageTitle: '🎪 Podiumplattegrond',
    statsTitle: '📊 Statistieken',
    noStats: 'Nog geen shows uitgevoerd.',
    shows: 'Shows',
    totalTimeLabel: 'Totale tijd',
    avgParts: 'Gem. delen',
    clearHistory: '🗑 Geschiedenis wissen',
    editPart: '✏️ Deel bewerken',
    addPart: '➕ Nieuw deel',
    titleLabel: 'Titel',
    durationLabel: 'Duur',
    introLabel: 'Intro-aankondiging (Text-to-Speech)',
    preAnnounceLabel: 'Vooraankondiging',
    preAnnounceText: 'Vooraankondigingstekst',
    notesLabel: 'Notities (Rekwisieten, Techniek...)',
    musicUrl: 'Muziek-URL (optioneel)',
    vol: 'Vol',
    fadeIn: 'Fade In',
    fadeOut: 'Fade Out',
    saveBtn: '💾 Opslaan',
    cancelBtn: 'Annuleren',
    testBtn: '🔊 Test',
    saveShowTitle: '💾 Show opslaan',
    showName: 'Shownaam',
    overwrite: 'Bestaande overschrijven:',
    loadShowTitle: '📂 Show laden',
    noSaved: 'Geen opgeslagen shows.',
    deletedHistory: '🗑 Geschiedenis gewist',
    perform_remaining: 'resterend',
    perform_part: 'Deel',
    perform_of: '/',
    perform_total: 'Totaal',
    perform_remaining2: 'Resterend',
    perform_pause: '⏸ Pauze',
    perform_resume: '▶ Hervatten',
    perform_stop: '⏹ Stop',
    perform_prev: '← Vorige',
    perform_next: 'Volgende →',
    perform_notes: '📝 Notities',
    perform_testAnnounce: '🔊 Test aankondiging',
    perform_testMusic: '🎵 Test muziek',
    audience: 'Publiek',
    backstage: 'Backstage',
    addItem: '➕ Toevoegen',
    updateItem: '💾 Bijwerken',
    cancelItem: 'Annuleren',
    itemName: 'Naam',
    itemIcon: 'Icoon (Emoji)',
    tutoBasicsTitle: 'Basis',
    tutoBasicsDesc: 'Show aanmaken, delen toevoegen',
    tutoPerformTitle: 'Show uitvoeren',
    tutoPerformDesc: 'Live-modus, timer, bediening',
    tutoSaveTitle: 'Opslaan & Back-up',
    tutoSaveDesc: 'Shows opslaan, exporteren, importeren',
    tutoThemesTitle: 'Designs & Instellingen',
    tutoThemesDesc: "Thema's, volledig scherm, volume",
    developer: '👨‍💻 Ontwikkelaar',
    devRole: 'Goochelaar, Ontwikkelaar & Show-enthousiasteling',
    rights: 'Alle rechten voorbehouden. React & Tailwind CSS.',
    autoSystem: '🔄 Auto (Systeem)',
    endedMsg: 'De show is afgelopen. Dank u!',
    speechLang: 'nl-NL',
  },
  pl: {
    appTitle: '🎩✨ Magic Showrunner',
    appSub: 'Twój profesjonalny asystent sceniczny',
    save: '💾 Zapisz',
    load: '📂 Wczytaj',
    backup: '📥 Kopia zapasowa',
    tutorial: '📖 Samouczek',
    about: 'ℹ️ O aplikacji',
    importBtn: '📤 Importuj',
    settings: '⚙️ Ustawienia',
    fullscreen: '⛶ Pełny ekran',
    exitFullscreen: '⛶ Okno',
    stage: '🎪 Scena',
    stats: '📊 Statystyki',
    newPart: '➕ Nowa część',
    startShow: '🎭 Rozpocznij show',
    testMode: '🧪 Tryb testowy',
    parts: 'Części',
    totalTime: 'Łączny czas',
    settingsTitle: '⚙️ Ustawienia',
    tabDesign: '🎨 Wygląd',
    tabAudio: '🔊 Audio',
    tabTest: '🧪 Test',
    tabLanguage: '🌐 Język',
    planTheme: 'Motyw planowania',
    performTheme: 'Motyw występu',
    beeps: '🔔 Sygnały dźwiękowe',
    vibration: '📳 Wibracje',
    volume: '🔊 Głośność',
    testTone: '🔊 Ton testowy',
    testDuration: '⏱ Czas trybu testowego na część',
    testHint: 'W trybie testowym każda część jest skracana do tego czasu.',
    selectLanguage: 'Wybierz język',
    tutorialTitle: '📖 Samouczek & Pomoc',
    tutorialIntro: 'Wybierz temat:',
    aboutTitle: 'ℹ️ O Magic Showrunner',
    stageTitle: '🎪 Plan sceny',
    statsTitle: '📊 Statystyki',
    noStats: 'Nie przeprowadzono jeszcze żadnego show.',
    shows: 'Pokazy',
    totalTimeLabel: 'Łączny czas',
    avgParts: 'Śr. części',
    clearHistory: '🗑 Wyczyść historię',
    editPart: '✏️ Edytuj część',
    addPart: '➕ Nowa część',
    titleLabel: 'Tytuł',
    durationLabel: 'Czas trwania',
    introLabel: 'Zapowiedź intro (Text-to-Speech)',
    preAnnounceLabel: 'Zapowiedź wstępna',
    preAnnounceText: 'Tekst zapowiedzi wstępnej',
    notesLabel: 'Notatki (Rekwizyty, Technika...)',
    musicUrl: 'URL muzyki (opcjonalne)',
    vol: 'Vol',
    fadeIn: 'Fade In',
    fadeOut: 'Fade Out',
    saveBtn: '💾 Zapisz',
    cancelBtn: 'Anuluj',
    testBtn: '🔊 Test',
    saveShowTitle: '💾 Zapisz show',
    showName: 'Nazwa show',
    overwrite: 'Nadpisz istniejący:',
    loadShowTitle: '📂 Wczytaj show',
    noSaved: 'Brak zapisanych pokazów.',
    deletedHistory: '🗑 Historia wyczyszczona',
    perform_remaining: 'pozostało',
    perform_part: 'Część',
    perform_of: '/',
    perform_total: 'Łącznie',
    perform_remaining2: 'Pozostało',
    perform_pause: '⏸ Pauza',
    perform_resume: '▶ Wznów',
    perform_stop: '⏹ Stop',
    perform_prev: '← Wstecz',
    perform_next: 'Dalej →',
    perform_notes: '📝 Notatki',
    perform_testAnnounce: '🔊 Test zapowiedzi',
    perform_testMusic: '🎵 Test muzyki',
    audience: 'Publiczność',
    backstage: 'Backstage',
    addItem: '➕ Dodaj',
    updateItem: '💾 Aktualizuj',
    cancelItem: 'Anuluj',
    itemName: 'Nazwa',
    itemIcon: 'Ikona (Emoji)',
    tutoBasicsTitle: 'Podstawy',
    tutoBasicsDesc: 'Utwórz show, dodaj części',
    tutoPerformTitle: 'Przeprowadź show',
    tutoPerformDesc: 'Tryb live, timer, sterowanie',
    tutoSaveTitle: 'Zapisz & Kopia zapasowa',
    tutoSaveDesc: 'Zapisz, eksportuj, importuj pokazy',
    tutoThemesTitle: 'Wygląd & Ustawienia',
    tutoThemesDesc: 'Motywy, pełny ekran, głośność',
    developer: '👨‍💻 Deweloper',
    devRole: 'Magik, Deweloper & Entuzjasta show',
    rights: 'Wszelkie prawa zastrzeżone. React & Tailwind CSS.',
    autoSystem: '🔄 Auto (System)',
    endedMsg: 'Show dobiegł końca. Dziękujemy!',
    speechLang: 'pl-PL',
  },
};

const LANG_FLAGS = { de: '🇩🇪', en: '🇬🇧', fr: '🇫🇷', es: '🇪🇸', it: '🇮🇹', pt: '🇵🇹', nl: '🇳🇱', pl: '🇵🇱' };
const LANG_NAMES = { de: 'Deutsch', en: 'English', fr: 'Français', es: 'Español', it: 'Italiano', pt: 'Português', nl: 'Nederlands', pl: 'Polski' };

const fmt = (s) => { s = Math.abs(Math.floor(s)); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; };

const EMPTY = { title:'', duration:300, introText:'', preAnnounceSec:10, announceNextText:'', notes:'', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false };

const DEMO = [
  { id:1, title:'Begrüßung & Einleitung', duration:180, introText:'Meine Damen und Herren, willkommen zur großen Zaubershow!', preAnnounceSec:15, announceNextText:'Achtung: Gleich beginnt der erste Zaubertrick!', notes:'Spotlight Mitte.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false },
  { id:2, title:'Die verschwindende Silbermünze', duration:300, introText:'Und nun zum ersten Trick!', preAnnounceSec:20, announceNextText:'Gleich: Gedankenlesung!', notes:'Silbermünze, schwarzes Tuch.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false },
  { id:3, title:'Mentalmagie – Gedankenlesung', duration:420, introText:'Darf ich einen Freiwilligen bitten?', preAnnounceSec:15, announceNextText:'Gleich gibt es eine Pause.', notes:'Umschläge, Stift.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false },
  { id:4, title:'Pause', duration:600, introText:'Zehn Minuten Pause!', preAnnounceSec:30, announceNextText:'Bitte Plätze einnehmen!', notes:'Jazz-Playlist.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:true },
  { id:5, title:'Der unmögliche Kartentrick', duration:480, introText:'Willkommen zurück!', preAnnounceSec:20, announceNextText:'Gleich kommt das Finale!', notes:'2 Kartenspiele.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false },
  { id:6, title:'Die schwebende Rose', duration:360, introText:'Das große Finale!', preAnnounceSec:20, announceNextText:'Gleich die Verabschiedung.', notes:'Nebelmaschine 30s vorher!', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false },
  { id:7, title:'Verabschiedung & Zugabe', duration:180, introText:'Vielen Dank!', preAnnounceSec:10, announceNextText:'', notes:'Visitenkarten am Ausgang.', musicUrl:'', musicVolume:0.5, musicFadeIn:2, musicFadeOut:2, musicLoop:false },
];

const THEMES = {
  light: { name:'☀️ Hell', bg:'bg-gradient-to-br from-indigo-50 to-purple-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-indigo-600', accentHover:'hover:bg-indigo-700', border:'border-gray-200', input:'bg-white border-gray-300 text-gray-800', planCard:'bg-white shadow', settingsCard:'bg-white shadow', badgeBg:'bg-indigo-100', badgeText:'text-indigo-700', headText:'text-indigo-900', subText:'text-indigo-600' },
  dark: { name:'🌙 Dunkel', bg:'bg-gradient-to-br from-gray-900 to-gray-800', card:'bg-gray-800', text:'text-gray-100', textSub:'text-gray-400', accent:'bg-indigo-500', accentHover:'hover:bg-indigo-600', border:'border-gray-700', input:'bg-gray-700 border-gray-600 text-gray-100', planCard:'bg-gray-800 shadow-lg shadow-black/20', settingsCard:'bg-gray-800 shadow-lg shadow-black/20', badgeBg:'bg-indigo-900', badgeText:'text-indigo-300', headText:'text-indigo-300', subText:'text-indigo-400' },
  black: { name:'⚫ Schwarz', bg:'bg-black', card:'bg-gray-950', text:'text-gray-200', textSub:'text-gray-600', accent:'bg-indigo-600', accentHover:'hover:bg-indigo-700', border:'border-gray-800', input:'bg-gray-900 border-gray-800 text-gray-200', planCard:'bg-gray-950 shadow-lg shadow-black/40 border border-gray-800', settingsCard:'bg-gray-950 shadow-lg shadow-black/40 border border-gray-800', badgeBg:'bg-indigo-950', badgeText:'text-indigo-400', headText:'text-indigo-400', subText:'text-indigo-500' },
  ocean: { name:'🌊 Ozean', bg:'bg-gradient-to-br from-cyan-50 to-blue-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-cyan-600', accentHover:'hover:bg-cyan-700', border:'border-cyan-200', input:'bg-white border-cyan-300 text-gray-800', planCard:'bg-white shadow', settingsCard:'bg-white shadow', badgeBg:'bg-cyan-100', badgeText:'text-cyan-700', headText:'text-cyan-900', subText:'text-cyan-600' },
  oceanDark: { name:'🌊 Ozean Dunkel', bg:'bg-gradient-to-br from-cyan-950 to-blue-950', card:'bg-cyan-900', text:'text-cyan-100', textSub:'text-cyan-400', accent:'bg-cyan-500', accentHover:'hover:bg-cyan-600', border:'border-cyan-800', input:'bg-cyan-900 border-cyan-700 text-cyan-100', planCard:'bg-cyan-900 shadow-lg shadow-black/30', settingsCard:'bg-cyan-900 shadow-lg shadow-black/30', badgeBg:'bg-cyan-800', badgeText:'text-cyan-200', headText:'text-cyan-200', subText:'text-cyan-400' },
  forest: { name:'🌲 Wald', bg:'bg-gradient-to-br from-green-50 to-emerald-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-emerald-600', accentHover:'hover:bg-emerald-700', border:'border-emerald-200', input:'bg-white border-emerald-300 text-gray-800', planCard:'bg-white shadow', settingsCard:'bg-white shadow', badgeBg:'bg-emerald-100', badgeText:'text-emerald-700', headText:'text-emerald-900', subText:'text-emerald-600' },
  forestDark: { name:'🌲 Wald Dunkel', bg:'bg-gradient-to-br from-green-950 to-emerald-950', card:'bg-emerald-900', text:'text-emerald-100', textSub:'text-emerald-400', accent:'bg-emerald-500', accentHover:'hover:bg-emerald-600', border:'border-emerald-800', input:'bg-emerald-900 border-emerald-700 text-emerald-100', planCard:'bg-emerald-900 shadow-lg shadow-black/30', settingsCard:'bg-emerald-900 shadow-lg shadow-black/30', badgeBg:'bg-emerald-800', badgeText:'text-emerald-200', headText:'text-emerald-200', subText:'text-emerald-400' },
  sunset: { name:'🌅 Sonnenuntergang', bg:'bg-gradient-to-br from-orange-50 to-rose-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-orange-500', accentHover:'hover:bg-orange-600', border:'border-orange-200', input:'bg-white border-orange-300 text-gray-800', planCard:'bg-white shadow', settingsCard:'bg-white shadow', badgeBg:'bg-orange-100', badgeText:'text-orange-700', headText:'text-orange-900', subText:'text-orange-600' },
  sunsetDark: { name:'🌅 Sunset Dunkel', bg:'bg-gradient-to-br from-orange-950 to-rose-950', card:'bg-orange-950', text:'text-orange-100', textSub:'text-orange-400', accent:'bg-orange-500', accentHover:'hover:bg-orange-600', border:'border-orange-800', input:'bg-orange-950 border-orange-800 text-orange-100', planCard:'bg-orange-950 shadow-lg shadow-black/30', settingsCard:'bg-orange-950 shadow-lg shadow-black/30', badgeBg:'bg-orange-900', badgeText:'text-orange-200', headText:'text-orange-200', subText:'text-orange-400' },
  royal: { name:'👑 Royal', bg:'bg-gradient-to-br from-purple-50 to-fuchsia-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-purple-600', accentHover:'hover:bg-purple-700', border:'border-purple-200', input:'bg-white border-purple-300 text-gray-800', planCard:'bg-white shadow', settingsCard:'bg-white shadow', badgeBg:'bg-purple-100', badgeText:'text-purple-700', headText:'text-purple-900', subText:'text-purple-600' },
  royalDark: { name:'👑 Royal Dunkel', bg:'bg-gradient-to-br from-purple-950 to-fuchsia-950', card:'bg-purple-900', text:'text-purple-100', textSub:'text-purple-400', accent:'bg-purple-500', accentHover:'hover:bg-purple-600', border:'border-purple-800', input:'bg-purple-900 border-purple-700 text-purple-100', planCard:'bg-purple-900 shadow-lg shadow-black/30', settingsCard:'bg-purple-900 shadow-lg shadow-black/30', badgeBg:'bg-purple-800', badgeText:'text-purple-200', headText:'text-purple-200', subText:'text-purple-400' },
  rose: { name:'🌹 Rose', bg:'bg-gradient-to-br from-rose-50 to-pink-100', card:'bg-white', text:'text-gray-800', textSub:'text-gray-500', accent:'bg-rose-500', accentHover:'hover:bg-rose-600', border:'border-rose-200', input:'bg-white border-rose-300 text-gray-800', planCard:'bg-white shadow', settingsCard:'bg-white shadow', badgeBg:'bg-rose-100', badgeText:'text-rose-700', headText:'text-rose-900', subText:'text-rose-600' },
  roseDark: { name:'🌹 Rose Dunkel', bg:'bg-gradient-to-br from-rose-950 to-pink-950', card:'bg-rose-950', text:'text-rose-100', textSub:'text-rose-400', accent:'bg-rose-500', accentHover:'hover:bg-rose-600', border:'border-rose-800', input:'bg-rose-950 border-rose-800 text-rose-100', planCard:'bg-rose-950 shadow-lg shadow-black/30', settingsCard:'bg-rose-950 shadow-lg shadow-black/30', badgeBg:'bg-rose-900', badgeText:'text-rose-200', headText:'text-rose-200', subText:'text-rose-400' },
};

const isDarkTheme = (k) => ['dark','black','oceanDark','forestDark','sunsetDark','royalDark','roseDark'].includes(k);

const PERFORM_THEMES = {
  light: { name:'☀️ Hell', bg:'bg-gradient-to-br from-indigo-50 to-purple-100', card:'bg-white', text:'text-gray-800', timerText:'text-indigo-700', warnBg:'bg-red-50 border-2 border-red-300', warnTimer:'text-red-600' },
  dark: { name:'🌙 Dunkel', bg:'bg-gradient-to-br from-gray-900 to-gray-800', card:'bg-gray-800', text:'text-gray-100', timerText:'text-indigo-400', warnBg:'bg-red-950 border-2 border-red-700', warnTimer:'text-red-500' },
  black: { name:'⚫ Schwarz', bg:'bg-black', card:'bg-gray-950 border border-gray-800', text:'text-gray-300', timerText:'text-indigo-400', warnBg:'bg-black border-2 border-red-800', warnTimer:'text-red-500' },
};

export default function ShowRunner() {
  const getSystemTheme = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('ms_themeMode') || 'auto');
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const [performTheme, setPerformTheme] = useState(() => localStorage.getItem('ms_performTheme') || 'dark');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const h = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => { localStorage.setItem('ms_themeMode', themeMode); }, [themeMode]);
  useEffect(() => { localStorage.setItem('ms_performTheme', performTheme); }, [performTheme]);

  const resolvedTheme = themeMode === 'auto' ? systemTheme : themeMode;
  const th = THEMES[resolvedTheme] || THEMES.light;
  const darkMode = isDarkTheme(resolvedTheme);
  const pth = PERFORM_THEMES[performTheme] || PERFORM_THEMES.dark;

  const [mode, setMode] = useState('plan');
  const [parts, setParts] = useState(() => {
    try { const s = localStorage.getItem('ms_autosave'); if (s) { const d = JSON.parse(s); if (d.parts?.length) return d.parts; } } catch(e) {}
    return DEMO;
  });
  const [editPart, setEditPart] = useState(null);
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
  const [savedShows, setSavedShows] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ms_shows') || '[]'); } catch(e) { return []; }
  });
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('design');
  const [showStats, setShowStats] = useState(false);
  const [showStageplan, setShowStageplan] = useState(false);
  const [stageItems, setStageItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ms_stageItems') || '[]'); } catch(e) { return []; }
  });
  const [editStageItem, setEditStageItem] = useState(null);
  const [stageForm, setStageForm] = useState({ name:'', x:50, y:50, icon:'📦', color:'#6366f1' });
  const [showHistory, setShowHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ms_showHistory') || '[]'); } catch(e) { return []; }
  });
  const [saveName, setSaveName] = useState('');
  const [toast, setToast] = useState('');
  const [lang, setLang] = useState(() => localStorage.getItem('ms_lang') || 'de');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.de;
  useEffect(() => { localStorage.setItem('ms_lang', lang); }, [lang]);

  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialSection, setTutorialSection] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const intervalRef = useRef(null);
  const musicRef = useRef(null);
  const containerRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedo = useRef(false);

  const pushHistory = useCallback((newParts) => {
    if (isUndoRedo.current) { isUndoRedo.current = false; return; }
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const next = [...trimmed, JSON.stringify(newParts)];
      if (next.length > 50) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  useEffect(() => { pushHistory(parts); }, [parts]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  const undo = () => {
    if (historyIndex <= 0) return;
    isUndoRedo.current = true;
    setParts(JSON.parse(history[historyIndex - 1]));
    setHistoryIndex(historyIndex - 1);
    showToast('↩️ Rückgängig');
  };
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    isUndoRedo.current = true;
    setParts(JSON.parse(history[historyIndex + 1]));
    setHistoryIndex(historyIndex + 1);
    showToast('↪️ Wiederherstellt');
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  useEffect(() => { localStorage.setItem('ms_autosave', JSON.stringify({ parts, savedAt: new Date().toISOString() })); }, [parts]);
  useEffect(() => { localStorage.setItem('ms_stageItems', JSON.stringify(stageItems)); }, [stageItems]);
  useEffect(() => { localStorage.setItem('ms_showHistory', JSON.stringify(showHistory)); }, [showHistory]);

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
    const data = { version: 2, exportedAt: new Date().toISOString(), shows: savedShows, currentShow: parts, settings: { themeMode, performTheme, beepEnabled, vibrationEnabled, volume, testSpeed } };
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
        if (data.settings) {
          if (data.settings.themeMode) setThemeMode(data.settings.themeMode);
          if (data.settings.performTheme) setPerformTheme(data.settings.performTheme);
          if (typeof data.settings.beepEnabled === 'boolean') setBeepEnabled(data.settings.beepEnabled);
          if (typeof data.settings.vibrationEnabled === 'boolean') setVibrationEnabled(data.settings.vibrationEnabled);
          if (typeof data.settings.volume === 'number') setVolume(data.settings.volume);
          if (typeof data.settings.testSpeed === 'number') setTestSpeed(data.settings.testSpeed);
        }
        showToast('📤 Backup importiert');
      } catch(err) { showToast('❌ Ungültige Datei'); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { (containerRef.current || document.documentElement).requestFullscreen?.(); setIsFullscreen(true); }
    else { document.exitFullscreen?.(); setIsFullscreen(false); }
  };
  useEffect(() => { const h = () => setIsFullscreen(!!document.fullscreenElement); document.addEventListener('fullscreenchange', h); return () => document.removeEventListener('fullscreenchange', h); }, []);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      const a = musicRef.current;
      const fo = () => { if (a.volume > 0.05) { a.volume = Math.max(0, a.volume - 0.05); setTimeout(fo, 100); } else { a.pause(); a.currentTime = 0; } };
      fo(); musicRef.current = null;
    }
  }, []);

  const playMusic = useCallback((part) => {
    stopMusic();
    if (!part.musicUrl) return;
    try {
      const a = new Audio(part.musicUrl); a.loop = part.musicLoop || false; a.volume = 0;
      const tv = part.musicVolume || 0.5; const ft = (part.musicFadeIn || 2) * 10; let s = 0;
      a.play().then(() => { const fi = () => { s++; if (s <= ft) { a.volume = Math.min(tv, (s/ft)*tv); setTimeout(fi, 100); } }; fi(); }).catch(() => {});
      musicRef.current = a;
    } catch(e) {}
  }, [stopMusic]);

  const totalDuration = parts.reduce((s,p) => s+p.duration, 0);
  const effectiveParts = mode === 'test' ? parts.map(p => ({...p, duration:testSpeed, preAnnounceSec:Math.min(p.preAnnounceSec, Math.floor(testSpeed/2))})) : parts;
  const effectiveTotal = effectiveParts.reduce((s,p) => s+p.duration, 0);

  useEffect(() => {
    if (isRunning && !isPaused) { intervalRef.current = setInterval(() => { setPartElapsed(p => p+1); setTotalElapsed(p => p+1); }, 1000); }
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const cp = effectiveParts[currentPartIndex]; if (!cp) return;
    const rem = cp.duration - partElapsed;
    if (!introAnnounced && partElapsed === 0) {
      if (cp.introText) AudioEngine.speak(cp.introText, t.speechLang);
      if (beepEnabled) AudioEngine.beep(volume, 660, 0.2);
      if (vibrationEnabled) vibrate([200]);
      playMusic(cp);
      setIntroAnnounced(true);
    }
    if (!preAnnounced && rem <= cp.preAnnounceSec && rem > 0) {
      if (cp.announceNextText) AudioEngine.speak(cp.announceNextText, t.speechLang);
      if (beepEnabled) AudioEngine.beep(volume, 440, 0.3);
      if (vibrationEnabled) vibrate([200, 100, 200]);
      setPreAnnounced(true);
    }
    if (partElapsed >= cp.duration) {
      stopMusic();
      if (currentPartIndex < effectiveParts.length - 1) {
        setCurrentPartIndex(p => p+1); setPartElapsed(0); setPreAnnounced(false); setIntroAnnounced(false);
      } else {
        AudioEngine.speak(t.endedMsg, t.speechLang);
        if (beepEnabled) AudioEngine.beep(volume, 880, 0.5);
        if (vibrationEnabled) vibrate([300, 100, 300, 100, 300]);
        setIsRunning(false); setIsPaused(false);
        setShowHistory(prev => [...prev, { date: new Date().toISOString(), parts: parts.length, duration: totalDuration }]);
      }
    }
  }, [partElapsed, isRunning, isPaused, currentPartIndex, effectiveParts, preAnnounced, introAnnounced, beepEnabled, volume, vibrationEnabled, playMusic, stopMusic]);

  const startShow = () => { if (!parts.length) return; setCurrentPartIndex(0); setPartElapsed(0); setTotalElapsed(0); setPreAnnounced(false); setIntroAnnounced(false); setIsRunning(true); setIsPaused(false); };
  const togglePause = () => setIsPaused(p => !p);
  const stopShow = () => { setIsRunning(false); setIsPaused(false); stopMusic(); window.speechSynthesis?.cancel(); if (isFullscreen) document.exitFullscreen?.(); setMode('plan'); };

  const jumpToPart = (index) => {
    if (index < 0 || index >= effectiveParts.length) return;
    stopMusic();
    const elapsed = effectiveParts.slice(0, index).reduce((s,p) => s+p.duration, 0);
    setCurrentPartIndex(index); setPartElapsed(0); setTotalElapsed(elapsed);
    setPreAnnounced(false); setIntroAnnounced(false);
  };
  const skipToNext = () => { if (currentPartIndex < effectiveParts.length-1) jumpToPart(currentPartIndex+1); };
  const skipToPrev = () => { if (currentPartIndex > 0) jumpToPart(currentPartIndex-1); else { setPartElapsed(0); setIntroAnnounced(false); setPreAnnounced(false); } };
  const scrubPart = (v) => {
    const diff = v - partElapsed; setPartElapsed(v); setTotalElapsed(prev => Math.max(0, prev + diff));
    const cp = effectiveParts[currentPartIndex];
    if (cp && cp.duration - v > cp.preAnnounceSec) setPreAnnounced(false);
    if (v === 0) setIntroAnnounced(false);
  };
  const triggerTestAnnounce = () => { const cp = effectiveParts[currentPartIndex]; if (cp?.announceNextText) AudioEngine.speak(cp.announceNextText, t.speechLang); if (beepEnabled) AudioEngine.beep(volume, 440, 0.3); };

  const openAdd = () => { setForm({...EMPTY}); setEditPart(null); setShowForm(true); };
  const openEdit = (p) => { setForm({ title:p.title, duration:p.duration, introText:p.introText, preAnnounceSec:p.preAnnounceSec, announceNextText:p.announceNextText, notes:p.notes, musicUrl:p.musicUrl||'', musicVolume:p.musicVolume||0.5, musicFadeIn:p.musicFadeIn||2, musicFadeOut:p.musicFadeOut||2, musicLoop:p.musicLoop||false }); setEditPart(p.id); setShowForm(true); };
  const savePart = () => {
    if (!form.title.trim()) return;
    if (editPart !== null) setParts(parts.map(p => p.id === editPart ? {...p,...form} : p));
    else setParts([...parts, {...form, id: Date.now()}]);
    setShowForm(false);
    showToast(editPart !== null ? '✏️ Teil aktualisiert' : '➕ Teil hinzugefügt');
  };
  const removePart = (id) => { setParts(parts.filter(p => p.id !== id)); showToast('🗑 Teil entfernt'); };
  const movePart = (i,d) => { const a = [...parts]; const t = i+d; if (t<0||t>=a.length) return; [a[i],a[t]] = [a[t],a[i]]; setParts(a); };

  const Btn = ({children, onClick, className='', variant='primary'}) => {
    const base = 'font-medium rounded-lg px-4 py-2 text-sm transition-colors ';
    const vars = {
      primary: `${th.accent} ${th.accentHover} text-white `,
      secondary: `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} `,
      danger: 'bg-red-100 hover:bg-red-200 text-red-700 ',
    };
    return <button onClick={onClick} className={base + (vars[variant]||'') + className}>{children}</button>;
  };

  // ─── Settings Panel ───
  const renderSettings = () => (
    <div className={`${th.settingsCard} rounded-2xl p-5 mb-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${th.text}`}>{t.settingsTitle}</h3>
        <button onClick={() => setShowSettings(false)} className={`${th.textSub} text-xl`}>✕</button>
      </div>
      <div className="flex gap-2 mb-4">
        {['design','audio','test','language'].map(t => (
          <button key={t} onClick={() => setSettingsTab(t)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${settingsTab===t ? `${th.accent} text-white` : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {t === 'design' ? '🎨 Design' : t === 'audio' ? '🔊 Audio' : t === 'test' ? '🧪 Test' : '🌐 Sprache'}
          </button>
        ))}
      </div>
      {settingsTab === 'design' && (
        <div className="space-y-4">
          <div>
            <label className={`text-sm font-semibold ${th.text} block mb-2`}>Planungs-Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(THEMES).map(([k,v]) => (
                <button key={k} onClick={() => setThemeMode(k)}
                  className={`p-2 rounded-lg text-sm text-left transition-all ${resolvedTheme===k || themeMode===k ? 'ring-2 ring-indigo-500 scale-105' : ''} ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  {v.name}
                </button>
              ))}
              <button onClick={() => setThemeMode('auto')}
                className={`p-2 rounded-lg text-sm text-left transition-all ${themeMode==='auto' ? 'ring-2 ring-indigo-500 scale-105' : ''} ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                🔄 Auto (System)
              </button>
            </div>
          </div>
          <div>
            <label className={`text-sm font-semibold ${th.text} block mb-2`}>Perform-Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PERFORM_THEMES).map(([k,v]) => (
                <button key={k} onClick={() => setPerformTheme(k)}
                  className={`p-2 rounded-lg text-sm text-center transition-all ${performTheme===k ? 'ring-2 ring-indigo-500 scale-105' : ''} ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {settingsTab === 'audio' && (
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={beepEnabled} onChange={e => setBeepEnabled(e.target.checked)} className="w-5 h-5 rounded" />
            <span className={`text-sm ${th.text}`}>🔔 Signaltöne</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={vibrationEnabled} onChange={e => setVibrationEnabled(e.target.checked)} className="w-5 h-5 rounded" />
            <span className={`text-sm ${th.text}`}>📳 Vibration</span>
          </label>
          <div>
            <label className={`text-sm ${th.text} block mb-1`}>🔊 Lautstärke: {Math.round(volume*100)}%</label>
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-full" />
          </div>
          <Btn variant="secondary" onClick={() => AudioEngine.beep(volume, 880, 0.2)}>🔊 Testton</Btn>
        </div>
      )}
      {settingsTab === 'language' && (
        <div className="space-y-3">
          <label className={`text-sm font-semibold ${th.text} block mb-2`}>{t.selectLanguage}</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(TRANSLATIONS).map(lk => (
              <button key={lk} onClick={() => setLang(lk)}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all ${
                  lang === lk
                    ? `${th.accent} text-white scale-105 shadow-lg`
                    : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}>
                <span className="text-2xl">{LANG_FLAGS[lk]}</span>
                <span>{LANG_NAMES[lk]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {settingsTab === 'test' && (
        <div className="space-y-4">
          <div>
            <label className={`text-sm ${th.text} block mb-1`}>⏱ Testmodus-Dauer pro Teil: {testSpeed}s</label>
            <input type="range" min="3" max="30" value={testSpeed} onChange={e => setTestSpeed(parseInt(e.target.value))} className="w-full" />
          </div>
          <p className={`text-xs ${th.textSub}`}>Im Testmodus wird jeder Teil auf diese Dauer gekürzt.</p>
        </div>
      )}
    </div>
  );

  // ─── Tutorial Panel ───
  const renderTutorial = () => (
    <div className={`${th.settingsCard} rounded-2xl p-5 mb-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${th.text}`}>{t.tutorialTitle}</h3>
        <button onClick={() => { setShowTutorial(false); setTutorialSection(null); }} className={`${th.textSub} text-xl`}>✕</button>
      </div>
      {!tutorialSection ? (
        <div className="space-y-2">
          <p className={`text-sm ${th.textSub} mb-4`}>{t.tutorialIntro}</p>
          {[
            { key:'basics', icon:'🎯', title:t.tutoBasicsTitle, desc:t.tutoBasicsDesc },
            { key:'perform', icon:'🎭', title:t.tutoPerformTitle, desc:t.tutoPerformDesc },
            { key:'save', icon:'💾', title:t.tutoSaveTitle, desc:t.tutoSaveDesc },
            { key:'themes', icon:'🎨', title:t.tutoThemesTitle, desc:t.tutoThemesDesc },
          ].map(item => (
            <button key={item.key} onClick={() => setTutorialSection(item.key)}
              className={`w-full text-left ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg p-4 transition-colors`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className={`font-semibold ${th.text}`}>{item.title}</div>
                  <div className={`text-xs ${th.textSub}`}>{item.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setTutorialSection(null)} className={`text-sm ${th.accent} text-white px-3 py-1 rounded-lg`}>← Zurück</button>
          {tutorialSection === 'basics' && (
            <div className="space-y-3">
              <h4 className={`text-lg font-bold ${th.text}`}>🎯 Grundlagen</h4>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                <h5 className={`font-semibold ${th.text} mb-2`}>➕ Neuen Teil hinzufügen</h5>
                <ol className={`text-sm ${th.textSub} space-y-1 list-decimal list-inside`}>
                  <li>Klicke auf "➕ Neuer Teil"</li>
                  <li>Fülle Titel und Dauer aus</li>
                  <li>Optional: Intro-Text, Ansagen, Musik</li>
                  <li>Klicke "💾 Speichern"</li>
                </ol>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                <h5 className={`font-semibold ${th.text} mb-2`}>✏️ Teil bearbeiten</h5>
                <p className={`text-sm ${th.textSub}`}>Klicke auf ✏️ neben einem Teil, um ihn zu ändern.</p>
              </div>
            </div>
          )}
          {tutorialSection === 'perform' && (
            <div className="space-y-3">
              <h4 className={`text-lg font-bold ${th.text}`}>🎭 Show durchführen</h4>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                <h5 className={`font-semibold ${th.text} mb-2`}>▶️ Show starten</h5>
                <p className={`text-sm ${th.textSub}`}>Klicke "🎭 Show starten". Timer läuft automatisch, Ansagen werden abgespielt.</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                <h5 className={`font-semibold ${th.text} mb-2`}>⏸️ Steuerung</h5>
                <p className={`text-sm ${th.textSub}`}>Pause, Skip, Scrubbing – alles während der Show steuerbar.</p>
              </div>
            </div>
          )}
          {tutorialSection === 'save' && (
            <div className="space-y-3">
              <h4 className={`text-lg font-bold ${th.text}`}>💾 Speichern & Backup</h4>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                <p className={`text-sm ${th.textSub}`}>💾 Speichern: Gib einen Namen ein. 📥 Backup: JSON-Datei herunterladen. 📤 Import: JSON-Datei laden.</p>
              </div>
            </div>
          )}
          {tutorialSection === 'themes' && (
            <div className="space-y-3">
              <h4 className={`text-lg font-bold ${th.text}`}>🎨 Designs</h4>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                <p className={`text-sm ${th.textSub}`}>⚙️ Einstellungen → Design: 14 Themes verfügbar. Perform-Theme separat wählbar.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ─── About Panel ───
  const renderAbout = () => (
    <div className={`${th.settingsCard} rounded-2xl p-5 mb-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${th.text}`}>{t.aboutTitle}</h3>
        <button onClick={() => setShowAbout(false)} className={`${th.textSub} text-xl`}>✕</button>
      </div>
      <div className="space-y-4">
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 text-center`}>
          <div className="text-5xl mb-3">🎩✨</div>
          <h4 className={`text-xl font-bold ${th.text} mb-1`}>Magic Showrunner</h4>
          <p className={`text-sm ${th.textSub}`}>Version 1.0 — Dein professioneller Bühnen-Assistent</p>
        </div>
        <div className={`${darkMode ? 'bg-gradient-to-br from-indigo-900 to-purple-900' : 'bg-gradient-to-br from-indigo-50 to-purple-50'} rounded-xl p-4`}>
          <h5 className={`font-semibold ${th.text} mb-2`}>{t.developer}</h5>
          <p className={`font-semibold ${th.text}`}>✨ Dominik Lohmar</p>
          <p className={`text-xs ${th.textSub}`}>{t.devRole}</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
          <h5 className={`font-semibold ${th.text} mb-2`}>© 2026 Dominik Lohmar</h5>
          <p className={`text-xs ${th.textSub}`}>{t.rights}</p>
        </div>
      </div>
    </div>
  );

  // ─── Stage Plan ───
  const renderStageplan = () => (
    <div className={`${th.settingsCard} rounded-2xl p-5 mb-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${th.text}`}>{t.stageTitle}</h3>
        <button onClick={() => setShowStageplan(false)} className={`${th.textSub} text-xl`}>✕</button>
      </div>
      <div className={`relative w-full aspect-video ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl border-2 ${th.border} mb-4`}>
        <div className={`absolute top-2 left-1/2 -translate-x-1/2 text-xs ${th.textSub} font-semibold uppercase tracking-widest`}>{t.audience}</div>
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs ${th.textSub} font-semibold uppercase tracking-widest`}>{t.backstage}</div>
        {stageItems.map((item) => (
          <div key={item.id} className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            onClick={() => { setEditStageItem(item.id); setStageForm({ name: item.name, x: item.x, y: item.y, icon: item.icon, color: item.color }); }}>
            <div className="text-2xl group-hover:scale-125 transition-transform">{item.icon}</div>
            <div className={`text-xs ${th.text} text-center mt-0.5 font-medium`}>{item.name}</div>
          </div>
        ))}
      </div>
      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 space-y-2`}>
        <div className="grid grid-cols-2 gap-2">
          <input className={`rounded-lg px-3 py-2 text-sm border ${th.input}`} placeholder="Name" value={stageForm.name} onChange={e => setStageForm({...stageForm, name: e.target.value})} />
          <input className={`rounded-lg px-3 py-2 text-sm border ${th.input}`} placeholder="Icon (Emoji)" value={stageForm.icon} onChange={e => setStageForm({...stageForm, icon: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={`text-xs ${th.textSub}`}>X: {stageForm.x}%</label>
            <input type="range" min="5" max="95" value={stageForm.x} onChange={e => setStageForm({...stageForm, x: parseInt(e.target.value)})} className="w-full" />
          </div>
          <div>
            <label className={`text-xs ${th.textSub}`}>Y: {stageForm.y}%</label>
            <input type="range" min="5" max="95" value={stageForm.y} onChange={e => setStageForm({...stageForm, y: parseInt(e.target.value)})} className="w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          {editStageItem ? (
            <>
              <Btn onClick={() => { setStageItems(stageItems.map(si => si.id === editStageItem ? {...si, ...stageForm} : si)); setEditStageItem(null); setStageForm({name:'',x:50,y:50,icon:'📦',color:'#6366f1'}); showToast('✏️ Aktualisiert'); }}>💾 Update</Btn>
              <Btn variant="danger" onClick={() => { setStageItems(stageItems.filter(si => si.id !== editStageItem)); setEditStageItem(null); setStageForm({name:'',x:50,y:50,icon:'📦',color:'#6366f1'}); showToast('🗑 Entfernt'); }}>🗑</Btn>
              <Btn variant="secondary" onClick={() => { setEditStageItem(null); setStageForm({name:'',x:50,y:50,icon:'📦',color:'#6366f1'}); }}>Abbrechen</Btn>
            </>
          ) : (
            <Btn onClick={() => { if (!stageForm.name.trim()) return; setStageItems([...stageItems, {...stageForm, id: Date.now()}]); setStageForm({name:'',x:50,y:50,icon:'📦',color:'#6366f1'}); showToast('➕ Hinzugefügt'); }}>➕ Hinzufügen</Btn>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Statistics Panel ───
  const renderStats = () => (
    <div className={`${th.settingsCard} rounded-2xl p-5 mb-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${th.text}`}>{t.statsTitle}</h3>
        <button onClick={() => setShowStats(false)} className={`${th.textSub} text-xl`}>✕</button>
      </div>
      {showHistory.length === 0 ? (
        <p className={`text-sm ${th.textSub} text-center py-8`}>{t.noStats}</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-indigo-50'} rounded-xl p-3 text-center`}>
              <div className={`text-2xl font-bold ${th.text}`}>{showHistory.length}</div>
              <div className={`text-xs ${th.textSub}`}>{t.shows}</div>
            </div>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-indigo-50'} rounded-xl p-3 text-center`}>
              <div className={`text-2xl font-bold ${th.text}`}>{fmt(showHistory.reduce((s,h) => s + (h.duration||0), 0))}</div>
              <div className={`text-xs ${th.textSub}`}>{t.totalTimeLabel}</div>
            </div>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-indigo-50'} rounded-xl p-3 text-center`}>
              <div className={`text-2xl font-bold ${th.text}`}>{Math.round(showHistory.reduce((s,h) => s + (h.parts||0), 0) / showHistory.length)}</div>
              <div className={`text-xs ${th.textSub}`}>{t.avgParts}</div>
            </div>
          </div>
          <div className="space-y-2">
            {showHistory.slice(-10).reverse().map((h, i) => (
              <div key={i} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 flex justify-between items-center`}>
                <div>
                  <div className={`text-sm ${th.text}`}>{new Date(h.date).toLocaleDateString('de-DE')}</div>
                  <div className={`text-xs ${th.textSub}`}>{h.parts} Teile</div>
                </div>
                <div className={`text-sm font-mono ${th.text}`}>{fmt(h.duration || 0)}</div>
              </div>
            ))}
          </div>
          <Btn variant="danger" onClick={() => { setShowHistory([]); showToast(t.deletedHistory); }}>{t.clearHistory}</Btn>
        </div>
      )}
    </div>
  );

  // ─── Part Form ───
  const renderPartForm = () => (
    <div className={`${th.settingsCard} rounded-2xl p-5 mb-4`}>
      <h3 className={`text-lg font-bold ${th.text} mb-4`}>{editPart !== null ? t.editPart : t.addPart}</h3>
      <div className="space-y-3">
        <input className={`w-full rounded-lg px-3 py-2 text-sm border ${th.input}`} placeholder={t.titleLabel} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <div>
          <label className={`text-xs ${th.textSub}`}>Dauer: {fmt(form.duration)}</label>
          <input type="range" min="10" max="3600" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} className="w-full" />
        </div>
        <textarea className={`w-full rounded-lg px-3 py-2 text-sm border ${th.input}`} rows="2" placeholder={t.introLabel} value={form.introText} onChange={e => setForm({...form, introText: e.target.value})} />
        <div>
          <label className={`text-xs ${th.textSub}`}>Vorankündigung: {form.preAnnounceSec}s vor Ende</label>
          <input type="range" min="5" max="120" value={form.preAnnounceSec} onChange={e => setForm({...form, preAnnounceSec: parseInt(e.target.value)})} className="w-full" />
        </div>
        <textarea className={`w-full rounded-lg px-3 py-2 text-sm border ${th.input}`} rows="2" placeholder={t.preAnnounceText} value={form.announceNextText} onChange={e => setForm({...form, announceNextText: e.target.value})} />
        <textarea className={`w-full rounded-lg px-3 py-2 text-sm border ${th.input}`} rows="2" placeholder={t.notesLabel} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
        <input className={`w-full rounded-lg px-3 py-2 text-sm border ${th.input}`} placeholder={t.musicUrl} value={form.musicUrl} onChange={e => setForm({...form, musicUrl: e.target.value})} />
        {form.musicUrl && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={`text-xs ${th.textSub}`}>Vol: {Math.round(form.musicVolume*100)}%</label>
              <input type="range" min="0" max="1" step="0.05" value={form.musicVolume} onChange={e => setForm({...form, musicVolume: parseFloat(e.target.value)})} className="w-full" />
            </div>
            <div>
              <label className={`text-xs ${th.textSub}`}>Fade In: {form.musicFadeIn}s</label>
              <input type="range" min="0" max="10" value={form.musicFadeIn} onChange={e => setForm({...form, musicFadeIn: parseInt(e.target.value)})} className="w-full" />
            </div>
            <div>
              <label className={`text-xs ${th.textSub}`}>Fade Out: {form.musicFadeOut}s</label>
              <input type="range" min="0" max="10" value={form.musicFadeOut} onChange={e => setForm({...form, musicFadeOut: parseInt(e.target.value)})} className="w-full" />
            </div>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Btn onClick={savePart}>{t.saveBtn}</Btn>
          <Btn variant="secondary" onClick={() => setShowForm(false)}>{t.cancelBtn}</Btn>
          {form.introText && <Btn variant="secondary" onClick={() => AudioEngine.speak(form.introText, t.speechLang)}>{t.testBtn}</Btn>}
        </div>
      </div>
    </div>
  );

  // ─── Save Menu ───
  const renderSaveMenu = () => (
    <div className={`${th.settingsCard} rounded-2xl p-5 mb-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${th.text}`}>{t.saveShowTitle}</h3>
        <button onClick={() => setShowSaveMenu(false)} className={`${th.textSub} text-xl`}>✕</button>
      </div>
      <div className="flex gap-2">
        <input className={`flex-1 rounded-lg px-3 py-2 text-sm border ${th.input}`} placeholder={t.showName} value={saveName} onChange={e => setSaveName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && saveName.trim()) saveShow(saveName.trim()); }} />
        <Btn onClick={() => { if (saveName.trim()) saveShow(saveName.trim()); }}>💾</Btn>
      </div>
      {savedShows.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className={`text-xs ${th.textSub}`}>{t.overwrite}</p>
          {savedShows.map(s => (
            <button key={s.id} onClick={() => saveShow(s.name)} className={`w-full text-left p-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} ${th.text}`}>
              {s.name} <span className={`text-xs ${th.textSub}`}>({new Date(s.savedAt).toLocaleDateString('de-DE')})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Load Menu ───
  const renderLoadMenu = () => (
    <div className={`${th.settingsCard} rounded-2xl p-5 mb-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${th.text}`}>{t.loadShowTitle}</h3>
        <button onClick={() => setShowLoadMenu(false)} className={`${th.textSub} text-xl`}>✕</button>
      </div>
      {savedShows.length === 0 ? (
        <p className={`text-sm ${th.textSub} text-center py-4`}>Keine gespeicherten Shows.</p>
      ) : (
        <div className="space-y-2">
          {savedShows.map(s => (
            <div key={s.id} className={`flex items-center gap-2 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex-1 cursor-pointer" onClick={() => loadShow(s)}>
                <div className={`text-sm font-semibold ${th.text}`}>{s.name}</div>
                <div className={`text-xs ${th.textSub}`}>{s.parts.length} Teile · {new Date(s.savedAt).toLocaleDateString('de-DE')}</div>
              </div>
              <button onClick={() => deleteShow(s.id)} className="text-red-400 hover:text-red-600 text-sm">🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Plan Mode ───
  const renderPlan = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className={`text-3xl font-bold ${th.headText}`}>{t.appTitle} <span className="text-sm font-normal opacity-60">v1.0</span></h1>
        <p className={`mt-1 ${th.subText}`}>{t.appSub}</p>
      </div>

      {/* Toolbar */}
      <div className={`${th.planCard} rounded-xl p-3 mb-4 flex flex-wrap gap-2 items-center justify-between`}>
        <div className="flex gap-2 flex-wrap">
          <Btn variant="secondary" onClick={() => setShowSaveMenu(true)}>{t.save}</Btn>
          <Btn variant="secondary" onClick={() => setShowLoadMenu(true)}>{t.load}</Btn>
          <Btn variant="secondary" onClick={exportBackup}>{t.backup}</Btn>
          <Btn variant="secondary" onClick={() => setShowTutorial(true)}>{t.tutorial}</Btn>
          <Btn variant="secondary" onClick={() => setShowAbout(true)}>{t.about}</Btn>
          <label className={`font-medium rounded-lg px-4 py-2 text-sm cursor-pointer transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
            {t.importBtn} <input type="file" accept=".json" onChange={importBackup} className="hidden" />
          </label>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={undo} className={historyIndex <= 0 ? 'opacity-30 cursor-not-allowed' : ''}>↩️</Btn>
          <Btn variant="secondary" onClick={redo} className={historyIndex >= history.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}>↪️</Btn>
          <Btn variant="secondary" onClick={() => setShowSettings(!showSettings)}>⚙️</Btn>
          <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${darkMode?'bg-gray-700 text-gray-200':'bg-gray-100 text-gray-700'}`}>{LANG_FLAGS[lang]}</span>
        </div>
      </div>

      {showSettings && renderSettings()}
      {showTutorial && renderTutorial()}
      {showAbout && renderAbout()}
      {showSaveMenu && renderSaveMenu()}
      {showLoadMenu && renderLoadMenu()}
      {showStats && renderStats()}
      {showStageplan && renderStageplan()}
      {showForm && renderPartForm()}

      {/* Summary */}
      <div className={`${th.planCard} rounded-xl p-4 mb-4 flex flex-wrap gap-4 items-center justify-between`}>
        <div className="flex gap-4">
          <div><span className={`text-xs ${th.textSub}`}>{t.parts}</span><div className={`text-xl font-bold ${th.text}`}>{parts.length}</div></div>
          <div><span className={`text-xs ${th.textSub}`}>{t.totalTime}</span><div className={`text-xl font-bold ${th.text}`}>{fmt(totalDuration)}</div></div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Btn variant="secondary" onClick={() => setShowStageplan(true)}>{t.stage}</Btn>
          <Btn variant="secondary" onClick={() => setShowStats(true)}>{t.stats}</Btn>
          <Btn variant="secondary" onClick={toggleFullscreen}>{isFullscreen ? t.exitFullscreen : t.fullscreen}</Btn>
        </div>
      </div>

      {/* Parts List */}
      <div className="space-y-2 mb-4">
        {parts.map((p, i) => (
          <div key={p.id} className={`${th.planCard} rounded-xl p-4 transition-all hover:scale-[1.01]`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${th.badgeBg} ${th.badgeText} flex items-center justify-center text-sm font-bold flex-shrink-0`}>{i+1}</div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${th.text} truncate`}>{p.title}</div>
                <div className={`text-xs ${th.textSub} mt-0.5`}>
                  ⏱ {fmt(p.duration)} {p.preAnnounceSec > 0 && `· 📢 ${p.preAnnounceSec}s`} {p.musicUrl && ' · 🎵'} {p.notes && ' · 📝'}
                </div>
                {p.notes && <div className={`text-xs ${th.textSub} mt-1 truncate`}>📝 {p.notes}</div>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => movePart(i, -1)} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${i === 0 ? 'opacity-20' : ''}`}>⬆️</button>
                <button onClick={() => movePart(i, 1)} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${i === parts.length-1 ? 'opacity-20' : ''}`}>⬇️</button>
                <button onClick={() => openEdit(p)} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>✏️</button>
                <button onClick={() => removePart(p.id)} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Btn onClick={openAdd}>➕ Neuer Teil</Btn>
        <Btn onClick={() => { setMode('perform'); startShow(); }}>🎭 Show starten</Btn>
        <Btn variant="secondary" onClick={() => { setMode('test'); startShow(); }}>🧪 Testlauf</Btn>
        {parts.length > 0 && <Btn variant="danger" onClick={() => { if (confirm('Alle Teile löschen?')) { setParts([]); showToast('🗑 Alle Teile entfernt'); } }}>🗑 Alle löschen</Btn>}
        <Btn variant="secondary" onClick={() => { setParts(DEMO); showToast('📋 Demo geladen'); }}>📋 Demo laden</Btn>
      </div>
    </div>
  );

  // ─── Perform Mode ───
  const renderPerform = () => {
    const cp = effectiveParts[currentPartIndex];
    if (!cp) return <div className={`text-center p-20 ${pth.text}`}>Keine Teile vorhanden.</div>;
    const rem = cp.duration - partElapsed;
    const pct = (partElapsed / cp.duration) * 100;
    const totalPct = effectiveTotal > 0 ? (totalElapsed / effectiveTotal) * 100 : 0;
    const isWarning = rem <= cp.preAnnounceSec && rem > 0;
    const next = effectiveParts[currentPartIndex + 1];

    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className={`text-xs ${pth.text} opacity-60 uppercase tracking-wider`}>{mode === 'test' ? '🧪 Testmodus' : '🎭 Live'}</div>
            <div className={`text-sm ${pth.text} opacity-80`}>Teil {currentPartIndex+1} / {effectiveParts.length}</div>
          </div>
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={toggleFullscreen}>{isFullscreen ? '⛶' : '⛶'}</Btn>
            <Btn variant="danger" onClick={stopShow}>⏹ Stopp</Btn>
          </div>
        </div>

        {/* Current Part */}
        <div className={`${isWarning ? pth.warnBg : pth.card} rounded-2xl p-6 mb-4 transition-all`}>
          <h2 className={`text-2xl font-bold ${pth.text} mb-2`}>{cp.title}</h2>
          <div className={`text-6xl font-mono font-bold ${isWarning ? pth.warnTimer : pth.timerText} mb-4 text-center tabular-nums`}>
            {rem < 0 ? '+' : ''}{fmt(rem)}
          </div>
          {/* Progress */}
          <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3 mb-3`}>
            <div className={`h-3 rounded-full transition-all ${isWarning ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          {/* Scrub */}
          <input type="range" min="0" max={cp.duration} value={Math.min(partElapsed, cp.duration)} onChange={e => scrubPart(parseInt(e.target.value))} className="w-full mb-3" />
          {/* Controls */}
          <div className="flex gap-2 justify-center flex-wrap">
            <Btn variant="secondary" onClick={skipToPrev}>⏮</Btn>
            <Btn onClick={togglePause}>{isPaused ? '▶️ Weiter' : '⏸ Pause'}</Btn>
            <Btn variant="secondary" onClick={skipToNext}>⏭</Btn>
            <Btn variant="secondary" onClick={triggerTestAnnounce}>📢 Test</Btn>
          </div>
        </div>

        {/* Notes */}
        {cp.notes && (
          <div className={`${pth.card} rounded-xl p-4 mb-4`}>
            <div className={`text-xs ${pth.text} opacity-60 mb-1`}>📝 Notizen</div>
            <div className={`text-sm ${pth.text}`}>{cp.notes}</div>
          </div>
        )}

        {/* Next Part */}
        {next && (
          <div className={`${pth.card} rounded-xl p-4 mb-4 opacity-70`}>
            <div className={`text-xs ${pth.text} opacity-60 mb-1`}>⏭ Als nächstes</div>
            <div className={`text-sm font-semibold ${pth.text}`}>{next.title}</div>
            <div className={`text-xs ${pth.text} opacity-60`}>⏱ {fmt(next.duration)}</div>
          </div>
        )}

        {/* Global Progress */}
        <div className={`${pth.card} rounded-xl p-4`}>
          <div className="flex justify-between mb-1">
            <span className={`text-xs ${pth.text} opacity-60`}>Gesamtfortschritt</span>
            <span className={`text-xs font-mono ${pth.text}`}>{fmt(totalElapsed)} / {fmt(effectiveTotal)}</span>
          </div>
          <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
            <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.min(100, totalPct)}%` }} />
          </div>
        </div>

        {/* Part List */}
        <div className="mt-4 space-y-1">
          {effectiveParts.map((p, i) => (
            <button key={p.id || i} onClick={() => jumpToPart(i)}
              className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${i === currentPartIndex ? `${th.accent} text-white` : i < currentPartIndex ? `${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'} line-through` : `${pth.card} ${pth.text}`}`}>
              {i+1}. {p.title} ({fmt(p.duration)})
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`min-h-screen ${mode === 'plan' ? th.bg : pth.bg} p-4 transition-colors`}>
      {mode === 'plan' ? renderPlan() : renderPerform()}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium z-50 animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
}
