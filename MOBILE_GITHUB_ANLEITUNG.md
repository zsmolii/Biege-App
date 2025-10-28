# 📱 Biege-Regisseur auf GitHub Pages vom Handy aus veröffentlichen

Diese Anleitung zeigt Ihnen Schritt für Schritt, wie Sie die Biege-Regisseur App komplett vom Handy aus auf GitHub Pages veröffentlichen können - **ohne PC!**

## 🎯 Was Sie brauchen

1. **Ein Smartphone** (iPhone oder Android)
2. **GitHub Account** (kostenlos)
3. **Die App-Dateien** (als ZIP von v0.dev)

---

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: GitHub Account erstellen (falls noch nicht vorhanden)

1. Öffnen Sie auf Ihrem Handy den Browser (Safari, Chrome, etc.)
2. Gehen Sie zu: **https://github.com**
3. Tippen Sie auf **"Sign up"** (Registrieren)
4. Geben Sie ein:
   - Email-Adresse
   - Passwort (mindestens 8 Zeichen)
   - Benutzername (z.B. "ZSmolii")
5. Bestätigen Sie Ihre Email-Adresse

### Schritt 2: App-Dateien von v0.dev herunterladen

1. Gehen Sie zurück zu **v0.dev** in Ihrem Browser
2. Klicken Sie auf die **drei Punkte** (⋮) oben rechts im Code-Bereich
3. Wählen Sie **"Download ZIP"**
4. Die Datei wird auf Ihr Handy heruntergeladen (meist im "Downloads" Ordner)

### Schritt 3: Neues GitHub Repository erstellen

1. Öffnen Sie **https://github.com** in Ihrem Browser
2. Melden Sie sich an (falls noch nicht angemeldet)
3. Tippen Sie oben rechts auf das **+** Symbol
4. Wählen Sie **"New repository"**
5. Geben Sie ein:
   - **Repository name**: `biege-regisseur` (oder einen anderen Namen)
   - **Description**: "Digitaler Biege-Regisseur für Biegemaschinen"
   - Wählen Sie **Public** (öffentlich)
   - ✅ Aktivieren Sie **"Add a README file"**
6. Tippen Sie auf **"Create repository"**

### Schritt 4: GitHub Desktop Browser-Modus aktivieren

Da die mobile GitHub-Ansicht eingeschränkt ist, müssen wir die Desktop-Version nutzen:

**Für iPhone (Safari):**
1. Tippen Sie auf das **"aA"** Symbol in der Adressleiste
2. Wählen Sie **"Desktop-Website anfordern"**

**Für Android (Chrome):**
1. Tippen Sie auf die **drei Punkte** (⋮) oben rechts
2. Aktivieren Sie **"Desktop-Website"**

### Schritt 5: Dateien hochladen

1. Sie sind jetzt in Ihrem neuen Repository
2. Tippen Sie auf **"Add file"** → **"Upload files"**
3. Tippen Sie auf **"choose your files"**
4. Navigieren Sie zu Ihrem Downloads-Ordner
5. **WICHTIG**: Sie müssen die ZIP-Datei erst entpacken:
   - Tippen Sie auf die heruntergeladene ZIP-Datei
   - Wählen Sie "Entpacken" oder "Extract"
   - Jetzt sehen Sie alle Dateien

6. Wählen Sie **ALLE** Dateien aus dem entpackten Ordner:
   - `app/` Ordner
   - `components/` Ordner
   - `lib/` Ordner
   - `public/` Ordner (falls vorhanden)
   - `package.json`
   - `next.config.mjs`
   - `tsconfig.json`
   - Alle anderen Dateien

7. Tippen Sie auf **"Commit changes"** (unten auf der Seite)

### Schritt 6: GitHub Actions für automatisches Deployment einrichten

1. Gehen Sie in Ihrem Repository zu **"Settings"** (Einstellungen)
2. Scrollen Sie im linken Menü zu **"Pages"**
3. Unter **"Source"** wählen Sie:
   - **"GitHub Actions"** (statt "Deploy from a branch")

4. Erstellen Sie eine neue Datei für GitHub Actions:
   - Gehen Sie zurück zur Hauptseite Ihres Repositories
   - Tippen Sie auf **"Add file"** → **"Create new file"**
   - Geben Sie als Dateinamen ein: `.github/workflows/deploy.yml`
   - Kopieren Sie folgenden Code hinein:

