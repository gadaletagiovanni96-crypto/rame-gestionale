import { Preset } from '../models/Preset.js'; import { ApiError } from '../utils/ApiError.js';
const populated = q => q.populate('items.material');
export const list = async (_req, res) => res.json(await populated(Preset.find().sort('name')));
export const create = async (req, res) => { const p = await Preset.create(req.body); res.status(201).json(await populated(Preset.findById(p.id))); };
export const update = async (req, res) => { const p = await populated(Preset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })); if (!p) throw ApiError.notFound(); res.json(p); };
export const remove = async (req, res) => { if (!(await Preset.findByIdAndDelete(req.params.id))) throw ApiError.notFound(); res.status(204).end(); };
