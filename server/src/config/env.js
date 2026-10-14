import 'dotenv/config';
['MONGO_URI', 'JWT_SECRET'].forEach(k => { if (!process.env[k]) throw new Error(`Variabile d'ambiente mancante: ${k}`); });
export const env = {
  port: process.env.PORT || 4000, mongoUri: process.env.MONGO_URI, jwtSecret: process.env.JWT_SECRET,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  google: { calendarId: process.env.GOOGLE_CALENDAR_ID, credentials: process.env.GOOGLE_SERVICE_ACCOUNT },
  admin: { name: process.env.ADMIN_NAME || 'Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }
};
