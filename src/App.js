import { useState, useEffect } from "react"

const defaultTiles = [
  { id: 11, title: "RP Einkauf", description: "", group: "Intern", favorite: false, url: "https://rp.sharepoint.com/sites/Einkauf", color: "#0078D4", size: "medium", newTab: true, icon: "🛒", showUrl: false },
  { id: 10, title: "RP Intranet", description: "", group: "Intern", favorite: false, url: "https://intranet.rheinischepostmediengruppe.de/home", color: "#E30613", size: "medium", newTab: true, icon: "🏢", showUrl: false },
  { id: 9, title: "Langdock", description: "", group: "Tools", favorite: false, url: "https://app.langdock.com/chat", color: "#6366F1", size: "medium", newTab: true, icon: "🤖", showUrl: false },
  { id: 1, title: "Google", description: "", group: "Tools", favorite: false, url: "https://google.com", color: "#4285F4", size: "medium", newTab: true, icon: "🔍", showUrl: false },
  { id: 4, title: "RP Online", description: "", group: "News", favorite: false, url: "https://rp-online.de", color: "#E30613", size: "medium", newTab: true, icon: "📰", showUrl: false },
  { id: 7, title: "Jira", description: "", group: "Tools", favorite: false, url: "https://promgm.atlassian.net/jira/software/c/projects/S4HANA/boards/1522", color: "#0052CC", size: "medium", newTab: true, icon: "jira", showUrl: false },
  { id: 6, title: "Ariba", description: "", group: "Intern", favorite: false, url: "https://s1-eu.ariba.com/Sourcing/Main/aw?awh=r&awssk=4ZKLv3K6vaB.A7cf&realm=745237532-T&passwordadapter=ThirdPartyUser&dard=1#b0", color: "#00B7F0", size: "medium", newTab: true, icon: "ariba", showUrl: false },
  { id: 8, title: "RP E-Paper", description: "", group: "News", favorite: false, url: "https://epaper.rp-online.de", color: "#E30613", size: "medium", newTab: true, icon: "📄", showUrl: false },
  { id: 5, title: "SAP Test", description: "", group: "Intern", favorite: false, url: "https://my424364.s4hana.cloud.sap/ui#Shell-home", color: "#0070F2", size: "medium", newTab: true, icon: "🔷", showUrl: false },
]

const colorPresets = ["#4285F4","#FF0000","#24292e","#0A66C2","#1DA1F2","#FF4500","#34A853","#7C3AED","#EC4899","#F59E0B","#10B981","#6366F1","#0EA5E9","#D946EF","#84CC16"]

const themes = {
  dark: {
    bg: "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950",
    header: "bg-gray-950 bg-opacity-80 border-gray-800",
    input: "bg-gray-800 text-white border-gray-700",
    btn: "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700",
    footer: "text-gray-600", modal: "bg-gray-900 border-gray-700",
    label: "text-gray-400", modalInput: "bg-gray-800 text-white border-gray-600",
    logoText: "#fff", appName: "#e2e8f0", version: "#6b7280",
    divider: "border-gray-600", text: "text-white", subtext: "text-gray-500",
    panelBg: "bg-gray-900 border-gray-700",
    themeActiveBg: "bg-blue-600 text-white",
    themeInactiveBg: "bg-gray-800 hover:bg-gray-700 text-gray-300",
    emptyText: "text-gray-500",
  },
  light: {
    bg: "bg-white",
    header: "bg-white bg-opacity-90 border-gray-200",
    input: "bg-gray-100 text-gray-900 border-gray-300",
    btn: "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300",
    footer: "text-gray-400", modal: "bg-white border-gray-200",
    label: "text-gray-600", modalInput: "bg-gray-100 text-gray-900 border-gray-300",
    logoText: "#111", appName: "#1a1a2e", version: "#9ca3af",
    divider: "border-gray-300", text: "text-gray-900", subtext: "text-gray-400",
    panelBg: "bg-white border-gray-200",
    themeActiveBg: "bg-blue-600 text-white",
    themeInactiveBg: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    emptyText: "text-gray-400",
  },
}

function TileIcon({ icon, isDark }) {
  if (icon && icon.startsWith("https://")) return <img src={icon} alt="icon" className="mb-2 drop-shadow-lg" style={{ width: 40, height: 40, objectFit: 'contain' }} onError={e => { e.target.style.display='none' }} />
  if (icon === "jira") return (
    <svg viewBox="0 0 32 32" className="mb-2 drop-shadow-lg" style={{ width: 40, height: 40 }}>
      <defs>
        <linearGradient id="jiraGrad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2684FF" />
          <stop offset="100%" stopColor="#0052CC" />
        </linearGradient>
      </defs>
      <path d="M15.98 0.16L8.1 8.04 3.9 3.84a1.3 1.3 0 00-1.84 0L.16 5.74a1.3 1.3 0 000 1.84l7.02 7.02-7.02 7.02a1.3 1.3 0 000 1.84l1.9 1.9a1.3 1.3 0 001.84 0l4.2-4.2 7.88 7.88a1.3 1.3 0 001.84 0l1.9-1.9a1.3 1.3 0 000-1.84L11.7 17.28l4.28-4.28 7.88-7.88a1.3 1.3 0 000-1.84L21.96.16a1.3 1.3 0 00-1.84 0z" fill="url(#jiraGrad)" transform="translate(4,4) scale(0.9)" />
    </svg>
  )
  if (icon === "ariba") return (
    <svg viewBox="0 0 120 40" className="mb-2 drop-shadow-lg" style={{ width: 80, height: 27 }}>
      <text x="0" y="32" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="38" fill={isDark ? "#ffffff" : "#00B7F0"}>ariba</text>
    </svg>
  )
  return <span className="text-4xl mb-2 drop-shadow-lg">{icon}</span>
}

