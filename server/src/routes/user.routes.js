import { Router } from 'express'; import * as c from '../controllers/user.controller.js';
import { requireRole } from '../middleware/auth.js'; import { validate } from '../middleware/validate.js'; import { asyncHandler as h } from '../utils/asyncHandler.js';
import { userSchema, userUpdateSchema } from '../validators/index.js'; import { MANAGERS } from '../utils/constants.js';
const r = Router(); const manager = requireRole(...MANAGERS);
r.get('/me', h(c.me)); r.get('/', h(c.list)); r.post('/', manager, validate(userSchema), h(c.create)); r.put('/:id', manager, validate(userUpdateSchema), h(c.update)); r.delete('/:id', manager, h(c.remove));
export default r;
