# Firebase Setup Instruktioner

## 1. Opret Firebase Projekt

1. Gå til [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project"
3. Vælg et projekt navn (f.eks. "smarthome-simulator")
4. Aktiver Google Analytics (valgfrit)
5. Klik "Create project"

## 2. Aktiver Authentication

1. I Firebase Console, gå til "Authentication"
2. Klik "Get started"
3. Gå til "Sign-in method" tab
4. Aktiver "Email/Password" provider
5. Klik "Save"

## 3. Få Firebase Konfiguration

1. I Firebase Console, gå til "Project settings" (gear ikon)
2. Scroll ned til "Your apps" sektion
3. Klik "Web" ikon (</>)
4. Registrer app med navn "Smarthome Simulator"
5. Kopier Firebase konfiguration objektet

## 4. Opdater firebase-config.js

Erstat placeholder værdierne i `firebase-config.js` med dine rigtige Firebase konfigurationsværdier:

```javascript
const firebaseConfig = {
  apiKey: "din-rigtige-api-key",
  authDomain: "dit-projekt.firebaseapp.com",
  projectId: "dit-projekt-id",
  storageBucket: "dit-projekt.appspot.com",
  messagingSenderId: "123456789",
  appId: "din-app-id"
};
```

## 5. Test Authentication

1. Åbn appen i browser
2. Prøv at oprette en ny konto
3. Prøv at logge ind med den oprettede konto
4. Tjek Firebase Console > Authentication > Users for at se oprettede brugere

## 6. Sikkerhedsregler (Valgfrit)

Hvis du vil bruge Firestore senere, opdater sikkerhedsreglerne:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Funktioner

- ✅ Email/Password login
- ✅ Bruger registrering
- ✅ Automatisk login state management
- ✅ Fejlhåndtering med danske besked
- ✅ Loading states
- ✅ Logout funktionalitet

## Fejlfinding

Hvis du får CORS fejl:
1. Tjek at du bruger `type="module"` i script tag
2. Sørg for at køre appen via en web server (ikke file://)
3. Brug Live Server extension i VS Code eller lignende
