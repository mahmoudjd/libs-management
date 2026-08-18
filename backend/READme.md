# 📚 Bibliotheksverwaltung – Backend

Dieses **Node.js + TypeScript**-Backend verwaltet eine Bibliothek und ermöglicht es Nutzern, **Bücher zu suchen, auszuleihen, zurückzugeben und hinzuzufügen**.  

## 🚀 Features
- ✅ **📖 Bücherverwaltung** – Hinzufügen, Suchen, Löschen von Büchern
- ✅ **👤 Benutzerverwaltung** – Registrierung, Anmeldung und Authentifizierung
- ✅ **🔒 JWT-Authentifizierung** – Sichere Benutzeranmeldung mit Token
- ✅ **📌 Ausleihsystem** – Nutzer können Bücher ausleihen und zurückgeben
- ✅ **🔗 REST API** – Strukturierte und dokumentierte API-Endpunkte
- ✅ **💾 MongoDB** – Speicherung von Büchern, Nutzern und Ausleihen

---

## 📂 Projektstruktur

```plaintext
src/
├── api/                          # API-Routen und Hilfsfunktionen  
│   ├── api-routes.ts             # Zentrale API-Routen  
│   └── lib/                      # Hilfsfunktionen  
│       └── extract-access-token-from-request.ts  # Extrahiert Access-Token aus Anfragen  
├── application/                   # Express-Server  
│   └── express.ts                 # Express-Setup  
├── books/                         # Bücherverwaltung  
│   ├── books-router.ts            # Bücher-Routen  
│   ├── create-book.ts             # Buch hinzufügen  
│   ├── delete-book.ts             # Buch löschen  
│   ├── get-books.ts               # Bücher abrufen  
│   └── update-book.ts             # Buch aktualisieren  
├── config/                        # Konfigurationsdateien  
│   └── config.ts                  # Lädt Umgebungsvariablen  
├── context/                       # App- und Datenbank-Kontext  
│   ├── app-ctx.ts                 # Zentraler App-Kontext  
│   └── db-ctx.ts                  # MongoDB-Verbindung  
├── loans/                         # Verwaltung von Buchausleihen  
│   ├── create-loan.ts             # Buch ausleihen  
│   ├── delete-loan.ts             # Buchrückgabe/Löschung eines Ausleihdatensatzes  
│   ├── loan-router.ts             # Routen für Buchausleihen  
│   └── update-loan.ts             # Buchausleihe aktualisieren  
├── middlewares/                   # Middleware-Funktionen  
│   └── authentication.ts          # Authentifizierung mit JWT  
├── types/                         # TypeScript-Typdefinitionen  
│   └── types.ts                   # Globale Typen für das Projekt  
├── users/                         # Benutzerverwaltung  
│   ├── auth-router.ts             # Authentifizierungsrouten  
│   ├── get-users.ts               # Alle Benutzer abrufen
|   ├── get-user.ts                # Benutzerinformationen abrufen 
│   ├── login-user.ts              # Login-Logik  
│   ├── google-auth.ts             # Login mit Google Logik  
│   └── signup-user.ts             # Registrierung-Logik  
└── index.ts                       # Einstiegspunkt der Anwendung  
```

## 🔧 Voraussetzungen
 - **Node.js** (Version 20.x oder höher)
 - **MongoDB** (Lokal oder Atlas)
 - **npm** (Node Package Manager)
 - **.env-Datei** mit folgenden Variablen:
 ```plaintext
    APP_PORT = 8080
    NODE_ENV = "development"
    API_PREFIX = "/api"
    DB_CONNECTION_STRING = your-mongodb-connection-string
    DB_DATABASE = "libraryDb"
    AUTH_SECRET=your-jwt-secret
 ```

## 🛠️  Installation
```bash 
    npm install
```

## 🏃‍♂️  Starten der Anwendung
```bash
    npm run dev
```

## 📌 API-Endpunkte

Die OpenAPI-Spezifikation ist im laufenden Backend unter folgenden Routen verfügbar:

- `GET /api/openapi.json` – maschinenlesbare OpenAPI-3.1-Spezifikation
- `GET /api/docs` – lokale HTML-Dokumentation, direkt aus der Spezifikation gerendert

### 🔑 **Authentifizierung**
| Methode | Route       | Beschreibung |
|---------|------------|--------------|
| `POST`  | `/auth/signup` | Benutzer registrieren |
| `POST`  | `/auth/login`  | Benutzer anmelden |
| `GET`   | `/auth/get-user/:userId` | Benutzerinfos abrufen |

### 📖 **Bücherverwaltung**
| Methode | Route         | Beschreibung |
|---------|--------------|--------------|
| `GET`   | `/books`       | Alle Bücher abrufen |
| `POST`  | `/books`       | Neues Buch hinzufügen (Admin) |
| `DELETE`| `/books/:id`   | Buch löschen (Admin) |
| `PUT`   | `/books/:id`   | Buch aktualisieren (Admin) |

### 🔄 **Ausleihen**
| Methode | Route          | Beschreibung |
|---------|---------------|--------------|
| `GET`   | `/loans`       | Alle Ausleihen abrufen (Admin) |
| `GET`   | `/loans/:userId` | Alle Ausleihen des Nutzern abrufen |
| `POST`  | `/loans`       | Neue Buchausleihe hinzufügen |
| `DELETE`| `/loans/:id`   | Buchausleihe löschen (Admin) |
| `PUT`   | `/loans/:id`   | Buchauslaeihe returnDAte aktualisieren |

