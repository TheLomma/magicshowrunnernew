import React, { useState, useEffect, useRef } from "react";

var uid = function () { return Math.random().toString(36).slice(2, 9); };
var fmt = function (s) { var m = Math.floor(s / 60); var sec = s % 60; return m + ":" + String(sec).padStart(2, "0"); };

var SOUNDS = {
  beep: { label: "Beep", freq: 880, dur: 150, type: "sine" },
  bell: { label: "Glocke", freq: 1200, dur: 300, type: "sine" },
  gong: { label: "Gong", freq: 220, dur: 500, type: "sine" },
  chime: { label: "Chime", freq: 1400, dur: 200, type: "triangle" },
  buzz: { label: "Buzz", freq: 330, dur: 250, type: "sawtooth" },
  click: { label: "Click", freq: 1000, dur: 50, type: "square" },
  soft: { label: "Soft", freq: 660, dur: 400, type: "sine" }
};

var T = {
  de: {
    title: "Magic Showrunner", ver: "v5.2", save: "Speichern", load: "Laden", newPart: "Neuer Teil",
    start: "Show starten", test: "Testmodus", parts: "Teile", total: "Gesamt", settings: "Einstellungen",
    planTheme: "Planungs-Theme", perfTheme: "Perform-Theme", beeps: "Signaltöne", vibration: "Vibration",
    volume: "Lautstärke", testTone: "Testton", testDur: "Testdauer/Teil", titleL: "Titel",
    durL: "Dauer (Sek)", introL: "Intro-Ansage", preAnnL: "Vorankündigung (Sek)",
    preAnnTxt: "Vorankündigungs-Text", notesL: "Notizen", colorL: "Farbe", saveBtn: "Speichern",
    cancel: "Abbrechen", showName: "Show-Name", overwrite: "Überschreiben", noSaved: "Keine Shows.",
    pause: "Pause", resume: "Weiter", prev: "Zurück", next: "Weiter", partOf: "Teil", of: "/",
    dup: "Duplizieren", del: "Löschen", edit: "Bearbeiten", sek: "Sek", csv: "CSV",
    fontSize: "Größe", fontFamily: "Schriftart", ttsVoice: "Stimme", ttsRate: "Tempo",
    ttsPitch: "Tonhöhe", ttsPreview: "Vorschau", animations: "Animationen", notes: "Notizen",
    stop: "Stop", setlist: "Setlist", elapsed: "Vergangen", remaining: "Verbleibend",
    soundLabel: "Signalton", colorTrans: "Farb-Übergänge", blackout: "Blackout",
    startBlackout: "Start im Blackout", countdown: "Countdown", countdownSek: "Countdown (Sek)",
    countdownOff: "Aus", testModeLbl: "Testmodus", testDurLbl: "Testdauer pro Teil (Sek)",
    confirmStop: "Show wirklich beenden?"
  },
  en: {
    title: "Magic Showrunner", ver: "v5.2", save: "Save", load: "Load", newPart: "New Part",
    start: "Start Show", test: "Test Mode", parts: "Parts", total: "Total", settings: "Settings",
    planTheme: "Plan Theme", perfTheme: "Perform Theme", beeps: "Beeps", vibration: "Vibration",
    volume: "Volume", testTone: "Test Tone", testDur: "Test dur/part", titleL: "Title",
    durL: "Duration (sec)", introL: "Intro (TTS)", preAnnL: "Pre-announce (sec)",
    preAnnTxt: "Pre-announce text", notesL: "Notes", colorL: "Color", saveBtn: "Save",
    cancel: "Cancel", showName: "Show Name", overwrite: "Overwrite", noSaved: "No saved shows.",
    pause: "Pause", resume: "Resume", prev: "Back", next: "Next", partOf: "Part", of: "/",
    dup: "Duplicate", del: "Delete", edit: "Edit", sek: "sec", csv: "CSV",
    fontSize: "Size", fontFamily: "Font family", ttsVoice: "Voice", ttsRate: "Speed",
    ttsPitch: "Pitch", ttsPreview: "Preview", animations: "Animations", notes: "Notes",
    stop: "Stop", setlist: "Setlist", elapsed: "Elapsed", remaining: "Remaining",
    soundLabel: "Alert Sound", colorTrans: "Color Transitions", blackout: "Blackout",
    startBlackout: "Start in Blackout", countdown: "Countdown", countdownSek: "Countdown (sec)",
    countdownOff: "Off", testModeLbl: "Test Mode", testDurLbl: "Test duration per part (sec)",
    confirmStop: "Really stop the show?"
  }
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

function doBeep(vol, freq, ms, soundKey) {
  try {
    var s = soundKey && SOUNDS[soundKey] ? SOUNDS[soundKey] : null;
    var c = new (window.AudioContext || window.webkitAudioContext)();
    var o = c.createOscillator();
    var g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.frequency.value = s ? s.freq : (freq || 880);
    o.type = s ? s.type : "sine";
    var v = vol || 0.5;
    var duration = s ? s.dur : (ms || 150);
    g.gain.setValueAtTime(v, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + duration / 1000);
    o.start();
    o.stop(c.currentTime + duration / 1000);
  } catch (e) { /* ignore */ }
}

function doVibrate(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms || 200); } catch (e) { /* ignore */ }
}

