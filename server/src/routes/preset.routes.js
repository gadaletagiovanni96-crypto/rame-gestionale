import { Router } from 'express'; import * as c from '../controllers/preset.controller.js';
import { requireRole } from '../middleware/auth.js'; import { validate } from '../middleware/validate.js'; import { asyncHandler as h } from '../utils/asyncHandler.js';
import { presetSchema } from '../validators/index.js'; import { ROLES, MANAGERS } from '../utils/constants.js';
const r = Router(); const owner = requireRole(ROLES.OWNER);   // li legge chi gestisce gli eventi, li crea solo il titolare
r.get('/', requireRole(...MANAGERS), h(c.list)); r.post('/', owner, validate(presetSchema), h(c.create));
r.put('/:id', owner, validate(presetSchema), h(c.update)); r.delete('/:id', owner, h(c.remove));
export default r;
