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
├── api/                   # API-Routen und Hilfsfunktionen  
│   ├── api-routes.ts      # Zentrale API-Routen  
│   └── lib/               # Hilfsfunktionen  
│       └── extract-access-token-from-request.ts  # Extrahiert Token aus Anfragen  
├── application/           # Express-Server  
│   └── express.ts         # Express-Setup  
├── books/                 # Bücherverwaltung  
│   ├── books-router.ts    # Bücher-Routen  
│   ├── create-book.ts     # Buch hinzufügen  
│   ├── delete-book.ts     # Buch löschen  
│   └── get-books.ts       # Bücher abrufen  
├── config/                # Konfigurationsdateien  
│   └── config.ts          # Lädt Umgebungsvariablen  
├── context/               # App- und Datenbank-Kontext  
│   ├── app-ctx.ts         # Zentraler App-Kontext  
│   └── db-ctx.ts          # MongoDB-Verbindung  
├── loans/                 # Verwaltung von Buchausleihen  
├── middlewares/           # Middleware-Funktionen  
│   └── authentication.ts  # Authentifizierung mit JWT  
├── types/                 # TypeScript-Typdefinitionen  
│   └── types.ts           # Globale Typen für das Projekt  
├── users/                 # Benutzerverwaltung  
│   ├── auth-router.ts     # Authentifizierungsrouten  
│   ├── login-user.ts      # Login-Logik  
│   └── signup-user.ts     # Registrierung-Logik  
└── index.ts               # Einstiegspunkt der Anwendung  
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


## 🛠 Entwicklung & Sicherheit

- TypeScript – Strikte Typisierung für robusten Code
- JWT-Authentifizierung – Sichere Anmeldung mit JSON Web Tokens
- MongoDB mit Mongoose – NoSQL-Datenbank für schnelle Abfragen
- Passwort-Hashing mit bcrypt – Sichere Speicherung von Passwörtern


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