\`\`\`yaml
name: Deploy Next.js to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          static_site_generator: next
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build with Next.js
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
\`\`\`

5. Tippen Sie auf **"Commit changes"**

### Schritt 7: Next.js für statischen Export konfigurieren

1. Öffnen Sie die Datei `next.config.mjs` in Ihrem Repository
2. Tippen Sie auf das **Stift-Symbol** (✏️) zum Bearbeiten
3. Ändern Sie den Inhalt zu:

\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/biege-regisseur' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/biege-regisseur/' : '',
}

export default nextConfig
\`\`\`

**WICHTIG**: Ersetzen Sie `biege-regisseur` mit dem Namen Ihres Repositories!

4. Tippen Sie auf **"Commit changes"**

### Schritt 8: Deployment starten

1. Gehen Sie zu **"Actions"** (oben im Repository)
2. Sie sollten sehen, dass ein Workflow läuft (gelber Punkt)
3. Warten Sie, bis der Workflow fertig ist (grüner Haken ✓)
4. Dies dauert etwa 2-5 Minuten

### Schritt 9: Ihre App ist online!

1. Gehen Sie zu **"Settings"** → **"Pages"**
2. Oben sehen Sie die URL Ihrer App:
   \`\`\`
   https://IhrBenutzername.github.io/biege-regisseur/
   \`\`\`
3. Tippen Sie auf die URL - Ihre App ist jetzt live! 🎉

---

## 🔒 Sicherheit: Passwörter verschlüsseln

Die Passwörter werden bereits verschlüsselt in localStorage gespeichert. Der Registrierungscode "Schlosser" ist im Code sichtbar, aber das ist bei einer Client-Side-App unvermeidbar.

**Für mehr Sicherheit:**
1. Ändern Sie den Registrierungscode regelmäßig
2. Teilen Sie den Code nur mit vertrauenswürdigen Personen
3. Nutzen Sie starke Passwörter

---

## 🔄 App aktualisieren (nach Änderungen)

Wenn Sie die App später aktualisieren möchten:

1. Gehen Sie zu Ihrem Repository auf GitHub
2. Navigieren Sie zur Datei, die Sie ändern möchten
3. Tippen Sie auf das **Stift-Symbol** (✏️)
4. Nehmen Sie Ihre Änderungen vor
5. Tippen Sie auf **"Commit changes"**
6. GitHub Actions baut die App automatisch neu (dauert 2-5 Minuten)
7. Ihre Änderungen sind live!

---

## 📱 GitHub Mobile App (Optional)

Für einfachere Verwaltung können Sie die **GitHub Mobile App** installieren:

**iPhone:**
- App Store → Suchen Sie "GitHub"
- Installieren Sie die offizielle GitHub App

**Android:**
- Google Play Store → Suchen Sie "GitHub"
- Installieren Sie die offizielle GitHub App

Mit der App können Sie:
- Dateien einfacher bearbeiten
- Commits durchführen
- Actions-Status überwachen

---

## ❓ Häufige Probleme & Lösungen

### Problem: "404 - Page not found"

**Lösung:**
1. Überprüfen Sie, ob in `next.config.mjs` der richtige Repository-Name steht
2. Warten Sie 5-10 Minuten nach dem ersten Deployment
3. Leeren Sie den Browser-Cache (Einstellungen → Safari/Chrome → Verlauf löschen)

### Problem: "Build failed" in GitHub Actions

**Lösung:**
1. Gehen Sie zu "Actions" → Klicken Sie auf den fehlgeschlagenen Workflow
2. Lesen Sie die Fehlermeldung
3. Häufigste Ursache: Fehlende Dateien beim Upload
4. Laden Sie alle Dateien erneut hoch

### Problem: OCR funktioniert nicht

**Lösung:**
1. OCR (Tesseract.js) lädt beim ersten Mal die Sprachdateien
2. Stellen Sie sicher, dass Sie eine Internetverbindung haben
3. Warten Sie beim ersten Scan etwas länger (bis zu 30 Sekunden)

### Problem: Daten gehen verloren

**Lösung:**
- Alle Daten werden in localStorage gespeichert
- Löschen Sie nicht den Browser-Cache
- Nutzen Sie immer denselben Browser auf demselben Gerät
- Für dauerhafte Speicherung: Später auf Supabase upgraden

---

## 🚀 Nächste Schritte

Jetzt können Sie:
1. ✅ Die App vom Handy aus nutzen
2. ✅ Zeichnungen hochladen und analysieren
3. ✅ Dem System Biegedaten beibringen
4. ✅ Die App mit Kollegen teilen (einfach URL weitergeben)

**Viel Erfolg mit Ihrem Digitalen Biege-Regisseur!** 🎯

---

## 📞 Support

Bei Problemen:
1. Überprüfen Sie diese Anleitung nochmal
2. Schauen Sie in GitHub Actions nach Fehlermeldungen
3. Kontaktieren Sie den Support über GitHub Issues
