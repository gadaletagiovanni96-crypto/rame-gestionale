export const ROLES = Object.freeze({ OWNER: 'titolare', MANAGER: 'responsabile', ANIMATOR: 'animatore' });
export const MANAGERS = Object.freeze([ROLES.OWNER, ROLES.MANAGER]);   // chi gestisce eventi, squadre, materiale
export const AVAILABILITY = Object.freeze({ YES: 'disponibile', NO: 'indisponibile' });
