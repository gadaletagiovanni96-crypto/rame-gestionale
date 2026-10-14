import mongoose from 'mongoose';
// Indisponibilità libera: un giorno o un periodo, valida anche se non esiste nessun periodo di disponibilità
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  from: { type: String, required: true }, to: { type: String, required: true }, reason: String
}, { timestamps: true });
schema.index({ from: 1, to: 1 });
export const Unavailability = mongoose.model('Unavailability', schema);
