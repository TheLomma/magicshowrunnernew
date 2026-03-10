import React, { useState, useEffect, useRef } from "react";

var uid = function() { return Math.random().toString(36).slice(2, 9); };
var fmt = function(s) { var m = Math.floor(s / 60); var sec = s % 60; return m + ":" + String(sec).padStart(2, "0"); };

var T = {
  de: { title: "Magic Showrunner", ver: "v4.6", save: "Speichern", load: "Laden", newPart: "Neuer Teil", start: "Show starten", test: "Testmodus", parts: "Teile", total: "Gesamt", settings: "Einstellungen", planTheme: "Planungs-Theme", perfTheme: "Perform-Theme", beeps: "Signaltöne", vibration: "Vibration", volume: "Lautstärke", testTone: "Testton", testDur: "Testdauer/Teil", titleL: "Titel", durL: "Dauer (Sek)", introL: "Intro-Ansage", preAnnL: "Vorankündigung (Sek)", preAnnTxt: "Vorankündigungs-Text", notesL: "Notizen", colorL: "Farbe", saveBtn: "Speichern", cancel: "Abbrechen", showName: "Show-Name", overwrite: "Überschreiben", noSaved: "Keine Shows.", pause: "Pause", resume: "Weiter", prev: "Zurück", next: "Weiter", partOf: "Teil", of: "/", dup: "Duplizieren", del: "Löschen", edit: "Bearbeiten", sek: "Sek", csv: "CSV", fontSize: "Größe", fontFamily: "Schriftart", ttsVoice: "Stimme", ttsRate: "Tempo", ttsPitch: "Tonhöhe", ttsPreview: "Vorschau", animations: "Animationen", notes: "Notizen", stop: "Stop", setlist: "Setlist" },
  en: { title: "Magic Showrunner", ver: "v4.6", save: "Save", load: "Load", newPart: "New Part", start: "Start Show", test: "Test Mode", parts: "Parts", total: "Total", settings: "Settings", planTheme: "Plan Theme", perfTheme: "Perform Theme", beeps: "Beeps", vibration: "Vibration", volume: "Volume", testTone: "Test Tone", testDur: "Test dur/part", titleL: "Title", durL: "Duration (sec)", introL: "Intro (TTS)", preAnnL: "Pre-announce (sec)", preAnnTxt: "Pre-announce text", notesL: "Notes", colorL: "Color", saveBtn: "Save", cancel: "Cancel", showName: "Show Name", overwrite: "Overwrite", noSaved: "No saved shows.", pause: "Pause", resume: "Resume", prev: "Back", next: "Next", partOf: "Part", of: "/", dup: "Duplicate", del: "Delete", edit: "Edit", sek: "sec", csv: "CSV", fontSize: "Size", fontFamily: "Font family", ttsVoice: "Voice", ttsRate: "Speed", ttsPitch: "Pitch", ttsPreview: "Preview", animations: "Animations", notes: "Notes", stop: "Stop", setlist: "Setlist" }
};

var TH = {
  light: { label: "Light", bg: "#f8fafc", card: "#ffffff", text: "#1e293b", sub: "#64748b", acc: "#4f46e5", brd: "#e2e8f0", inp: "#f1f5f9" },
  dark: { label: "Dark", bg: "#1e1e2e", card: "#2a2a3c", text: "#e2e8f0", sub: "#94a3b8", acc: "#6366f1", brd: "#3f3f5c", inp: "#33334d" },
  midnight: { label: "Midnight", bg: "#0f0f23", card: "#1a1a35", text: "#c4b5fd", sub: "#7c6fae", acc: "#7c3aed", brd: "#2e2e52", inp: "#25254a" },
  ember: { label: "Ember", bg: "#1c1410", card: "#2a1f18", text: "#fde68a", sub: "#d97706", acc: "#ea580c", brd: "#44392e", inp: "#332a20" }
};

var PTH = {
  light: { bg: "#ffffff", text: "#111827", timer: "#1e293b", bar: "#4f46e5", barBg: "#e2e8f0" },
  dark: { bg: "#111827", text: "#f1f5f9", timer: "#e2e8f0", bar: "#6366f1", barBg: "#374151" },
  black: { bg: "#000000", text: "#ffffff", timer: "#ffffff", bar: "#8b5cf6", barBg: "#1f1f1f" }
};

var COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

var DEMO = [
  { id: uid(), title: "Begrüßung", duration: 60, intro: "Willkommen!", preAnn: 10, preAnnText: "Gleich weiter", notes: "Publikum begrüßen", color: COLORS[0] },
  { id: uid(), title: "Kartentrick", duration: 180, intro: "Ein Kartentrick", preAnn: 15, preAnnText: "Nächster Trick", notes: "Pik-Ass", color: COLORS[1] },
  { id: uid(), title: "Mentalmagie", duration: 240, intro: "Mysteriös", preAnn: 20, preAnnText: "Finale naht", notes: "Umschlag", color: COLORS[5] },
  { id: uid(), title: "Finale", duration: 120, intro: "Das Finale!", preAnn: 10, preAnnText: "", notes: "Konfetti", color: COLORS[3] }
];

function doBeep(vol, freq, ms) {
  try {
    var c = new (window.AudioContext || window.webkitAudioContext)();
    var o = c.createOscillator();
    var g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.value = freq || 880;
    g.gain.value = vol || 0.5;
    o.start(); o.stop(c.currentTime + (ms || 150) / 1000);
  } catch (e) {}
}

function doVibrate(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms || 200); } catch (e) {}
}

function doSpeak(text, rate, pitch, uri) {
  if (!text || !window.speechSynthesis) return;
  var u = new SpeechSynthesisUtterance(text);
  u.rate = rate || 1;
  u.pitch = pitch || 1;
  if (uri) {
    var v = speechSynthesis.getVoices().find(function(x) { return x.voiceURI === uri; });
    if (v) u.voice = v;
  }
  speechSynthesis.speak(u);
}

function Modal(props) {
  if (!props.open) return null;
  return React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }, onClick: props.onClose },
    React.createElement("div", { onClick: function(e) { e.stopPropagation(); }, style: { background: props.th.card, color: props.th.text, borderRadius: 16, padding: 24, minWidth: 320, maxWidth: 480, maxHeight: "80vh", overflow: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" } },
      React.createElement("h3", { style: { marginTop: 0 } }, props.title),
      props.children
    )
  );
}

