import { ZodError } from 'zod'; import { ApiError } from '../utils/ApiError.js';
export const notFound = (_req, _res, next) => next(ApiError.notFound('Endpoint inesistente'));
export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) return res.status(400).json({ error: err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') });
  if (err.code === 11000) return res.status(409).json({ error: 'Elemento già esistente' });
  if (err.name === 'CastError') return res.status(400).json({ error: 'Identificativo non valido' });
  if (!(err instanceof ApiError)) console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Errore interno del server' });
};