function doSpeak(text, rate, pitch, uri) {
  if (!text || !window.speechSynthesis) return;
  var u = new SpeechSynthesisUtterance(text);
  u.rate = rate || 1;
  u.pitch = pitch || 1;
  if (uri) {
    var v = speechSynthesis.getVoices().find(function (x) { return x.voiceURI === uri; });
    if (v) u.voice = v;
  }
  speechSynthesis.speak(u);
}

/* ---- Modal ---- */
function Modal(props) {
  if (!props.open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={props.onClose}>
      <div onClick={function (e) { e.stopPropagation(); }} style={{ background: props.th.card, color: props.th.text, borderRadius: 16, padding: 24, minWidth: 320, maxWidth: 480, maxHeight: "80vh", overflow: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
        <h3 style={{ marginTop: 0 }}>{props.title}</h3>
        {props.children}
      </div>
    </div>
  );
}

/* ---- Toast ---- */
function Toast(props) {
  useEffect(function () { var t = setTimeout(props.onDone, 2200); return function () { clearTimeout(t); }; }, []);
  if (!props.msg) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#333", color: "#fff", padding: "10px 24px", borderRadius: 12, zIndex: 9999, fontSize: 14 }}>
      {props.msg}
    </div>
  );
}

/* ---- PartEditor ---- */
function PartEditor(props) {
  var open = props.open, part = props.part, onSave = props.onSave, onClose = props.onClose, t = props.t, th = props.th;
  var blank = { title: "", duration: 120, intro: "", preAnn: 10, preAnnText: "", notes: "", color: COLORS[0] };
  var _s = useState(part || blank);
  var f = _s[0], setF = _s[1];
  useEffect(function () { setF(part || blank); }, [part, open]);
  var up = function (k, v) { setF(function (p) { var n = Object.assign({}, p); n[k] = v; return n; }); };
  var is = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid " + th.brd, background: th.inp, color: th.text, marginBottom: 8, boxSizing: "border-box" };
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={part ? t.edit : t.newPart} th={th}>
      <label style={{ fontSize: 12, color: th.sub }}>{t.titleL}</label>
      <input style={is} value={f.title} onChange={function (e) { up("title", e.target.value); }} />
      <label style={{ fontSize: 12, color: th.sub }}>{t.durL}</label>
      <input style={is} type="number" min={1} value={f.duration} onChange={function (e) { up("duration", +e.target.value); }} />
      <label style={{ fontSize: 12, color: th.sub }}>{t.introL}</label>
      <input style={is} value={f.intro} onChange={function (e) { up("intro", e.target.value); }} />
      <label style={{ fontSize: 12, color: th.sub }}>{t.preAnnL}</label>
      <input style={is} type="number" min={0} value={f.preAnn} onChange={function (e) { up("preAnn", +e.target.value); }} />
      <label style={{ fontSize: 12, color: th.sub }}>{t.preAnnTxt}</label>
      <input style={is} value={f.preAnnText} onChange={function (e) { up("preAnnText", e.target.value); }} />
      <label style={{ fontSize: 12, color: th.sub }}>{t.notesL}</label>
      <textarea style={Object.assign({}, is, { minHeight: 50 })} value={f.notes} onChange={function (e) { up("notes", e.target.value); }} />
      <label style={{ fontSize: 12, color: th.sub }}>{t.colorL}</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {COLORS.map(function (c) {
          return <div key={c} onClick={function () { up("color", c); }} style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: "pointer", border: f.color === c ? "3px solid #fff" : "3px solid transparent" }} />;
        })}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={function () { if (!f.title) return; onSave(Object.assign({}, f, { id: f.id || uid() })); onClose(); }} style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", background: th.acc, color: "#fff", fontWeight: 700, cursor: "pointer" }}>{t.saveBtn}</button>
        <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid " + th.brd, background: "transparent", color: th.text, cursor: "pointer" }}>{t.cancel}</button>
      </div>
    </Modal>
  );
}

/* ---- SaveModal ---- */
function SaveModal(props) {
  var open = props.open, onClose = props.onClose, parts = props.parts, t = props.t, th = props.th, onToast = props.onToast;
  var _n = useState("");
  var name = _n[0], setName = _n[1];
  var _sv = useState([]);
  var saves = _sv[0], setSaves = _sv[1];
  useEffect(function () { if (open) setSaves(JSON.parse(localStorage.getItem("ms3_shows") || "[]")); }, [open]);
  if (!open) return null;
  var doSave = function () {
    if (!name.trim()) return;
    var s = JSON.parse(localStorage.getItem("ms3_shows") || "[]");
    var i = s.findIndex(function (x) { return x.name === name; });
    var entry = { name: name, parts: parts, date: new Date().toISOString() };
    if (i >= 0) { s[i] = entry; } else { s.push(entry); }
    localStorage.setItem("ms3_shows", JSON.stringify(s));
    onToast(t.save + " OK");
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={t.save} th={th}>
      <input style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid " + th.brd, background: th.inp, color: th.text, marginBottom: 8, boxSizing: "border-box" }} placeholder={t.showName} value={name} onChange={function (e) { setName(e.target.value); }} />
      {saves.length > 0 && <div style={{ marginBottom: 8, fontSize: 12, color: th.sub }}>{t.overwrite}:</div>}
      {saves.map(function (s) {
        return <div key={s.name} onClick={function () { setName(s.name); }} style={{ padding: "6px 10px", background: name === s.name ? th.acc + "22" : "transparent", borderRadius: 8, cursor: "pointer", fontSize: 13, color: th.text, marginBottom: 2 }}>{s.name} ({s.parts.length} {t.parts})</div>;
      })}
      <button onClick={doSave} style={{ marginTop: 8, width: "100%", padding: 10, borderRadius: 10, border: "none", background: th.acc, color: "#fff", fontWeight: 700, cursor: "pointer" }}>{t.saveBtn}</button>
    </Modal>
  );
}

