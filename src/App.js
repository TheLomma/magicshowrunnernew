import { useState, useEffect, useRef } from "react";

const AudioEngine = {
  ctx: null,
  getCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this.ctx;
  },
  beep(volume = 0.5, freq = 880, duration = 0.15) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq; gain.gain.value = volume;
    osc.start(); osc.stop(ctx.currentTime + duration);
  },
  speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    const voices = window.speechSynthesis.getVoices();
    const de = voices.find(v => v.lang.startsWith("de"));
    if (de) u.voice = de;
    window.speechSynthesis.speak(u);
  }
};

const fmt = (s) => { s = Math.abs(Math.floor(s)); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; };

const EMPTY = { title:"", duration:300, introText:"", preAnnounceSec:10, announceNextText:"", notes:"" };

const DEMO = [
  { id:1, title:"Begr\u00fc\u00dfung & Einleitung", duration:180, introText:"Meine Damen und Herren, willkommen zur gro\u00dfen Zaubershow!", preAnnounceSec:15, announceNextText:"Achtung: Gleich beginnt der erste Zaubertrick!", notes:"Spotlight Mitte." },
  { id:2, title:"Die verschwindende Silberm\u00fcnze", duration:300, introText:"Und nun zum ersten Trick: Ich ben\u00f6tige eine M\u00fcnze.", preAnnounceSec:20, announceNextText:"Gleich wird es mysteri\u00f6s: Gedankenlesung!", notes:"Silberm\u00fcnze, schwarzes Tuch, Glasschale." },
  { id:3, title:"Mentalmagie", duration:420, introText:"Darf ich einen Freiwilligen auf die B\u00fchne bitten?", preAnnounceSec:15, announceNextText:"Gleich gibt es eine Pause.", notes:"Umschl\u00e4ge, Stift, Flipchart." },
  { id:4, title:"Pause", duration:600, introText:"Zehn Minuten Pause!", preAnnounceSec:30, announceNextText:"Bitte Pl\u00e4tze einnehmen!", notes:"Jazz-Playlist." },
  { id:5, title:"Kartentrick", duration:480, introText:"Willkommen zur\u00fcck!", preAnnounceSec:20, announceNextText:"Gleich kommt das Finale!", notes:"2 Kartenspiele." },
  { id:6, title:"Schwebende Rose", duration:360, introText:"Das gro\u00dfe Finale!", preAnnounceSec:20, announceNextText:"Gleich die Verabschiedung.", notes:"Nebelmaschine 30s vorher!" },
  { id:7, title:"Verabschiedung", duration:180, introText:"Vielen Dank!", preAnnounceSec:10, announceNextText:"", notes:"Visitenkarten am Ausgang." },
];

