import { z } from 'zod';
import { ROLES, AVAILABILITY } from '../utils/constants.js';
const id = z.string().regex(/^[a-f\d]{24}$/i, 'ID non valido');
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data non valida (YYYY-MM-DD)');
const time = z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal(''));
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const userSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), role: z.nativeEnum(ROLES) });
export const materialSchema = z.object({ category: z.string().min(1), name: z.string().min(1), total: z.coerce.number().int().min(0) });
export const materialUpdateSchema = materialSchema.partial();
export const eventSchema = z.object({
  title: z.string().min(1), date, start: time, end: time, location: z.string().optional(), notes: z.string().optional(),
  materials: z.array(z.object({ material: id, qty: z.coerce.number().int().min(1) })).default([])
});
export const teamSchema = z.object({
  leader: id.or(z.literal('')).optional(), animators: z.array(id).default([]), guests: z.array(z.string().trim().min(1)).default([])
});
export const userUpdateSchema = z.object({
  name: z.string().min(2), email: z.string().email(), role: z.nativeEnum(ROLES), password: z.string().min(6).optional().or(z.literal(''))
});
export const renameCategorySchema = z.object({ from: z.string().min(1), to: z.string().trim().min(1) });
export const busyQuery = z.object({ date, exclude: id.optional().or(z.literal('')) });
export const periodSchema = z.object({ title: z.string().min(1), from: date, to: date, deadline: date }).refine(p => p.from <= p.to, 'La data di fine precede quella di inizio');
export const availabilitySchema = z.object({
  period: id, from: date, to: date.optional(), status: z.nativeEnum(AVAILABILITY).or(z.literal('')),
  reason: z.string().trim().max(100).optional(), user: id.optional()     // user: solo il titolare, per agire su un altro account
}).refine(a => !a.to || a.from <= a.to, 'La data di fine precede quella di inizio');
export const readySchema = z.object({ ready: z.boolean() });
export const deadlineSchema = z.object({ deadline: date });
export const presetSchema = z.object({ name: z.string().trim().min(1), items: z.array(z.object({ material: id, qty: z.coerce.number().int().min(1) })).min(1, 'Aggiungi almeno un articolo') });
export const unavailabilitySchema = z.object({ from: date, to: date, reason: z.string().trim().max(100).optional() }).refine(u => u.from <= u.to, 'La data di fine precede quella di inizio');
export const calendarQuery = z.object({ from: date, to: date });
export const dayEditSchema = z.object({ user: id, date, status: z.literal(AVAILABILITY.YES).or(z.literal('')) });