/* ---- LoadModal ---- */
function LoadModal(props) {
  var open = props.open, onClose = props.onClose, onLoad = props.onLoad, t = props.t, th = props.th;
  var _sv = useState([]);
  var saves = _sv[0], setSaves = _sv[1];
  useEffect(function () { if (open) setSaves(JSON.parse(localStorage.getItem("ms3_shows") || "[]")); }, [open]);
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={t.load} th={th}>
      {saves.length === 0 && <p style={{ color: th.sub }}>{t.noSaved}</p>}
      {saves.map(function (s) {
        return (
          <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 8, marginBottom: 4, background: th.inp }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: th.sub }}>{s.parts.length} {t.parts}</div>
            </div>
            <button onClick={function () { onLoad(s.parts); onClose(); }} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: th.acc, color: "#fff", cursor: "pointer", fontWeight: 600 }}>{t.load}</button>
          </div>
        );
      })}
    </Modal>
  );
}

/* ---- SettingsModal ---- */
function SettingsModal(props) {
  var open = props.open, onClose = props.onClose, cfg = props.cfg, setCfg = props.setCfg, t = props.t, th = props.th;
  var _t = useState("design");
  var tab = _t[0], setTab = _t[1];
  var _v = useState([]);
  var voices = _v[0], setVoices = _v[1];
  useEffect(function () {
    var ld = function () { setVoices((speechSynthesis && speechSynthesis.getVoices()) || []); };
    ld();
    if (speechSynthesis) speechSynthesis.addEventListener("voiceschanged", ld);
    return function () { if (speechSynthesis) speechSynthesis.removeEventListener("voiceschanged", ld); };
  }, []);
  var is = { width: "100%", padding: 8, borderRadius: 8, border: "1px solid " + th.brd, background: th.inp, color: th.text, marginBottom: 8, boxSizing: "border-box" };
  if (!open) return null;
  var upCfg = function (k, v) { setCfg(function (c) { var o = {}; o[k] = v; return Object.assign({}, c, o); }); };
  var tabs = ["design", "audio", "voice", "font", "lang"];
  var icons = { design: "Design", audio: "Audio", voice: cfg.lang === "de" ? "Stimme" : "Voice", font: cfg.lang === "de" ? "Schrift" : "Font", lang: cfg.lang === "de" ? "Sprache" : "Language" };

  var content = null;
  if (tab === "design") {
    content = (
      <div>
        <label style={{ fontSize: 12, color: th.sub }}>{t.planTheme}</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {Object.keys(TH).map(function (k) {
            return <button key={k} onClick={function () { upCfg("theme", k); }} style={{ padding: "8px 14px", borderRadius: 8, border: cfg.theme === k ? "2px solid " + th.acc : "2px solid transparent", background: TH[k].card, color: TH[k].text, cursor: "pointer", fontSize: 12 }}>{TH[k].label}</button>;
          })}
        </div>
        <label style={{ fontSize: 12, color: th.sub }}>{t.perfTheme}</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {Object.keys(PTH).map(function (k) {
            return <button key={k} onClick={function () { upCfg("perfTheme", k); }} style={{ padding: "8px 14px", borderRadius: 8, border: cfg.perfTheme === k ? "2px solid " + th.acc : "2px solid transparent", background: PTH[k].bg, color: PTH[k].text, cursor: "pointer", fontSize: 12, textTransform: "capitalize" }}>{k}</button>;
          })}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginBottom: 8 }}>
          <input type="checkbox" checked={cfg.animations} onChange={function (e) { upCfg("animations", e.target.checked); }} /> {t.animations}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={cfg.colorTransitions !== false} onChange={function (e) { upCfg("colorTransitions", e.target.checked); }} /> {t.colorTrans}
        </label>
      </div>
    );
  } else if (tab === "audio") {
    content = (
      <div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={cfg.beeps} onChange={function (e) { upCfg("beeps", e.target.checked); }} /> {t.beeps}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={cfg.vibrate} onChange={function (e) { upCfg("vibrate", e.target.checked); }} /> {t.vibration}
        </label>
        <label style={{ fontSize: 12, color: th.sub }}>{t.volume}</label>
        <input type="range" min={0} max={1} step={0.1} value={cfg.volume} onChange={function (e) { upCfg("volume", +e.target.value); }} style={{ width: "100%", marginBottom: 8 }} />
        <label style={{ fontSize: 12, color: th.sub, marginTop: 8, display: "block" }}>{t.soundLabel}</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {Object.keys(SOUNDS).map(function (k) {
            return <button key={k} onClick={function () { upCfg("beepSound", k); doBeep(cfg.volume, null, null, k); }} style={{ padding: "6px 12px", borderRadius: 8, border: cfg.beepSound === k ? "2px solid " + th.acc : "2px solid transparent", background: cfg.beepSound === k ? th.acc + "22" : th.inp, color: th.text, cursor: "pointer", fontSize: 12 }}>{SOUNDS[k].label}</button>;
          })}
        </div>
        <button onClick={function () { doBeep(cfg.volume, null, null, cfg.beepSound); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: th.acc, color: "#fff", cursor: "pointer" }}>{t.testTone}</button>
      </div>
    );
  } else if (tab === "voice") {
    content = (
      <div>
        <label style={{ fontSize: 12, color: th.sub }}>{t.ttsVoice}</label>
        <select value={cfg.ttsVoice} onChange={function (e) { upCfg("ttsVoice", e.target.value); }} style={is}>
          <option value="">Default</option>
          {voices.map(function (v) { return <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>; })}
        </select>
        <label style={{ fontSize: 12, color: th.sub }}>{t.ttsRate}</label>
        <input type="range" min={0.5} max={2} step={0.1} value={cfg.ttsRate} onChange={function (e) { upCfg("ttsRate", +e.target.value); }} style={{ width: "100%" }} />
        <span style={{ fontSize: 11, color: th.sub }}>{cfg.ttsRate}</span>
        <label style={{ fontSize: 12, color: th.sub, marginTop: 8, display: "block" }}>{t.ttsPitch}</label>
        <input type="range" min={0.5} max={2} step={0.1} value={cfg.ttsPitch} onChange={function (e) { upCfg("ttsPitch", +e.target.value); }} style={{ width: "100%" }} />
        <span style={{ fontSize: 11, color: th.sub }}>{cfg.ttsPitch}</span>
        <button onClick={function () { doSpeak("Test 1 2 3", cfg.ttsRate, cfg.ttsPitch, cfg.ttsVoice); }} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "none", background: th.acc, color: "#fff", cursor: "pointer" }}>{t.ttsPreview}</button>
      </div>
    );
  } else if (tab === "font") {
    content = (
      <div>
        <label style={{ fontSize: 12, color: th.sub }}>{cfg.lang === "de" ? "Anzeigegröße im Perform-Modus" : "Display size in Perform Mode"}</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {["XXL", "XL", "M", "S"].map(function (sz) {
            return <button key={sz} onClick={function () { upCfg("performSize", sz); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: cfg.performSize === sz ? "2px solid " + th.acc : "2px solid transparent", background: cfg.performSize === sz ? th.acc + "22" : th.inp, color: th.text, cursor: "pointer", fontWeight: cfg.performSize === sz ? 700 : 400, fontSize: 14 }}>{sz}</button>;
          })}
        </div>
        <label style={{ fontSize: 12, color: th.sub }}>{t.fontSize}</label>
        <input type="range" min={12} max={24} value={cfg.fontSize} onChange={function (e) { upCfg("fontSize", +e.target.value); }} style={{ width: "100%" }} />
        <span style={{ fontSize: 11, color: th.sub }}>{cfg.fontSize}px</span>
        <label style={{ fontSize: 12, color: th.sub, marginTop: 8, display: "block" }}>{t.fontFamily}</label>
        <select value={cfg.fontFamily} onChange={function (e) { upCfg("fontFamily", e.target.value); }} style={is}>
          {["System", "Arial", "Georgia", "Courier New", "Verdana"].map(function (f) { return <option key={f} value={f}>{f}</option>; })}
        </select>
      </div>
    );
  } else {
    content = (
      <div style={{ display: "flex", gap: 8 }}>
        {["de", "en"].map(function (l) {
          return <button key={l} onClick={function () { upCfg("lang", l); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: cfg.lang === l ? "2px solid " + th.acc : "2px solid transparent", background: cfg.lang === l ? th.acc + "22" : "transparent", color: th.text, cursor: "pointer", fontSize: 16 }}>{l === "de" ? "DE Deutsch" : "EN English"}</button>;
        })}
      </div>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={t.settings} th={th}>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {tabs.map(function (k) {
          return <button key={k} onClick={function () { setTab(k); }} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: tab === k ? "2px solid " + th.acc : "2px solid transparent", background: tab === k ? th.acc + "22" : "transparent", color: th.text, cursor: "pointer", fontSize: 13 }}>{icons[k]}</button>;
        })}
      </div>
      {content}
    </Modal>
  );
}