## 🛠 Entwicklung & Sicherheit

- TypeScript – Strikte Typisierung für robusten Code
- JWT-Authentifizierung – Sichere Anmeldung mit JSON Web Tokens
- MongoDB mit Mongoose – NoSQL-Datenbank für schnelle Abfragen
- Passwort-Hashing mit bcrypt – Sichere Speicherung von Passwörtern

## 🚀 Deployment mit fly.io

### Umgebungsvariablen in fly.io

Bei der Bereitstellung auf fly.io müssen Umgebungsvariablen direkt in der fly.io-Umgebung gesetzt werden, anstatt eine .env-Datei zu verwenden. Die Anwendung wurde so konfiguriert, dass sie dieses Szenario behandeln kann.

Um Umgebungsvariablen in fly.io zu setzen, verwenden Sie den folgenden Befehl:

```bash
fly secrets set SCHLÜSSEL=WERT [SCHLÜSSEL2=WERT2 ...]
```

Zum Beispiel:

```bash
   fly secrets set APP_PORT=8080 \
     NODE_ENV="production" \
     API_PREFIX="/api" \
     DB_CONNECTION_STRING="mongodb+srv://benutzer:passwort@cluster.mongodb.net/?retryWrites=true&w=majority" \
     DB_DATABASE="libraryDb" \
     AUTH_SECRET="ihr-auth-secret"
```

Stellen Sie sicher, dass Sie alle erforderlichen Umgebungsvariablen setzen:

- `APP_PORT`: Der Port, auf dem die Anwendung läuft (Standard: 8080)
- `NODE_ENV`: Die Umgebung, in der die Anwendung läuft (sollte "production" für fly.io sein)
- `API_PREFIX`: Das Präfix für API-Routen
- `DB_CONNECTION_STRING`: MongoDB-Verbindungszeichenfolge (stellen Sie sicher, dass Sie eine gültige MongoDB Atlas-Verbindungszeichenfolge verwenden)
- `DB_DATABASE`: MongoDB-Datenbankname
- `AUTH_SECRET`: Geheimer Schlüssel für die Authentifizierung

**Wichtig**: Bei der Bereitstellung auf fly.io ist es wichtig, dass Ihre MongoDB-Verbindungszeichenfolge korrekt konfiguriert ist. Die Anwendung verwendet SSL/TLS für die Verbindung zu MongoDB Atlas. Stellen Sie sicher, dass Ihr MongoDB Atlas-Cluster TLS 1.2 oder höher unterstützt und dass Ihre IP-Adresse in der MongoDB Atlas-Whitelist steht oder der Zugriff von überall erlaubt ist.

### Deployment

Um die Anwendung auf fly.io bereitzustellen:

1. Bauen Sie die Anwendung:
   ```bash
   npm run build
   ```

2. Stellen Sie auf fly.io bereit:
   ```bash
   fly deploy
   ```

Weitere Informationen zur Bereitstellung auf fly.io finden Sie in der [fly.io-Dokumentation](https://fly.io/docs/languages-and-frameworks/node/).


## 📌 Datenmodelle

Die folgenden Datenmodelle werden in der Bibliotheksverwaltung verwendet. Sie beschreiben die Struktur der gespeicherten Daten in **MongoDB**.

### 📖 Book (Buch)
Ein Buch enthält Informationen wie Titel, Autor, Genre und seine Verfügbarkeit.

```json
{
  "_id": "ObjectId",
  "title": "string",
  "author": "string",
  "genre": "string",
  "available": true
}
``` 
| Feld       | Typ       | Beschreibung                  |
|------------|----------|--------------------------------|
| `_id`      | ObjectId | Eindeutige ID des Buches     |
| `title`    | string   | Titel des Buches             |
| `author`   | string   | Name des Autors              |
| `genre`    | string   | Genre des Buches             |
| `available`| boolean  | Ob das Buch verfügbar ist    |
----


### 👤 User (Benutzer)
Ein Benutzer hat einen Benutzernamen, ein Passwort und eine Rolle (Admin oder Nutzer).

```json
{
  "_id": "ObjectId",
  "username": "string",
  "password": "string",
  "role": "string"
}
```
| Feld        | Typ       | Beschreibung                     |
|-------------|----------|---------------------------------|
| `_id`       | ObjectId | Eindeutige Benutzer-ID         |
| `firstName` | string   | Vorname des Benutzers          |
| `lastName`  | string   | Nachname des Benutzers         |
| `email`     | string   | E-Mail-Adresse des Benutzers   |
| `password`  | string   | Gehashte Passwort (bcrypt)     |
| `role`      | string   | Rolle (`user` oder `admin`)    |

---


### 📚 Loan (Ausleihe)
Jede Ausleihe speichert, welcher Benutzer welches Buch ausgeliehen hat.
```json
{
  "_id": "ObjectId",
  "bookId": "ObjectId",
  "userId": "ObjectId",
  "loanDate": "ISODate",
  "returnDate": "ISODate | null"
}
```

| Feld        | Typ       | Beschreibung                             |
|-------------|----------|-----------------------------------------|
| `_id`       | ObjectId | Eindeutige ID der Ausleihe              |
| `bookId`    | ObjectId | Referenz auf das ausgeliehene Buch      |
| `userId`    | ObjectId | Referenz auf den ausleihenden Benutzer  |
| `loanDate`  | ISODate  | Datum der Ausleihe                      |
| `returnDate`| ISODate  | Datum der Rückgabe (null, falls offen)  |

---
