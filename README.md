# Smarthome Simulator

En interaktiv smarthome simulator med E-Learning moduler til undervisning.

## 🚀 Hurtig Start

### Lokal Udvikling
1. Klon repositoryet
2. Kopier `firebase-config.template.js` til `firebase-config.js`
3. Tilføj dine Firebase konfigurationsdetaljer i `firebase-config.js`
4. Start lokal server:
   ```cmd
   python -m http.server 8000
   ```
5. Åbn http://localhost:8000 i din browser

**Note:** Brug `cmd` (Command Prompt) i stedet for PowerShell for bedre kompatibilitet med Windows kommandoer.

### GitHub Pages
Appen er konfigureret til at køre på GitHub Pages uden følsomme API nøgler.

## 🔧 Konfiguration

### Firebase Setup
1. Opret et Firebase projekt
2. Kopier `firebase-config.template.js` til `firebase-config.js`
3. Erstat placeholder værdierne med dine rigtige Firebase konfigurationsdetaljer

### Sikkerhed
- `firebase-config.js` er i `.gitignore` og uploades ikke til GitHub
- Kun `firebase-config-github.js` (med placeholder værdier) er i repositoryet
- Firebase sikkerhedsregler er konfigureret til at kræve autentificering

## 📚 Funktioner

- **E-Learning Moduler**: Interaktive læringsmoduler om smarthome teknologi
- **Smarthome Simulator**: Simuler smarthome enheder og automatiseringer
- **Advanced Mode**: Avancerede funktioner til lærere
- **Temaer**: Forskellige visuelle temaer
- **Responsivt Design**: Fungerer på alle enheder

## 📊 Kode Statistikker

**Seneste oprydning (Wiresheet fjernelse):**
- **Fjernet**: 1.308 linjer kode
- **Filer påvirket**: 3 (index.html, js/app.js, css/style.css)
- **Funktionalitet fjernet**: Wiresheet regel editor interface
- **Resultat**: Renere kodebase med kun kontrolpanel funktionalitet

## 🛡️ Sikkerhed

Denne app bruger Firebase til autentificering og data lagring. Alle følsomme konfigurationsfiler er udelukket fra Git repositoryet for at beskytte API nøgler.

## 📝 Licens

Dette projekt er udviklet til undervisningsformål.