function Toast(props) {
  useEffect(function() { var t = setTimeout(props.onDone, 2200); return function() { clearTimeout(t); }; }, []);
  if (!props.msg) return null;
  return React.createElement("div", { style: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 24px", borderRadius: 12, zIndex: 9999, fontSize: 14 } }, props.msg);
}

function PartEditor(props) {
  var open = props.open, part = props.part, onSave = props.onSave, onClose = props.onClose, t = props.t, th = props.th;
  var blank = { title: "", duration: 120, intro: "", preAnn: 10, preAnnText: "", notes: "", color: COLORS[0] };
  var _s = useState(part || blank);
  var f = _s[0], setF = _s[1];
  useEffect(function() { setF(part || blank); }, [part, open]);
  var up = function(k, v) { setF(function(p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
  var is = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid " + th.brd, background: th.inp, color: th.text, marginBottom: 8, boxSizing: "border-box" };
  if (!open) return null;
  return React.createElement(Modal, { open: open, onClose: onClose, title: part ? t.edit : t.newPart, th: th },
    React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.titleL),
    React.createElement("input", { style: is, value: f.title, onChange: function(e) { up("title", e.target.value); } }),
    React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.durL),
    React.createElement("input", { style: is, type: "number", min: 1, value: f.duration, onChange: function(e) { up("duration", +e.target.value); } }),
    React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.introL),
    React.createElement("input", { style: is, value: f.intro, onChange: function(e) { up("intro", e.target.value); } }),
    React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.preAnnL),
    React.createElement("input", { style: is, type: "number", min: 0, value: f.preAnn, onChange: function(e) { up("preAnn", +e.target.value); } }),
    React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.preAnnTxt),
    React.createElement("input", { style: is, value: f.preAnnText, onChange: function(e) { up("preAnnText", e.target.value); } }),
    React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.notesL),
    React.createElement("textarea", { style: Object.assign({}, is, { minHeight: 50 }), value: f.notes, onChange: function(e) { up("notes", e.target.value); } }),
    React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.colorL),
    React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" } },
      COLORS.map(function(c) {
        return React.createElement("div", { key: c, onClick: function() { up("color", c); }, style: { width: 28, height: 28, borderRadius: 8, background: c, cursor: "pointer", border: f.color === c ? "3px solid #fff" : "3px solid transparent" } });
      })
    ),
    React.createElement("div", { style: { display: "flex", gap: 8 } },
      React.createElement("button", { onClick: function() { if (!f.title) return; onSave(Object.assign({}, f, { id: f.id || uid() })); onClose(); }, style: { flex: 1, padding: 10, borderRadius: 10, border: "none", background: th.acc, color: "#fff", fontWeight: 700, cursor: "pointer" } }, t.saveBtn),
      React.createElement("button", { onClick: onClose, style: { flex: 1, padding: 10, borderRadius: 10, border: "1px solid " + th.brd, background: "transparent", color: th.text, cursor: "pointer" } }, t.cancel)
    )
  );
}

function SaveModal(props) {
  var open = props.open, onClose = props.onClose, parts = props.parts, t = props.t, th = props.th, onToast = props.onToast;
  var _n = useState(""); var name = _n[0]; var setName = _n[1];
  var _sv = useState([]); var saves = _sv[0]; var setSaves = _sv[1];
  useEffect(function() { if (open) setSaves(JSON.parse(localStorage.getItem("ms3_shows") || "[]")); }, [open]);
  if (!open) return null;
  var doSave = function() {
    if (!name.trim()) return;
    var s = JSON.parse(localStorage.getItem("ms3_shows") || "[]");
    var i = s.findIndex(function(x) { return x.name === name; });
    var entry = { name: name, parts: parts, date: new Date().toISOString() };
    if (i >= 0) { s[i] = entry; } else { s.push(entry); }
    localStorage.setItem("ms3_shows", JSON.stringify(s));
    onToast(t.save + " OK");
    onClose();
  };
  return React.createElement(Modal, { open: open, onClose: onClose, title: t.save, th: th },
    React.createElement("input", { style: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid " + th.brd, background: th.inp, color: th.text, marginBottom: 8, boxSizing: "border-box" }, placeholder: t.showName, value: name, onChange: function(e) { setName(e.target.value); } }),
    saves.length > 0 ? React.createElement("div", { style: { marginBottom: 8, fontSize: 12, color: th.sub } }, t.overwrite + ":") : null,
    saves.map(function(s) {
      return React.createElement("div", { key: s.name, onClick: function() { setName(s.name); }, style: { padding: "6px 10px", background: name === s.name ? th.acc + "22" : "transparent", borderRadius: 8, cursor: "pointer", fontSize: 13, color: th.text, marginBottom: 2 } }, s.name + " (" + s.parts.length + " " + t.parts + ")");
    }),
    React.createElement("button", { onClick: doSave, style: { marginTop: 8, width: "100%", padding: 10, borderRadius: 10, border: "none", background: th.acc, color: "#fff", fontWeight: 700, cursor: "pointer" } }, t.saveBtn)
  );
}

function LoadModal(props) {
  var open = props.open, onClose = props.onClose, onLoad = props.onLoad, t = props.t, th = props.th;
  var _sv = useState([]); var saves = _sv[0]; var setSaves = _sv[1];
  useEffect(function() { if (open) setSaves(JSON.parse(localStorage.getItem("ms3_shows") || "[]")); }, [open]);
  if (!open) return null;
  return React.createElement(Modal, { open: open, onClose: onClose, title: t.load, th: th },
    saves.length === 0 ? React.createElement("p", { style: { color: th.sub } }, t.noSaved) : null,
    saves.map(function(s) {
      return React.createElement("div", { key: s.name, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 8, marginBottom: 4, background: th.inp } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontWeight: 600, fontSize: 14 } }, s.name),
          React.createElement("div", { style: { fontSize: 11, color: th.sub } }, s.parts.length + " " + t.parts)
        ),
        React.createElement("button", { onClick: function() { onLoad(s.parts); onClose(); }, style: { padding: "6px 14px", borderRadius: 8, border: "none", background: th.acc, color: "#fff", cursor: "pointer", fontWeight: 600 } }, t.load)
      );
    })
  );
}