function TileForm({ tile, setTile, onSave, onCancel, saveLabel, th }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className={`rounded-2xl p-6 w-full max-w-md border shadow-2xl ${th.modal}`} onClick={e => e.stopPropagation()}>
        <h3 className={`text-xl font-bold mb-5 ${th.text}`}>{saveLabel === "Speichern" ? "Kachel bearbeiten" : "Neue Kachel"}</h3>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${th.label}`}>Titel</label>
            <input className={`w-full rounded-lg px-4 py-2.5 border focus:border-blue-500 focus:outline-none ${th.modalInput}`} value={tile.title} onChange={e => setTile({ ...tile, title: e.target.value })} placeholder="Mein Link" />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${th.label}`}>URL</label>
            <input className={`w-full rounded-lg px-4 py-2.5 border focus:border-blue-500 focus:outline-none ${th.modalInput}`} value={tile.url} onChange={e => setTile({ ...tile, url: e.target.value })} placeholder="https://example.com" />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${th.label}`}>Icon / Emoji</label>
            <div className="flex gap-2">
              <input className={`flex-1 rounded-lg px-4 py-2.5 border focus:border-blue-500 focus:outline-none ${th.modalInput}`} value={tile.icon} onChange={e => setTile({ ...tile, icon: e.target.value })} placeholder="🔗" />
              <button className={`px-3 py-2 rounded-lg text-sm border transition-colors ${th.btn}`} title="Favicon automatisch laden" onClick={() => {
                try {
                  const url = tile.url.startsWith('http') ? tile.url : 'https://' + tile.url
                  const domain = new URL(url).hostname
                  setTile({ ...tile, icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64` })
                } catch { alert('Bitte zuerst eine gültige URL eingeben.') }
              }}>🌐 Favicon</button>
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${th.label}`}>Farbe</label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map(c => (
                <button key={c} className={`w-8 h-8 rounded-full border-2 transition-transform ${tile.color === c ? "border-white scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} onClick={() => setTile({ ...tile, color: c })} />
              ))}
            </div>
            <input type="color" className="mt-2 w-12 h-8 rounded cursor-pointer bg-transparent" value={tile.color} onChange={e => setTile({ ...tile, color: e.target.value })} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${th.label}`}>Größe</label>
            <div className="flex gap-2">
              {["small", "medium", "large"].map(s => (
                <button key={s} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tile.size === s ? "bg-blue-600 text-white" : th.themeInactiveBg}`} onClick={() => setTile({ ...tile, size: s })}>
                  {s === "small" ? "Klein" : s === "medium" ? "Mittel" : "Groß"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${th.label}`}>Gruppe <span className="font-normal opacity-60">(optional)</span></label>
            <input className={`w-full rounded-lg px-4 py-2.5 border focus:border-blue-500 focus:outline-none ${th.modalInput}`} value={tile.group || ""} onChange={e => setTile({ ...tile, group: e.target.value })} placeholder="z.B. Intern, Tools, News…" list="group-suggestions" />
            <datalist id="group-suggestions">
              {[...new Set((typeof tiles !== 'undefined' ? [] : []).filter(Boolean))].map(g => <option key={g} value={g} />)}
            </datalist>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${th.label}`}>Beschreibung <span className="font-normal opacity-60">(optional)</span></label>
            <input className={`w-full rounded-lg px-4 py-2.5 border focus:border-blue-500 focus:outline-none ${th.modalInput}`} value={tile.description || ""} onChange={e => setTile({ ...tile, description: e.target.value })} placeholder="Kurze Notiz…" />
          </div>
          <label className="flex items-center gap-3 py-2 cursor-pointer select-none">
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${tile.showUrl ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-transparent'}`} onClick={() => setTile({ ...tile, showUrl: !tile.showUrl })}>
              {tile.showUrl && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={`text-sm font-medium ${th.text}`}>URL anzeigen</span>
          </label>
          <label className="flex items-center gap-3 py-2 cursor-pointer select-none">
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${tile.newTab ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-transparent'}`} onClick={() => setTile({ ...tile, newTab: !tile.newTab })}>
              {tile.newTab && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={`text-sm font-medium ${th.text}`}>In neuem Tab öffnen</span>
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors" onClick={onSave}>{saveLabel}</button>
          <button className={`flex-1 font-medium py-2.5 rounded-lg transition-colors border ${th.btn}`} onClick={onCancel}>Abbrechen</button>
        </div>
      </div>
    </div>
  )
}

function DraggableTile({ tile, index, moveTile, isDark, sizeClasses, showSettings, setEditingTile, deleteTile, toggleFavorite, updateTileColor, duplicateTile, th }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = (e) => { e.dataTransfer.setData("tileIndex", index); setIsDragging(true) }
  const dragEnd = () => setIsDragging(false)
  const dragOver = (e) => { e.preventDefault(); setIsDragOver(true) }
  const dragLeave = () => setIsDragOver(false)
  const drop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const from = parseInt(e.dataTransfer.getData("tileIndex"))
    if (from !== index) moveTile(from, index)
  }
  return (
    <a
      href={showSettings ? undefined : tile.url}
      target={tile.newTab ? "_blank" : "_self"}
      rel="noopener noreferrer"
      draggable
      onDragStart={dragStart}
      onDragEnd={dragEnd}
      onDragOver={dragOver}
      onDragLeave={dragLeave}
      onDrop={drop}
      onClick={e => { if (showSettings) e.preventDefault() }}
      className={`${sizeClasses[tile.size]} relative group rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40 scale-95' : ''} ${isDragOver ? 'scale-105 ring-4 ring-blue-400 ring-opacity-80' : ''} ${tile.hidden ? 'opacity-40' : ''}`}
      style={{
        background: isDark ? `linear-gradient(135deg, ${tile.color}, ${tile.color}cc)` : "#ffffff",
        border: isDark ? `1px solid rgba(255,255,255,0.1)` : `2px solid ${tile.color}`,
        boxShadow: isDark ? "none" : `0 4px 20px ${tile.color}33`
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
      <TileIcon icon={tile.icon} isDark={isDark} />
      <span className="font-semibold text-sm tracking-wide" style={{ color: isDark ? "#fff" : tile.color }}>{tile.title}</span>
      {tile.description && (
        <span className="text-xs mt-1 px-3 text-center opacity-70" style={{ color: isDark ? "rgba(255,255,255,0.6)" : tile.color + "bb" }}>{tile.description}</span>
      )}
      {tile.showUrl && (
        <span className="text-xs mt-1 truncate max-w-full px-4" style={{ color: isDark ? "rgba(255,255,255,0.5)" : tile.color + "99" }}>
          {tile.url.replace(/https?:\/\//, "").replace(/\/$/, "")}
        </span>
      )}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center gap-1.5 z-10 p-2">
          <span className="text-white text-xs font-semibold text-center truncate max-w-full opacity-80 mb-1">{tile.title}</span>
          <div className="flex gap-1.5">
          <button className={`p-2 rounded-lg text-sm transition-colors ${tile.favorite ? 'bg-yellow-400 bg-opacity-90 hover:bg-opacity-100' : 'bg-white bg-opacity-20 hover:bg-opacity-40'} text-white`} onClick={e => { e.preventDefault(); toggleFavorite(tile.id) }} title={tile.favorite ? 'Favorit entfernen' : 'Als Favorit markieren'}>⭐</button>
            <label className="bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-lg text-sm cursor-pointer flex items-center justify-center" title="Farbe ändern" onClick={e => e.stopPropagation()}>🎨<input type="color" className="w-0 h-0 opacity-0 absolute" value={tile.color} onChange={e => updateTileColor(tile.id, e.target.value)} /></label>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-lg text-sm" onClick={e => { e.preventDefault(); setEditingTile({ ...tile }) }}>✏️</button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-2 rounded-lg text-sm" title="Kachel duplizieren" onClick={e => { e.preventDefault(); duplicateTile(tile) }}>⧉</button>
            <button className={`p-2 rounded-lg text-sm transition-colors ${tile.hidden ? 'bg-gray-500 bg-opacity-80 hover:bg-opacity-100 text-white' : 'bg-white bg-opacity-20 hover:bg-opacity-40 text-white'}`} title={tile.hidden ? 'Einblenden' : 'Ausblenden'} onClick={e => { e.preventDefault(); toggleHiddenTile(tile.id) }}>{tile.hidden ? '🙈' : '👁️'}</button>
            <button className="bg-red-600 bg-opacity-80 hover:bg-opacity-100 text-white p-2 rounded-lg text-sm" onClick={e => { e.preventDefault(); deleteTile(tile.id) }}>🗑️</button>
          </div>
        </div>
      )}
      {tile.favorite && <span className="absolute top-2 left-2 text-sm">⭐</span>}
      {tile.newTab && <span className={`absolute text-xs ${tile.favorite ? 'top-2 right-2' : 'top-2 right-2'}`} style={{ color: isDark ? "rgba(255,255,255,0.4)" : tile.color + "88" }}>↗</span>}
    </a>
  )
}

export default function LinkDashboard() {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem("rp-theme") || "dark")
  const [isDark, setIsDark] = useState(true)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  useEffect(() => {
    localStorage.setItem("rp-theme", themeMode)
    if (themeMode === "auto") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      setIsDark(mq.matches)
      const handler = e => setIsDark(e.matches)
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    } else {
      setIsDark(themeMode === "dark")
    }
  }, [themeMode])

  const th = isDark ? themes.dark : themes.light

  const [tiles, setTiles] = useState(() => {
    try {
      const saved = localStorage.getItem("rp-dashboard-tiles")
      return saved ? JSON.parse(saved) : defaultTiles
    } catch { return defaultTiles }
  })

  useEffect(() => {
    localStorage.setItem("rp-dashboard-tiles", JSON.stringify(tiles))
  }, [tiles])

  const [showSettings, setShowSettings] = useState(false)
  const [editingTile, setEditingTile] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTile, setNewTile] = useState({ title: "", url: "", color: "#4285F4", size: "medium", newTab: true, icon: "🔗", showUrl: false, description: "", group: "" })
  const [searchQuery, setSearchQuery] = useState("")

  const [showSearch, setShowSearch] = useState(() => localStorage.getItem("rp-show-search") === "true")
  const [showGroups, setShowGroups] = useState(() => localStorage.getItem("rp-show-groups") === "true")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showHidden, setShowHidden] = useState(false)
  const [showFullscreenBtn, setShowFullscreenBtn] = useState(() => localStorage.getItem("rp-show-fullscreen") === "true")
  const [sortMode, setSortMode] = useState(() => localStorage.getItem("rp-sort-mode") || "manual")

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const toggleHiddenTile = (id) => setTiles(tiles.map(t => t.id === id ? { ...t, hidden: !t.hidden } : t))

  const toggleFavorite = (id) => setTiles(tiles.map(t => t.id === id ? { ...t, favorite: !t.favorite } : t))
  const updateTileColor = (id, color) => setTiles(tiles.map(t => t.id === id ? { ...t, color } : t))
  const duplicateTile = (tile) => {
    const newId = Date.now()
    const copy = { ...tile, id: newId, title: tile.title + ' (Kopie)' }
    const idx = tiles.findIndex(t => t.id === tile.id)
    const updated = [...tiles]
    updated.splice(idx + 1, 0, copy)
    setTiles(updated)
    setAddingId(newId)
    setTimeout(() => setAddingId(null), 400)
  }

  const filteredTiles = tiles
    .filter(tile => tile.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(tile => showHidden || !tile.hidden)
    .sort((a, b) => {
      if (sortMode === 'name') return a.title.localeCompare(b.title, 'de')
      if (sortMode === 'group') return (a.group || '').localeCompare(b.group || '', 'de') || a.title.localeCompare(b.title, 'de')
      if (sortMode === 'color') return a.color.localeCompare(b.color)
      return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0)
    })

  const groups = [...new Set(filteredTiles.map(t => t.group || ""))]
  const groupedTiles = groups.map(g => ({ group: g, tiles: filteredTiles.filter(t => (t.group || "") === g) }))
  const sizeClasses = { small: "col-span-1 h-32", medium: "col-span-1 h-40", large: "col-span-2 h-40" }

  const addTile = () => {
    if (!newTile.title || !newTile.url) return
    const url = newTile.url.startsWith("http") ? newTile.url : "https://" + newTile.url
    const newId = Date.now()
    setTiles([...tiles, { ...newTile, url, id: newId }])
    setAddingId(newId)
    setTimeout(() => setAddingId(null), 400)
    setNewTile({ title: "", url: "", color: "#4285F4", size: "medium", newTab: true, icon: "🔗", showUrl: false, description: "", group: "" })
    setShowAdd(false)
  }

  const updateTile = () => {
    if (!editingTile) return
    setTiles(tiles.map(t => t.id === editingTile.id ? editingTile : t))
    setEditingTile(null)
  }

  const [removingId, setRemovingId] = useState(null)
  const [addingId, setAddingId] = useState(null)

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const deleteTile = (id) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = () => {
    setRemovingId(confirmDeleteId)
    setConfirmDeleteId(null)
    setTimeout(() => {
      setTiles(tiles.filter(t => t.id !== confirmDeleteId))
      setRemovingId(null)
    }, 300)
  }

  const moveTile = (from, to) => {
    const updated = [...tiles]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setTiles(updated)
  }

  const [listView, setListView] = useState(() => localStorage.getItem("rp-list-view") === "true")

  useEffect(() => {
    localStorage.setItem("rp-list-view", listView)
  }, [listView])

  useEffect(() => {
    localStorage.setItem("rp-show-search", showSearch)
  }, [showSearch])

  useEffect(() => {
    localStorage.setItem("rp-show-groups", showGroups)
  }, [showGroups])

  useEffect(() => {
    localStorage.setItem("rp-show-fullscreen", showFullscreenBtn)
  }, [showFullscreenBtn])

  useEffect(() => {
    localStorage.setItem("rp-sort-mode", sortMode)
  }, [sortMode])

  const resetTiles = () => {
    if (window.confirm("Alle Kacheln auf Standard zurücksetzen?")) {
      setTiles(defaultTiles)
      setShowSettingsMenu(false)
    }
  }

  const exportTiles = () => {
    const blob = new Blob([JSON.stringify(tiles, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "rp-dashboard-kacheln.json"
    a.click()
    URL.revokeObjectURL(url)
    setShowSettingsMenu(false)
  }

  const importTiles = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result)
        if (Array.isArray(imported) && imported.length > 0) {
          if (window.confirm(`${imported.length} Kacheln importieren? Aktuelle Kacheln werden ersetzt.`)) {
            setTiles(imported)
            setShowSettingsMenu(false)
          }
        } else {
          alert("Ungültige Datei – keine Kacheln gefunden.")
        }
      } catch { alert("Fehler beim Lesen der Datei.") }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const [showHelp, setShowHelp] = useState(false)

  const [showBackup, setShowBackup] = useState(false)

  const [showWartung, setShowWartung] = useState(false)

  const [logoClickCount, setLogoClickCount] = useState(0)
  const [easterEgg, setEasterEgg] = useState(false)
  const logoClickTimer = useState(null)

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1
    setLogoClickCount(newCount)
    if (newCount >= 5) {
      setLogoClickCount(0)
      setEasterEgg(true)
      setTimeout(() => setEasterEgg(false), 7000)
    }
  }

  const closeMenus = () => { setShowThemeMenu(false); setShowSettingsMenu(false) }

  const ThemeIcon = () => {
    if (themeMode === "auto") return <span>🖥️</span>
    if (themeMode === "dark") return <span>🌙</span>
    return <span>☀️</span>
  }

  return (
    <div className={`min-h-screen ${th.bg} ${th.text} transition-colors duration-300`} onClick={closeMenus}>
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${th.header} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col leading-none select-none cursor-pointer" onClick={e => { e.stopPropagation(); handleLogoClick() }}>
              <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 900, fontSize: "1.35rem", letterSpacing: "-0.01em", color: th.logoText, lineHeight: 1.1 }}>RHEINISCHE ROST</span>
              <div style={{ height: "4px", background: "#F97316", borderRadius: "1px", marginTop: "3px" }} />
            </div>
            <div className={`ml-4 pl-4 border-l ${th.divider} flex flex-col justify-center`}>
              <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, fontSize: "0.95rem", letterSpacing: "0.04em", color: th.appName, lineHeight: 1.2 }}>Dashboard</span>
              <span style={{ fontSize: "0.65rem", letterSpacing: "0.08em", color: th.version, lineHeight: 1.2, marginTop: "1px" }}>Version 2.9</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {showSearch && (
            <div className="relative">
              <input className={`text-sm rounded-xl pl-10 pr-4 py-2.5 w-48 border focus:border-blue-500 focus:outline-none transition-all ${th.input}`} placeholder="Suchen…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onClick={e => e.stopPropagation()} />
              <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
            </div>
            )}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                className={`p-2.5 rounded-xl transition-colors border text-sm ${sortMode !== 'manual' ? 'bg-blue-600 border-blue-600 text-white' : th.btn}`}
                title="Sortierung"
                onClick={() => {
                  const modes = ['manual', 'name', 'group', 'color']
                  const next = modes[(modes.indexOf(sortMode) + 1) % modes.length]
                  setSortMode(next)
                }}
              >
                {sortMode === 'manual' ? '⇅' : sortMode === 'name' ? 'A–Z' : sortMode === 'group' ? '🗂' : '🎨'}
              </button>
            </div>
            {showFullscreenBtn && <button className={`px-4 py-2.5 rounded-xl transition-colors border text-sm font-medium ${isFullscreen ? 'bg-blue-600 border-blue-600 text-white' : th.btn}`} onClick={e => { e.stopPropagation(); toggleFullscreen() }}>{isFullscreen ? 'Vollbild ✕' : 'Vollbild'}</button>}
            <button className={`p-2.5 rounded-xl transition-colors border text-sm ${showSettings ? 'bg-blue-600 border-blue-600 text-white' : th.btn}`} title={showSettings ? 'Bearbeiten beenden' : 'Kacheln bearbeiten'} onClick={e => { e.stopPropagation(); setShowSettings(!showSettings); setShowSettingsMenu(false) }}>✏️</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-lg" onClick={e => { e.stopPropagation(); setShowAdd(true) }}>
              <span className="text-lg leading-none">+</span> Neue Kachel
            </button>
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button className={`p-2.5 rounded-xl transition-colors border ${th.btn}`} onClick={() => { setShowThemeMenu(!showThemeMenu); setShowSettingsMenu(false) }}><ThemeIcon /></button>
              {showThemeMenu && (
                <div className={`absolute right-0 mt-2 w-44 rounded-xl shadow-2xl border overflow-hidden z-50 ${th.panelBg}`}>
                  <div className="p-2 space-y-1">
                    {[{val:"auto",label:"Automatisch",icon:"🖥️"},{val:"dark",label:"Dunkel",icon:"🌙"},{val:"light",label:"Hell",icon:"☀️"}].map(opt => (
                      <button key={opt.val} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${themeMode === opt.val ? th.themeActiveBg : th.themeInactiveBg}`} onClick={() => { setThemeMode(opt.val); setShowThemeMenu(false) }}>
                        <span>{opt.icon}</span> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button className={`p-2.5 rounded-xl transition-colors border ${showSettings ? "bg-blue-600 border-blue-600 text-white" : th.btn}`} onClick={() => { setShowSettingsMenu(!showSettingsMenu); setShowThemeMenu(false) }}>⚙️</button>
              {showSettingsMenu && (
                <div className={`absolute right-0 mt-2 w-60 rounded-xl shadow-2xl border overflow-hidden z-50 ${th.panelBg}`}>
                  <div className="p-2 space-y-1">
                    <label className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer ${th.themeInactiveBg}`} onClick={e => e.stopPropagation()}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${showSearch ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-transparent'}`} onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(""); setShowSettingsMenu(false) }}>
                        {showSearch && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span>🔍</span> Suchfeld anzeigen
                    </label>
                    <label className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer ${th.themeInactiveBg}`} onClick={e => e.stopPropagation()}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${listView ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-transparent'}`} onClick={() => { setListView(!listView); setShowSettingsMenu(false) }}>
                        {listView && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span>📋</span> Listenansicht
                    </label>
                    <label className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer ${th.themeInactiveBg}`} onClick={e => e.stopPropagation()}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${showGroups ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-transparent'}`} onClick={() => { setShowGroups(!showGroups); setShowSettingsMenu(false) }}>
                        {showGroups && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                        <span>🗂️</span> Gruppen anzeigen
                    </label>
                    <label className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer ${th.themeInactiveBg}`} onClick={e => e.stopPropagation()}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${showHidden ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-transparent'}`} onClick={() => { setShowHidden(!showHidden); setShowSettingsMenu(false) }}>
                        {showHidden && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span>👁️</span> Versteckte anzeigen
                    </label>
                    <label className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer ${th.themeInactiveBg}`} onClick={e => e.stopPropagation()}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${showFullscreenBtn ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-transparent'}`} onClick={() => { setShowFullscreenBtn(!showFullscreenBtn); setShowSettingsMenu(false) }}>
                        {showFullscreenBtn && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span>⛶</span> Vollbild-Button
                    </label>

                    <div className={`my-1 border-t ${th.divider}`} />
                    <button className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${th.themeInactiveBg}`} onClick={() => { setShowBackup(true); setShowSettingsMenu(false) }}>
                      <span>💾</span> Backup
                    </button>
                    <div className={`my-1 border-t ${th.divider}`} />
                    <button className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${th.themeInactiveBg}`} onClick={() => { setShowHelp(true); setShowSettingsMenu(false) }}>
                      <span>❓</span> Anleitung
                    </button>
                    <div className={`my-1 border-t ${th.divider}`} />
                    <button className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${th.themeInactiveBg}`} onClick={() => { setShowWartung(true); setShowSettingsMenu(false) }}>
                      <span>🛠️</span> Wartung
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredTiles.length === 0 ? (
          <div className={`text-center py-24 ${th.emptyText}`}>
            <p className="text-5xl mb-4">📫</p>
            {searchQuery ? (
              <>
                <p className="text-lg">Keine Treffer für "{searchQuery}"</p>
                <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mx-auto" onClick={() => setSearchQuery("")}>✕ Suche zurücksetzen</button>
              </>
            ) : (
              <>
                <p className="text-lg">Keine Kacheln gefunden.</p>
                <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm" onClick={() => { setSearchQuery(""); setShowAdd(true) }}>Neue Kachel hinzufügen</button>
              </>
            )}
          </div>
        ) : listView ? (
          <div className="space-y-8">
            {groupedTiles.map(({ group, tiles: groupTiles }) => (
              <div key={group}>
                {group ? (
                  <div className={`flex items-center gap-3 mb-2`}>
                    <span className={`text-xs font-bold uppercase tracking-widest ${th.label}`}>{group}</span>
                    <div className={`flex-1 h-px ${th.divider} border-t`} />
                  </div>
                ) : null}
                <div className={`rounded-2xl border overflow-hidden ${th.panelBg}`}>
                {groupTiles.map((tile, index) => (
              <a
                key={tile.id}
                href={showSettings ? undefined : tile.url}
                target={tile.newTab ? "_blank" : "_self"}
                rel="noopener noreferrer"
                onClick={e => { if (showSettings) e.preventDefault() }}
                className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-opacity-10 hover:bg-blue-400 ${index !== 0 ? `border-t ${th.divider}` : ''}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${tile.color}, ${tile.color}cc)` }}>
  {tile.icon && tile.icon.startsWith('https://') ? (
                    <img src={tile.icon} alt="icon" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                  ) : tile.icon === 'ariba' ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>ariba</span>
                  ) : tile.icon === 'jira' ? (
                    <svg viewBox="0 0 32 32" style={{ width: 24, height: 24 }}>
                      <defs><linearGradient id="jiraGrad2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2684FF" /><stop offset="100%" stopColor="#0052CC" /></linearGradient></defs>
                      <path d="M15.98 0.16L8.1 8.04 3.9 3.84a1.3 1.3 0 00-1.84 0L.16 5.74a1.3 1.3 0 000 1.84l7.02 7.02-7.02 7.02a1.3 1.3 0 000 1.84l1.9 1.9a1.3 1.3 0 001.84 0l4.2-4.2 7.88 7.88a1.3 1.3 0 001.84 0l1.9-1.9a1.3 1.3 0 000-1.84L11.7 17.28l4.28-4.28 7.88-7.88a1.3 1.3 0 000-1.84L21.96.16a1.3 1.3 0 00-1.84 0z" fill="url(#jiraGrad2)" transform="translate(4,4) scale(0.9)" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: 20 }}>{tile.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm flex items-center gap-1 ${th.text}`}>
                    {tile.favorite && <span className="text-xs">⭐</span>}
                    {tile.title}
                    {tile.newTab && <span className="text-xs opacity-40">↗</span>}
                  </div>
                  <div className={`text-xs truncate ${th.subtext}`}>{tile.url.replace(/https?:\/\//, '').replace(/\/$/, '')}</div>
                </div>
                {showSettings && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className={`p-1.5 rounded-lg text-sm transition-colors ${tile.favorite ? 'bg-yellow-400 text-white' : `border ${th.btn}`}`} onClick={e => { e.preventDefault(); toggleFavorite(tile.id) }}>⭐</button>
                    <button className={`p-1.5 rounded-lg text-sm border transition-colors ${th.btn}`} onClick={e => { e.preventDefault(); setEditingTile({ ...tile }) }}>✏️</button>
                    <button className={`p-1.5 rounded-lg text-sm transition-colors border ${tile.hidden ? 'bg-gray-500 text-white border-gray-500' : th.btn}`} title={tile.hidden ? 'Einblenden' : 'Ausblenden'} onClick={e => { e.preventDefault(); toggleHiddenTile(tile.id) }}>{tile.hidden ? '🙈' : '👁️'}</button>
                    <button className="p-1.5 rounded-lg text-sm bg-red-600 bg-opacity-80 hover:bg-opacity-100 text-white transition-colors" onClick={e => { e.preventDefault(); deleteTile(tile.id) }}>🗑️</button>
                  </div>
                )}
              </a>
            ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {(showGroups ? groupedTiles : [{ group: "", tiles: filteredTiles }]).map(({ group, tiles: groupTiles }) => (
              <div key={group}>
                {showGroups && group ? (
                  <div className={`flex items-center gap-3 mb-4`}>
                    <span className={`text-xs font-bold uppercase tracking-widest ${th.label}`}>{group}</span>
                    <div className={`flex-1 h-px ${th.divider} border-t`} />
                  </div>
                ) : null}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupTiles.map((tile, index) => (
                    <div
                      key={tile.id}
                      style={{
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                        opacity: removingId === tile.id ? 0 : addingId === tile.id ? 0 : 1,
                        transform: removingId === tile.id ? 'scale(0.8)' : addingId === tile.id ? 'scale(0.8)' : 'scale(1)',
                      }}
                    >
                      <DraggableTile
                        tile={tile}
                        index={filteredTiles.indexOf(tile)}
                        moveTile={moveTile}
                        isDark={isDark}
                        sizeClasses={sizeClasses}
                        showSettings={showSettings}
                        setEditingTile={setEditingTile}
                        deleteTile={deleteTile}
                        toggleFavorite={toggleFavorite}
                        updateTileColor={updateTileColor}
                        duplicateTile={duplicateTile}
                        th={th}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {confirmDeleteId && (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteId(null)}>
      <div className={`rounded-2xl p-6 w-full max-w-sm border shadow-2xl ${th.modal}`} onClick={e => e.stopPropagation()}>
        <p className="text-4xl text-center mb-3">🗑️</p>
        <h3 className={`text-lg font-bold text-center mb-2 ${th.text}`}>Kachel löschen?</h3>
        <p className={`text-sm text-center mb-6 ${th.label}`}>"{tiles.find(t => t.id === confirmDeleteId)?.title}" wird unwiderruflich gelöscht.</p>
        <div className="flex gap-3">
          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors" onClick={confirmDelete}>Löschen</button>
          <button className={`flex-1 font-medium py-2.5 rounded-lg transition-colors border ${th.btn}`} onClick={() => setConfirmDeleteId(null)}>Abbrechen</button>
        </div>
      </div>
    </div>
  )}
  {showWartung && (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowWartung(false)}>
      <div className={`rounded-2xl p-6 w-full max-w-sm border shadow-2xl ${th.modal}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${th.text}`}>🛠️ Wartung</h3>
          <button className={`p-1.5 rounded-lg transition-colors border ${th.btn}`} onClick={() => setShowWartung(false)}>✕</button>
        </div>
        <div className="space-y-3">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-yellow-500 border-opacity-40 bg-yellow-500 bg-opacity-10 hover:bg-opacity-20 transition-colors" onClick={() => { if (window.confirm('Cache leeren und neu laden?')) { localStorage.clear(); window.location.reload() } }}>
            <span className="text-2xl">🗑️</span>
            <div className="text-left">
              <p className="font-medium text-sm text-yellow-500">Cache leeren & neu laden</p>
              <p className={`text-xs ${th.label}`}>Alle gespeicherten Daten löschen</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500 border-opacity-40 bg-red-500 bg-opacity-10 hover:bg-opacity-20 transition-colors" onClick={() => { resetTiles(); setShowWartung(false) }}>
            <span className="text-2xl">🔄</span>
            <div className="text-left">
              <p className="font-medium text-sm text-red-500">Auf Standard zurücksetzen</p>
              <p className={`text-xs ${th.label}`}>Alle Kacheln auf Standardwerte zurücksetzen</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )}
  {showBackup && (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowBackup(false)}>
      <div className={`rounded-2xl p-6 w-full max-w-sm border shadow-2xl ${th.modal}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${th.text}`}>💾 Backup</h3>
          <button className={`p-1.5 rounded-lg transition-colors border ${th.btn}`} onClick={() => setShowBackup(false)}>✕</button>
        </div>
        <div className="space-y-3">
          <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${th.themeInactiveBg}`} onClick={() => { exportTiles(); setShowBackup(false) }}>
            <span className="text-2xl">📤</span>
            <div className="text-left">
              <p className={`font-medium text-sm ${th.text}`}>Exportieren</p>
              <p className={`text-xs ${th.label}`}>Kacheln als JSON-Datei speichern</p>
            </div>
          </button>
          <label className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors cursor-pointer ${th.themeInactiveBg}`}>
            <span className="text-2xl">📥</span>
            <div className="text-left">
              <p className={`font-medium text-sm ${th.text}`}>Importieren</p>
              <p className={`text-xs ${th.label}`}>Kacheln aus JSON-Datei laden</p>
            </div>
            <input type="file" accept=".json" className="hidden" onChange={(e) => { importTiles(e); setShowBackup(false) }} />
          </label>
        </div>
      </div>
    </div>
  )}
  {showHelp && (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowHelp(false)}>
      <div className={`rounded-2xl w-full max-w-lg border shadow-2xl overflow-hidden ${th.modal}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${th.text}`}>❓ Anleitung</h3>
          <button className={`p-1.5 rounded-lg transition-colors border ${th.btn}`} onClick={() => setShowHelp(false)}>✕</button>
        </div>
        <div className="overflow-y-auto max-h-[70vh] px-6 py-4 space-y-5">
          {[
            { icon: '➕', title: 'Kachel hinzufügen', text: 'Klicke oben rechts auf "+ Neue Kachel". Gib Titel, URL, Icon und Farbe ein und bestätige mit "Hinzufügen".' },
            { icon: '✏️', title: 'Kachel bearbeiten', text: 'Aktiviere den Bearbeitungsmodus über ⚙️ → "Kacheln bearbeiten". Dann erscheint auf jeder Kachel ein ✏️-Button.' },
            { icon: '🗑️', title: 'Kachel löschen', text: 'Im Bearbeitungsmodus auf 🗑️ klicken. Es erscheint eine Sicherheitsabfrage bevor die Kachel gelöscht wird.' },
            { icon: '↕️', title: 'Drag & Drop', text: 'Im Bearbeitungsmodus kannst du Kacheln per Drag & Drop verschieben. Die Ziel-Kachel leuchtet blau auf.' },
            { icon: '⭐', title: 'Favoriten', text: 'Im Bearbeitungsmodus auf ⭐ klicken, um eine Kachel als Favorit zu markieren. Favoriten erscheinen immer ganz oben.' },
            { icon: '🔍', title: 'Suchfeld', text: 'Das Suchfeld kann über ⚙️ → Checkbox "Suchfeld anzeigen" ein- oder ausgeblendet werden.' },
            { icon: '📋', title: 'Listenansicht', text: 'Über ⚙️ → Checkbox "Listenansicht" kannst du zwischen Kachel- und kompakter Listenansicht wechseln.' },
            { icon: '🌐', title: 'Favicon als Icon', text: 'Im Kachel-Formular auf "🌐 Favicon" klicken, um das Logo der Website automatisch als Icon zu laden.' },
            { icon: '📤', title: 'Export & Import', text: 'Über ⚙️ kannst du alle Kacheln als JSON-Datei exportieren und auf einem anderen Gerät wieder importieren.' },
            { icon: '🌙', title: 'Theme wechseln', text: 'Über den 🌙-Button oben rechts kannst du zwischen Dunkel, Hell und Automatisch (Systemeinstellung) wechseln.' },
            { icon: '🗂️', title: 'Gruppen anzeigen', text: 'Über ⚙️ → Checkbox "Gruppen anzeigen" werden Kacheln nach ihrer Gruppe mit Trennlinien gegliedert. Standard: aus.' },
            { icon: '👁️', title: 'Kacheln ausblenden', text: 'Im Bearbeitungsmodus auf 👁️ klicken, um eine Kachel auszublenden. Ausgeblendete Kacheln bleiben gespeichert und können über ⚙️ → "Versteckte anzeigen" wieder sichtbar gemacht werden.' },
            { icon: '⛶', title: 'Vollbild-Modus', text: 'Den Vollbild-Button kann über ⚙️ → Checkbox "Vollbild-Button" eingeblendet werden. Ein Klick darauf öffnet das Dashboard im Browser-Vollbild. Beenden mit ESC oder erneutem Klick.' },
          ].map(item => (
            <div key={item.title} className={`flex gap-3 p-3 rounded-xl ${th.themeInactiveBg}`}>
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className={`font-semibold text-sm mb-0.5 ${th.text}`}>{item.title}</p>
                <p className={`text-xs leading-relaxed ${th.label}`}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={`px-6 py-4 border-t text-xs text-center ${th.label}`} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>Version 2.9 • RHEINISCHE ROST Dashboard</div>
      </div>
    </div>
  )}
  {easterEgg && (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 80 + 20}px`,
            fontSize: `${Math.random() * 24 + 16}px`,
            animation: `fall ${Math.random() * 1 + 1}s linear ${Math.random() * 1}s forwards`,
            opacity: 0,
          }}
        >📰</span>
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random() * 360)}deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  )}
  {showAdd && <TileForm tile={newTile} setTile={setNewTile} onSave={addTile} onCancel={() => setShowAdd(false)} saveLabel="Hinzufügen" th={th} />}
      {editingTile && <TileForm tile={editingTile} setTile={setEditingTile} onSave={updateTile} onCancel={() => setEditingTile(null)} saveLabel="Speichern" th={th} />}
      <footer className={`text-center py-6 text-xs ${th.footer}`}>{tiles.length} Kacheln{tiles.filter(t => t.favorite).length > 0 ? ` • ${tiles.filter(t => t.favorite).length} Favoriten` : ''} • Dashboard</footer>
    </div>
  )
}
