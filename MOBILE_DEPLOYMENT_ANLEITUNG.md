# 📱 Mobile Deployment Anleitung - Biege-Regisseur

Diese Anleitung zeigt Ihnen **Schritt für Schritt**, wie Sie die Biege-Regisseur App **komplett vom Handy aus** auf GitHub hochladen und als öffentliche Webseite veröffentlichen.

## 🎯 Was Sie erreichen werden

- ✅ App auf GitHub hochladen
- ✅ Gemeinsame Datenbank für alle Benutzer einrichten (Supabase)
- ✅ App als öffentliche Webseite veröffentlichen
- ✅ Alle Benutzer können die gleichen Daten sehen und nutzen

---

## 📋 Voraussetzungen

- Ein Smartphone (iOS oder Android)
- Internetverbindung
- Ca. 30-45 Minuten Zeit

---

## Teil 1: Supabase Datenbank einrichten (15 Min)

### Schritt 1: Supabase Account erstellen

1. Öffnen Sie auf Ihrem Handy den Browser (Safari, Chrome, etc.)
2. Gehen Sie zu: **https://supabase.com**
3. Tippen Sie auf **"Start your project"**
4. Wählen Sie **"Sign up with GitHub"** (empfohlen) oder Email
5. Folgen Sie den Anweisungen zur Registrierung

### Schritt 2: Neues Projekt erstellen

1. Nach dem Login tippen Sie auf **"New Project"**
2. Geben Sie ein:
   - **Name**: `biege-regisseur` (oder einen Namen Ihrer Wahl)
   - **Database Password**: Wählen Sie ein sicheres Passwort (WICHTIG: Notieren Sie es!)
   - **Region**: Wählen Sie `Europe (Frankfurt)` oder die nächstgelegene Region
3. Tippen Sie auf **"Create new project"**
4. Warten Sie 2-3 Minuten bis das Projekt erstellt ist

### Schritt 3: SQL Skripte ausführen

1. In Ihrem Supabase Projekt, tippen Sie links auf **"SQL Editor"**
2. Tippen Sie auf **"New query"**
3. Kopieren Sie den Inhalt aus `scripts/001_create_bending_tables.sql`
4. Fügen Sie ihn in den SQL Editor ein
5. Tippen Sie auf **"Run"** (unten rechts)
6. Wiederholen Sie dies für:
   - `scripts/002_insert_default_tools.sql`
   - `scripts/003_create_user_trigger.sql`

### Schritt 4: API Keys kopieren

1. Tippen Sie links auf **"Project Settings"** (Zahnrad-Symbol)
2. Tippen Sie auf **"API"**
3. Scrollen Sie zu **"Project API keys"**
4. Kopieren Sie diese beiden Werte (WICHTIG - Sie brauchen sie später):
   - **Project URL** (z.B. `https://xxxxx.supabase.co`)
   - **anon public** Key (langer Text)

**💡 Tipp**: Senden Sie sich diese Werte per Email oder speichern Sie sie in einer Notiz-App!

---

## Teil 2: GitHub Repository erstellen (10 Min)

### Schritt 1: GitHub Account erstellen (falls noch nicht vorhanden)

1. Öffnen Sie: **https://github.com**
2. Tippen Sie auf **"Sign up"**
3. Folgen Sie den Anweisungen zur Registrierung
4. Bestätigen Sie Ihre Email-Adresse

### Schritt 2: Neues Repository erstellen

1. Nach dem Login tippen Sie auf das **"+"** Symbol (oben rechts)
2. Wählen Sie **"New repository"**
3. Geben Sie ein:
   - **Repository name**: `biege-regisseur`
   - **Description**: "Digitaler Biege-Regisseur für Biegemaschinen"
   - Wählen Sie **"Public"** (damit es als Webseite funktioniert)
   - ✅ Aktivieren Sie **"Add a README file"**
4. Tippen Sie auf **"Create repository"**

### Schritt 3: Code hochladen

**Option A: Via v0 (Empfohlen)**

1. In v0, tippen Sie auf die **drei Punkte** (⋮) oben rechts
2. Wählen Sie **"Push to GitHub"**
3. Verbinden Sie Ihr GitHub Account
4. Wählen Sie das Repository `biege-regisseur`
5. Tippen Sie auf **"Push"**

**Option B: Via GitHub Web Interface**

1. Laden Sie die ZIP-Datei von v0 herunter:
   - Tippen Sie auf **⋮** → **"Download ZIP"**
2. Entpacken Sie die ZIP-Datei auf Ihrem Handy
3. Gehen Sie zu Ihrem GitHub Repository
4. Tippen Sie auf **"Add file"** → **"Upload files"**
5. Laden Sie alle Dateien hoch (kann mehrere Durchgänge brauchen)
6. Tippen Sie auf **"Commit changes"**

---

## Teil 3: Vercel Deployment (10 Min)

**Warum Vercel?** Vercel unterstützt Environment Variables und ist perfekt für Next.js Apps. GitHub Pages funktioniert nur für statische Seiten.

### Schritt 1: Vercel Account erstellen

