import { env } from './config/env.js'; import { User } from './models/User.js'; import { ROLES } from './utils/constants.js';
// Garantisce l'esistenza di almeno un titolare. Se il DB ha già utenti (versioni precedenti) promuove l'admin esistente.
export async function seedAdmin() {
  if (await User.exists({ role: ROLES.OWNER })) return;
  const { name, email, password } = env.admin;
  const existing = (email && await User.findOne({ email: email.toLowerCase() })) || await User.findOne({ role: ROLES.MANAGER }).sort('createdAt');
  if (existing) { existing.role = ROLES.OWNER; await existing.save(); console.log('Account promosso a titolare:', existing.email); return; }
  if (!email || !password) return;
  await User.create({ name, email, password, role: ROLES.OWNER }); console.log('Titolare iniziale creato:', email);
}
