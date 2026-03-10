const TRANSLATIONS = {
de: {
appTitle: '🎩✨ Magic Showrunner',
    appVersion: 'v1.3',
    appVersion: 'v1.4',
appSub: 'Dein professioneller Bühnen-Assistent',
backupReminder: '💾 Kein Backup seit {days} Tagen – jetzt sichern?',
backupReminderBtn: '📥 Jetzt Backup erstellen',
@@ -149,11 +149,11 @@ const TRANSLATIONS = {
shareGDrive: '☁️ Google Drive', shareICloud: '☁️ iCloud',
ttsVoice: 'Stimme', ttsRate: 'Geschwindigkeit', ttsPitch: 'Tonhöhe', ttsPreview: '🔊 Vorschau',
ttsPreviewText: 'Das ist eine Vorschau der Stimme.',
    wakelock: '📱 Bildschirm aktiv halten', offlineReady: '✅ Offline bereit',
    wakelock: '📱 Bildschirm aktiv halten', offlineReady: 'offline',
},
en: {
appTitle: '🎩✨ Magic Showrunner',
    appVersion: 'v1.3', appSub: 'Your professional stage assistant',
    appVersion: 'v1.4', appSub: 'Your professional stage assistant',
backupReminder: '💾 No backup for {days} days – save now?',
backupReminderBtn: '📥 Create Backup now',
backupReminderDismiss: 'Later',
@@ -206,7 +206,7 @@ const TRANSLATIONS = {
shareGDrive: '☁️ Google Drive', shareICloud: '☁️ iCloud',
ttsVoice: 'Voice', ttsRate: 'Speed', ttsPitch: 'Pitch', ttsPreview: '🔊 Preview',
ttsPreviewText: 'This is a voice preview.',
    wakelock: '📱 Keep screen active', offlineReady: '✅ Offline ready',
    wakelock: '📱 Keep screen active', offlineReady: 'offline',
},
};

@@ -282,6 +282,7 @@ export default function ShowRunner() {
const [backupReminderDays, setBackupReminderDays] = useState(0);
const BACKUP_REMINDER_DAYS = 5;
const [wakeLockActive, setWakeLockActive] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
const wakeLockRef = useRef(null);
const touchStartX = useRef(null);
const touchStartY = useRef(null);
@@ -846,7 +847,7 @@ export default function ShowRunner() {
<div>
<h1 className={`font-black text-xl ${th.headText} flex items-baseline gap-2`}>
{t.appTitle}
                  <span className={`text-xs font-normal opacity-40 ${th.textSub}`}>v1.3</span>
                  <span className={`text-xs font-normal opacity-40 ${th.textSub}`}>v1.4</span>
</h1>
<p className={`text-xs ${th.textSub}`}>{t.appSub}</p>
</div>