function SettingsModal(props) {
  var open = props.open, onClose = props.onClose, cfg = props.cfg, setCfg = props.setCfg, t = props.t, th = props.th;
  var _t = useState("design"); var tab = _t[0]; var setTab = _t[1];
  var _v = useState([]); var voices = _v[0]; var setVoices = _v[1];
  useEffect(function() {
    var ld = function() { setVoices((speechSynthesis && speechSynthesis.getVoices()) || []); };
    ld();
    if (speechSynthesis) speechSynthesis.addEventListener("voiceschanged", ld);
    return function() { if (speechSynthesis) speechSynthesis.removeEventListener("voiceschanged", ld); };
  }, []);
  var is = { width: "100%", padding: 8, borderRadius: 8, border: "1px solid " + th.brd, background: th.inp, color: th.text, marginBottom: 8, boxSizing: "border-box" };
  if (!open) return null;
  var tabs = ["design", "audio", "voice", "font", "lang"];
  var icons = { design: "Design", audio: "Audio", voice: cfg.lang === "de" ? "Stimme" : "Voice", font: cfg.lang === "de" ? "Schrift" : "Font", lang: cfg.lang === "de" ? "Sprache" : "Language" };
  var upCfg = function(k, v) { setCfg(function(c) { var o = {}; o[k] = v; return Object.assign({}, c, o); }); };

  var content = null;
  if (tab === "design") {
    content = React.createElement("div", null,
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.planTheme),
      React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 } },
        Object.keys(TH).map(function(k) { return React.createElement("button", { key: k, onClick: function() { upCfg("theme", k); }, style: { padding: "8px 14px", borderRadius: 8, border: cfg.theme === k ? "2px solid " + th.acc : "2px solid transparent", background: TH[k].card, color: TH[k].text, cursor: "pointer", fontSize: 12 } }, TH[k].label); })
      ),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.perfTheme),
      React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12 } },
        Object.keys(PTH).map(function(k) { return React.createElement("button", { key: k, onClick: function() { upCfg("perfTheme", k); }, style: { padding: "8px 14px", borderRadius: 8, border: cfg.perfTheme === k ? "2px solid " + th.acc : "2px solid transparent", background: PTH[k].bg, color: PTH[k].text, cursor: "pointer", fontSize: 12, textTransform: "capitalize" } }, k); })
      ),
      React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" } },
        React.createElement("input", { type: "checkbox", checked: cfg.animations, onChange: function(e) { upCfg("animations", e.target.checked); } }), t.animations
      )
    );
  } else if (tab === "audio") {
    content = React.createElement("div", null,
      React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 8, cursor: "pointer" } },
        React.createElement("input", { type: "checkbox", checked: cfg.beeps, onChange: function(e) { upCfg("beeps", e.target.checked); } }), t.beeps),
      React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 8, cursor: "pointer" } },
        React.createElement("input", { type: "checkbox", checked: cfg.vibrate, onChange: function(e) { upCfg("vibrate", e.target.checked); } }), t.vibration),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.volume),
      React.createElement("input", { type: "range", min: 0, max: 1, step: 0.1, value: cfg.volume, onChange: function(e) { upCfg("volume", +e.target.value); }, style: { width: "100%", marginBottom: 8 } }),
      React.createElement("button", { onClick: function() { doBeep(cfg.volume); }, style: { padding: "8px 16px", borderRadius: 8, border: "none", background: th.acc, color: "#fff", cursor: "pointer" } }, t.testTone)
    );
  } else if (tab === "voice") {
    content = React.createElement("div", null,
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.ttsVoice),
      React.createElement("select", { value: cfg.ttsVoice, onChange: function(e) { upCfg("ttsVoice", e.target.value); }, style: is },
        React.createElement("option", { value: "" }, "Default"),
        voices.map(function(v) { return React.createElement("option", { key: v.voiceURI, value: v.voiceURI }, v.name + " (" + v.lang + ")"); })
      ),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.ttsRate),
      React.createElement("input", { type: "range", min: 0.5, max: 2, step: 0.1, value: cfg.ttsRate, onChange: function(e) { upCfg("ttsRate", +e.target.value); }, style: { width: "100%" } }),
      React.createElement("span", { style: { fontSize: 11, color: th.sub } }, String(cfg.ttsRate)),
      React.createElement("label", { style: { fontSize: 12, color: th.sub, marginTop: 8, display: "block" } }, t.ttsPitch),
      React.createElement("input", { type: "range", min: 0.5, max: 2, step: 0.1, value: cfg.ttsPitch, onChange: function(e) { upCfg("ttsPitch", +e.target.value); }, style: { width: "100%" } }),
      React.createElement("span", { style: { fontSize: 11, color: th.sub } }, String(cfg.ttsPitch)),
      React.createElement("button", { onClick: function() { doSpeak("Test 1 2 3", cfg.ttsRate, cfg.ttsPitch, cfg.ttsVoice); }, style: { marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "none", background: th.acc, color: "#fff", cursor: "pointer" } }, t.ttsPreview)
    );
  } else if (tab === "font") {
    content = React.createElement("div", null,
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, cfg.lang === "de" ? "Anzeigegröße im Perform-Modus" : "Display size in Perform Mode"),
      React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12 } },
        ["XXL", "XL", "M", "S"].map(function(sz) {
          return React.createElement("button", { key: sz, onClick: function() { upCfg("performSize", sz); }, style: { flex: 1, padding: "8px 0", borderRadius: 8, border: cfg.performSize === sz ? "2px solid " + th.acc : "2px solid transparent", background: cfg.performSize === sz ? th.acc + "22" : th.inp, color: th.text, cursor: "pointer", fontWeight: cfg.performSize === sz ? 700 : 400, fontSize: 14 } }, sz);
        })
      ),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.fontSize),
      React.createElement("input", { type: "range", min: 12, max: 24, value: cfg.fontSize, onChange: function(e) { upCfg("fontSize", +e.target.value); }, style: { width: "100%" } }),
      React.createElement("span", { style: { fontSize: 11, color: th.sub } }, cfg.fontSize + "px"),
      React.createElement("label", { style: { fontSize: 12, color: th.sub, marginTop: 8, display: "block" } }, t.fontFamily),
      React.createElement("select", { value: cfg.fontFamily, onChange: function(e) { upCfg("fontFamily", e.target.value); }, style: is },
        ["System", "Arial", "Georgia", "Courier New", "Verdana"].map(function(f) { return React.createElement("option", { key: f, value: f }, f); })
      )
    );
  } else {
    content = React.createElement("div", { style: { display: "flex", gap: 8 } },
      ["de", "en"].map(function(l) {
        return React.createElement("button", { key: l, onClick: function() { upCfg("lang", l); }, style: { flex: 1, padding: 12, borderRadius: 10, border: cfg.lang === l ? "2px solid " + th.acc : "2px solid transparent", background: cfg.lang === l ? th.acc + "22" : "transparent", color: th.text, cursor: "pointer", fontSize: 16 } }, l === "de" ? "DE Deutsch" : "EN English");
      })
    );
  }

  return React.createElement(Modal, { open: open, onClose: onClose, title: t.settings, th: th },
    React.createElement("div", { style: { display: "flex", gap: 4, marginBottom: 16 } },
      tabs.map(function(k) { return React.createElement("button", { key: k, onClick: function() { setTab(k); }, style: { flex: 1, padding: "8px 4px", borderRadius: 8, border: tab === k ? "2px solid " + th.acc : "2px solid transparent", background: tab === k ? th.acc + "22" : "transparent", color: th.text, cursor: "pointer", fontSize: 13 } }, icons[k]); })
    ),
    content
  );
}

