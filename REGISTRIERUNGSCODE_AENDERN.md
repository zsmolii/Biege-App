# 🔐 Registrierungscode ändern

So ändern Sie den Registrierungscode "Schlosser" in einen eigenen Code:

## Vom Handy aus ändern

1. Gehen Sie zu Ihrem GitHub Repository
2. Öffnen Sie die Datei: `lib/auth.ts`
3. Tippen Sie auf das **Stift-Symbol** (✏️)
4. Suchen Sie diese Zeile (ca. Zeile 8):
   \`\`\`typescript
   const REGISTRATION_CODE = "Schlosser"
   \`\`\`
5. Ändern Sie "Schlosser" zu Ihrem eigenen Code, z.B.:
   \`\`\`typescript
   const REGISTRATION_CODE = "MeinGeheimCode2024"
   \`\`\`
6. Tippen Sie auf **"Commit changes"**
7. Warten Sie 2-5 Minuten bis GitHub Actions fertig ist
8. Der neue Code ist aktiv!

## ⚠️ Wichtig

- Teilen Sie den neuen Code nur mit vertrauenswürdigen Personen
- Ändern Sie den Code regelmäßig für mehr Sicherheit
- Notieren Sie sich den Code, damit Sie ihn nicht vergessen!

## Bestehende Benutzer

Bereits registrierte Benutzer können sich weiterhin anmelden. Nur neue Registrierungen benötigen den neuen Code.
