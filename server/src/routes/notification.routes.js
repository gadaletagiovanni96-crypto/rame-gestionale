import { Router } from 'express'; import * as c from '../controllers/notification.controller.js'; import { asyncHandler as h } from '../utils/asyncHandler.js';
export default Router().get('/', h(c.list)).post('/read', h(c.markAllRead));
