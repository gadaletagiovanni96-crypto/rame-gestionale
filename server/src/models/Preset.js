import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;
export const Preset = mongoose.model('Preset', new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  items: [{ _id: false, material: { type: ObjectId, ref: 'Material', required: true }, qty: { type: Number, min: 1, required: true } }]
}, { timestamps: true }));
