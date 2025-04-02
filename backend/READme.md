# 📚 Bibliotheksverwaltung – Backend

Dieses Backend ist ein **Node.js + TypeScript**-basiertes System zur Verwaltung einer Bibliothek. Nutzer können **Bücher ausleihen, zurückgeben und neue hinzufügen**.  

## 🚀 Features
✅ **Bücherverwaltung**: Bücher können hinzugefügt, gesucht und gelöscht werden.  
✅ **Benutzerverwaltung**: Registrierung, Anmeldung und Verwaltung von Nutzern.  
✅ **Ausleihsystem**: Nutzer können Bücher ausleihen und zurückgeben.  
✅ **REST API**: Schnittstellen für alle wichtigen Funktionen.  
✅ **MongoDB-Datenbank**: Speicherung aller Bücher, Nutzer und Ausleihen.  

---

## 📂 Projektstruktur

```plaintext
src/
├── api/              # Zentrale API-Routen  
│   └── api-routes.ts # Definiert API-Routen  
├── application/      # Express-Anwendung  
│   └── express.ts    # Express-Server-Setup  
├── books/            # Bücherverwaltung  
│   ├── books-router.ts # Routen für Bücher  
│   ├── create-book.ts  # Logik zum Erstellen eines Buches  
│   └── get-books.ts    # Logik zum Abrufen von Büchern  
├── config/           # Konfigurationsdateien  
│   └── config.ts     # Lädt Umgebungsvariablen  
├── context/          # App- und Datenbank-Kontext  
│   ├── app-ctx.ts    # Zentrale App-Kontextverwaltung  
│   └── db-ctx.ts     # MongoDB-Verbindung  
├── loans/            # Verwaltung von Ausleihen (noch offen)  
├── users/            # Benutzerverwaltung (noch offen)  
├── types/            # Globale TypeScript-Typen  
│   └── types.ts      # Enthält geteilte Typendefinitionen  
└── index.ts          # Einstiegspunkt der Anwendung  
```


## 🛠️  Installation
```bash 
    npm install
```

## 🏃‍♂️  Starten der Anwendung
```bash
    npm run dev
```