/* ---- PerformMode ---- */
function PerformMode(props) {
  var parts = props.parts, cfg = props.cfg, onExit = props.onExit, startInBlackout = props.startInBlackout;
  var pt = PTH[cfg.perfTheme] || PTH.dark;
  var t = T[cfg.lang] || T.de;

  var _cd = useState(cfg.countdown > 0 ? cfg.countdown : 0);
  var cdVal = _cd[0], setCdVal = _cd[1];
  var _cdr = useState(cfg.countdown > 0);
  var cdRunning = _cdr[0], setCdRunning = _cdr[1];

  var _idx = useState(0);
  var idx = _idx[0], setIdx = _idx[1];
  var _el = useState(0);
  var elapsed = _el[0], setElapsed = _el[1];
  var _paused = useState(false);
  var paused = _paused[0], setPaused = _paused[1];
  var _showElapsed = useState(false);
  var showElapsed = _showElapsed[0], setShowElapsed = _showElapsed[1];
  var _showSetlist = useState(false);
  var showSetlist = _showSetlist[0], setShowSetlist = _showSetlist[1];
  var _showNotes = useState(false);
  var showNotes = _showNotes[0], setShowNotes = _showNotes[1];
  var _blackout = useState(startInBlackout || false);
  var blackout = _blackout[0], setBlackout = _blackout[1];
  var _confirmStop = useState(false);
  var confirmStop = _confirmStop[0], setConfirmStop = _confirmStop[1];
  var _done = useState(false);
  var done = _done[0], setDone = _done[1];

  var preAnnRef = useRef({});
  var introRef = useRef({});
  var barRef = useRef(null);

  var cur = parts[idx];
  var dur = cfg.testMode ? (cfg.testDur || 10) : (cur ? cur.duration : 60);

  // Countdown timer
  useEffect(function () {
    if (!cdRunning) return;
    if (cdVal <= 0) { setCdRunning(false); return; }
    var iv = setInterval(function () {
      setCdVal(function (v) {
        if (v <= 1) { setCdRunning(false); return 0; }
        if (cfg.beeps) doBeep(cfg.volume, 600, 100, cfg.beepSound);
        return v - 1;
      });
    }, 1000);
    return function () { clearInterval(iv); };
  }, [cdRunning]);

  // Main timer
  useEffect(function () {
    if (cdRunning || paused || done) return;
    var iv = setInterval(function () {
      setElapsed(function (e) {
        var ne = e + 1;
        // pre-announce
        if (cur && cur.preAnn && ne === dur - cur.preAnn && !preAnnRef.current[idx]) {
          preAnnRef.current[idx] = true;
          if (cur.preAnnText) doSpeak(cur.preAnnText, cfg.ttsRate, cfg.ttsPitch, cfg.ttsVoice);
          if (cfg.beeps) doBeep(cfg.volume, 600, 100, cfg.beepSound);
          if (cfg.vibrate) doVibrate(200);
        }
        // end of part
        if (ne >= dur) {
          if (cfg.beeps) doBeep(cfg.volume, 880, 200, cfg.beepSound);
          if (cfg.vibrate) doVibrate(400);
          if (idx < parts.length - 1) {
            setIdx(function (i) { return i + 1; });
            introRef.current = {};
            preAnnRef.current = {};
            return 0;
          } else {
            setDone(true);
            return dur;
          }
        }
        return ne;
      });
    }, 1000);
    return function () { clearInterval(iv); };
  }, [cdRunning, paused, done, idx, dur]);

  // Intro TTS
  useEffect(function () {
    if (cdRunning || done) return;
    if (cur && cur.intro && !introRef.current[idx]) {
      introRef.current[idx] = true;
      doSpeak(cur.intro, cfg.ttsRate, cfg.ttsPitch, cfg.ttsVoice);
    }
  }, [idx, cdRunning, done]);

  if (!cur) return null;

  var sizes = { XXL: { timer: 96, title: 36 }, XL: { timer: 72, title: 28 }, M: { timer: 56, title: 22 }, S: { timer: 40, title: 18 } };
  var sz = sizes[cfg.performSize] || sizes.XL;
  var pct = Math.min(elapsed / dur * 100, 100);
  var rem = Math.max(dur - elapsed, 0);
  var timerVal = showElapsed ? fmt(elapsed) : fmt(rem);
  var timerLabel = showElapsed ? t.elapsed : t.remaining;

  var partColor = cur.color || COLORS[0];
  var useColorTrans = cfg.colorTransitions !== false;

  // Blackout mode
  if (blackout) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 999, cursor: "pointer" }} onClick={function () { setBlackout(false); }}>
        <div style={{ fontSize: sz.timer, fontWeight: 800, color: rem <= 10 ? "#ef4444" : "#ffffff", fontFamily: "monospace" }}>{timerVal}</div>
        <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>{timerLabel}</div>
        <div style={{ position: "absolute", bottom: 40, fontSize: 12, color: "#444" }}>{t.blackout} – {cfg.lang === "de" ? "tippen zum Beenden" : "tap to exit"}</div>
      </div>
    );
  }

  // Countdown screen
  if (cdRunning) {
    return (
      <div style={{ position: "fixed", inset: 0, background: pt.bg, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 120, fontWeight: 800, color: pt.timer }}>{cdVal}</div>
          <div style={{ fontSize: 18, color: pt.text, opacity: 0.6 }}>{t.countdown}...</div>
        </div>
      </div>
    );
  }

  // Done screen
  if (done) {
    return (
      <div style={{ position: "fixed", inset: 0, background: pt.bg, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: pt.text }}>🎉</div>
          <div style={{ fontSize: 24, color: pt.text, marginBottom: 24 }}>{cfg.lang === "de" ? "Show beendet!" : "Show finished!"}</div>
          <button onClick={onExit} style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: pt.bar, color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer" }}>OK</button>
        </div>
      </div>
    );
  }

  // Confirm stop dialog
  if (confirmStop) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <div style={{ background: pt.bg, borderRadius: 16, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 18, color: pt.text, marginBottom: 20 }}>{t.confirmStop}</div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onExit} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer" }}>{t.stop}</button>
            <button onClick={function () { setConfirmStop(false); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid " + pt.barBg, background: "transparent", color: pt.text, fontWeight: 700, cursor: "pointer" }}>{t.cancel}</button>
          </div>
        </div>
      </div>
    );
  }

  var bgStyle = pt.bg;
  if (useColorTrans) {
    bgStyle = "radial-gradient(ellipse at center, " + partColor + "22 0%, " + pt.bg + " 70%)";
  }

  var handleSeek = function (e) {
    if (!barRef.current) return;
    var rect = barRef.current.getBoundingClientRect();
    var x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    var ratio = x / rect.width;
    setElapsed(Math.floor(ratio * dur));
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: bgStyle, display: "flex", flexDirection: "column", zIndex: 999, transition: useColorTrans ? "background 1.5s ease" : "none" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "12px 16px", gap: 8 }}>
        <button onClick={function () { setConfirmStop(true); }} style={{ display: "none" }}>.</button>
          
          <button onClick={function () { setShowSetlist(!showSetlist); }} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid " + pt.barBg, background: showSetlist ? pt.bar : "transparent", color: showSetlist ? "#fff" : pt.text, cursor: "pointer", fontSize: 12 }}>{t.setlist}</button>
          <button onClick={function () { setShowNotes(!showNotes); }} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid " + pt.barBg, background: showNotes ? pt.bar : "transparent", color: showNotes ? "#fff" : pt.text, cursor: "pointer", fontSize: 12 }}>{t.notes}</button>
          <button onClick={function () { setBlackout(true); }} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid " + pt.barBg, background: "transparent", color: pt.text, cursor: "pointer", fontSize: 12 }}>🌑</button>
          <button onClick={function () { setConfirmStop(true); }} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 12 }}>{t.stop}</button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ fontSize: sz.title, fontWeight: 700, color: pt.text, marginBottom: 8, textAlign: "center" }}>{cur.title}</div>
        <div style={{ fontSize: 14, color: pt.text, opacity: 0.5, marginBottom: 16 }}>{t.partOf} {idx + 1} {t.of} {parts.length}</div>

        {/* Timer – click to toggle elapsed/remaining */}
        <div onClick={function () { setShowElapsed(!showElapsed); }} style={{ cursor: "pointer", textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: sz.timer, fontWeight: 800, color: rem <= 10 ? "#ef4444" : pt.timer, fontFamily: "monospace", transition: "color 0.3s" }}>{timerVal}</div>
          <div style={{ fontSize: 12, color: pt.text, opacity: 0.4 }}>{timerLabel}</div>
        </div>

        {/* Progress bar with seek */}
        <div ref={barRef} onClick={handleSeek} style={{ width: "100%", maxWidth: 400, height: 12, background: pt.barBg, borderRadius: 6, cursor: "pointer", position: "relative", marginBottom: 16 }}>
          <div style={{ width: pct + "%", height: "100%", background: rem <= 10 ? "#ef4444" : pt.bar, borderRadius: 6, transition: "width 0.3s" }} />
          <div style={{ position: "absolute", top: -4, left: "calc(" + pct + "% - 10px)", width: 20, height: 20, borderRadius: "50%", background: rem <= 10 ? "#ef4444" : pt.bar, border: "3px solid " + pt.bg, cursor: "grab" }} />
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={function () { if (idx > 0) { setIdx(idx - 1); setElapsed(0); preAnnRef.current = {}; introRef.current = {}; } }} disabled={idx === 0} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: pt.barBg, color: pt.text, fontWeight: 600, cursor: idx > 0 ? "pointer" : "default", opacity: idx === 0 ? 0.3 : 1 }}>{t.prev}</button>
          <button onClick={function () { setPaused(!paused); }} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: pt.bar, color: "#fff", fontWeight: 700, cursor: "pointer", minWidth: 100 }}>{paused ? t.resume : t.pause}</button>
          <button onClick={function () { if (idx < parts.length - 1) { setIdx(idx + 1); setElapsed(0); preAnnRef.current = {}; introRef.current = {}; } }} disabled={idx >= parts.length - 1} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: pt.barBg, color: pt.text, fontWeight: 600, cursor: idx < parts.length - 1 ? "pointer" : "default", opacity: idx >= parts.length - 1 ? 0.3 : 1 }}>{t.next}</button>
        </div>

        {/* Notes panel */}
        {showNotes && cur.notes && (
          <div style={{ marginTop: 16, padding: 12, background: pt.barBg, borderRadius: 10, maxWidth: 400, width: "100%", fontSize: 14, color: pt.text }}>{cur.notes}</div>
        )}
      </div>

      {/* Setlist panel */}
      {showSetlist && (
        <div style={{ position: "absolute", right: 0, top: 50, bottom: 0, width: 200, background: pt.bg, borderLeft: "1px solid " + pt.barBg, padding: 12, overflowY: "auto" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: pt.text, marginBottom: 8 }}>{t.setlist}</div>
          {parts.map(function (p, i) {
            return (
              <div key={p.id} onClick={function () { setIdx(i); setElapsed(0); preAnnRef.current = {}; introRef.current = {}; }} style={{ padding: "6px 8px", borderRadius: 6, marginBottom: 2, background: i === idx ? pt.bar : "transparent", color: i === idx ? "#fff" : pt.text, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: p.color, flexShrink: 0 }} />
                {p.title}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---- CSV helpers ---- */
function exportCSV(parts, t) {
  var header = "Title,Duration,Intro,PreAnn,PreAnnText,Notes,Color\n";
  var rows = parts.map(function (p) {
    return [p.title, p.duration, p.intro, p.preAnn, p.preAnnText, p.notes, p.color].map(function (v) { return '"' + String(v || "").replace(/"/g, '""') + '"'; }).join(",");
  }).join("\n");
  var blob = new Blob([header + rows], { type: "text/csv" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "showrunner.csv";
  a.click();
}

function exportTXT(parts) {
  var txt = parts.map(function (p, i) { return (i + 1) + ". " + p.title + " (" + fmt(p.duration) + ")"; }).join("\n");
  var blob = new Blob([txt], { type: "text/plain" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "setlist.txt";
  a.click();
}

/* ---- Main App ---- */
export default function App() {
  var _cfg = useState({
    theme: "dark", perfTheme: "dark", lang: "de", beeps: true, vibrate: true, volume: 0.5,
    beepSound: "beep", ttsVoice: "", ttsRate: 1, ttsPitch: 1, fontSize: 16, fontFamily: "System",
    performSize: "XL", animations: true, colorTransitions: true, testMode: false, testDur: 10, countdown: 3
  });
  var cfg = _cfg[0], setCfg = _cfg[1];

  var _parts = useState(DEMO);
  var parts = _parts[0], setParts = _parts[1];
  var _perf = useState(false);
  var perf = _perf[0], setPerf = _perf[1];
  var _startBlackout = useState(false);
  var startBlackout = _startBlackout[0], setStartBlackout = _startBlackout[1];
  var _edit = useState(null);
  var editPart = _edit[0], setEditPart = _edit[1];
  var _editorOpen = useState(false);
  var editorOpen = _editorOpen[0], setEditorOpen = _editorOpen[1];
  var _saveOpen = useState(false);
  var saveOpen = _saveOpen[0], setSaveOpen = _saveOpen[1];
  var _loadOpen = useState(false);
  var loadOpen = _loadOpen[0], setLoadOpen = _loadOpen[1];
  var _settOpen = useState(false);
  var settOpen = _settOpen[0], setSettOpen = _settOpen[1];
  var _toast = useState("");
  var toast = _toast[0], setToast = _toast[1];
  var _drag = useState(null);
  var dragIdx = _drag[0], setDragIdx = _drag[1];

  var th = TH[cfg.theme] || TH.dark;
  var t = T[cfg.lang] || T.de;
  var csvRef = useRef(null);

  var totalDur = parts.reduce(function (s, p) { return s + p.duration; }, 0);

  var addPart = function () { setEditPart(null); setEditorOpen(true); };
  var doEdit = function (p) { setEditPart(p); setEditorOpen(true); };
  var savePart = function (p) {
    setParts(function (ps) {
      var i = ps.findIndex(function (x) { return x.id === p.id; });
      if (i >= 0) { var n = ps.slice(); n[i] = p; return n; }
      return ps.concat([p]);
    });
  };
  var delPart = function (id) { setParts(function (ps) { return ps.filter(function (x) { return x.id !== id; }); }); };
  var dupPart = function (p) { setParts(function (ps) { return ps.concat([Object.assign({}, p, { id: uid(), title: p.title + " (copy)" })]); }); };

  var handleDragStart = function (i) { setDragIdx(i); };
  var handleDrop = function (i) {
    if (dragIdx === null || dragIdx === i) return;
    setParts(function (ps) {
      var n = ps.slice();
      var item = n.splice(dragIdx, 1)[0];
      n.splice(i, 0, item);
      return n;
    });
    setDragIdx(null);
  };

  var handleCSVImport = function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var lines = ev.target.result.split("\n").filter(function (l) { return l.trim(); });
        if (lines.length < 2) return;
        var imported = [];
        for (var i = 1; i < lines.length; i++) {
          var vals = lines[i].match(/(".*?"|[^,]+)/g);
          if (vals && vals.length >= 2) {
            var clean = function (v) { return (v || "").replace(/^"|"$/g, "").replace(/""/g, '"'); };
            imported.push({
              id: uid(),
              title: clean(vals[0]),
              duration: parseInt(clean(vals[1])) || 120,
              intro: clean(vals[2] || ""),
              preAnn: parseInt(clean(vals[3] || "")) || 10,
              preAnnText: clean(vals[4] || ""),
              notes: clean(vals[5] || ""),
              color: clean(vals[6] || "") || COLORS[0]
            });
          }
        }
        if (imported.length > 0) {
          setParts(imported);
          setToast("CSV OK – " + imported.length + " " + t.parts);
        }
      } catch (err) { setToast("CSV Error"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  var startShow = function (inBlackout) {
    setStartBlackout(inBlackout || false);
    setPerf(true);
  };

  if (perf) {
    return (
      <PerformMode
        parts={parts}
        cfg={cfg}
        onExit={function () { setPerf(false); setStartBlackout(false); }}
        startInBlackout={startBlackout}
      />
    );
  }

  var bs = function (extra) {
    return Object.assign({
      padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13
    }, extra || {});
  };

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.text, fontFamily: cfg.fontFamily === "System" ? "-apple-system, BlinkMacSystemFont, sans-serif" : cfg.fontFamily, fontSize: cfg.fontSize, transition: "background 0.3s" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>🎩 {t.title}</h1>
            <span style={{ fontSize: 11, color: th.sub }}>{t.ver}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={function () { setSaveOpen(true); }} style={bs({ background: th.acc, color: "#fff" })}>{t.save}</button>
            <button onClick={function () { setLoadOpen(true); }} style={bs({ background: th.inp, color: th.text })}>{t.load}</button>
            <button onClick={function () { setSettOpen(true); }} style={bs({ background: th.inp, color: th.text })}>⚙️</button>
          </div>
        </div>

        {/* Parts list */}
        <div style={{ marginBottom: 16 }}>
          {parts.map(function (p, i) {
            return (
              <div
                key={p.id}
                draggable
                onDragStart={function () { handleDragStart(i); }}
                onDragOver={function (e) { e.preventDefault(); }}
                onDrop={function () { handleDrop(i); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  background: th.card, borderRadius: 10, marginBottom: 6,
                  border: "1px solid " + th.brd, cursor: "grab",
                  transition: cfg.animations ? "transform 0.15s" : "none"
                }}
              >
                <div style={{ width: 6, height: 32, borderRadius: 3, background: p.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: th.sub }}>{fmt(p.duration)}</div>
                </div>
                <button onClick={function () { doEdit(p); }} style={{ background: "transparent", border: "none", color: th.sub, cursor: "pointer", fontSize: 16 }}>✏️</button>
                <button onClick={function () { dupPart(p); }} style={{ background: "transparent", border: "none", color: th.sub, cursor: "pointer", fontSize: 16 }}>📋</button>
                <button onClick={function () { delPart(p.id); }} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>🗑️</button>
              </div>
            );
          })}
        </div>

        {/* Add part */}
        <button onClick={addPart} style={bs({ background: th.acc, color: "#fff", width: "100%", padding: 12, marginBottom: 12 })}>+ {t.newPart}</button>

        {/* Total */}
        <div style={{ textAlign: "center", marginBottom: 16, fontSize: 13, color: th.sub }}>
          {parts.length} {t.parts} – {t.total}: {fmt(totalDur)}
        </div>

        {/* CSV / TXT */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "center" }}>
          <button onClick={function () { exportCSV(parts, t); }} style={bs({ background: th.inp, color: th.text, fontSize: 11 })}>📥 CSV Export</button>
          <button onClick={function () { csvRef.current && csvRef.current.click(); }} style={bs({ background: th.inp, color: th.text, fontSize: 11 })}>📤 CSV Import</button>
          <button onClick={function () { exportTXT(parts); }} style={bs({ background: th.inp, color: th.text, fontSize: 11 })}>📄 TXT</button>
          <input ref={csvRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleCSVImport} />
        </div>

        {/* Countdown setting */}
        <div style={{ background: th.card, borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid " + th.brd }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>{t.countdownSek}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number" min={0} max={10} value={cfg.countdown}
                onChange={function (e) { setCfg(function (c) { return Object.assign({}, c, { countdown: Math.max(0, Math.min(10, +e.target.value)) }); }); }}
                style={{ width: 60, padding: 6, borderRadius: 6, border: "1px solid " + th.brd, background: th.inp, color: th.text, textAlign: "center" }}
              />
              <span style={{ fontSize: 11, color: th.sub }}>{cfg.countdown === 0 ? t.countdownOff : cfg.countdown + " " + t.sek}</span>
            </div>
          </div>

          {/* Test mode */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={cfg.testMode} onChange={function (e) { setCfg(function (c) { return Object.assign({}, c, { testMode: e.target.checked }); }); }} />
              {t.testModeLbl}
            </label>
            {cfg.testMode && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 11, color: th.sub }}>{t.testDurLbl}</label>
                <input
                  type="number" min={3} max={60} value={cfg.testDur}
                  onChange={function (e) { setCfg(function (c) { return Object.assign({}, c, { testDur: Math.max(3, +e.target.value) }); }); }}
                  style={{ width: 50, padding: 4, borderRadius: 6, border: "1px solid " + th.brd, background: th.inp, color: th.text, textAlign: "center" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Start buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={function () { startShow(false); }}
            disabled={parts.length === 0}
            style={bs({ flex: 1, background: "#10b981", color: "#fff", padding: 14, fontSize: 16, opacity: parts.length === 0 ? 0.4 : 1 })}
          >
            ▶ {t.start}
          </button>
          <button
            onClick={function () { startShow(true); }}
            disabled={parts.length === 0}
            style={bs({ background: "#1e1e2e", color: "#fff", padding: 14, fontSize: 16, border: "1px solid #333", opacity: parts.length === 0 ? 0.4 : 1 })}
          >
            🌑 {t.startBlackout}
          </button>
        </div>
      </div>

      {/* Modals */}
      <PartEditor open={editorOpen} part={editPart} onSave={savePart} onClose={function () { setEditorOpen(false); }} t={t} th={th} />
      <SaveModal open={saveOpen} onClose={function () { setSaveOpen(false); }} parts={parts} t={t} th={th} onToast={setToast} />
      <LoadModal open={loadOpen} onClose={function () { setLoadOpen(false); }} onLoad={setParts} t={t} th={th} />
      <SettingsModal open={settOpen} onClose={function () { setSettOpen(false); }} cfg={cfg} setCfg={setCfg} t={t} th={th} />
      {toast && <Toast msg={toast} onDone={function () { setToast(""); }} />}
    </div>
  );
}