function PerformMode(props) {
  var parts = props.parts, cfg = props.cfg, onExit = props.onExit;
  var pt = PTH[cfg.perfTheme] || PTH.dark;
  var t = T[cfg.lang] || T.de;
  var _cd = useState(cfg.countdown > 0 ? cfg.countdown : 0); var cdVal = _cd[0]; var setCdVal = _cd[1];
  var _cdr = useState(cfg.countdown > 0); var cdRunning = _cdr[0]; var setCdRunning = _cdr[1];
  var _i = useState(0); var idx = _i[0]; var setIdx = _i[1];
  var _e = useState(0); var elapsed = _e[0]; var setElapsed = _e[1];
  var _p = useState(false); var paused = _p[0]; var setPaused = _p[1];
  var _n = useState(false); var showNotes = _n[0]; var setShowNotes = _n[1];
  var _a = useState(false); var preAnnDone = _a[0]; var setPreAnnDone = _a[1];
  var _ps = useState(0); var pauseSecs = _ps[0]; var setPauseSecs = _ps[1];
  var pauseRef = useRef(null);
  var _pa = useState(""); var preAnnMsg = _pa[0]; var setPreAnnMsg = _pa[1];
  var _sz = useState(cfg.performSize || "XL"); var perfSize = _sz[0]; var setPerfSize = _sz[1];
  var _sl = useState(false); var showSetlist = _sl[0]; var setShowSetlist = _sl[1];
  var _cs = useState(false); var confirmStop = _cs[0]; var setConfirmStop = _cs[1];
  var sizeMap = { XXL: { timer: 240, title: 36 }, XL: { timer: 120, title: 22 }, M: { timer: 72, title: 18 }, S: { timer: 44, title: 15 } };
  var wakeLockRef = useRef(null);
  var isDragging = useRef(false);
  var timerRef = useRef(null);

  useEffect(function() {
    var acquire = function() { if (navigator.wakeLock) { navigator.wakeLock.request("screen").then(function(wl) { wakeLockRef.current = wl; }).catch(function() {}); } };
    acquire();
    var onVis = function() { if (document.visibilityState === "visible") acquire(); };
    document.addEventListener("visibilitychange", onVis);
    return function() { if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; } document.removeEventListener("visibilitychange", onVis); };
  }, []);

  if (parts.length === 0) { onExit(); return null; }

  var szCfg = sizeMap[perfSize] || sizeMap["XL"];
  var safeIdx = Math.min(idx, parts.length - 1);
  var part = parts[safeIdx];
  var dur = cfg.testMode ? cfg.testDur : part.duration;
  var remaining = Math.max(0, dur - elapsed);
  var pct = dur > 0 ? Math.min(100, (elapsed / dur) * 100) : 100;

  useEffect(function() {
    if (!cdRunning) return;
    if (cdVal <= 0) { setCdRunning(false); return; }
    var t2 = setTimeout(function() {
      if (cfg.beeps) doBeep(cfg.volume, 660, 80);
      setCdVal(function(v) { return v - 1; });
    }, 1000);
    return function() { clearTimeout(t2); };
  }, [cdRunning, cdVal]);

  useEffect(function() {
    clearInterval(timerRef.current);
    setElapsed(0); setPaused(false); setPreAnnDone(false);
    if (part && part.intro) doSpeak(part.intro, cfg.ttsRate, cfg.ttsPitch, cfg.ttsVoice);
  }, [idx]);

  useEffect(function() {
    clearInterval(timerRef.current);
    clearInterval(pauseRef.current);
    if (cdRunning) return;
    if (paused) {
      pauseRef.current = setInterval(function() { setPauseSecs(function(s) { return s + 1; }); }, 1000);
    } else {
      setPauseSecs(0);
      timerRef.current = setInterval(function() { setElapsed(function(p) { return p + 1; }); }, 1000);
    }
    return function() { clearInterval(timerRef.current); clearInterval(pauseRef.current); };
  }, [paused, idx, cdRunning]);

  useEffect(function() {
    if (remaining <= 0 && elapsed > 0) {
      if (cfg.beeps) doBeep(cfg.volume, 660, 300);
      if (cfg.vibrate) doVibrate(400);
      if (safeIdx < parts.length - 1) {
        setTimeout(function() { setIdx(function(i) { return i + 1; }); }, 1500);
      } else {
        setTimeout(onExit, 2000);
      }
    }
    if (!preAnnDone && part && part.preAnn > 0 && remaining <= part.preAnn && remaining > 0) {
      setPreAnnDone(true);
      if (part.preAnnText) doSpeak(part.preAnnText, cfg.ttsRate, cfg.ttsPitch, cfg.ttsVoice);
      if (part.preAnnText) { setPreAnnMsg(part.preAnnText); setTimeout(function() { setPreAnnMsg(""); }, 5000); }
      if (cfg.beeps) doBeep(cfg.volume, 440, 100);
      if (cfg.vibrate) doVibrate(100);
    }
  }, [elapsed]);

  var totalElapsed = parts.slice(0, safeIdx).reduce(function(a, p) { return a + (cfg.testMode ? cfg.testDur : p.duration); }, 0) + elapsed;
  var totalDur = parts.reduce(function(a, p) { return a + (cfg.testMode ? cfg.testDur : p.duration); }, 0);

  var seekTo = function(clientX, barEl) {
    var rect = barEl.getBoundingClientRect();
    var ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    var ne = Math.round(ratio * dur);
    setElapsed(ne);
    if (ne >= (dur - ((part && part.preAnn) || 0))) setPreAnnDone(true);
  };

  var handleBarMouseDown = function(ev) {
    isDragging.current = true;
    seekTo(ev.clientX, ev.currentTarget);
    var bar = ev.currentTarget;
    var onMove = function(e) { if (isDragging.current) seekTo(e.clientX, bar); };
    var onUp = function() { isDragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  var handleBarTouchStart = function(ev) {
    isDragging.current = true;
    seekTo(ev.touches[0].clientX, ev.currentTarget);
    var bar = ev.currentTarget;
    var onMove = function(e) { if (isDragging.current) seekTo(e.touches[0].clientX, bar); };
    var onEnd = function() { isDragging.current = false; window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
  };

  var bs = { padding: "12px 20px", borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 };
  var timerColor = remaining <= 10 && remaining > 0 ? "#ef4444" : remaining <= 30 && remaining > 0 ? "#f59e0b" : pt.timer;

  if (cdRunning && cdVal > 0) {
    return React.createElement("div", { style: { position: "fixed", inset: 0, background: pt.bg, color: pt.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 500 } },
      React.createElement("div", { style: { fontSize: 14, opacity: 0.6, marginBottom: 16 } }, cfg.lang === "de" ? "Show startet in..." : "Show starts in..."),
      React.createElement("div", { style: { fontSize: 140, fontWeight: 900, fontVariantNumeric: "tabular-nums" } }, cdVal),
      React.createElement("button", { onClick: function() { setCdRunning(false); setCdVal(0); }, style: { marginTop: 32, padding: "10px 24px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer" } }, cfg.lang === "de" ? "Abbrechen" : "Cancel")
    );
  }

  var setlistPanel = showSetlist ? React.createElement("div", { style: { position: "fixed", right: 0, top: 0, bottom: 0, width: 260, background: pt.bg, borderLeft: "2px solid " + (pt.barBg || "#333"), zIndex: 600, overflowY: "auto", padding: "16px 12px", boxShadow: "-4px 0 24px rgba(0,0,0,0.4)" } },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } },
      React.createElement("span", { style: { fontWeight: 700, fontSize: 15 } }, t.setlist),
      React.createElement("button", { onClick: function() { setShowSetlist(false); }, style: { background: "none", border: "none", color: pt.text, fontSize: 20, cursor: "pointer" } }, "\u2715")
    ),
    parts.map(function(p, i) {
      var partDur = cfg.testMode ? cfg.testDur : p.duration;
      var isCurrent = i === safeIdx;
      var isDone = i < safeIdx;
      return React.createElement("div", { key: p.id, onClick: function() { setIdx(i); setShowSetlist(false); }, style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 4, borderRadius: 10, cursor: "pointer", background: isCurrent ? (pt.bar + "33") : "transparent", borderLeft: "3px solid " + (isCurrent ? pt.bar : isDone ? "#22c55e" : "transparent"), opacity: isDone ? 0.5 : 1 } },
        React.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: p.color || pt.bar, flexShrink: 0 } }),
        React.createElement("div", { style: { flex: 1, minWidth: 0 } },
          React.createElement("div", { style: { fontSize: 13, fontWeight: isCurrent ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, (i + 1) + ". " + p.title),
          React.createElement("div", { style: { fontSize: 11, opacity: 0.6 } }, fmt(partDur))
        ),
        isCurrent ? React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: pt.bar } }, "\u25b6") : null,
        isDone ? React.createElement("div", { style: { fontSize: 11, color: "#22c55e" } }, "\u2713") : null
      );
    }),
    React.createElement("div", { style: { marginTop: 12, padding: "8px 10px", borderTop: "1px solid " + (pt.barBg || "#333"), fontSize: 12, opacity: 0.6 } }, t.total + ": " + fmt(totalDur))
  ) : null;

  return React.createElement("div", { style: { position: "fixed", inset: 0, background: "radial-gradient(ellipse at center, " + (part && part.color ? part.color + "0d" : "transparent") + " 0%, " + pt.bg + " 70%)", color: pt.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: cfg.fontFamily === "System" ? "-apple-system,sans-serif" : cfg.fontFamily, zIndex: 500, overflowY: "auto", padding: 12, boxSizing: "border-box" } },
    React.createElement("div", { style: { position: "absolute", top: 16, left: 16, fontSize: 13, opacity: 0.7 } }, t.partOf + " " + (safeIdx + 1) + t.of + parts.length),
    cfg.testMode ? React.createElement("div", { style: { position: "absolute", top: 16, right: 120, background: "#f59e0b", color: "#000", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 } }, "TEST") : null,
    React.createElement("div", { style: { display: "flex", gap: 6, position: "absolute", top: 16, right: 16 } },
      ["XXL", "XL", "M", "S"].map(function(sz) {
        return React.createElement("button", { key: sz, onClick: function() { setPerfSize(sz); }, style: { padding: "4px 10px", borderRadius: 8, border: perfSize === sz ? "2px solid " + pt.bar : "2px solid transparent", background: perfSize === sz ? pt.bar + "44" : "rgba(255,255,255,0.1)", color: pt.text, cursor: "pointer", fontSize: 12, fontWeight: perfSize === sz ? 700 : 400 } }, sz);
      })
    ),
    React.createElement("div", { style: { fontSize: szCfg.title, fontWeight: 600, marginBottom: 8, opacity: 0.8 } }, part ? part.title : ""),
    React.createElement("div", { style: { fontSize: szCfg.timer, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: timerColor, transition: "color 0.3s" } }, fmt(remaining)),
    React.createElement("div", { style: { width: "80%", maxWidth: 400, marginBottom: 6 } },
      React.createElement("div", { style: { fontSize: 11, opacity: 0.5, marginBottom: 3, textAlign: "center" } }, cfg.lang === "de" ? "Gesamt-Fortschritt" : "Overall Progress"),
      React.createElement("div", { style: { width: "100%", height: 5, borderRadius: 3, background: pt.barBg, overflow: "hidden" } },
        React.createElement("div", { style: { height: "100%", borderRadius: 3, background: pt.bar, width: (totalDur > 0 ? Math.min(100, (totalElapsed / totalDur) * 100) : 0) + "%", transition: cfg.animations ? "width 1s linear" : "none", opacity: 0.6 } })
      )
    ),
    React.createElement("div", { style: { width: "80%", maxWidth: 400, position: "relative", cursor: "pointer", padding: "8px 0", marginTop: 4, marginBottom: 24, userSelect: "none" }, onMouseDown: handleBarMouseDown, onTouchStart: handleBarTouchStart },
      React.createElement("style", null, "@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }"),
      React.createElement("div", { style: { width: "100%", height: 10, borderRadius: 5, background: pt.barBg, overflow: "hidden", boxShadow: remaining <= 10 && remaining > 0 ? "0 0 12px #ef444488" : "none" } },
        React.createElement("div", { style: { height: "100%", borderRadius: 4, background: remaining <= 10 && remaining > 0 ? "#ef4444" : remaining <= 30 && remaining > 0 ? "#f59e0b" : (part && part.color ? part.color : pt.bar), width: pct + "%", transition: cfg.animations ? "width 1s linear" : "none", animation: remaining <= 10 && remaining > 0 ? "pulse 0.8s ease-in-out infinite" : "none" } })
      ),
      React.createElement("div", { style: { position: "absolute", left: "calc(" + pct + "% - 7px)", top: 2, width: 14, height: 14, borderRadius: "50%", background: remaining <= 10 ? "#ef4444" : remaining <= 30 ? "#f59e0b" : (part && part.color ? part.color : pt.bar), border: "2px solid " + pt.text, boxShadow: "0 2px 6px rgba(0,0,0,0.3)", transition: cfg.animations ? "left 1s linear" : "none", pointerEvents: "none" } })
    ),
    preAnnMsg ? React.createElement("div", { style: { position: "fixed", top: 32, left: "50%", transform: "translateX(-50%)", background: "#f59e0b", color: "#000", padding: "14px 28px", borderRadius: 16, fontWeight: 800, fontSize: 18, zIndex: 600, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", textAlign: "center", maxWidth: 360 } }, "\u26a1 " + preAnnMsg) : null,
    showNotes && part && part.notes ? React.createElement("div", { style: { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 700, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", padding: "16px 20px 24px 20px", borderTop: "1px solid rgba(255,255,255,0.15)", maxHeight: "35vh", overflowY: "auto" } },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
        React.createElement("span", { style: { fontWeight: 700, fontSize: 14, opacity: 0.7 } }, t.notesL),
        React.createElement("button", { onClick: function() { setShowNotes(false); }, style: { background: "rgba(255,255,255,0.15)", border: "none", color: pt.text, fontSize: 18, cursor: "pointer", borderRadius: 8, padding: "4px 10px", lineHeight: 1 } }, "\u2715")
      ),
      React.createElement("div", { style: { fontSize: 16, whiteSpace: "pre-wrap", lineHeight: 1.5, color: pt.text } }, part.notes)
    ) : null,
    React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" } },
      React.createElement("button", { onClick: function() { if (safeIdx > 0) setIdx(function(i) { return i - 1; }); else setElapsed(0); }, style: Object.assign({}, bs, { background: "#6b7280" }) }, t.prev),
      React.createElement("button", { onClick: function() { setPaused(function(p) { return !p; }); }, style: Object.assign({}, bs, { background: paused ? "#22c55e" : "#eab308", minWidth: 110 }) }, paused ? ("\u25b6 " + fmt(pauseSecs)) : t.pause),
      React.createElement("button", { onClick: function() { if (safeIdx < parts.length - 1) setIdx(function(i) { return i + 1; }); }, style: Object.assign({}, bs, { background: "#6b7280" }) }, t.next),
      React.createElement("button", { onClick: function() { setShowNotes(function(p) { return !p; }); }, style: Object.assign({}, bs, { background: showNotes ? "#7c3aed" : "#8b5cf6" }) }, t.notesL),
      React.createElement("button", { onClick: function() { setShowSetlist(function(p) { return !p; }); }, style: Object.assign({}, bs, { background: showSetlist ? "#0369a1" : "#0ea5e9" }) }, t.setlist),
      React.createElement("button", { onClick: function() { if (!document.fullscreenElement) { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); } else { document.exitFullscreen && document.exitFullscreen(); } }, style: Object.assign({}, bs, { background: "#0ea5e9", fontSize: 18 }) }, "\u26f6"),
      React.createElement("button", { onClick: function() { setConfirmStop(true); }, style: Object.assign({}, bs, { background: "#ef4444" }) }, t.stop)
    ),
    confirmStop ? React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900 } },
      React.createElement("div", { style: { background: pt.bg === "#000000" ? "#1a1a1a" : pt.bg, color: pt.text, borderRadius: 16, padding: 28, maxWidth: 320, width: "90%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)" } },
        React.createElement("div", { style: { fontSize: 36, marginBottom: 12 } }, "\u23F9"),
        React.createElement("div", { style: { fontWeight: 700, fontSize: 18, marginBottom: 8 } }, cfg.lang === "de" ? "Show beenden?" : "End show?"),
        React.createElement("div", { style: { fontSize: 13, opacity: 0.7, marginBottom: 20 } }, cfg.lang === "de" ? "Der Timer wird gestoppt und du kehrst zur Planung zurück." : "The timer will stop and you'll return to the plan."),
        React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center" } },
          React.createElement("button", { onClick: function() { setConfirmStop(false); }, style: { flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: pt.text, fontWeight: 600, cursor: "pointer", fontSize: 14 } }, cfg.lang === "de" ? "Weiter" : "Continue"),
          React.createElement("button", { onClick: function() { setConfirmStop(false); onExit(); }, style: { flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 } }, cfg.lang === "de" ? "Beenden" : "End")
        )
      )
    ) : null,
    parts[safeIdx + 1] ? React.createElement("div", { style: { marginTop: 12, fontSize: 14, opacity: 0.55, fontStyle: "italic" } }, "\u23ed " + (cfg.lang === "de" ? "N\u00e4chster Teil" : "Next") + ": " + parts[safeIdx + 1].title) : null,
    React.createElement("div", { style: { marginTop: 8, fontSize: 12, opacity: 0.6 } }, t.total + ": " + fmt(totalElapsed) + " / " + fmt(totalDur)),
    setlistPanel
  );
}

