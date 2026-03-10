import React, { useState, useEffect, useRef } from "react";

const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return m + ":" + String(sec).padStart(2, "0"); };

const T = {
  de: { title: "Magic Showrunner", ver: "v3.0", save: "Speichern", load: "Laden", newPart: "Neuer Teil", start: "Show starten", test: "Testmodus", parts: "Teile", total: "Gesamt", settings: "Einstellungen", planTheme: "Planungs-Theme", perfTheme: "Perform-Theme", beeps: "Signalt\u00f6ne", vibration: "Vibration", volume: "Lautst\u00e4rke", testTone: "Testton", testDur: "Testdauer/Teil", titleL: "Titel", durL: "Dauer (Sek)", introL: "Intro-Ansage", preAnnL: "Vorank\u00fcndigung (Sek)", preAnnTxt: "Vorank\u00fcndigungs-Text", notesL: "Notizen", colorL: "Farbe", saveBtn: "Speichern", cancel: "Abbrechen", showName: "Show-Name", overwrite: "\u00dcberschreiben", noSaved: "Keine Shows.", pause: "Pause", resume: "Weiter", prev: "Zur\u00fcck", next: "Weiter", partOf: "Teil", of: "/", dup: "Duplizieren", del: "L\u00f6schen", edit: "Bearbeiten", sek: "Sek", csv: "CSV", fontSize: "Gr\u00f6\u00dfe", fontFamily: "Schriftart", ttsVoice: "Stimme", ttsRate: "Tempo", ttsPitch: "Tonh\u00f6he", ttsPreview: "Vorschau", animations: "Animationen" },
  en: { title: "Magic Showrunner", ver: "v3.0", save: "Save", load: "Load", newPart: "New Part", start: "Start Show", test: "Test Mode", parts: "Parts", total: "Total", settings: "Settings", planTheme: "Plan Theme", perfTheme: "Perform Theme", beeps: "Beeps", vibration: "Vibration", volume: "Volume", testTone: "Test Tone", testDur: "Test dur/part", titleL: "Title", durL: "Duration (sec)", introL: "Intro (TTS)", preAnnL: "Pre-announce (sec)", preAnnTxt: "Pre-announce text", notesL: "Notes", colorL: "Color", saveBtn: "Save", cancel: "Cancel", showName: "Show Name", overwrite: "Overwrite", noSaved: "No saved shows.", pause: "Pause", resume: "Resume", prev: "Back", next: "Next", partOf: "Part", of: "/", dup: "Duplicate", del: "Delete", edit: "Edit", sek: "sec", csv: "CSV", fontSize: "Size", fontFamily: "Font family", ttsVoice: "Voice", ttsRate: "Speed", ttsPitch: "Pitch", ttsPreview: "Preview", animations: "Animations" }
};

const TH = {
  light: { label: "Light", bg: "#f8fafc", card: "#fff", text: "#1e293b", sub: "#64748b", acc: "#4f46e5", brd: "#e2e8f0", inp: "#f1f5f9" },
  dark: { label: "Dark", bg: "#1e1e2e", card: "#2a2a3c", text: "#e2e8f0", sub: "#94a3b8", acc: "#6366f1", brd: "#3f3f5c", inp: "#33334d" },
  midnight: { label: "Midnight", bg: "#0f0f23", card: "#1a1a35", text: "#c4b5fd", sub: "#7c6fae", acc: "#7c3aed", brd: "#2e2e52", inp: "#25254a" },
  ember: { label: "Ember", bg: "#1c1410", card: "#2a1f18", text: "#fde68a", sub: "#d97706", acc: "#ea580c", brd: "#44392e", inp: "#332a20" }
};
const PTH = {
  light: { bg: "#fff", text: "#111827", timer: "#1e293b", bar: "#4f46e5", barBg: "#e2e8f0" },
  dark: { bg: "#111827", text: "#f1f5f9", timer: "#e2e8f0", bar: "#6366f1", barBg: "#374151" },
  black: { bg: "#000", text: "#fff", timer: "#fff", bar: "#8b5cf6", barBg: "#1f1f1f" }
};
const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];
const DEMO = [
  { id: uid(), title: "Begr\u00fc\u00dfung", duration: 60, intro: "Willkommen!", preAnn: 10, preAnnText: "Gleich weiter", notes: "Publikum begr\u00fc\u00dfen", color: COLORS[0] },
  { id: uid(), title: "Kartentrick", duration: 180, intro: "Ein Kartentrick", preAnn: 15, preAnnText: "N\u00e4chster Trick", notes: "Pik-Ass", color: COLORS[1] },
  { id: uid(), title: "Mentalmagie", duration: 240, intro: "Mysteri\u00f6s", preAnn: 20, preAnnText: "Finale naht", notes: "Umschlag", color: COLORS[5] },
  { id: uid(), title: "Finale", duration: 120, intro: "Das Finale!", preAnn: 10, preAnnText: "", notes: "Konfetti", color: COLORS[3] }
];

