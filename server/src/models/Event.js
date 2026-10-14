import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/, index: true },
  start: String, end: String, location: String, notes: String,
  leader: { type: ObjectId, ref: 'User' },
  animators: [{ type: ObjectId, ref: 'User' }],
  guests: [String],
  acks: [{ _id: false, user: { type: ObjectId, ref: 'User' }, at: { type: Date, default: Date.now } }],
  materialReady: { type: Boolean, default: false },
  googleEventId: String,
  materials: [{ _id: false, material: { type: ObjectId, ref: 'Material', required: true }, qty: { type: Number, min: 1, required: true } }]
}, { timestamps: true });
export const Event = mongoose.model('Event', schema);
