# Biege-Regisseur - Komplette Setup-Anleitung

## Schritt 1: Supabase Datenbank einrichten (vom Handy)

### 1.1 Supabase Projekt erstellen
1. Öffnen Sie https://supabase.com auf Ihrem Handy
2. Klicken Sie "Start your project"
3. Melden Sie sich an (GitHub, Google, oder E-Mail)
4. Klicken Sie "New Project"
5. Geben Sie ein:
   - Name: `biegemaschine` (oder beliebig)
   - Database Password: **WICHTIG - Notieren Sie sich dieses Passwort!**
   - Region: Wählen Sie die nächstgelegene (z.B. Frankfurt)
6. Klicken Sie "Create new project"
7. Warten Sie 2-3 Minuten bis das Projekt erstellt ist

### 1.2 SQL-Skripte ausführen
1. Gehen Sie zu "SQL Editor" (linkes Menü)
2. Klicken Sie "New query"
3. Kopieren Sie den Inhalt von `scripts/001_create_bending_tables.sql`
4. Fügen Sie ihn ein und klicken Sie "Run"
5. Wiederholen Sie für `scripts/002_insert_default_tools.sql`

### 1.3 API Keys kopieren
1. Gehen Sie zu "Project Settings" (Zahnrad-Symbol unten links)
2. Klicken Sie "API"
3. Kopieren Sie diese Werte (WICHTIG!):
   - **Project URL** (z.B. https://xxxxx.supabase.co)
   - **anon public** Key (der lange Text unter "Project API keys")

## Schritt 2: Admin-User in Supabase anlegen

1. Gehen Sie zu "Authentication" → "Users"
2. Klicken Sie "Add user" → "Create new user"
3. Füllen Sie aus:
   - Email: `admin@biegemaschine.local`
   - Password: `Admin`
   - ✅ **Auto Confirm User** aktivieren!
4. Klicken Sie "Create user"

## Schritt 3: Vercel Deployment

### 3.1 GitHub Repository erstellen
1. Öffnen Sie https://github.com auf Ihrem Handy
2. Klicken Sie "+" → "New repository"
3. Name: `biegemaschine`
4. Klicken Sie "Create repository"

### 3.2 Code hochladen
1. In v0: Klicken Sie die drei Punkte oben rechts
2. Wählen Sie "Push to GitHub"
3. Wählen Sie Ihr Repository `biegemaschine`
4. Klicken Sie "Push"

### 3.3 Vercel verbinden
1. Öffnen Sie https://vercel.com auf Ihrem Handy
2. Melden Sie sich mit GitHub an
3. Klicken Sie "Add New..." → "Project"
4. Wählen Sie Ihr Repository `biegemaschine`
5. Klicken Sie "Import"

### 3.4 Environment Variables setzen
**WICHTIG:** Bevor Sie deployen, müssen Sie die Supabase Keys eingeben!

1. Scrollen Sie zu "Environment Variables"
2. Fügen Sie hinzu:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: [Ihre Project URL von Schritt 1.3]
   - ✅ Production, Preview, Development alle aktivieren

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: [Ihr anon public Key von Schritt 1.3]
   - ✅ Production, Preview, Development alle aktivieren

3. Klicken Sie "Deploy"
4. Warten Sie 2-3 Minuten

## Schritt 4: App nutzen

1. Nach dem Deployment klicken Sie "Visit"
2. Melden Sie sich an mit:
   - Email: `admin@biegemaschine.local`
   - Passwort: `Admin`

## Andere Benutzer registrieren

Andere Personen können sich registrieren mit:
1. Benutzername: [beliebig]
2. Passwort: [beliebig]
3. Registrierungscode: `Schlosser`

Das System erstellt automatisch eine E-Mail-Adresse im Format `benutzername@bending-app.local`.

## Wichtige Hinweise

- **Alle Daten sind gemeinsam**: Jeder Benutzer sieht die gleichen Biege-Rezepte
- **Lernsystem**: Das System lernt mit jeder gespeicherten Biegung
- **Sicherheit**: Passwörter werden verschlüsselt in Supabase gespeichert
- **Kostenlos**: Supabase und Vercel sind kostenlos für kleine Projekte

## Troubleshooting

### "404 - Page not found"
- Prüfen Sie ob die Environment Variables gesetzt sind
- Gehen Sie zu Vercel → Ihr Projekt → Settings → Environment Variables
- Stellen Sie sicher dass beide Keys vorhanden sind

### "Anmeldung fehlgeschlagen"
- Prüfen Sie ob der Admin-User in Supabase existiert
- Gehen Sie zu Supabase → Authentication → Users
- Der User muss "Auto Confirmed" sein (grüner Haken)

### "Keine Werkzeuge verfügbar"
- Prüfen Sie ob die SQL-Skripte ausgeführt wurden
- Gehen Sie zu Supabase → SQL Editor
- Führen Sie `002_insert_default_tools.sql` erneut aus

## Support

Bei Problemen:
1. Prüfen Sie die Vercel Logs: Vercel → Ihr Projekt → Deployments → [Neuestes] → Logs
2. Prüfen Sie die Supabase Logs: Supabase → Logs
3. Öffnen Sie ein Support-Ticket bei Vercel: https://vercel.com/help