function doBeep(vol, freq, ms) { try { const c = new (window.AudioContext || window.webkitAudioContext)(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = freq || 880; g.gain.value = vol || 0.5; o.start(); o.stop(c.currentTime + (ms || 150) / 1000); } catch (e) {} }
function doVibrate(ms) { try { navigator.vibrate && navigator.vibrate(ms || 200); } catch (e) {} }
function doSpeak(text, rate, pitch, uri) { if (!text || !window.speechSynthesis) return; const u = new SpeechSynthesisUtterance(text); u.rate = rate || 1; u.pitch = pitch || 1; if (uri) { const v = speechSynthesis.getVoices().find(function (x) { return x.voiceURI === uri; }); if (v) u.voice = v; } speechSynthesis.speak(u); }

function Modal(props) {
  if (!props.open) return null;
  return (
    React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }, onClick: props.onClose },
      React.createElement("div", { onClick: function (e) { e.stopPropagation(); }, style: { background: props.th.card, color: props.th.text, borderRadius: 16, padding: 24, minWidth: 320, maxWidth: 480, maxHeight: "80vh", overflow: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" } },
        React.createElement("h3", { style: { marginTop: 0 } }, props.title),
        props.children
      )
    )
  );
}

function Toast(props) {
  useEffect(function () { var t = setTimeout(props.onDone, 2200); return function () { clearTimeout(t); }; }, []);
  if (!props.msg) return null;
  return (
    React.createElement("div", { style: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 24px", borderRadius: 12, zIndex: 9999, fontSize: 14 } }, props.msg)
  );
}

function PartEditor(props) {
  var open = props.open, part = props.part, onSave = props.onSave, onClose = props.onClose, t = props.t, th = props.th;
  var _s = useState(part || { title: "", duration: 120, intro: "", preAnn: 10, preAnnText: "", notes: "", color: COLORS[0] });
  var f = _s[0], setF = _s[1];
  useEffect(function () { setF(part || { title: "", duration: 120, intro: "", preAnn: 10, preAnnText: "", notes: "", color: COLORS[0] }); }, [part, open]);
  var up = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
  var is = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid " + th.brd, background: th.inp, color: th.text, marginBottom: 8, boxSizing: "border-box" };
  if (!open) return null;
  return (
    React.createElement(Modal, { open: open, onClose: onClose, title: part ? t.edit : t.newPart, th: th },
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.titleL),
      React.createElement("input", { style: is, value: f.title, onChange: function (e) { up("title", e.target.value); } }),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.durL),
      React.createElement("input", { style: is, type: "number", min: 1, value: f.duration, onChange: function (e) { up("duration", +e.target.value); } }),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.introL),
      React.createElement("input", { style: is, value: f.intro, onChange: function (e) { up("intro", e.target.value); } }),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.preAnnL),
      React.createElement("input", { style: is, type: "number", min: 0, value: f.preAnn, onChange: function (e) { up("preAnn", +e.target.value); } }),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.preAnnTxt),
      React.createElement("input", { style: is, value: f.preAnnText, onChange: function (e) { up("preAnnText", e.target.value); } }),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.notesL),
      React.createElement("textarea", { style: Object.assign({}, is, { minHeight: 50 }), value: f.notes, onChange: function (e) { up("notes", e.target.value); } }),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.colorL),
      React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" } },
        COLORS.map(function (c) { return React.createElement("div", { key: c, onClick: function () { up("color", c); }, style: { width: 28, height: 28, borderRadius: 8, background: c, cursor: "pointer", border: f.color === c ? "3px solid #fff" : "3px solid transparent" } }); })
      ),
      React.createElement("div", { style: { display: "flex", gap: 8 } },
        React.createElement("button", { onClick: function () { if (!f.title) return; onSave(Object.assign({}, f, { id: f.id || uid() })); onClose(); }, style: { flex: 1, padding: 10, borderRadius: 10, border: "none", background: th.acc, color: "#fff", fontWeight: 700, cursor: "pointer" } }, t.saveBtn),
        React.createElement("button", { onClick: onClose, style: { flex: 1, padding: 10, borderRadius: 10, border: "1px solid " + th.brd, background: "transparent", color: th.text, cursor: "pointer" } }, t.cancel)
      )
    )
  );
}

