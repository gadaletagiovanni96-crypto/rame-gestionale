// Un evento è confermato quando il materiale è sistemato E il responsabile ha dato la presa visione
export const leaderSeen = e => Boolean(e.leader && e.acks?.some(a => a.user === e.leader._id));
export const isConfirmed = e => Boolean(e.materialReady && leaderSeen(e));
export const hasTeam = e => Boolean(e.leader || e.animators.length);
export const piecesOf = e => e.materials.reduce((n, m) => n + m.qty, 0);
