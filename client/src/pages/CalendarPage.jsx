import { useState } from 'react'; import { eventsApi, availabilityApi } from '../api/index.js'; import { useAsync } from '../hooks/useAsync.js'; import { MONTHS, toYmd } from '../utils/date.js';
import CalendarGrid from '../components/events/CalendarGrid.jsx'; import DaySheet from '../components/events/DaySheet.jsx'; import EventForm from '../components/events/EventForm.jsx';
export default function CalendarPage() {
  const now = new Date(); const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [day, setDay] = useState(null); const [editing, setEditing] = useState(null);
  const from = toYmd(cursor.y, cursor.m, 1), to = toYmd(cursor.y, cursor.m, new Date(cursor.y, cursor.m + 1, 0).getDate());
  const { data: events, reload } = useAsync(() => eventsApi.list({ from, to }), [from, to], []);
  const { data: availability } = useAsync(() => availabilityApi.calendar(from, to), [from, to], null);   // disponibilità di tutti, solo in visualizzazione
  const move = delta => { const d = new Date(cursor.y, cursor.m + delta, 1); setCursor({ y: d.getFullYear(), m: d.getMonth() }); };
  return <>
    <div className="row"><button className="ghost" aria-label="Mese precedente" onClick={() => move(-1)}>‹</button>
      <h2 className="grow" style={{ textAlign: 'center' }}>{MONTHS[cursor.m]} {cursor.y}</h2><button className="ghost" aria-label="Mese successivo" onClick={() => move(1)}>›</button></div>
    <div className="legend"><span className="good">✔ disponibili</span><span className="warn">✖ indisponibili</span><span className="mute">Tocca un giorno per impegni e disponibilità</span></div>
    <CalendarGrid year={cursor.y} month={cursor.m} events={events} availability={availability} onDayClick={setDay} />
    {day && !editing && <DaySheet date={day} events={events.filter(e => e.date === day)} availability={availability} onClose={() => setDay(null)} onAdd={() => setEditing({ date: day })} onEdit={setEditing} />}
    {editing && <EventForm event={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
  </>;
}
