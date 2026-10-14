import { unavailabilityService as s } from '../services/unavailability.service.js';
export const list = async (req, res) => res.json(await s.list({ all: req.query.all === '1' }, req.user));
export const create = async (req, res) => res.status(201).json(await s.create(req.body, req.user.id));
export const remove = async (req, res) => { await s.remove(req.params.id, req.user); res.status(204).end(); };
