import { User } from '../models/User.js'; import { ApiError } from '../utils/ApiError.js'; import { ROLES } from '../utils/constants.js';
const view = u => ({ id: u.id, name: u.name, email: u.email, role: u.role });
// Gli account titolare li gestisce solo un titolare
const guardOwner = (actor, ...roles) => { if (roles.includes(ROLES.OWNER) && actor.role !== ROLES.OWNER) throw ApiError.forbidden('Solo il titolare può gestire gli account titolare'); };

export const list = async (_req, res) => res.json(await User.find({}, 'name email role').sort('name'));
export const me = async (req, res) => res.json(view(await User.findById(req.user.id)));
export const create = async (req, res) => { guardOwner(req.user, req.body.role); res.status(201).json(view(await User.create(req.body))); };
export const update = async (req, res) => {
  const u = await User.findById(req.params.id); if (!u) throw ApiError.notFound();
  guardOwner(req.user, u.role, req.body.role);
  if (req.params.id === req.user.id && req.body.role !== u.role) throw ApiError.badRequest('Non puoi cambiare il tuo ruolo');
  const { name, email, role, password } = req.body;
  Object.assign(u, { name, email, role }); if (password) u.password = password;
  await u.save(); res.json(view(u));
};
export const remove = async (req, res) => {
  if (req.params.id === req.user.id) throw ApiError.badRequest('Non puoi eliminare il tuo account');
  const u = await User.findById(req.params.id); if (!u) throw ApiError.notFound();
  guardOwner(req.user, u.role); await u.deleteOne(); res.status(204).end();
};