function SaveModal(props) {
  var open = props.open, onClose = props.onClose, parts = props.parts, t = props.t, th = props.th, onToast = props.onToast;
  var _n = useState(""), name = _n[0], setName = _n[1];
  var _sv = useState([]), saves = _sv[0], setSaves = _sv[1];
  useEffect(function () { if (open) setSaves(JSON.parse(localStorage.getItem("ms3_shows") || "[]")); }, [open]);
  if (!open) return null;
  var doSave = function () {
    if (!name.trim()) return;
    var s = JSON.parse(localStorage.getItem("ms3_shows") || "[]");
    var idx = s.findIndex(function (x) { return x.name === name; });
    var entry = { name: name, parts: parts, date: new Date().toISOString() };
    if (idx >= 0) s[idx] = entry; else s.push(entry);
    localStorage.setItem("ms3_shows", JSON.stringify(s));
    onToast(t.save + " \u2713"); onClose();
  };
  return (
    React.createElement(Modal, { open: open, onClose: onClose, title: "\ud83d\udcbe " + t.save, th: th },
      React.createElement("input", { style: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid " + th.brd, background: th.inp, color: th.text, marginBottom: 8, boxSizing: "border-box" }, placeholder: t.showName, value: name, onChange: function (e) { setName(e.target.value); } }),
      saves.length > 0 && React.createElement("div", { style: { marginBottom: 8, fontSize: 12, color: th.sub } }, t.overwrite + ":"),
      saves.map(function (s) { return React.createElement("div", { key: s.name, onClick: function () { setName(s.name); }, style: { padding: "6px 10px", background: name === s.name ? th.acc + "22" : "transparent", borderRadius: 8, cursor: "pointer", fontSize: 13, color: th.text, marginBottom: 2 } }, s.name, " (", s.parts.length, " ", t.parts, ")"); }),
      React.createElement("button", { onClick: doSave, style: { marginTop: 8, width: "100%", padding: 10, borderRadius: 10, border: "none", background: th.acc, color: "#fff", fontWeight: 700, cursor: "pointer" } }, t.saveBtn)
    )
  );
}

function LoadModal(props) {
  var open = props.open, onClose = props.onClose, onLoad = props.onLoad, t = props.t, th = props.th;
  var _sv = useState([]), saves = _sv[0], setSaves = _sv[1];
  useEffect(function () { if (open) setSaves(JSON.parse(localStorage.getItem("ms3_shows") || "[]")); }, [open]);
  if (!open) return null;
  return (
    React.createElement(Modal, { open: open, onClose: onClose, title: "\ud83d\udcc2 " + t.load, th: th },
      saves.length === 0 && React.createElement("p", { style: { color: th.sub } }, t.noSaved),
      saves.map(function (s) {
        return React.createElement("div", { key: s.name, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 8, marginBottom: 4, background: th.inp } },
          React.createElement("div", null,
            React.createElement("div", { style: { fontWeight: 600, fontSize: 14 } }, s.name),
            React.createElement("div", { style: { fontSize: 11, color: th.sub } }, s.parts.length, " ", t.parts)
          ),
          React.createElement("button", { onClick: function () { onLoad(s.parts); onClose(); }, style: { padding: "6px 14px", borderRadius: 8, border: "none", background: th.acc, color: "#fff", cursor: "pointer", fontWeight: 600 } }, "\ud83d\udcc2")
        );
      })
    )
  );
}

function SettingsModal(props) {
  var open = props.open, onClose = props.onClose, cfg = props.cfg, setCfg = props.setCfg, t = props.t, th = props.th;
  var _t = useState("design"), tab = _t[0], setTab = _t[1];
  var _v = useState([]), voices = _v[0], setVoices = _v[1];
  useEffect(function () { var ld = function () { setVoices((speechSynthesis && speechSynthesis.getVoices()) || []); }; ld(); if (speechSynthesis) speechSynthesis.addEventListener("voiceschanged", ld); return function () { if (speechSynthesis) speechSynthesis.removeEventListener("voiceschanged", ld); }; }, []);
  var is = { width: "100%", padding: 8, borderRadius: 8, border: "1px solid " + th.brd, background: th.inp, color: th.text, marginBottom: 8, boxSizing: "border-box" };
  if (!open) return null;
  var tabs = ["design", "audio", "voice", "font", "lang"];
  var icons = { design: "\ud83c\udfa8", audio: "\ud83d\udd0a", voice: "\ud83d\udde3", font: "\ud83d\udd24", lang: "\ud83c\udf10" };
  var upCfg = function (k, v) { setCfg(function (c) { var n = Object.assign({}, c); n[k] = v; return n; }); };
  var content = null;
  if (tab === "design") {
    content = React.createElement("div", null,
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.planTheme),
      React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 } },
        Object.keys(TH).map(function (k) { return React.createElement("button", { key: k, onClick: function () { upCfg("theme", k); }, style: { padding: "8px 14px", borderRadius: 8, border: cfg.theme === k ? "2px solid " + th.acc : "2px solid transparent", background: TH[k].card, color: TH[k].text, cursor: "pointer", fontSize: 12 } }, TH[k].label); })
      ),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.perfTheme),
      React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12 } },
        Object.keys(PTH).map(function (k) { return React.createElement("button", { key: k, onClick: function () { upCfg("perfTheme", k); }, style: { padding: "8px 14px", borderRadius: 8, border: cfg.perfTheme === k ? "2px solid " + th.acc : "2px solid transparent", background: PTH[k].bg, color: PTH[k].text, cursor: "pointer", fontSize: 12, textTransform: "capitalize" } }, k); })
      ),
      React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" } },
        React.createElement("input", { type: "checkbox", checked: cfg.animations, onChange: function (e) { upCfg("animations", e.target.checked); } }), t.animations
      )
    );
  } else if (tab === "audio") {
    content = React.createElement("div", null,
      React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 8, cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: cfg.beeps, onChange: function (e) { upCfg("beeps", e.target.checked); } }), t.beeps),
      React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 8, cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: cfg.vibrate, onChange: function (e) { upCfg("vibrate", e.target.checked); } }), t.vibration),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.volume),
      React.createElement("input", { type: "range", min: 0, max: 1, step: 0.1, value: cfg.volume, onChange: function (e) { upCfg("volume", +e.target.value); }, style: { width: "100%", marginBottom: 8 } }),
      React.createElement("button", { onClick: function () { doBeep(cfg.volume); }, style: { padding: "8px 16px", borderRadius: 8, border: "none", background: th.acc, color: "#fff", cursor: "pointer" } }, t.testTone),
      React.createElement("div", { style: { marginTop: 12 } },
        React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.testDur, " (", t.sek, ")"),
        React.createElement("input", { type: "number", min: 3, max: 30, value: cfg.testDur, onChange: function (e) { upCfg("testDur", +e.target.value); }, style: is })
      )
    );
  } else if (tab === "voice") {
    content = React.createElement("div", null,
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.ttsVoice),
      React.createElement("select", { value: cfg.ttsVoice, onChange: function (e) { upCfg("ttsVoice", e.target.value); }, style: is },
        React.createElement("option", { value: "" }, "Default"),
        voices.map(function (v) { return React.createElement("option", { key: v.voiceURI, value: v.voiceURI }, v.name + " (" + v.lang + ")"); })
      ),
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.ttsRate),
      React.createElement("input", { type: "range", min: 0.5, max: 2, step: 0.1, value: cfg.ttsRate, onChange: function (e) { upCfg("ttsRate", +e.target.value); }, style: { width: "100%" } }),
      React.createElement("span", { style: { fontSize: 11, color: th.sub } }, cfg.ttsRate),
      React.createElement("label", { style: { fontSize: 12, color: th.sub, marginTop: 8, display: "block" } }, t.ttsPitch),
      React.createElement("input", { type: "range", min: 0.5, max: 2, step: 0.1, value: cfg.ttsPitch, onChange: function (e) { upCfg("ttsPitch", +e.target.value); }, style: { width: "100%" } }),
      React.createElement("span", { style: { fontSize: 11, color: th.sub } }, cfg.ttsPitch),
      React.createElement("button", { onClick: function () { doSpeak("Test 1 2 3", cfg.ttsRate, cfg.ttsPitch, cfg.ttsVoice); }, style: { marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "none", background: th.acc, color: "#fff", cursor: "pointer" } }, t.ttsPreview)
    );
  } else if (tab === "font") {
    content = React.createElement("div", null,
      React.createElement("label", { style: { fontSize: 12, color: th.sub } }, t.fontSize),
      React.createElement("input", { type: "range", min: 12, max: 24, value: cfg.fontSize, onChange: function (e) { upCfg("fontSize", +e.target.value); }, style: { width: "100%" } }),
      React.createElement("span", { style: { fontSize: 11, color: th.sub } }, cfg.fontSize + "px"),
      React.createElement("label", { style: { fontSize: 12, color: th.sub, marginTop: 8, display: "block" } }, t.fontFamily),
      React.createElement("select", { value: cfg.fontFamily, onChange: function (e) { upCfg("fontFamily", e.target.value); }, style: is },
        ["System", "Arial", "Georgia", "Courier New", "Verdana"].map(function (f) { return React.createElement("option", { key: f, value: f }, f); })
      )
    );
  } else {
    content = React.createElement("div", { style: { display: "flex", gap: 8 } },
      ["de", "en"].map(function (l) { return React.createElement("button", { key: l, onClick: function () { upCfg("lang", l); }, style: { flex: 1, padding: 12, borderRadius: 10, border: cfg.lang === l ? "2px solid " + th.acc : "2px solid transparent", background: cfg.lang === l ? th.acc + "22" : "transparent", color: th.text, cursor: "pointer", fontSize: 16 } }, l === "de" ? "DE Deutsch" : "EN English"); })
    );
  }
  return (
    React.createElement(Modal, { open: open, onClose: onClose, title: "\u2699\ufe0f " + t.settings, th: th },
      React.createElement("div", { style: { display: "flex", gap: 4, marginBottom: 16 } },
        tabs.map(function (k) { return React.createElement("button", { key: k, onClick: function () { setTab(k); }, style: { flex: 1, padding: "8px 4px", borderRadius: 8, border: tab === k ? "2px solid " + th.acc : "2px solid transparent", background: tab === k ? th.acc + "22" : "transparent", color: th.text, cursor: "pointer", fontSize: 16 } }, icons[k]); })
      ),
      content
    )
  );
}

