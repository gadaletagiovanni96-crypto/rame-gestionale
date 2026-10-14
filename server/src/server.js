import app from './app.js'; import { env } from './config/env.js'; import { connectDb } from './config/db.js'; import { seedAdmin } from './seed.js';
await connectDb(); await seedAdmin();
app.listen(env.port, () => console.log(`API su http://localhost:${env.port}`));
