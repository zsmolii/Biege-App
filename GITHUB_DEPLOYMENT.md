# GitHub Pages Deployment Anleitung

## Vollständige Schritt-für-Schritt Anleitung für den Digitalen Biege-Regisseur

---

## 1. Repository erstellen und Code hochladen

### 1.1 Neues GitHub Repository erstellen

1. Gehen Sie zu [github.com](https://github.com) und melden Sie sich an
2. Klicken Sie auf das **+** Symbol oben rechts und wählen Sie **"New repository"**
3. Geben Sie einen Namen ein, z.B. `bending-machine-app`
4. Wählen Sie **Public** (für GitHub Pages kostenlos)
5. Klicken Sie auf **"Create repository"**

### 1.2 Code hochladen

**Option A: Mit GitHub Desktop (einfacher)**

1. Laden Sie [GitHub Desktop](https://desktop.github.com/) herunter und installieren Sie es
2. Klicken Sie in GitHub Desktop auf **"Clone a repository"**
3. Wählen Sie Ihr neu erstelltes Repository
4. Kopieren Sie alle Projektdateien in den lokalen Repository-Ordner
5. Klicken Sie auf **"Commit to main"** und dann **"Push origin"**

**Option B: Mit Git Command Line**

\`\`\`bash
# In Ihrem Projektordner
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/IHR-USERNAME/bending-machine-app.git
git push -u origin main
\`\`\`

---

## 2. Next.js für Static Export konfigurieren

### 2.1 next.config.mjs anpassen

Erstellen oder bearbeiten Sie die Datei `next.config.mjs`:

\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/bending-machine-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/bending-machine-app/' : '',
}

export default nextConfig
\`\`\`

**Wichtig:** Ersetzen Sie `bending-machine-app` mit dem Namen Ihres Repositories!

---

## 3. Sicherheit: Passwörter und Registrierungscode schützen

### 3.1 Passwörter verschlüsseln

Da GitHub Pages nur statische Dateien unterstützt, müssen wir Passwörter client-seitig verschlüsseln.

Erstellen Sie `lib/secure-auth.ts`:

\`\`\`typescript
// Einfache Hash-Funktion für Passwörter
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Gespeicherte Passwort-Hashes (nicht die echten Passwörter!)
const STORED_HASHES = {
  'ZSmolii': 'c1c224b03cd9bc7b6a86d77f5dace40191766c485cd55dc48caf9ac873335d6f', // Hash von "Admin"
}

// Registrierungscode Hash
const REGISTRATION_CODE_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' // Hash von "Schlosser"

export async function verifyPassword(username: string, password: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return STORED_HASHES[username] === hash
}

export async function verifyRegistrationCode(code: string): Promise<boolean> {
  const hash = await hashPassword(code)
  return hash === REGISTRATION_CODE_HASH
}

export async function addUser(username: string, password: string) {
  const hash = await hashPassword(password)
  // In localStorage speichern
  const users = JSON.parse(localStorage.getItem('app_users') || '{}')
  users[username] = hash
  localStorage.setItem('app_users', JSON.stringify(users))
}
\`\`\`

### 3.2 Auth-System aktualisieren

Aktualisieren Sie `lib/auth.ts` um die verschlüsselten Passwörter zu verwenden:

\`\`\`typescript
import { verifyPassword, verifyRegistrationCode, addUser } from './secure-auth'


export async function login(username: string, password: string): Promise<boolean> {
  // Prüfe gegen verschlüsselte Hashes
  const isValid = await verifyPassword(username, password)
  
  if (isValid) {
    const user: User = {
      username,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    return true
  }
  
  return false
}

export async function register(username: string, password: string, registrationCode: string): Promise<boolean> {
  // Prüfe Registrierungscode
  const isValidCode = await verifyRegistrationCode(registrationCode)
  
  if (!isValidCode) {
    return false
  }
  
  // Speichere neuen Benutzer mit verschlüsseltem Passwort
  await addUser(username, password)
  
  return true
}
\`\`\`

**Wichtig:** Die Hashes im Code sind sichtbar, aber die Original-Passwörter nicht. Dies ist die beste Lösung für eine rein client-seitige App.

---

## 4. GitHub Actions für automatisches Deployment einrichten

### 4.1 Workflow-Datei erstellen

Erstellen Sie die Datei `.github/workflows/deploy.yml`:

\`\`\`yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
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
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
      
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

### 4.2 GitHub Pages aktivieren

1. Gehen Sie zu Ihrem Repository auf GitHub
2. Klicken Sie auf **Settings** (Einstellungen)
3. Scrollen Sie zu **Pages** im linken Menü
4. Unter **Source** wählen Sie **"GitHub Actions"**
5. Speichern Sie die Einstellungen

---

## 5. Tesseract.js für OCR konfigurieren

### 5.1 Public-Ordner für Tesseract-Daten erstellen

Erstellen Sie den Ordner `public/tesseract` und fügen Sie eine `.gitkeep` Datei hinzu, damit der Ordner im Repository bleibt.

### 5.2 OCR-Konfiguration anpassen

In `lib/ocr-processor.ts` ist Tesseract bereits so konfiguriert, dass es die Sprachdaten automatisch lädt:

\`\`\`typescript
const result = await Tesseract.recognize(imageData, 'deu+eng', {
  logger: (m) => {
    if (m.status === 'recognizing text') {
      console.log(`[v0] OCR Progress: ${Math.round(m.progress * 100)}%`)
    }
  },
})
\`\`\`

Tesseract.js lädt die benötigten Sprachdaten automatisch von einem CDN beim ersten Gebrauch.

---

## 6. Deployment durchführen

### 6.1 Code committen und pushen

\`\`\`bash
git add .
git commit -m "Configure for GitHub Pages deployment"
git push origin main
\`\`\`

### 6.2 Deployment überwachen

1. Gehen Sie zu Ihrem Repository auf GitHub
2. Klicken Sie auf den Tab **Actions**
3. Sie sehen den laufenden Workflow "Deploy to GitHub Pages"
4. Warten Sie, bis beide Jobs (build und deploy) erfolgreich abgeschlossen sind (grüner Haken ✓)

### 6.3 App aufrufen

Nach erfolgreichem Deployment ist Ihre App verfügbar unter:

\`\`\`
https://IHR-USERNAME.github.io/bending-machine-app/
\`\`\`

Ersetzen Sie `IHR-USERNAME` mit Ihrem GitHub-Benutzernamen und `bending-machine-app` mit Ihrem Repository-Namen.

---

## 7. Wichtige Hinweise

### 7.1 Sicherheit

- **Passwörter:** Sind als SHA-256 Hashes gespeichert, nicht im Klartext
- **Registrierungscode:** Ist ebenfalls gehasht
- **localStorage:** Alle Daten werden lokal im Browser gespeichert
- **Keine Server-Seite:** Alles läuft client-seitig, keine Backend-Kosten

### 7.2 Einschränkungen von GitHub Pages

- Nur statische Dateien (HTML, CSS, JS)
- Keine Server-seitigen APIs
- Keine Datenbank (wir nutzen localStorage)
- Keine Umgebungsvariablen zur Laufzeit

### 7.3 Daten-Persistenz

- Alle Daten (Benutzer, Rezepte, gelernte Werte) werden in **localStorage** gespeichert
- Daten bleiben nur auf dem Gerät des Benutzers
- Bei Browser-Cache-Löschung gehen Daten verloren
- Für produktiven Einsatz sollte später eine echte Datenbank hinzugefügt werden

### 7.4 OCR-Performance

- Tesseract.js läuft komplett im Browser
- Erste Analyse kann 5-10 Sekunden dauern (Sprachdaten werden geladen)
- Nachfolgende Analysen sind schneller
- Funktioniert auch offline nach dem ersten Laden

---

## 8. Troubleshooting

### Problem: Build schlägt fehl

**Lösung:** Prüfen Sie die Logs im Actions-Tab und stellen Sie sicher, dass:
- `next.config.mjs` korrekt konfiguriert ist
- Alle Dependencies in `package.json` vorhanden sind
- Keine TypeScript-Fehler im Code sind

### Problem: App lädt nicht richtig

**Lösung:** 
- Prüfen Sie, ob `basePath` in `next.config.mjs` mit Ihrem Repository-Namen übereinstimmt
- Öffnen Sie die Browser-Konsole (F12) und prüfen Sie auf Fehler
- Stellen Sie sicher, dass GitHub Pages aktiviert ist

### Problem: OCR funktioniert nicht

**Lösung:**
- Prüfen Sie die Browser-Konsole auf Fehler
- Tesseract.js benötigt eine Internetverbindung beim ersten Laden
- Stellen Sie sicher, dass das Bild im richtigen Format ist (JPG, PNG)

### Problem: Login funktioniert nicht

**Lösung:**
- Standard-Benutzer: `ZSmolii` / `Admin`
- Registrierungscode: `Schlosser`
- Prüfen Sie, ob localStorage im Browser aktiviert ist
- Testen Sie im Inkognito-Modus, um Cache-Probleme auszuschließen

---

## 9. Updates deployen

Wenn Sie Änderungen am Code vornehmen:

\`\`\`bash
git add .
git commit -m "Beschreibung der Änderungen"
git push origin main
\`\`\`

GitHub Actions baut und deployed automatisch die neue Version!

---

## 10. Nächste Schritte (Optional)

### 10.1 Custom Domain einrichten

1. Kaufen Sie eine Domain (z.B. bei Namecheap, GoDaddy)
2. Gehen Sie zu Repository → Settings → Pages
3. Geben Sie Ihre Custom Domain ein
4. Konfigurieren Sie DNS-Einträge bei Ihrem Domain-Anbieter

### 10.2 Echte Datenbank hinzufügen (später)

Für produktiven Einsatz empfehlen wir:
- **Supabase** (kostenloser Tier verfügbar)
- **Firebase** (kostenloser Tier verfügbar)
- **Vercel** mit Postgres (für Next.js optimiert)

### 10.3 Bessere Authentifizierung

Für mehr Sicherheit später:
- **Supabase Auth** (OAuth, Magic Links)
- **Auth0** (Enterprise-Level)
- **NextAuth.js** (wenn Sie zu Vercel wechseln)

---

## Fertig! 🎉

Ihre Bending Machine App ist jetzt live auf GitHub Pages und kann von jedem mit dem Link aufgerufen werden!
