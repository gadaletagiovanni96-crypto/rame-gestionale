# Gestionale Animazione

Stack: React 18 + React Router · Node/Express · MongoDB (Mongoose) · Zod · JWT

## Struttura
server/src
  config/       env + connessione DB
  models/       schemi Mongoose (User, Event, Material, Period, Availability, Notification)
  validators/   schemi Zod per body/query
  middleware/   authenticate, requireRole, validate, errorHandler
  routes/       un router per risorsa, montati in routes/index.js
  controllers/  strato HTTP sottile (req → service → res)
  services/     logica di dominio (conflitti, notifiche, quantità materiale)
  utils/        ApiError, asyncHandler, costanti
client/src
  api/          client HTTP + moduli per risorsa
  context/      AuthContext
  hooks/        useAsync, useNotifications
  routes/       AppRouter + ProtectedRoute (guard per ruolo)
  layouts/      MainLayout
  pages/        una pagina per route
  components/   ui/, layout/, events/

## Regole di dominio
- Ruoli: animatore · responsabile · titolare (= responsabile + animatore + funzioni speciali).
- Aree: Gestione (calendario, squadre, materiale, periodi, staff) · Il mio spazio (programma, le mie disponibilità) · Titolare (disponibilità di tutti con modifica, preset materiale).
- Periodo di disponibilità: creato in Gestione → Periodi (giorni da compilare + termine). Fino al termine ognuno modifica le proprie risposte. Dopo il termine: le disponibilità confermate sono congelate (le toglie solo il titolare); le indisponibilità si possono sempre cambiare in disponibilità; i giorni senza risposta valgono come INDISPONIBILI.
- Indisponibilità libere (Il mio spazio → Disponibilità): giorno o periodo, sempre inseribili anche senza periodi aperti. Unico limite: non si segnano sui giorni con disponibilità confermata in un periodo scaduto.
- Stato effettivo di una persona in un giorno (server/services/availability.service.js, usato da calendario e composizione squadre): risposta esplicita > indisponibilità libera > periodo scaduto senza risposta (= indisponibile) > nessuna informazione ("chiedere disponibilità").
- Disponibilità nel calendario generale (Gestione → Calendario, sola lettura): ogni giorno mostra ✔ disponibili e ✖ indisponibili; toccando il giorno si vedono gli impegni, il pulsante per aggiungerne uno e, a scomparsa, l'elenco delle disponibilità. Il calendario modificabile resta solo al titolare (area Titolare → Disponibilità).
- I responsabili vedono, giorno per giorno, chi è disponibile/indisponibile (loro inclusi). Gli animatori solo le proprie risposte.
- Materiale: si può aggiungere anche se esaurito in quella giornata (avviso rosso). I preset (creati dal titolare) aggiungono i loro articoli ai contatori.
- Evento confermato ✅ = materiale "sistemato" + presa visione del responsabile dell'evento.

## Google Calendar (opzionale)
Ogni impegno viene creato/aggiornato/eliminato su un calendario Google condiviso dell'agenzia (titolo, orario, luogo, squadra, materiale).
1. Google Cloud Console → nuovo progetto → abilita "Google Calendar API".
2. Crea un Service Account → chiave JSON → salvala in server/google-service-account.json (NON committarla).
3. Su Google Calendar crea un calendario "Agenzia" → Impostazioni → Condividi con → email del service account → permesso "Apporta modifiche agli eventi".
4. Copia l'ID calendario in GOOGLE_CALENDAR_ID (.env). Se le variabili sono vuote la sincronizzazione è disattivata.
5. Ogni animatore aggiunge il calendario sul proprio telefono (Google Calendar → "Iscriviti al calendario").
La sync è a senso unico (gestionale → Google) e non blocca mai l'app se Google non risponde.

## Avvio
server: cp .env.example .env && npm install && npm run dev
client: npm install && npm run dev      (http://localhost:5173)
Primo avvio: responsabile admin@agenzia.it / admin123 (da .env). Cambialo.
