import { eventService } from '../services/event.service.js';
export const list = async (req, res) => res.json(await eventService.list({ ...req.query, mine: req.query.mine === '1' }, req.user));
export const busy = async (req, res) => res.json(await eventService.busy(req.query.date, req.query.exclude || undefined));
export const create = async (req, res) => res.status(201).json(await eventService.create(req.body));
export const update = async (req, res) => res.json(await eventService.update(req.params.id, req.body));
export const remove = async (req, res) => { await eventService.remove(req.params.id); res.status(204).end(); };
export const updateTeam = async (req, res) => res.json(await eventService.updateTeam(req.params.id, req.body));
export const setMaterialReady = async (req, res) => res.json(await eventService.setMaterialReady(req.params.id, req.body.ready));
export const ack = async (req, res) => res.json(await eventService.ack(req.params.id, req.user.id));
