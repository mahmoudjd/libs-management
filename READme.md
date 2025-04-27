# Bibliotheksverwaltungssystem (Library Management System)

Ein modernes System zur Verwaltung einer Bibliothek. Nutzer können Bücher ausleihen, zurückgeben und durchsuchen. Administratoren können neue Bücher hinzufügen und verwalten.

## Funktionen

### Für alle Benutzer
- Anmeldung mit E-Mail/Passwort oder Google-Konto
- Durchsuchen des Buchbestands
- Filtern von Büchern nach Titel, Autor oder Genre
- Ausleihen verfügbarer Bücher
- Anzeigen und Verwalten ausgeliehener Bücher
- Rückgabe von Büchern

### Für Administratoren
- Hinzufügen neuer Bücher
- Bearbeiten von Buchinformationen
- Überwachung aller Ausleihen

## Technologien

### Frontend
- Next.js (React Framework)
- TypeScript
- NextAuth.js für Authentifizierung
- Tailwind CSS für Styling
- Axios für API-Anfragen

### Backend
- Node.js
- Express.js
- MongoDB für Datenspeicherung
- JWT für Authentifizierung

## Installation und Start

### Voraussetzungen
- Node.js (v14 oder höher)
- MongoDB
- npm oder yarn

### Backend einrichten
1. Ins Backend-Verzeichnis wechseln:
   ```
   cd backend
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Umgebungsvariablen konfigurieren:
   Erstellen Sie eine `.env`-Datei im Backend-Verzeichnis mit folgenden Variablen:
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/library
   JWT_SECRET=your_jwt_secret
   ```

4. Server starten:
   ```
   npm run dev
   ```

### Frontend einrichten
1. Ins Frontend-Verzeichnis wechseln:
   ```
   cd frontend
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Umgebungsvariablen konfigurieren:
   Erstellen Sie eine `.env.local`-Datei im Frontend-Verzeichnis mit folgenden Variablen:
   ```
   NEXT_PUBLIC_API_HOST=http://localhost:8080/api
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Frontend-Server starten:
   ```
   npm run dev
   ```

5. Öffnen Sie die Anwendung im Browser unter `http://localhost:3000`

## API-Endpunkte

### Authentifizierung
- `POST /auth/login` - Benutzeranmeldung
- `POST /auth/signup` - Benutzerregistrierung

### Bücher
- `GET /books` - Alle Bücher abrufen
- `POST /books` - Neues Buch hinzufügen (nur Admin)
- `PUT /books/:bookId` - Buch aktualisieren (nur Admin)
- `DELETE /books/:bookId` - Buch löschen (nur Admin)

### Ausleihen
- `GET /loans` - Alle Ausleihen abrufen (nur Admin)
- `GET /loans/:userId` - Ausleihen eines bestimmten Benutzers abrufen
- `POST /loans` - Neue Ausleihe erstellen (Buch ausleihen)
- `PUT /loans/:loanId` - Ausleihe aktualisieren (Buch zurückgeben)
- `DELETE /loans/:loanId` - Ausleihe löschen

## Lizenz
MIT
