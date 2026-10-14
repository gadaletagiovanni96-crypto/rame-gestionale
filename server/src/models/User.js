import mongoose from 'mongoose'; import bcrypt from 'bcryptjs';
import { ROLES } from '../utils/constants.js';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.ANIMATOR }
}, { timestamps: true });
schema.pre('save', async function () { if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10); });
schema.methods.checkPassword = function (plain) { return bcrypt.compare(plain, this.password); };
export const User = mongoose.model('User', schema);