function PerformMode(props) {
  var parts = props.parts, cfg = props.cfg, onExit = props.onExit;
  var pt = PTH[cfg.perfTheme] || PTH.dark;
  var t = T[cfg.lang] || T.de;
  var _i = useState(0), idx = _i[0], setIdx = _i[1];
  var _e = useState(0), elapsed = _e[0], setElapsed = _e[1];
  var _p = useState(false), paused = _p[0], setPaused = _p[1];
  var _n = useState(false), showNotes = _n[0], setShowNotes = _n[1];
  var _a = useState(false), preAnnDone = _a[0], setPreAnnDone = _a[1];
  var timerRef = useRef(null);
  var part = parts[idx];
  var dur = cfg.testMode ? cfg.testDur : part.duration;
  var remaining = Math.max(0, dur - elapsed);
  var pct = dur > 0 ? Math.min(100, (elapsed / dur) * 100) : 100;

  useEffect(function () { setElapsed(0); setPaused(false); setPreAnnDone(false); if (part && part.intro) doSpeak(part.intro, cfg.ttsRate, cfg.ttsPitch, cfg.ttsVoice); }, [idx]);
  useEffect(function () { if (paused) return; timerRef.current = setInterval(function () { setElapsed(function (p) { return p + 1; }); }, 1000); return function () { clearInterval(timerRef.current); }; }, [paused, idx]);
  useEffect(function () {
    if (remaining <= 0 && elapsed > 0) { if (cfg.beeps) doBeep(cfg.volume, 660, 300); if (cfg.vibrate) doVibrate(400); if (idx < parts.length - 1) setTimeout(function () { setIdx(function (i) { return i + 1; }); }, 1500); else setTimeout(onExit, 2000); }
    if (!preAnnDone && part && part.preAnn > 0 && remaining <= part.preAnn && remaining > 0) { setPreAnnDone(true); if (part.preAnnText) doSpeak(part.preAnnText, cfg.ttsRate, cfg.ttsPitch, cfg.ttsVoice); if (cfg.beeps) doBeep(cfg.volume, 440, 100); if (cfg.vibrate) doVibrate(100); }
  }, [elapsed]);

  var totalElapsed = parts.slice(0, idx).reduce(function (a, p) { return a + (cfg.testMode ? cfg.testDur : p.duration); }, 0) + elapsed;
  var totalDur = parts.reduce(function (a, p) { return a + (cfg.testMode ? cfg.testDur : p.duration); }, 0);
  var bs = { padding: "12px 20px", borderRadius: 12, border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 };

  return (
    React.createElement("div", { style: { position: "fixed", inset: 0, background: pt.bg, color: pt.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: cfg.fontFamily === "System" ? "-apple-system,sans-serif" : cfg.fontFamily, zIndex: 500 } },
      React.createElement("div", { style: { position: "absolute", top: 16, left: 16, fontSize: 13, opacity: 0.7 } }, t.partOf, " ", idx + 1, t.of, parts.length),
      cfg.testMode && React.createElement("div", { style: { position: "absolute", top: 16, right: 16, background: "#f59e0b", color: "#000", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 } }, "TEST"),
      React.createElement("div", { style: { fontSize: 18, fontWeight: 600, marginBottom: 8, opacity: 0.8 } }, part && part.title),
      React.createElement("div", { style: { fontSize: Math.min(120, cfg.fontSize * 5), fontWeight: 800, fontVariantNumeric: "tabular-nums", color: remaining <= 10 && remaining > 0 ? "#ef4444" : pt.timer, transition: "color 0.3s" } }, fmt(remaining)),
      React.createElement("div", { style: { width: "80%", maxWidth: 400, height: 8, borderRadius: 4, background: pt.barBg, marginTop: 16, marginBottom: 24, overflow: "hidden" } },
        React.createElement("div", { style: { height: "100%", borderRadius: 4, background: remaining <= 10 ? "#ef4444" : pt.bar, width: pct + "%", transition: cfg.animations ? "width 1s linear" : "none" } })
      ),
      showNotes && part && part.notes && React.createElement("div", { style: { background: "rgba(0,0,0,0.2)", padding: "12px 20px", borderRadius: 12, marginBottom: 16, maxWidth: 400, fontSize: 14, textAlign: "center" } }, part.notes),
      React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" } },
        React.createElement("button", { onClick: function () { if (idx > 0) setIdx(function (i) { return i - 1; }); else setElapsed(0); }, style: Object.assign({}, bs, { background: "#6b7280" }) }, t.prev),
        React.createElement("button", { onClick: function () { setPaused(function (p) { return !p; }); }, style: Object.assign({}, bs, { background: paused ? "#22c55e" : "#eab308" }) }, paused ? "\u25b6 " + t.resume : "\u23f8 " + t.pause),
        React.createElement("button", { onClick: function () { if (idx < parts.length - 1) setIdx(function (i) { return i + 1; }); }, style: Object.assign({}, bs, { background: "#6b7280" }) }, t.next),
        React.createElement("button", { onClick: function () { setShowNotes(function (p) { return !p; }); }, style: Object.assign({}, bs, { background: "#8b5cf6" }) }, "\ud83d\udcdd"),
        React.createElement("button", { onClick: onExit, style: Object.assign({}, bs, { background: "#ef4444" }) }, "\u23f9")
      ),
      React.createElement("div", { style: { marginTop: 20, fontSize: 12, opacity: 0.6 } }, t.total, ": ", fmt(totalElapsed), " / ", fmt(totalDur))
    )
  );
}

