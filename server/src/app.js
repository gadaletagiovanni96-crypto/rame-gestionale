import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// 1. Ricrea __dirname per i moduli ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disattivato temporaneamente per non bloccare script/stili di Vite
  }), 
  cors({ origin: env.clientOrigin }), 
  express.json()
);

// 3. Le tue rotte API
app.use('/api', routes);

// 4. Applica "notFound" (Endpoint inesistente) SOLO alle rotte API sbagliate
app.use('/api/*', notFound);

// 5. Servi i file statici del frontend (la cartella dist di Vite)
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// 6. Fallback per il Frontend: tutte le altre rotte restituiscono la tua app web
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// 7. Gestore degli errori globale (cattura eventuali errori di sistema/500)
app.use(errorHandler);

export default app;