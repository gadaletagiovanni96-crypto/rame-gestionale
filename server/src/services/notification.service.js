import { Notification } from '../models/Notification.js';
export const notificationService = {
  async notify(userIds, text) {
    const unique = [...new Set(userIds.filter(Boolean).map(String))];
    if (unique.length) await Notification.insertMany(unique.map(user => ({ user, text })));
  },
  list: userId => Notification.find({ user: userId }).sort('-createdAt').limit(50),
  markAllRead: userId => Notification.updateMany({ user: userId, read: false }, { read: true })
};
