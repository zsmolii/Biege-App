# Supabase Setup-Anleitung (vom Handy)

Diese Anleitung zeigt Ihnen Schritt für Schritt, wie Sie die Biegemaschinen-App mit Supabase einrichten, damit alle Benutzer die gleichen Daten sehen.

## Schritt 1: SQL-Skripte in Supabase ausführen

1. **Öffnen Sie Supabase Dashboard**: https://supabase.com/dashboard
2. **Wählen Sie Ihr Projekt** aus
3. **Gehen Sie zu "SQL Editor"** (linkes Menü, </> Symbol)
4. **Klicken Sie auf "+ New query"**

### Erstes Skript ausführen:

5. **Kopieren Sie den Inhalt** von `scripts/001_create_bending_tables.sql`
6. **Fügen Sie ihn in den SQL Editor ein**
7. **Klicken Sie auf "Run"** (grüner Play-Button)
8. **Warten Sie** bis "Success" angezeigt wird

### Zweites Skript ausführen:

9. **Klicken Sie erneut auf "+ New query"**
10. **Kopieren Sie den Inhalt** von `scripts/002_insert_default_tools.sql`
11. **Fügen Sie ihn ein und klicken Sie "Run"**

✅ **Fertig!** Die Datenbank-Tabellen sind jetzt erstellt.

---

## Schritt 2: Admin-User anlegen

1. **Gehen Sie zu "Authentication"** (linkes Menü, Schlüssel-Symbol)
2. **Klicken Sie auf "Users"**
3. **Klicken Sie auf "Add user"** (grüner Button oben rechts)
4. **Füllen Sie aus:**
   - **Email**: `zsmolii@bending-app.local`
   - **Password**: `Admin`
   - ✅ **Haken bei "Auto Confirm User"** setzen (wichtig!)
5. **Klicken Sie "Create user"**

✅ **Fertig!** Sie können sich jetzt anmelden mit:
- **Username**: `zsmolii`
- **Passwort**: `Admin`

---

## Schritt 3: E-Mail-Bestätigung deaktivieren (Optional)

Damit sich andere Benutzer ohne E-Mail-Bestätigung registrieren können:

1. **Gehen Sie zu "Authentication" → "Settings"**
2. **Scrollen Sie zu "Email Auth"**
3. **Deaktivieren Sie "Enable email confirmations"**
4. **Klicken Sie "Save"**

---

## Schritt 4: Environment Variables in Vercel setzen

1. **Öffnen Sie Vercel**: https://vercel.com
2. **Wählen Sie Ihr Projekt**
3. **Gehen Sie zu "Settings" → "Environment Variables"**
4. **Fügen Sie diese beiden Variables hinzu:**

### Variable 1:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Ihre Supabase Project URL
  - Finden Sie in Supabase: **Settings → API → Project URL**
  - Sieht aus wie: `https://xxxxx.supabase.co`

### Variable 2:
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Ihr Supabase Anon Key
  - Finden Sie in Supabase: **Settings → API → anon/public key**
  - Langer String der mit `eyJ...` beginnt

5. **Klicken Sie "Save"** für beide Variables

---

## Schritt 5: Neu deployen

1. **Gehen Sie zu "Deployments"** in Vercel
2. **Klicken Sie auf die drei Punkte** beim letzten Deployment
3. **Klicken Sie "Redeploy"**
4. **Warten Sie** bis das Deployment fertig ist

✅ **Fertig!** Die App ist jetzt live und nutzt Supabase!

---

## Anmeldung in der App

- **Username**: `zsmolii` (wird automatisch zu `zsmolii@bending-app.local`)
- **Passwort**: `Admin`

## Registrierung für andere Benutzer

Andere können sich mit dem **Registrierungscode "Schlosser"** registrieren.

---

## Wichtig zu wissen

- **Alle Daten sind gemeinsam**: Alle Benutzer sehen die gleichen Biege-Rezepte, Werkzeuge und Zeichnungen
- **Das System lernt gemeinsam**: Wenn ein Benutzer ein neues Rezept speichert, können alle anderen es nutzen
- **Sicher**: Nur authentifizierte Benutzer können auf die Daten zugreifen (Row Level Security)

---

## Troubleshooting

### "404 - Page not found"
- Prüfen Sie ob die Environment Variables in Vercel gesetzt sind
- Deployen Sie neu nach dem Setzen der Variables

### "Anmeldung fehlgeschlagen"
- Prüfen Sie ob der User in Supabase existiert
- Prüfen Sie ob "Auto Confirm User" aktiviert war
- Username ist `zsmolii` (ohne @bending-app.local)

### "Registrierung fehlgeschlagen"
- Prüfen Sie den Registrierungscode: `Schlosser` (groß/klein beachten!)
- Deaktivieren Sie E-Mail-Bestätigung in Supabase (siehe Schritt 3)
