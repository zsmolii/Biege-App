# Biege-Regisseur - Komplette Setup-Anleitung

## Übersicht

Diese Anleitung führt Sie Schritt für Schritt durch das komplette Setup der Biege-Regisseur App mit Supabase, GitHub und Vercel - alles vom Handy aus möglich.

---

## Teil 1: Supabase Setup

### Schritt 1: Supabase Account erstellen

1. Öffnen Sie https://supabase.com auf Ihrem Handy
2. Klicken Sie auf "Start your project"
3. Registrieren Sie sich mit GitHub oder E-Mail
4. Bestätigen Sie Ihre E-Mail-Adresse

### Schritt 2: Neues Projekt erstellen

1. Nach dem Login klicken Sie auf "New Project"
2. Füllen Sie aus:
   - **Name**: `bending-machine` (oder ein anderer Name)
   - **Database Password**: Wählen Sie ein sicheres Passwort (WICHTIG: Notieren Sie es!)
   - **Region**: Wählen Sie die nächstgelegene Region (z.B. Frankfurt)
3. Klicken Sie auf "Create new project"
4. Warten Sie 2-3 Minuten bis das Projekt erstellt ist

### Schritt 3: Datenbank-Tabellen erstellen

1. In Ihrem Supabase Projekt gehen Sie zu **SQL Editor** (linkes Menü)
2. Klicken Sie auf "New query"
3. Kopieren Sie den folgenden SQL-Code und fügen Sie ihn ein:

\`\`\`sql
-- Tabelle für Benutzer
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle für Biege-Rezepte
CREATE TABLE IF NOT EXISTS bending_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material TEXT NOT NULL,
  thickness NUMERIC NOT NULL,
  radius TEXT NOT NULL,
  target_angle NUMERIC NOT NULL,
  inner_length NUMERIC NOT NULL,
  with_protection_plate BOOLEAN NOT NULL,
  v_opening TEXT NOT NULL,
  ground_setting NUMERIC NOT NULL,
  press_distance NUMERIC NOT NULL,
  length_allowance NUMERIC NOT NULL,
  created_by UUID REFERENCES app_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle für Werkzeuge
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_type TEXT NOT NULL CHECK (tool_type IN ('v_opening', 'radius', 'material')),
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_type, value)
);

-- Tabelle für Zeichnungen
CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_data TEXT NOT NULL,
  material TEXT NOT NULL,
  thickness NUMERIC NOT NULL,
  created_by UUID REFERENCES app_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle für Biegungen in Zeichnungen
CREATE TABLE IF NOT EXISTS drawing_bends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drawing_id UUID REFERENCES drawings(id) ON DELETE CASCADE,
  bend_sequence INTEGER NOT NULL,
  inner_length NUMERIC NOT NULL,
  angle NUMERIC NOT NULL,
  radius TEXT NOT NULL,
  v_opening TEXT NOT NULL,
  marking_point NUMERIC NOT NULL,
  ground_setting NUMERIC NOT NULL,
  press_distance NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle für gelernte Zugaben
CREATE TABLE IF NOT EXISTS learned_allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material TEXT NOT NULL,
  thickness NUMERIC NOT NULL,
  radius TEXT NOT NULL,
  angle NUMERIC NOT NULL,
  allowance NUMERIC NOT NULL,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_recipes_lookup ON bending_recipes(material, thickness, radius, target_angle, with_protection_plate);
CREATE INDEX IF NOT EXISTS idx_tools_type ON tools(tool_type);
CREATE INDEX IF NOT EXISTS idx_drawings_user ON drawings(created_by);
CREATE INDEX IF NOT EXISTS idx_drawing_bends_drawing ON drawing_bends(drawing_id);
CREATE INDEX IF NOT EXISTS idx_learned_allowances_lookup ON learned_allowances(material, thickness, radius, angle);

-- Row Level Security (RLS) aktivieren
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bending_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawing_bends ENABLE ROW LEVEL SECURITY;
ALTER TABLE learned_allowances ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Alle können lesen und schreiben (gemeinsame Daten)
CREATE POLICY "Alle können Benutzer lesen" ON app_users FOR SELECT USING (true);
CREATE POLICY "Alle können Benutzer erstellen" ON app_users FOR INSERT WITH CHECK (true);

CREATE POLICY "Alle können Rezepte lesen" ON bending_recipes FOR SELECT USING (true);
CREATE POLICY "Alle können Rezepte erstellen" ON bending_recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Alle können Rezepte aktualisieren" ON bending_recipes FOR UPDATE USING (true);

CREATE POLICY "Alle können Werkzeuge lesen" ON tools FOR SELECT USING (true);
CREATE POLICY "Alle können Werkzeuge erstellen" ON tools FOR INSERT WITH CHECK (true);
CREATE POLICY "Alle können Werkzeuge löschen" ON tools FOR DELETE USING (true);

CREATE POLICY "Alle können Zeichnungen lesen" ON drawings FOR SELECT USING (true);
CREATE POLICY "Alle können Zeichnungen erstellen" ON drawings FOR INSERT WITH CHECK (true);

CREATE POLICY "Alle können Biegungen lesen" ON drawing_bends FOR SELECT USING (true);
CREATE POLICY "Alle können Biegungen erstellen" ON drawing_bends FOR INSERT WITH CHECK (true);

CREATE POLICY "Alle können Zugaben lesen" ON learned_allowances FOR SELECT USING (true);
CREATE POLICY "Alle können Zugaben erstellen" ON learned_allowances FOR INSERT WITH CHECK (true);
CREATE POLICY "Alle können Zugaben aktualisieren" ON learned_allowances FOR UPDATE USING (true);
\`\`\`

4. Klicken Sie auf "RUN" (unten rechts)
5. Sie sollten "Success. No rows returned" sehen

### Schritt 4: Standard-Werkzeuge einfügen

1. Erstellen Sie eine neue Query im SQL Editor
2. Kopieren Sie diesen Code:

\`\`\`sql
-- Standard V-Öffnungen
INSERT INTO tools (tool_type, value) VALUES
  ('v_opening', 'V50'),
  ('v_opening', 'V80')
ON CONFLICT (tool_type, value) DO NOTHING;

-- Standard Radien
INSERT INTO tools (tool_type, value) VALUES
  ('radius', 'R1.5'),
  ('radius', 'R5'),
  ('radius', 'R10')
ON CONFLICT (tool_type, value) DO NOTHING;

-- Standard Materialien
INSERT INTO tools (tool_type, value) VALUES
  ('material', 'Stahl'),
  ('material', 'Edelstahl'),
  ('material', 'Aluminium'),
  ('material', 'Kupfer')
ON CONFLICT (tool_type, value) DO NOTHING;
\`\`\`

3. Klicken Sie auf "RUN"

### Schritt 5: Admin-User anlegen (ZSmolii)

1. Gehen Sie zu **Authentication** im linken Menü
2. Klicken Sie auf **Users**
3. Klicken Sie auf "Add user" (grüner Button oben rechts)
4. Füllen Sie aus:
   - **Email**: `zsmolii@bending-app.local`
   - **Password**: `Admin`
   - **Auto Confirm User**: ✅ AKTIVIEREN (sehr wichtig!)
5. Klicken Sie auf "Create user"

### Schritt 6: API Keys kopieren

1. Gehen Sie zu **Settings** → **API** (linkes Menü)
2. Kopieren Sie diese beiden Werte (WICHTIG für später):
   - **Project URL**: z.B. `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** Key: Langer String der mit `eyJ...` beginnt

