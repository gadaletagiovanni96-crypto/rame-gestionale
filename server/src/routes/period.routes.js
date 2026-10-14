import { Router } from 'express'; import * as c from '../controllers/period.controller.js';
import { requireRole } from '../middleware/auth.js'; import { validate } from '../middleware/validate.js'; import { asyncHandler as h } from '../utils/asyncHandler.js';
import { periodSchema, availabilitySchema, deadlineSchema } from '../validators/index.js'; import { MANAGERS } from '../utils/constants.js';
const r = Router(); const manager = requireRole(...MANAGERS);
r.get('/availability', h(c.listAvailability)); r.put('/availability', validate(availabilitySchema), h(c.setAvailability));
r.get('/', h(c.list)); r.post('/', manager, validate(periodSchema), h(c.create)); r.put('/:id', manager, validate(deadlineSchema), h(c.setDeadline)); r.delete('/:id', manager, h(c.remove));
export default r;
