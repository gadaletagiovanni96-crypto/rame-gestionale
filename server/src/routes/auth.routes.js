import { Router } from 'express'; import * as c from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js'; import { asyncHandler as h } from '../utils/asyncHandler.js'; import { loginSchema } from '../validators/index.js';
export default Router().post('/login', validate(loginSchema), h(c.login));