export default function ShowRunner() {
  const [mode, setMode] = useState("plan");
  const [parts, setParts] = useState(DEMO);
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
  const [volume, setVolume] = useState(0.5);
  const [testSpeed, setTestSpeed] = useState(10);
  const intervalRef = useRef(null);

  const totalDuration = parts.reduce((s,p) => s+p.duration, 0);
  const effectiveParts = mode==="test" ? parts.map(p => ({...p, duration:testSpeed, preAnnounceSec:Math.min(p.preAnnounceSec, Math.floor(testSpeed/2))})) : parts;
  const effectiveTotal = effectiveParts.reduce((s,p) => s+p.duration, 0);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => { setPartElapsed(p=>p+1); setTotalElapsed(p=>p+1); }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (!isRunning || isPaused) return;
    const cp = effectiveParts[currentPartIndex]; if (!cp) return;
    const rem = cp.duration - partElapsed;
    if (!introAnnounced && partElapsed === 0) { if (cp.introText) AudioEngine.speak(cp.introText); if (beepEnabled) AudioEngine.beep(volume,660,0.2); setIntroAnnounced(true); }
    if (!preAnnounced && rem <= cp.preAnnounceSec && rem > 0) { if (cp.announceNextText) AudioEngine.speak(cp.announceNextText); if (beepEnabled) AudioEngine.beep(volume,440,0.3); setPreAnnounced(true); }
    if (partElapsed >= cp.duration) {
      if (currentPartIndex < effectiveParts.length-1) { setCurrentPartIndex(p=>p+1); setPartElapsed(0); setPreAnnounced(false); setIntroAnnounced(false); }
      else { AudioEngine.speak("Die Show ist beendet!"); setIsRunning(false); setIsPaused(false); }
    }
  }, [partElapsed, isRunning, isPaused, currentPartIndex, effectiveParts, preAnnounced, introAnnounced, beepEnabled, volume]);

  const startShow = () => { if (!parts.length) return; setCurrentPartIndex(0); setPartElapsed(0); setTotalElapsed(0); setPreAnnounced(false); setIntroAnnounced(false); setIsRunning(true); setIsPaused(false); };
  const togglePause = () => setIsPaused(p=>!p);
  const stopShow = () => { setIsRunning(false); setIsPaused(false); window.speechSynthesis?.cancel(); setMode("plan"); };
  const jumpToPart = (i) => { if (i<0||i>=effectiveParts.length) return; setCurrentPartIndex(i); setPartElapsed(0); setTotalElapsed(effectiveParts.slice(0,i).reduce((s,p)=>s+p.duration,0)); setPreAnnounced(false); setIntroAnnounced(false); };
  const scrubPart = (v) => { const d=v-partElapsed; setPartElapsed(v); setTotalElapsed(p=>Math.max(0,p+d)); const cp=effectiveParts[currentPartIndex]; if(cp&&cp.duration-v>cp.preAnnounceSec)setPreAnnounced(false); if(v===0)setIntroAnnounced(false); };
  const triggerTestAnnounce = () => { const cp=effectiveParts[currentPartIndex]; if(cp?.announceNextText)AudioEngine.speak(cp.announceNextText); if(beepEnabled)AudioEngine.beep(volume,440,0.3); };

  const openAdd = () => { setForm({...EMPTY}); setEditPart(null); setShowForm(true); };
  const openEdit = (p) => { setForm({title:p.title,duration:p.duration,introText:p.introText,preAnnounceSec:p.preAnnounceSec,announceNextText:p.announceNextText,notes:p.notes}); setEditPart(p.id); setShowForm(true); };
  const savePart = () => { if(!form.title.trim())return; if(editPart!==null)setParts(parts.map(p=>p.id===editPart?{...p,...form}:p)); else setParts([...parts,{...form,id:Date.now()}]); setShowForm(false); };
  const removePart = (id) => setParts(parts.filter(p=>p.id!==id));
  const movePart = (i,d) => { const a=[...parts]; const t=i+d; if(t<0||t>=a.length)return; [a[i],a[t]]=[a[t],a[i]]; setParts(a); };

  const renderPlan = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6"><h1 className="text-3xl font-bold text-indigo-900">Show Runner</h1><p className="text-indigo-600 mt-1">Plane und steuere deinen Auftritt</p></div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow p-3 text-center"><div className="text-2xl font-bold text-indigo-700">{parts.length}</div><div className="text-xs text-gray-500">Teile</div></div>
        <div className="bg-white rounded-xl shadow p-3 text-center"><div className="text-2xl font-bold text-indigo-700">{fmt(totalDuration)}</div><div className="text-xs text-gray-500">Gesamtdauer</div></div>
        <div className="bg-white rounded-xl shadow p-3 text-center"><div className="text-2xl font-bold text-indigo-700">{parts.filter(p=>p.announceNextText).length}</div><div className="text-xs text-gray-500">Ansagen</div></div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Einstellungen</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={beepEnabled} onChange={e=>setBeepEnabled(e.target.checked)} className="accent-indigo-600"/>Beep</label>
          <label className="flex items-center gap-2 text-sm"><input type="range" min="0" max="1" step="0.1" value={volume} onChange={e=>setVolume(parseFloat(e.target.value))} className="w-24 accent-indigo-600"/>{Math.round(volume*100)}%</label>
          <button onClick={()=>{AudioEngine.beep(volume,880,0.2);AudioEngine.speak("Soundtest.");}} className="text-xs bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5">Test</button>
        </div>
      </div>
      <div className="space-y-3 mb-6">{parts.map((p,i) => { const cum=parts.slice(0,i).reduce((s,x)=>s+x.duration,0); return (
        <div key={p.id} className="bg-white rounded-xl shadow p-4"><div className="flex items-start justify-between"><div className="flex-1">
          <div className="flex items-center gap-2"><span className="bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{i+1}</span><h3 className="font-semibold text-gray-800">{p.title}</h3><span className="text-xs text-gray-400">ab {fmt(cum)}</span></div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
            <div>Dauer: <span className="font-medium text-gray-700">{fmt(p.duration)}</span></div>
            <div>Vorank.: <span className="font-medium text-gray-700">{p.preAnnounceSec}s</span></div>
            {p.introText && <div className="col-span-2">Intro: <span className="italic text-gray-600">"{p.introText}"</span></div>}
            {p.announceNextText && <div className="col-span-2">Ansage: <span className="italic text-gray-600">"{p.announceNextText}"</span></div>}
            {p.notes && <div className="col-span-2">{p.notes}</div>}
          </div></div>
          <div className="flex flex-col gap-1 ml-3">
            <button onClick={()=>movePart(i,-1)} className="text-gray-400 hover:text-indigo-600 text-sm" disabled={i===0}>&#9650;</button>
            <button onClick={()=>openEdit(p)} className="text-gray-400 hover:text-indigo-600 text-sm">&#9998;</button>
            <button onClick={()=>removePart(p.id)} className="text-gray-400 hover:text-red-500 text-sm">&#128465;</button>
            <button onClick={()=>movePart(i,1)} className="text-gray-400 hover:text-indigo-600 text-sm" disabled={i===parts.length-1}>&#9660;</button>
          </div></div></div>); })}</div>
      <button onClick={openAdd} className="w-full border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl py-3 hover:bg-indigo-50 font-medium">+ Neuen Teil</button>
      {parts.length>0 && <div className="flex gap-3 mt-6">
        <button onClick={()=>{setMode("perform");startShow();}} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-lg">Show starten</button>
        <button onClick={()=>{setMode("test");startShow();}} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-lg">Testmodus</button>
      </div>}
      {showForm && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{editPart?"Bearbeiten":"Neuer Teil"}</h2>
        <div className="space-y-3">
          <div><label className="text-sm font-medium text-gray-600">Titel *</label><input className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div><label className="text-sm font-medium text-gray-600">Dauer (Sek.)</label><div className="flex items-center gap-2 mt-1"><input type="number" className="w-24 border rounded-lg px-3 py-2 text-sm" value={form.duration} onChange={e=>setForm({...form,duration:Math.max(1,parseInt(e.target.value)||0)})}/><span className="text-xs text-gray-400">= {fmt(form.duration)}</span><div className="flex gap-1 ml-auto">{[60,120,180,300,600].map(v=><button key={v} onClick={()=>setForm({...form,duration:v})} className={`text-xs px-2 py-1 rounded ${form.duration===v?"bg-indigo-600 text-white":"bg-gray-100"}`}>{fmt(v)}</button>)}</div></div></div>
          <div><label className="text-sm font-medium text-gray-600">Intro-Ansage</label><textarea className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" rows={2} value={form.introText} onChange={e=>setForm({...form,introText:e.target.value})}/></div>
          <div><label className="text-sm font-medium text-gray-600">Vorank. (Sek. vor Ende)</label><input type="number" className="w-24 border rounded-lg px-3 py-2 mt-1 text-sm" value={form.preAnnounceSec} onChange={e=>setForm({...form,preAnnounceSec:Math.max(0,parseInt(e.target.value)||0)})}/></div>
          <div><label className="text-sm font-medium text-gray-600">Ansage naechster Teil</label><textarea className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" rows={2} value={form.announceNextText} onChange={e=>setForm({...form,announceNextText:e.target.value})}/></div>
          <div><label className="text-sm font-medium text-gray-600">Notizen</label><textarea className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" rows={2} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
        </div>
        <div className="flex gap-3 mt-5"><button onClick={savePart} className="flex-1 bg-indigo-600 text-white font-medium py-2 rounded-lg">Speichern</button><button onClick={()=>setShowForm(false)} className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg">Abbrechen</button></div>
      </div></div>}
    </div>
  );

  const cp = effectiveParts[currentPartIndex];
  const partRemaining = cp ? cp.duration-partElapsed : 0;
  const progressPart = cp ? (partElapsed/cp.duration)*100 : 0;
  const progressTotal = effectiveTotal>0 ? (totalElapsed/effectiveTotal)*100 : 0;
  const isWarning = cp && partRemaining<=cp.preAnnounceSec;
  const nextPart = effectiveParts[currentPartIndex+1];

  const renderPerform = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><span className={`text-xs font-bold px-2 py-1 rounded-full ${mode==="test"?"bg-amber-100 text-amber-700":"bg-green-100 text-green-700"}`}>{mode==="test"?"TESTMODUS":"LIVE"}</span>{isPaused && <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">PAUSE</span>}</div>
        <button onClick={stopShow} className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg font-medium">Beenden</button>
      </div>
      <div className="bg-white rounded-xl shadow p-4 mb-4"><div className="flex justify-between items-center text-sm text-gray-500 mb-1"><span>Gesamtzeit</span><span>{fmt(totalElapsed)} / {fmt(effectiveTotal)}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-500 h-2 rounded-full transition-all" style={{width:`${Math.min(progressTotal,100)}%`}}/></div></div>
      {cp && <div className={`rounded-2xl shadow-lg p-6 mb-4 transition-colors ${isWarning?"bg-red-50 border-2 border-red-300":"bg-white"}`}>
        <div className="flex items-center gap-2 mb-2"><span className="bg-indigo-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">{currentPartIndex+1}</span><h2 className="text-xl font-bold text-gray-800">{cp.title}</h2></div>
        <div className={`text-6xl font-mono font-bold text-center my-6 ${isWarning?"text-red-600 animate-pulse":"text-indigo-700"}`}>{fmt(partRemaining)}</div>
        <div className="relative w-full mb-1"><input type="range" min={0} max={cp.duration} value={partElapsed} onChange={e=>scrubPart(parseInt(e.target.value))} className="w-full h-3 rounded-full appearance-none cursor-pointer" style={{background:`linear-gradient(to right, ${isWarning?"#ef4444":"#6366f1"} ${progressPart}%, #e5e7eb ${progressPart}%)`}}/></div>
        <div className="flex justify-between text-xs text-gray-400"><span>Vergangen: {fmt(partElapsed)}</span><span>Dauer: {fmt(cp.duration)}</span></div>
        {cp.notes && <div className="mt-4 text-sm bg-gray-50 rounded-lg p-3 text-gray-600">{cp.notes}</div>}
        {isWarning && cp.announceNextText && <div className="mt-4 text-sm bg-red-100 rounded-lg p-3 text-red-700 font-medium">{cp.announceNextText}</div>}
      </div>}
      {nextPart && <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200"><div className="text-xs text-gray-400 mb-1">ALS NAECHSTES</div><div className="flex items-center gap-2"><span className="bg-gray-300 text-gray-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{currentPartIndex+2}</span><span className="font-medium text-gray-700">{nextPart.title}</span><span className="text-xs text-gray-400 ml-auto">{fmt(nextPart.duration)}</span></div></div>}
      <div className="flex gap-3">
        {currentPartIndex>0 && <button onClick={()=>jumpToPart(currentPartIndex-1)} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-3 px-4 rounded-xl text-lg">&#9198;</button>}
        <button onClick={togglePause} className={`flex-1 font-bold py-3 rounded-xl text-lg ${isPaused?"bg-green-500 hover:bg-green-600 text-white":"bg-yellow-400 hover:bg-yellow-500 text-yellow-900"}`}>{isPaused?"Weiter":"Pause"}</button>
        {currentPartIndex<effectiveParts.length-1 && <button onClick={()=>jumpToPart(currentPartIndex+1)} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-3 px-4 rounded-xl text-lg">&#9197;</button>}
      </div>
      {mode==="test" && <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="text-xs font-bold text-amber-700 mb-2">Testmodus</div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={triggerTestAnnounce} className="bg-amber-200 hover:bg-amber-300 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium">Ansage</button>
          <button onClick={()=>{if(beepEnabled)AudioEngine.beep(volume,880,0.2);}} className="bg-amber-200 hover:bg-amber-300 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium">Beep</button>
        </div>
        <div className="mt-3 flex items-center gap-2"><span className="text-xs text-amber-600">Testdauer:</span><input type="number" value={testSpeed} onChange={e=>setTestSpeed(Math.max(5,parseInt(e.target.value)||10))} className="w-16 border rounded px-2 py-1 text-sm"/><span className="text-xs text-amber-600">Sek.</span></div>
      </div>}
      <div className="mt-6 bg-white rounded-xl shadow p-4"><div className="text-xs font-bold text-gray-400 mb-3">ABLAUF - klicke zum Springen</div>
        {effectiveParts.map((p,i)=><div key={p.id} onClick={()=>jumpToPart(i)} className={`flex items-center gap-2 py-2 border-b last:border-0 cursor-pointer hover:bg-indigo-50 rounded ${i===currentPartIndex?"bg-indigo-50 -mx-2 px-2 font-semibold":i<currentPartIndex?"opacity-40":""}`}>
          <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${i===currentPartIndex?"bg-indigo-600 text-white":i<currentPartIndex?"bg-gray-300 text-gray-500":"bg-gray-200 text-gray-500"}`}>{i+1}</span>
          <span className={`flex-1 text-sm ${i<currentPartIndex?"line-through text-gray-400":"text-gray-700"}`}>{p.title}</span>
          <span className="text-xs text-gray-400">{fmt(p.duration)}</span>
        </div>)}
      </div>
    </div>
  );

  return (<div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">{mode==="plan"?renderPlan():renderPerform()}</div>);
}
