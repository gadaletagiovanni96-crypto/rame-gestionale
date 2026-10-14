import jwt from 'jsonwebtoken';
import { User } from '../models/User.js'; import { env } from '../config/env.js'; import { ApiError } from '../utils/ApiError.js';
export const authService = {
  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password))) throw ApiError.unauthorized('Email o password errate');
    const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: '7d' });
    return { token, user: { id: user.id, name: user.name, role: user.role } };
  }
};
