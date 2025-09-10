# Performance Mode til Bærbare PC'er

## Oversigt
Performance Mode er en automatisk optimering der aktiveres på bærbare PC'er for at forbedre applikationens ydeevne og reducere lag.

## Funktioner

### Automatisk Aktivering
- Performance Mode aktiveres automatisk når en bærbare PC detekteres
- Brugeren får en notifikation når det sker første gang
- Indstillingen gemmes lokalt og kan manuelt ændres

### Device Detection
Systemet bruger flere faktorer til at identificere bærbare PC'er:
- Skærmopløsning (≤1920x1080)
- Touch capability
- User agent strings
- Battery API tilgængelighed
- Hardware concurrency (CPU kerner)
- Device memory
- Netværksforbindelse type

### Performance Optimeringer

#### Animationer
- Alle animationer reduceres til 0.1s
- Tunge animationer deaktiveres helt:
  - Floating icons
  - Header glow effects
  - Holographic effects
  - Particle animations

#### Hover Effekter
- Transform effekter deaktiveres på hover
- Reducerer GPU belastning

#### Background Effects
- Komplekse gradienter simplificeres
- Background patterns deaktiveres
- Box shadows reduceres

#### Rendering Optimeringer
- Radiator temperature updates reduceres fra 1s til 2s interval
- CSS transitions minimeres

## Manuelt Kontrol

### UI Toggle
Performance Mode kan aktiveres/deaktiveres manuelt i:
- Indstillinger → Brugergrænseflade → Performance Mode

### Notifikationer
- Automatisk aktivering: "Performance Mode aktiveret automatisk"
- Manuel aktivering: "Performance Mode aktiveret"
- Manuel deaktivering: "Performance Mode deaktiveret"

## Tekniske Detaljer

### CSS Classes
- `.performance-mode` - Hovedklasse der anvendes på body elementet
- Specifikke optimeringer via CSS selectors

### JavaScript Funktioner
- `detectLaptop()` - Device detection med scoring system
- `initializePerformanceMode()` - Auto-aktivering logik
- `togglePerformanceMode()` - Manuel toggle funktionalitet
- `applyPerformanceMode()` - Anvend optimeringer
- `optimizeAnimations()` - Reducer animationer
- `optimizeRendering()` - Reducer rendering belastning

### Local Storage
- `performanceMode` - Gemmer brugerens valg
- `setting_performanceMode` - Gemmer indstillingen

## Kompatibilitet
- Fungerer på alle moderne browsere
- Fallback til normal mode hvis detection fejler
- Ingen breaking changes til eksisterende funktionalitet

## Ydeevne Forbedringer
- Reduceret CPU brug
- Lavere GPU belastning
- Hurtigere rendering
- Bedre batterilevetid på bærbare enheder
- Mindre lag og stuttering
