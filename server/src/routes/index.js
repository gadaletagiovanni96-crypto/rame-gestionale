import { Router } from 'express'; 
import { authenticate } from '../middleware/auth.js';
import auth from './auth.routes.js'; 
import users from './user.routes.js'; 
import materials from './material.routes.js';
import events from './event.routes.js'; 
import periods from './period.routes.js'; 
import notifications from './notification.routes.js'; 
import presets from './preset.routes.js'; 
import unavailability from './unavailability.routes.js'; 
import availability from './availability.routes.js';

// 1. Importa il modello User (verifica che il percorso sia corretto in base alle tue cartelle)
import User from '../models/User.js'; 

const api = Router();

// 2. INSERISCI LA ROTTA QUI (Pubblica, senza autenticazione)
api.get('/ping', async (req, res) => {
  try {
    await User.findOne().select('_id');
    console.log(`[${new Date().toISOString()}] Ping ricevuto per mantenere attivo il server`);
    res.status(200).send('Pong - Database attivo');
  } catch (error) {
    console.error('Errore durante il ping:', error);
    res.status(500).send('Errore di connessione al DB');
  }
});

api.use(auth);            // rotte pubbliche
api.use(authenticate);    // da qui in poi serve il token

api.use('/users', users); 
api.use('/materials', materials); 
api.use('/events', events);
api.use('/periods', periods); 
api.use('/presets', presets); 
api.use('/unavailability', unavailability); 
api.use('/availability', availability); 
api.use('/notifications', notifications);

export default api;