function exportCSV(parts, t) {
  var hdr = [t.titleL, t.durL, t.introL, t.notesL].join(";");
  var rows = parts.map(function (p) { return [p.title, p.duration, p.intro, p.notes].join(";"); });
  var csv = hdr + "\n" + rows.join("\n");
  var blob = new Blob([csv], { type: "text/csv" });
  var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "showrunner.csv"; a.click();
}

export default function App() {
  var _p = useState(DEMO), parts = _p[0], setParts = _p[1];
  var _c = useState({ lang: "de", theme: "dark", perfTheme: "dark", beeps: true, vibrate: true, volume: 0.5, ttsVoice: "", ttsRate: 1, ttsPitch: 1, fontSize: 15, fontFamily: "System", animations: true, testMode: false, testDur: 5 }), cfg = _c[0], setCfg = _c[1];
  var _ep = useState(null), editPart = _ep[0], setEditPart = _ep[1];
  var _eo = useState(false), editOpen = _eo[0], setEditOpen = _eo[1];
  var _so = useState(false), saveOpen = _so[0], setSaveOpen = _so[1];
  var _lo = useState(false), loadOpen = _lo[0], setLoadOpen = _lo[1];
  var _st = useState(false), settOpen = _st[0], setSettOpen = _st[1];
  var _pf = useState(false), performing = _pf[0], setPerforming = _pf[1];
  var _to = useState(""), toast = _to[0], setToast = _to[1];
  var _di = useState(null), dragIdx = _di[0], setDragIdx = _di[1];

  var t = T[cfg.lang] || T.de;
  var th = TH[cfg.theme] || TH.dark;
  var ff = cfg.fontFamily === "System" ? "-apple-system,BlinkMacSystemFont,sans-serif" : cfg.fontFamily;
  var totalSec = parts.reduce(function (a, p) { return a + p.duration; }, 0);

  var savePart = function (p) {
    setParts(function (prev) {
      var i = prev.findIndex(function (x) { return x.id === p.id; });
      if (i >= 0) { var n = prev.slice(); n[i] = p; return n; }
      return prev.concat([p]);
    });
    setToast(editPart ? t.edit + " \u2713" : t.newPart + " \u2713");
  };
  var delPart = function (id) { setParts(function (p) { return p.filter(function (x) { return x.id !== id; }); }); };
  var dupPart = function (p) { setParts(function (prev) { return prev.concat([Object.assign({}, p, { id: uid(), title: p.title + " (2)" })]); }); setToast(t.dup + " \u2713"); };

  var onDragStart = function (e, i) { setDragIdx(i); e.dataTransfer.effectAllowed = "move"; };
  var onDragOver = function (e, i) { e.preventDefault(); if (dragIdx === null || dragIdx === i) return; setParts(function (prev) { var n = prev.slice(); var item = n.splice(dragIdx, 1)[0]; n.splice(i, 0, item); return n; }); setDragIdx(i); };
  var onDragEnd = function () { setDragIdx(null); };

  if (performing) return React.createElement(PerformMode, { parts: parts, cfg: cfg, onExit: function () { setPerforming(false); } });

  var bs = { padding: "8px 16px", borderRadius: 10, border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 };

  return (
    React.createElement("div", { style: { minHeight: "100vh", background: th.bg, color: th.text, fontFamily: ff, fontSize: cfg.fontSize, transition: cfg.animations ? "background 0.3s" : "none" } },
      React.createElement("div", { style: { maxWidth: 600, margin: "0 auto", padding: "20px 16px" } },
        React.createElement("div", { style: { textAlign: "center", marginBottom: 20 } },
          React.createElement("h1", { style: { margin: 0, fontSize: 24 } }, "\ud83c\udfa9\u2728 ", t.title),
          React.createElement("div", { style: { fontSize: 11, color: th.sub } }, t.ver)
        ),
        React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 } },
          React.createElement("button", { onClick: function () { setSaveOpen(true); }, style: Object.assign({}, bs, { background: th.acc }) }, "\ud83d\udcbe ", t.save),
          React.createElement("button", { onClick: function () { setLoadOpen(true); }, style: Object.assign({}, bs, { background: th.acc }) }, "\ud83d\udcc2 ", t.load),
          React.createElement("button", { onClick: function () { setSettOpen(true); }, style: Object.assign({}, bs, { background: "#6b7280" }) }, "\u2699\ufe0f"),
          React.createElement("button", { onClick: function () { setEditPart(null); setEditOpen(true); }, style: Object.assign({}, bs, { background: "#22c55e" }) }, "\u2795"),
          React.createElement("button", { onClick: function () { exportCSV(parts, t); }, style: Object.assign({}, bs, { background: "#6b7280" }) }, "\ud83d\udcca ", t.csv)
        ),
        React.createElement("div", { style: { textAlign: "center", marginBottom: 16, fontSize: 13, color: th.sub } }, parts.length, " ", t.parts, " \u00b7 ", t.total, ": ", fmt(totalSec)),
        React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 } },
          React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" } },
            React.createElement("input", { type: "checkbox", checked: cfg.testMode, onChange: function (e) { setCfg(function (c) { return Object.assign({}, c, { testMode: e.target.checked }); }); } }),
            "\ud83e\uddea ", t.test
          )
        ),
        parts.map(function (p, i) {
          return React.createElement("div", {
            key: p.id, draggable: true,
            onDragStart: function (e) { onDragStart(e, i); },
            onDragOver: function (e) { onDragOver(e, i); },
            onDragEnd: onDragEnd,
            style: { background: th.card, border: "1px solid " + th.brd, borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12, cursor: "grab", borderLeft: "4px solid " + (p.color || th.acc), opacity: dragIdx === i ? 0.5 : 1, transition: cfg.animations ? "opacity 0.2s" : "none" }
          },
            React.createElement("div", { style: { fontSize: 18, color: th.sub, cursor: "grab", userSelect: "none" } }, "\u2630"),
            React.createElement("div", { style: { flex: 1 } },
              React.createElement("div", { style: { fontWeight: 700, fontSize: 15 } }, p.title),
              React.createElement("div", { style: { fontSize: 12, color: th.sub } }, fmt(p.duration), " \u00b7 ", p.intro ? "\ud83d\udde3" : "", " ", p.notes ? "\ud83d\udcdd" : "")
            ),
            React.createElement("div", { style: { display: "flex", gap: 4 } },
              React.createElement("button", { onClick: function () { setEditPart(p); setEditOpen(true); }, style: { padding: "6px 10px", borderRadius: 8, border: "none", background: th.acc + "33", color: th.acc, cursor: "pointer", fontSize: 12 } }, "\u270f\ufe0f"),
              React.createElement("button", { onClick: function () { dupPart(p); }, style: { padding: "6px 10px", borderRadius: 8, border: "none", background: "#8b5cf622", color: "#8b5cf6", cursor: "pointer", fontSize: 12 } }, "\ud83d\udccb"),
              React.createElement("button", { onClick: function () { delPart(p.id); }, style: { padding: "6px 10px", borderRadius: 8, border: "none", background: "#ef444422", color: "#ef4444", cursor: "pointer", fontSize: 12 } }, "\ud83d\uddd1")
            )
          );
        }),
        parts.length > 0 && React.createElement("button", { onClick: function () { setPerforming(true); }, style: { width: "100%", padding: 16, borderRadius: 14, border: "none", background: "linear-gradient(135deg," + th.acc + ",#8b5cf6)", color: "#fff", fontWeight: 800, fontSize: 18, cursor: "pointer", marginTop: 12, boxShadow: "0 4px 20px " + th.acc + "44" } }, "\ud83c\udfad ", t.start, cfg.testMode ? " (\ud83e\uddea)" : "")
      ),
      React.createElement(PartEditor, { open: editOpen, part: editPart, onSave: savePart, onClose: function () { setEditOpen(false); }, t: t, th: th }),
      React.createElement(SaveModal, { open: saveOpen, onClose: function () { setSaveOpen(false); }, parts: parts, t: t, th: th, onToast: setToast }),
      React.createElement(LoadModal, { open: loadOpen, onClose: function () { setLoadOpen(false); }, onLoad: function (p) { setParts(p); setToast(t.load + " \u2713"); }, t: t, th: th }),
      React.createElement(SettingsModal, { open: settOpen, onClose: function () { setSettOpen(false); }, cfg: cfg, setCfg: setCfg, t: t, th: th }),
      toast && React.createElement(Toast, { msg: toast, onDone: function () { setToast(""); } })
    )
  );
}
