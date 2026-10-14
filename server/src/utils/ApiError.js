export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
  static badRequest(m = 'Richiesta non valida') { return new ApiError(400, m); }
  static unauthorized(m = 'Non autenticato') { return new ApiError(401, m); }
  static forbidden(m = 'Operazione non consentita') { return new ApiError(403, m); }
  static notFound(m = 'Risorsa non trovata') { return new ApiError(404, m); }
  static conflict(m = 'Conflitto') { return new ApiError(409, m); }
}
