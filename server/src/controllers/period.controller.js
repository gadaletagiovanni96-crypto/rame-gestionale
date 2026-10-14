import { periodService } from '../services/period.service.js';
export const list = async (_req, res) => res.json(await periodService.list());
export const create = async (req, res) => res.status(201).json(await periodService.create(req.body));
export const setDeadline = async (req, res) => res.json(await periodService.setDeadline(req.params.id, req.body.deadline, req.user));
export const remove = async (req, res) => { await periodService.remove(req.params.id, req.user); res.status(204).end(); };
export const listAvailability = async (req, res) => res.json(await periodService.listAvailability({ period: req.query.period, all: req.query.all === '1' }, req.user));
export const setAvailability = async (req, res) => { await periodService.setAvailability(req.body, req.user); res.status(204).end(); };
