# Supabase Setup Anleitung - Vom Handy aus

Diese Anleitung zeigt Ihnen Schritt für Schritt, wie Sie die Biege-Regisseur App mit Supabase einrichten und auf Vercel deployen - alles vom Handy aus!

## Schritt 1: Supabase Datenbank einrichten

### 1.1 Supabase Account erstellen
1. Öffnen Sie auf Ihrem Handy: https://supabase.com
2. Klicken Sie auf "Start your project"
3. Registrieren Sie sich mit Ihrer E-Mail oder GitHub

### 1.2 Neues Projekt erstellen
1. Klicken Sie auf "New Project"
2. Geben Sie einen Namen ein: z.B. "bending-machine"
3. Wählen Sie ein sicheres Datenbank-Passwort
4. Wählen Sie eine Region (am besten Europa)
5. Klicken Sie auf "Create new project"
6. Warten Sie 2-3 Minuten bis das Projekt bereit ist

### 1.3 SQL-Skripte ausführen
1. Gehen Sie im Supabase Dashboard zu "SQL Editor" (linkes Menü)
2. Klicken Sie auf "New query"
3. Kopieren Sie den Inhalt aus `scripts/001_create_bending_tables.sql`
4. Fügen Sie ihn ein und klicken Sie auf "Run"
5. Wiederholen Sie dies für `scripts/002_insert_default_tools.sql`
6. Und für `scripts/003_create_user_trigger.sql`

### 1.4 API Keys kopieren
1. Gehen Sie zu "Project Settings" (Zahnrad-Symbol unten links)
2. Klicken Sie auf "API"
3. Kopieren Sie folgende Werte:
   - **Project URL** (z.B. https://xxxxx.supabase.co)
   - **anon public** Key (der lange String unter "Project API keys")

## Schritt 2: Vercel Deployment

### 2.1 Vercel Account erstellen
1. Öffnen Sie: https://vercel.com
2. Klicken Sie auf "Sign Up"
3. Wählen Sie "Continue with GitHub"
4. Autorisieren Sie Vercel

### 2.2 GitHub Repository verbinden
1. In v0: Klicken Sie oben rechts auf das GitHub-Symbol
2. Wählen Sie "Push to GitHub"
3. Geben Sie einen Repository-Namen ein: z.B. "bending-machine-app"
4. Klicken Sie auf "Create Repository"

### 2.3 Projekt auf Vercel deployen
1. Gehen Sie zu https://vercel.com/new
2. Wählen Sie Ihr GitHub Repository "bending-machine-app"
3. Klicken Sie auf "Import"
4. **WICHTIG**: Bevor Sie auf "Deploy" klicken, fügen Sie die Environment Variables hinzu:

#### Environment Variables hinzufügen:
Klicken Sie auf "Environment Variables" und fügen Sie hinzu:

\`\`\`
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Ihre Project URL von Schritt 1.4]

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Ihr anon public Key von Schritt 1.4]

Name: SUPABASE_URL
Value: [Ihre Project URL von Schritt 1.4]

Name: SUPABASE_ANON_KEY
Value: [Ihr anon public Key von Schritt 1.4]
\`\`\`

5. Klicken Sie auf "Deploy"
6. Warten Sie 2-3 Minuten

### 2.4 App öffnen
1. Nach erfolgreichem Deployment klicken Sie auf "Visit"
2. Ihre App ist jetzt live!

## Schritt 3: Ersten Benutzer erstellen

1. Öffnen Sie Ihre deployed App
2. Klicken Sie auf "Registrieren"
3. Geben Sie ein:
   - Benutzername: [Ihr Name]
   - Passwort: [Ihr Passwort]
   - Registrierungscode: **Schlosser**
4. Klicken Sie auf "Registrieren"

## Wichtige Hinweise

### Gemeinsame Datenbank
- Alle Benutzer sehen die gleichen Biege-Rezepte
- Wenn ein Benutzer ein neues Rezept lernt, ist es für alle verfügbar
- Die Werkzeuge (V-Öffnungen, Radien, Materialien) sind für alle gleich

### Sicherheit
- Der Registrierungscode "Schlosser" ist im Code sichtbar
- Passwörter werden von Supabase sicher verschlüsselt
- Row Level Security (RLS) schützt die Daten

### Updates
Wenn Sie Änderungen am Code machen:
1. Pushen Sie die Änderungen zu GitHub
2. Vercel deployed automatisch die neue Version
3. Alle Benutzer sehen die Updates sofort

## Troubleshooting

### "404 - Page not found"
- Prüfen Sie ob alle Environment Variables in Vercel gesetzt sind
- Gehen Sie zu Vercel Dashboard → Ihr Projekt → Settings → Environment Variables

### "Failed to fetch" Fehler
- Prüfen Sie ob die Supabase URL und Keys korrekt sind
- Stellen Sie sicher dass die SQL-Skripte erfolgreich ausgeführt wurden

### Login funktioniert nicht
- Prüfen Sie ob der Registrierungscode "Schlosser" korrekt eingegeben wurde
- Stellen Sie sicher dass Supabase Auth aktiviert ist (sollte standardmäßig aktiv sein)

## Support

Bei Problemen:
1. Prüfen Sie die Vercel Deployment Logs
2. Prüfen Sie die Browser Console (F12)
3. Prüfen Sie die Supabase Logs im Dashboard