**WICHTIG**: Notieren Sie beide Werte, Sie brauchen sie für Vercel!

---

## Teil 2: GitHub Setup

### Schritt 1: GitHub Account erstellen (falls noch nicht vorhanden)

1. Öffnen Sie https://github.com
2. Klicken Sie auf "Sign up"
3. Folgen Sie den Anweisungen zur Registrierung

### Schritt 2: Neues Repository erstellen

1. Nach dem Login klicken Sie auf das "+" Symbol oben rechts
2. Wählen Sie "New repository"
3. Füllen Sie aus:
   - **Repository name**: `bending-machine-app`
   - **Description**: "Biege-Regisseur - Maschineneinstellungen für Biegeprozesse"
   - **Public** oder **Private**: Wählen Sie nach Wunsch
   - **Initialize this repository with**: NICHTS ankreuzen!
4. Klicken Sie auf "Create repository"

### Schritt 3: Code hochladen

**Option A: Von v0 aus (empfohlen)**

1. In v0 klicken Sie auf das **GitHub-Symbol** oben rechts in der Code-Ansicht
2. Wählen Sie "Push to GitHub"
3. Wählen Sie Ihr Repository `bending-machine-app`
4. Klicken Sie auf "Push"

**Option B: ZIP Download und Upload**

1. In v0 klicken Sie auf die **drei Punkte** (⋮) oben rechts
2. Wählen Sie "Download ZIP"
3. Entpacken Sie die ZIP-Datei auf Ihrem Gerät
4. Gehen Sie zu Ihrem GitHub Repository
5. Klicken Sie auf "uploading an existing file"
6. Ziehen Sie alle Dateien in das Upload-Feld
7. Klicken Sie auf "Commit changes"

---

## Teil 3: Vercel Deployment

### Schritt 1: Vercel Account erstellen

1. Öffnen Sie https://vercel.com
2. Klicken Sie auf "Sign Up"
3. Wählen Sie "Continue with GitHub"
4. Autorisieren Sie Vercel für GitHub

### Schritt 2: Neues Projekt erstellen

1. Nach dem Login klicken Sie auf "Add New..." → "Project"
2. Wählen Sie Ihr GitHub Repository `bending-machine-app`
3. Klicken Sie auf "Import"

### Schritt 3: Environment Variables setzen

**WICHTIG**: Bevor Sie deployen, müssen Sie die Supabase Keys eintragen!

