import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  category: { type: String, required: true, trim: true }, name: { type: String, required: true, trim: true },
  total: { type: Number, required: true, min: 0 }
}, { timestamps: true });
schema.index({ category: 1, name: 1 }, { unique: true });
export const Material = mongoose.model('Material', schema);
