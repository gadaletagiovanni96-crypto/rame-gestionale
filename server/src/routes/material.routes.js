import { Router } from 'express'; import * as c from '../controllers/material.controller.js';
import { requireRole } from '../middleware/auth.js'; import { validate } from '../middleware/validate.js'; import { asyncHandler as h } from '../utils/asyncHandler.js';
import { materialSchema, materialUpdateSchema, renameCategorySchema } from '../validators/index.js'; import { MANAGERS } from '../utils/constants.js';
const r = Router(); const manager = requireRole(...MANAGERS);
r.get('/', h(c.list)); r.post('/', manager, validate(materialSchema), h(c.create));
r.put('/category/rename', manager, validate(renameCategorySchema), h(c.renameCategory));
r.put('/:id', manager, validate(materialUpdateSchema), h(c.update)); r.delete('/:id', manager, h(c.remove));
export default r;