function importCSV(text, onDone) {
  var clean = text.trim().replace(/\r/g, "");
  var lines = clean.split("\n");
  if (lines.length < 2) return;
  var rows = lines.slice(1);
  var imported = rows.map(function(row) {
    var sep = row.indexOf(";") >= 0 ? ";" : ",";
    var cols = row.split(sep);
    return { id: uid(), title: cols[0] || "?", duration: parseInt(cols[1]) || 60, intro: cols[2] || "", notes: cols[3] || "", preAnn: 10, preAnnText: "", color: COLORS[Math.floor(Math.random() * COLORS.length)] };
  }).filter(function(p) { return p.title && p.title !== "?"; });
  if (imported.length > 0) onDone(imported);
}

function exportCSV(parts, t) {
  var hdr = [t.titleL, t.durL, t.introL, t.notesL].join(";");
  var rows = parts.map(function(p) { return [p.title, p.duration, p.intro, p.notes].join(";"); });
  var csv = hdr + "\n" + rows.join("\n");
  var blob = new Blob([csv], { type: "text/csv" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "showrunner.csv";
  a.click();
}

function printSetlist(parts) {
  var total = parts.reduce(function(a, p) { return a + p.duration; }, 0);
  var rows = parts.map(function(p, i) {
    return "<tr><td>" + (i + 1) + "</td><td>" + p.title + "</td><td>" + fmt(p.duration) + "</td><td>" + (p.notes || "") + "</td></tr>";
  }).join("");
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Setlist</title><style>body{font-family:Arial,sans-serif;padding:32px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:8px 12px;border-bottom:1px solid #ddd;text-align:left}th{background:#f0f0f0}tfoot td{font-weight:700;border-top:2px solid #333}@media print{button{display:none}}</style></head><body><h1>Magic Showrunner</h1><table><thead><tr><th>#</th><th>Titel</th><th>Dauer</th><th>Notizen</th></tr></thead><tbody>' + rows + '</tbody><tfoot><tr><td colspan="2">Gesamt</td><td>' + fmt(total) + '</td><td></td></tr></tfoot></table><br><button onclick="window.print()">Drucken</button></body></html>';
  var w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

function exportPDF(parts, t) {
  var lines = ["MAGIC SHOWRUNNER - Export", ""];
  parts.forEach(function(p, i) {
    lines.push((i + 1) + ". " + p.title + " (" + fmt(p.duration) + ")");
    if (p.intro) lines.push("   Intro: " + p.intro);
    if (p.notes) lines.push("   " + t.notesL + ": " + p.notes);
    lines.push("");
  });
  var total = parts.reduce(function(a, p) { return a + p.duration; }, 0);
  lines.push("Gesamt: " + fmt(total));
  var blob = new Blob([lines.join("\n")], { type: "text/plain" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "showrunner.txt";
  a.click();
}

export default function App() {
  var _hist = useState([DEMO]); var history = _hist[0]; var setHistory = _hist[1];
  var _hidx = useState(0); var histIdx = _hidx[0]; var setHistIdx = _hidx[1];
  var parts = history[histIdx];
  var setParts = function(updater) {
    setHistory(function(h) {
      var cur = h[histIdx];
      var next = typeof updater === "function" ? updater(cur) : updater;
      var newH = h.slice(0, histIdx + 1).concat([next]);
      if (newH.length > 50) newH = newH.slice(newH.length - 50);
      return newH;
    });
    setHistIdx(function(i) { return Math.min(i + 1, 49); });
  };
  var canUndo = histIdx > 0;
  var canRedo = histIdx < history.length - 1;
  var doUndo = function() { if (canUndo) setHistIdx(function(i) { return i - 1; }); };
  var doRedo = function() { if (canRedo) setHistIdx(function(i) { return i + 1; }); };
  var _c = useState({ lang: "de", theme: (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"), perfTheme: "dark", beeps: true, vibrate: true, volume: 0.5, ttsVoice: "", ttsRate: 1, ttsPitch: 1, fontSize: 15, fontFamily: "System", animations: true, testMode: false, testDur: 5, countdown: 3, performSize: "XL" });
  var cfg = _c[0]; var setCfg = _c[1];
  var _ep = useState(null); var editPart = _ep[0]; var setEditPart = _ep[1];
  var _eo = useState(false); var editOpen = _eo[0]; var setEditOpen = _eo[1];
  var _so = useState(false); var saveOpen = _so[0]; var setSaveOpen = _so[1];
  var _lo = useState(false); var loadOpen = _lo[0]; var setLoadOpen = _lo[1];
  var _st = useState(false); var settOpen = _st[0]; var setSettOpen = _st[1];
  var _pf = useState(false); var performing = _pf[0]; var setPerforming = _pf[1];
  var _to = useState(""); var toast = _to[0]; var setToast = _to[1];
  var _di = useState(null); var dragIdx = _di[0]; var setDragIdx = _di[1];
  var _ex = useState(false); var exportOpen = _ex[0]; var setExportOpen = _ex[1];
  var csvInputRef = useRef(null);

  var t = T[cfg.lang] || T.de;
  var th = TH[cfg.theme] || TH.dark;
  var ff = cfg.fontFamily === "System" ? "-apple-system,BlinkMacSystemFont,sans-serif" : cfg.fontFamily;
  var totalSec = parts.reduce(function(a, p) { return a + p.duration; }, 0);

  var savePart = function(p) {
    setParts(function(prev) {
      var i = prev.findIndex(function(x) { return x.id === p.id; });
      if (i >= 0) { var n = prev.slice(); n[i] = p; return n; }
      return prev.concat([p]);
    });
    setToast(editPart ? t.edit + " OK" : t.newPart + " OK");
  };
  var delPart = function(id) { setParts(function(p) { return p.filter(function(x) { return x.id !== id; }); }); };
  var dupPart = function(p) { setParts(function(prev) { return prev.concat([Object.assign({}, p, { id: uid(), title: p.title + " (2)" })]); }); setToast(t.dup + " OK"); };

  var onDragStart = function(e, i) { setDragIdx(i); e.dataTransfer.effectAllowed = "move"; };
  var onDragOver = function(e, i) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    setParts(function(prev) { var n = prev.slice(); var item = n.splice(dragIdx, 1)[0]; n.splice(i, 0, item); return n; });
    setDragIdx(i);
  };
  var onDragEnd = function() { setDragIdx(null); };

  if (performing) return React.createElement(PerformMode, { parts: parts, cfg: cfg, onExit: function() { setPerforming(false); } });

  var bs = { padding: "8px 16px", borderRadius: 10, border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 };

  return React.createElement("div", { style: { minHeight: "100dvh", background: th.bg, color: th.text, fontFamily: ff, fontSize: cfg.fontSize, transition: cfg.animations ? "background 0.3s" : "none", overflowX: "hidden" } },
    React.createElement("div", { style: { maxWidth: 600, margin: "0 auto", padding: "16px 16px 24px 16px" } },
      React.createElement("div", { style: { textAlign: "center", marginBottom: 20, position: "relative" } },
        React.createElement("h1", { style: { margin: 0, fontSize: 24 } }, "Magic Showrunner"),
        React.createElement("div", { style: { fontSize: 11, color: th.sub } }, t.ver),
        React.createElement("button", {
          onClick: function() { setCfg(function(c) { if (c.theme === "light") { return Object.assign({}, c, { theme: c._prevTheme || "dark" }); } return Object.assign({}, c, { _prevTheme: c.theme, theme: "light" }); }); },
          title: cfg.theme === "light" ? "Dark Mode" : "Light Mode",
          style: { position: "absolute", top: 4, right: 0, background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: "4px 6px", borderRadius: 8, lineHeight: 1 }
        }, cfg.theme === "light" ? "\uD83C\uDF19" : "\u2600\uFE0F")
      ),
      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, alignItems: "center", marginBottom: 20 } },
        React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" } },
          React.createElement("button", { onClick: function() { setSaveOpen(true); }, style: Object.assign({}, bs, { background: th.acc }) }, t.save),
          React.createElement("button", { onClick: function() { setLoadOpen(true); }, style: Object.assign({}, bs, { background: th.acc }) }, t.load),
          React.createElement("button", { onClick: function() { setSettOpen(true); }, style: Object.assign({}, bs, { background: "#6b7280" }) }, t.settings),
          React.createElement("div", { style: { position: "relative" } },
            React.createElement("button", { onClick: function() { setExportOpen(function(o) { return !o; }); }, style: Object.assign({}, bs, { background: "#6b7280" }) }, "Export \u25be"),
            exportOpen ? React.createElement("div", { style: { position: "absolute", top: "110%", left: 0, background: th.card, border: "1px solid " + th.brd, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.3)", zIndex: 200, minWidth: 130, overflow: "hidden" } },
              React.createElement("button", { onClick: function() { exportCSV(parts, t); setExportOpen(false); }, style: { display: "block", width: "100%", padding: "10px 16px", border: "none", background: "transparent", color: th.text, cursor: "pointer", textAlign: "left", fontSize: 13 } }, "\ud83d\udcc4 CSV"),
              React.createElement("button", { onClick: function() { exportPDF(parts, t); setExportOpen(false); }, style: { display: "block", width: "100%", padding: "10px 16px", border: "none", background: "transparent", color: th.text, cursor: "pointer", textAlign: "left", fontSize: 13 } }, "\ud83d\udccb TXT"),
              React.createElement("hr", { style: { margin: "2px 0", border: "none", borderTop: "1px solid " + th.brd } }),
              React.createElement("button", { onClick: function() { setExportOpen(false); csvInputRef.current && csvInputRef.current.click(); }, style: { display: "block", width: "100%", padding: "10px 16px", border: "none", background: "transparent", color: th.text, cursor: "pointer", textAlign: "left", fontSize: 13 } }, "\ud83d\udce5 CSV Import"),
              React.createElement("hr", { style: { margin: "2px 0", border: "none", borderTop: "1px solid " + th.brd } }),
              React.createElement("button", { onClick: function() { printSetlist(parts); setExportOpen(false); }, style: { display: "block", width: "100%", padding: "10px 16px", border: "none", background: "transparent", color: th.text, cursor: "pointer", textAlign: "left", fontSize: 13 } }, "\ud83d\udda8\ufe0f Drucken")
            ) : null
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" } },
          React.createElement("button", { onClick: function() { setEditPart(null); setEditOpen(true); }, style: Object.assign({}, bs, { background: "#22c55e" }) }, t.newPart),
          React.createElement("button", { onClick: doUndo, disabled: !canUndo, title: "Undo", style: Object.assign({}, bs, { background: canUndo ? "#6b7280" : "#3f3f5c", opacity: canUndo ? 1 : 0.4, cursor: canUndo ? "pointer" : "not-allowed" }) }, "\u21a9\ufe0f"),
          React.createElement("button", { onClick: doRedo, disabled: !canRedo, title: "Redo", style: Object.assign({}, bs, { background: canRedo ? "#6b7280" : "#3f3f5c", opacity: canRedo ? 1 : 0.4, cursor: canRedo ? "pointer" : "not-allowed" }) }, "\u21aa\ufe0f")
        )
      ),
      React.createElement("input", { ref: csvInputRef, type: "file", accept: ".csv", style: { display: "none" }, onChange: function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) { importCSV(ev.target.result, function(imported) { setParts(imported); setToast("CSV Import OK"); }); };
        reader.readAsText(file);
        e.target.value = "";
      } }),
      React.createElement("div", { style: { textAlign: "center", marginBottom: 16, fontSize: 13, color: th.sub } }, parts.length + " " + t.parts + " | " + t.total + ": " + fmt(totalSec)),
      React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 } },
        React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" } },
          React.createElement("input", { type: "checkbox", checked: cfg.testMode, onChange: function(e) { setCfg(function(c) { return Object.assign({}, c, { testMode: e.target.checked }); }); } }),
          t.test
        )
      ),
      parts.map(function(p, i) {
        return React.createElement("div", {
          key: p.id,
          draggable: false,
          onDragOver: function(e) { e.preventDefault(); onDragOver(e, i); },
          onDrop: function(e) { e.preventDefault(); onDragEnd(); },
          style: { background: th.card, border: "1px solid " + th.brd, borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, borderLeft: "4px solid " + (p.color || th.acc), opacity: dragIdx === i ? 0.5 : 1 }
        },
          React.createElement("div", { draggable: true, onDragStart: function(e) { onDragStart(e, i); }, onDragEnd: onDragEnd, style: { fontSize: 18, color: th.sub, cursor: "grab", userSelect: "none", padding: "4px 6px", borderRadius: 6 } }, "\u22ee\u22ee"),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("div", { style: { fontWeight: 700, fontSize: 15 } }, p.title),
            React.createElement("div", { style: { fontSize: 12, color: th.sub } }, fmt(p.duration))
          ),
          React.createElement("div", { style: { display: "flex", gap: 4 } },
            React.createElement("button", { onClick: function() { setEditPart(p); setEditOpen(true); }, title: t.edit, style: { padding: "6px 10px", borderRadius: 8, border: "none", background: th.acc + "33", color: th.acc, cursor: "pointer", fontSize: 16 } }, "\u270f\ufe0f"),
            React.createElement("button", { onClick: function() { dupPart(p); }, title: t.dup, style: { padding: "6px 10px", borderRadius: 8, border: "none", background: "#8b5cf622", color: "#8b5cf6", cursor: "pointer", fontSize: 16 } }, "\u2398"),
            React.createElement("button", { onClick: function() { delPart(p.id); }, title: t.del, style: { padding: "6px 10px", borderRadius: 8, border: "none", background: "#ef444422", color: "#ef4444", cursor: "pointer", fontSize: 16 } }, "\u2715")
          )
        );
      }),
      React.createElement("div", { style: { display: "flex", justifyContent: "center", marginTop: 16 } },
        React.createElement("button", { onClick: function() { if (parts.length === 0) return; setPerforming(true); }, style: { padding: "14px 40px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 18, boxShadow: "0 4px 20px rgba(99,102,241,0.4)" } }, t.start)
      )
    ),
    React.createElement(PartEditor, { open: editOpen, part: editPart, onSave: savePart, onClose: function() { setEditOpen(false); setEditPart(null); }, t: t, th: th }),
    React.createElement(SaveModal, { open: saveOpen, onClose: function() { setSaveOpen(false); }, parts: parts, t: t, th: th, onToast: setToast }),
    React.createElement(LoadModal, { open: loadOpen, onClose: function() { setLoadOpen(false); }, onLoad: function(p) { setParts(p); setToast(t.load + " OK"); }, t: t, th: th }),
    React.createElement(SettingsModal, { open: settOpen, onClose: function() { setSettOpen(false); }, cfg: cfg, setCfg: setCfg, t: t, th: th }),
    toast ? React.createElement(Toast, { msg: toast, onDone: function() { setToast(""); } }) : null
  );
}
