import { Router } from 'express'; import * as c from '../controllers/unavailability.controller.js';
import { validate } from '../middleware/validate.js'; import { asyncHandler as h } from '../utils/asyncHandler.js'; import { unavailabilitySchema } from '../validators/index.js';
export default Router().get('/', h(c.list)).post('/', validate(unavailabilitySchema), h(c.create)).delete('/:id', h(c.remove));