1. Öffnen Sie: **https://vercel.com**
2. Tippen Sie auf **"Sign Up"**
3. Wählen Sie **"Continue with GitHub"**
4. Autorisieren Sie Vercel

### Schritt 2: Projekt importieren

1. Nach dem Login tippen Sie auf **"Add New..."** → **"Project"**
2. Suchen Sie Ihr Repository `biege-regisseur`
3. Tippen Sie auf **"Import"**

### Schritt 3: Environment Variables hinzufügen

**WICHTIG**: Hier fügen Sie Ihre Supabase Keys ein!

1. Scrollen Sie zu **"Environment Variables"**
2. Fügen Sie hinzu:

\`\`\`
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Ihre Supabase Project URL]

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Ihr Supabase anon public Key]
\`\`\`

3. Tippen Sie auf **"Deploy"**
4. Warten Sie 2-3 Minuten

### Schritt 4: Ihre App ist live! 🎉

1. Nach dem Deployment sehen Sie eine URL wie: `https://biege-regisseur.vercel.app`
2. Tippen Sie darauf um Ihre App zu öffnen
3. Teilen Sie diese URL mit Ihren Kollegen!

---

## Teil 4: Erste Schritte in der App (5 Min)

### Registrierung

1. Öffnen Sie Ihre App-URL
2. Tippen Sie auf **"Registrieren"**
3. Geben Sie ein:
   - **Email**: Ihre Email-Adresse
   - **Passwort**: Ein sicheres Passwort
   - **Registrierungscode**: `Schlosser`
4. Tippen Sie auf **"Registrieren"**
5. Bestätigen Sie Ihre Email (prüfen Sie Ihren Posteingang)

### Erste Biegung lernen

1. Nach dem Login gehen Sie zu **"Biege-Parameter"**
2. Geben Sie die Parameter ein (Material, Dicke, etc.)
3. Wenn kein Rezept gefunden wird, geben Sie die Maschinenwerte ein
4. Das System speichert diese Werte für alle Benutzer!

---

## 🔧 Troubleshooting

### Problem: "Database connection failed"

**Lösung**: 
1. Prüfen Sie ob die Environment Variables korrekt sind
2. Gehen Sie zu Vercel → Ihr Projekt → Settings → Environment Variables
3. Vergleichen Sie mit Ihren Supabase Keys

### Problem: "User not authenticated"

**Lösung**:
1. Prüfen Sie ob Sie Ihre Email bestätigt haben
2. Loggen Sie sich aus und wieder ein
3. Löschen Sie Browser-Cache

### Problem: SQL Skripte funktionieren nicht

**Lösung**:
1. Führen Sie die Skripte einzeln aus (nicht alle auf einmal)
2. Prüfen Sie auf Fehlermeldungen im SQL Editor
3. Stellen Sie sicher dass Sie in der richtigen Reihenfolge ausführen (001, 002, 003)

---

## 📊 Wie die gemeinsame Datenbank funktioniert

- **Alle Benutzer** sehen die gleichen Biege-Rezepte
- **Alle Benutzer** können neue Rezepte hinzufügen
- **Alle Benutzer** profitieren vom Lernsystem
- Die Daten sind **sicher** durch Row Level Security (RLS)
- Jeder Benutzer kann nur seine eigenen Zeichnungen sehen

---

## 🔐 Sicherheit

### Registrierungscode ändern

Der Registrierungscode `Schlosser` ist im Code sichtbar. Um ihn zu ändern:

1. Gehen Sie zu Ihrem GitHub Repository
2. Öffnen Sie `components/login-form.tsx`
3. Suchen Sie nach `REGISTRATION_CODE = "Schlosser"`
4. Ändern Sie `"Schlosser"` zu Ihrem gewünschten Code
5. Speichern Sie die Datei
6. Vercel deployed automatisch die Änderung

### Passwörter

- Passwörter werden **verschlüsselt** in Supabase gespeichert
- Niemand (auch nicht Sie) kann die Passwörter sehen
- Supabase verwendet bcrypt für sichere Verschlüsselung

---

## 🎓 Nächste Schritte

1. **Kollegen einladen**: Teilen Sie die App-URL und den Registrierungscode
2. **Daten eingeben**: Beginnen Sie Biege-Rezepte zu speichern
3. **Zeichnungen hochladen**: Nutzen Sie die OCR-Funktion
4. **System trainieren**: Je mehr Daten, desto intelligenter wird das System

---

## 💡 Tipps

- **Backup**: Supabase macht automatisch Backups Ihrer Datenbank
- **Updates**: Wenn Sie Code ändern, pushed Vercel automatisch die neue Version
- **Monitoring**: In Vercel können Sie sehen wie viele Benutzer die App nutzen
- **Kosten**: Supabase und Vercel sind kostenlos für kleine Teams (bis 500MB Datenbank)

---

## 📞 Support

Bei Problemen:
1. Prüfen Sie die Troubleshooting-Sektion
2. Schauen Sie in die Vercel Logs: Vercel → Ihr Projekt → Deployments → Logs
3. Prüfen Sie Supabase Logs: Supabase → Logs

---

**Viel Erfolg mit Ihrem Digitalen Biege-Regisseur! 🎉**
