import { Router } from 'express'; import * as c from '../controllers/availability.controller.js';
import { requireRole } from '../middleware/auth.js'; import { validate } from '../middleware/validate.js'; import { asyncHandler as h } from '../utils/asyncHandler.js';
import { calendarQuery, dayEditSchema } from '../validators/index.js'; import { ROLES, MANAGERS } from '../utils/constants.js';
const r = Router();
r.get('/calendar', requireRole(...MANAGERS), validate(calendarQuery, 'query'), h(c.calendar));      // vedere: responsabili e titolare
r.put('/day', requireRole(ROLES.OWNER), validate(dayEditSchema), h(c.setDay));                    // modificare: solo titolare
export default r;