1. Scrollen Sie zu "Environment Variables"
2. Fügen Sie diese beiden Variables hinzu:

**Variable 1:**
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Ihre Supabase Project URL (aus Schritt 1.6)
- Klicken Sie auf "Add"

**Variable 2:**
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Ihr Supabase anon public Key (aus Schritt 1.6)
- Klicken Sie auf "Add"

### Schritt 4: Deployen

1. Klicken Sie auf "Deploy" (unten)
2. Warten Sie 2-3 Minuten bis das Deployment fertig ist
3. Sie sehen "Congratulations!" wenn es erfolgreich war
4. Klicken Sie auf "Visit" um Ihre App zu öffnen

---

## Teil 4: App nutzen

### Erste Anmeldung

1. Öffnen Sie Ihre Vercel-URL (z.B. `https://bending-machine-app.vercel.app`)
2. Sie sehen das Login-Formular
3. Melden Sie sich an mit:
   - **Username**: `zsmolii`
   - **Passwort**: `Admin`
4. Klicken Sie auf "Anmelden"

**WICHTIG**: Der Username `zsmolii` wird automatisch zu `zsmolii@bending-app.local` konvertiert für Supabase.

### Neue Benutzer registrieren

1. Klicken Sie auf "Registrieren"
2. Füllen Sie aus:
   - **Name**: Beliebiger Name
   - **E-Mail**: Beliebige E-Mail (z.B. `max@firma.de`)
   - **Passwort**: Beliebiges Passwort
   - **Registrierungscode**: `Schlosser`
3. Klicken Sie auf "Registrieren"
4. Der Benutzer wird sofort erstellt und kann sich anmelden

### App-Funktionen

**Biege-Parameter suchen:**
1. Geben Sie Material, Dicke, Radius, Winkel, Innenlänge ein
2. Wählen Sie ob mit/ohne Schutzplatte
3. Klicken Sie auf "Suchen"
4. Wenn Daten vorhanden: Maschineneinstellungen werden angezeigt
5. Wenn keine Daten: Lernmodus öffnet sich → Werte eingeben und speichern

**Zeichnung analysieren:**
1. Wechseln Sie zum Tab "Zeichnung"
2. Laden Sie ein Foto der technischen Zeichnung hoch
3. Das System versucht automatisch Maße zu erkennen (OCR)
4. Korrigieren Sie die erkannten Werte falls nötig
5. Klicken Sie auf "Analysieren"
6. Sie erhalten die Markierpunkte und Maschineneinstellungen

**Werkzeuge verwalten:**
1. Wechseln Sie zum Tab "Werkzeuge"
2. Fügen Sie neue V-Öffnungen, Radien oder Materialien hinzu
3. Löschen Sie nicht mehr benötigte Werkzeuge

---

## Troubleshooting

### Problem: 404 Fehler nach Deployment

**Lösung:**
1. Prüfen Sie ob die Environment Variables gesetzt sind
2. Gehen Sie zu Vercel → Settings → Environment Variables
3. Stellen Sie sicher dass beide Variables vorhanden sind
4. Gehen Sie zu Deployments → Klicken Sie auf "Redeploy"

### Problem: "DB.handler is not a function"

**Lösung:**
1. Die Environment Variables fehlen oder sind falsch
2. Prüfen Sie die Werte in Vercel Settings
3. Kopieren Sie die Keys erneut aus Supabase
4. Redeploy durchführen

### Problem: Login funktioniert nicht

**Lösung:**
1. Prüfen Sie ob der User in Supabase existiert
2. Gehen Sie zu Supabase → Authentication → Users
3. Stellen Sie sicher dass "Auto Confirm User" aktiviert war
4. Versuchen Sie den User neu anzulegen

### Problem: Keine Daten werden gespeichert

**Lösung:**
1. Prüfen Sie ob die SQL-Skripte erfolgreich ausgeführt wurden
2. Gehen Sie zu Supabase → Table Editor
3. Sie sollten alle Tabellen sehen (app_users, bending_recipes, tools, etc.)
4. Falls nicht: SQL-Skripte erneut ausführen

---

## Wichtige Hinweise

1. **Gemeinsame Daten**: Alle Benutzer sehen die gleichen Biege-Rezepte und Werkzeuge
2. **Lernsystem**: Je mehr Rezepte gespeichert werden, desto intelligenter wird das System
3. **Sicherheit**: Passwörter werden verschlüsselt in Supabase gespeichert
4. **Registrierungscode**: Nur wer "Schlosser" kennt, kann sich registrieren
5. **Kostenlos**: Supabase und Vercel sind im Free-Tier kostenlos nutzbar

---

## Support

Bei Problemen:
1. Prüfen Sie die Troubleshooting-Sektion
2. Schauen Sie in die Vercel Logs (Deployments → Klick auf Deployment → Logs)
3. Prüfen Sie die Supabase Logs (Logs & Analytics im linken Menü)

---

**Viel Erfolg mit dem Biege-Regisseur!**
