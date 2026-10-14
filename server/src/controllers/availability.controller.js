import * as s from '../services/availability.service.js';
export const calendar = async (req, res) => res.json(await s.calendar(req.query));
export const setDay = async (req, res) => { await s.setDay(req.body); res.status(204).end(); };
