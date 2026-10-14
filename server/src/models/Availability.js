import mongoose from 'mongoose';
import { AVAILABILITY } from '../utils/constants.js';
const { ObjectId } = mongoose.Schema.Types;
const schema = new mongoose.Schema({
  period: { type: ObjectId, ref: 'Period', default: null }, user: { type: ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, status: { type: String, enum: Object.values(AVAILABILITY), required: true }, reason: String,
  unavailability: { type: ObjectId, ref: 'Unavailability' }   // se la riga nasce da un'indisponibilità libera
}, { timestamps: true });
schema.index({ period: 1, user: 1, date: 1 }, { unique: true });
export const Availability = mongoose.model('Availability', schema);
