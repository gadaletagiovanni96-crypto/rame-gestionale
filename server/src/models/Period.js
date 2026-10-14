import mongoose from 'mongoose';
export const Period = mongoose.model('Period', new mongoose.Schema({
  title: { type: String, required: true, trim: true }, from: { type: String, required: true }, to: { type: String, required: true },
  deadline: { type: String, required: true }   // ultimo giorno (incluso) per dare/togliere disponibilità
}, { timestamps: true }));
