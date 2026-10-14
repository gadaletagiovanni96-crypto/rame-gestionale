import { http } from './http.js';
export const authApi = { login: body => http('/login', { method: 'POST', body }) };
export const usersApi = {
  me: () => http('/users/me'), list: () => http('/users'), create: b => http('/users', { method: 'POST', body: b }),
  update: (id, b) => http(`/users/${id}`, { method: 'PUT', body: b }), remove: id => http(`/users/${id}`, { method: 'DELETE' })
};
export const materialsApi = {
  list: () => http('/materials'), create: b => http('/materials', { method: 'POST', body: b }),
  update: (id, b) => http(`/materials/${id}`, { method: 'PUT', body: b }), remove: id => http(`/materials/${id}`, { method: 'DELETE' }),
  renameCategory: (from, to) => http('/materials/category/rename', { method: 'PUT', body: { from, to } })
};
export const eventsApi = {
  list: params => http('/events', { params }), busy: (date, exclude) => http('/events/busy', { params: { date, exclude } }),
  create: b => http('/events', { method: 'POST', body: b }), update: (id, b) => http(`/events/${id}`, { method: 'PUT', body: b }),
  setMaterialReady: (id, ready) => http(`/events/${id}/material-ready`, { method: 'PUT', body: { ready } }),
  updateTeam: (id, b) => http(`/events/${id}/team`, { method: 'PUT', body: b }), ack: id => http(`/events/${id}/ack`, { method: 'POST' }),
  remove: id => http(`/events/${id}`, { method: 'DELETE' })
};
export const periodsApi = {
  list: () => http('/periods'), setDeadline: (id, deadline) => http(`/periods/${id}`, { method: 'PUT', body: { deadline } }), create: b => http('/periods', { method: 'POST', body: b }), remove: id => http(`/periods/${id}`, { method: 'DELETE' }),
  availability: (period, all) => http('/periods/availability', { params: { period, all: all ? 1 : '' } }),
  setAvailability: b => http('/periods/availability', { method: 'PUT', body: b })
};
export const notificationsApi = { list: () => http('/notifications'), markAllRead: () => http('/notifications/read', { method: 'POST' }) };
export const presetsApi = {
  list: () => http('/presets'), create: b => http('/presets', { method: 'POST', body: b }),
  update: (id, b) => http(`/presets/${id}`, { method: 'PUT', body: b }), remove: id => http(`/presets/${id}`, { method: 'DELETE' })
};
export const unavailabilityApi = {
  list: all => http('/unavailability', { params: { all: all ? 1 : '' } }), create: b => http('/unavailability', { method: 'POST', body: b }), remove: id => http(`/unavailability/${id}`, { method: 'DELETE' })
};
export const availabilityApi = {
  calendar: (from, to) => http('/availability/calendar', { params: { from, to } }),
  setDay: b => http('/availability/day', { method: 'PUT', body: b })
};
