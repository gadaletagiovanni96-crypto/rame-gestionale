// Elenco delle disponibilità di un giorno: disponibili / indisponibili / da chiedere. Con editable (titolare) compaiono i pulsanti di modifica.
const GROUPS = [['disponibile', '✔ Disponibili', 'good'], ['indisponibile', '✖ Indisponibili', 'warn'], ['nessuna', '❓ Da chiedere', 'ask']];
const detail = st => st.s === 'disponibile' ? 'Ha confermato la disponibilità'
  : st.s === 'indisponibile' ? (st.k === 'scaduto' ? 'Nessuna risposta entro il termine' : st.r || (st.k === 'libera' ? 'Indisponibilità segnata' : 'Ha risposto: non disponibile'))
  : st.k === 'attesa' ? 'Periodo aperto: non ha ancora risposto' : 'Nessuna informazione: chiedi direttamente';

export const countStatuses = statuses => {
  const list = Object.values(statuses || {});
  return { yes: list.filter(s => s.s === 'disponibile').length, no: list.filter(s => s.s === 'indisponibile').length, ask: list.filter(s => s.s === 'nessuna').length };
};

export default function AvailabilityDayList({ users, statuses, person = '', editable = false, onAct }) {
  return GROUPS.map(([k, label, cls]) => {
    const people = users.filter(u => statuses[u._id]?.s === k && (!person || u._id === person));
    return <div key={k}><h3 className={cls}>{label} ({people.length})</h3>
      {!people.length ? <p className="mute" style={{ margin: '0 0 8px' }}>—</p> : people.map(u => <div className="item" key={u._id}>
        <div className="grow"><b>{u.name}</b><small>{detail(statuses[u._id])}</small></div>
        {editable && k === 'disponibile' && <button className="del sm" onClick={() => onAct(u._id, '')}>Rimuovi</button>}
        {editable && k === 'indisponibile' && <button className="y sm" onClick={() => onAct(u._id, 'disponibile')}>Segna disponibile</button>}</div>)}</div>;
  });
}
