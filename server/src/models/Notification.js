import mongoose from 'mongoose';
export const Notification = mongoose.model('Notification', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true }, read: { type: Boolean, default: false }
}, { timestamps: true }));
