import { notificationService } from '../services/notification.service.js';
export const list = async (req, res) => res.json(await notificationService.list(req.user.id));
export const markAllRead = async (req, res) => { await notificationService.markAllRead(req.user.id); res.status(204).end(); };
