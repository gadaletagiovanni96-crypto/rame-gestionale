import jwt from 'jsonwebtoken';
import { env } from '../config/env.js'; import { ApiError } from '../utils/ApiError.js'; import { User } from '../models/User.js';
// Il ruolo viene riletto dal database: promozioni/retrocessioni valgono subito e un account eliminato non entra più
export const authenticate = async (req, _res, next) => {
  try {
    const payload = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), env.jwtSecret);
    const user = await User.findById(payload.id).select('role'); if (!user) throw new Error('utente inesistente');
    req.user = { id: user.id, role: user.role }; next();
  } catch { next(ApiError.unauthorized('Sessione scaduta')); }
};
export const requireRole = (...roles) => (req, _res, next) => roles.includes(req.user.role) ? next() : next(ApiError.forbidden());
