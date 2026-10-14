import express from 'express'; import cors from 'cors'; import helmet from 'helmet';
import { env } from './config/env.js'; import routes from './routes/index.js'; import { errorHandler, notFound } from './middleware/errorHandler.js';
const app = express();
app.use(helmet(), cors({ origin: env.clientOrigin }), express.json());
app.use('/api', routes);
app.use(notFound, errorHandler);
export default app;
