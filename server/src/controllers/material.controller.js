import { Preset } from '../models/Preset.js'; import { Material } from '../models/Material.js'; import { ApiError } from '../utils/ApiError.js';
export const list = async (_req, res) => res.json(await Material.find().sort('category name'));
export const create = async (req, res) => res.status(201).json(await Material.create(req.body));
export const update = async (req, res) => { const m = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!m) throw ApiError.notFound(); res.json(m); };
export const remove = async (req, res) => {
  if (!(await Material.findByIdAndDelete(req.params.id))) throw ApiError.notFound();
  await Preset.updateMany({}, { $pull: { items: { material: req.params.id } } }); res.status(204).end();   // via anche dai preset
};
export const renameCategory = async (req, res) => {
  const r = await Material.updateMany({ category: req.body.from }, { category: req.body.to });
  if (!r.matchedCount) throw ApiError.notFound('Categoria non trovata'); res.json({ updated: r.modifiedCount });
};
