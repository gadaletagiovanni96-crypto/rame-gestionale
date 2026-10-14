import { useState, useEffect } from 'react';
import { eventsApi, materialsApi, presetsApi } from '../../api/index.js'; import { useAsync } from '../../hooks/useAsync.js';
import Modal from '../ui/Modal.jsx'; import ErrorText from '../ui/ErrorText.jsx'; import MaterialPicker from './MaterialPicker.jsx';

const EMPTY_BUSY = { animators: {}, materials: {}, availability: {} };
// Impegno: dati dell'evento + materiale. La squadra si gestisce nella sezione Squadre.
export default function EventForm({ event, onClose, onSaved }) {
  const isEdit = Boolean(event._id);
  const [form, setForm] = useState({ title: '', start: '', end: '', location: '', notes: '', ...event });
  const [quantities, setQuantities] = useState(Object.fromEntries((event.materials || []).map(m => [m.material._id, m.qty])));
  const [busy, setBusy] = useState(EMPTY_BUSY); const [error, setError] = useState('');
  const { data: materials } = useAsync(materialsApi.list, [], []); const { data: presets } = useAsync(presetsApi.list, [], []);
  useEffect(() => { if (form.date) eventsApi.busy(form.date, event._id).then(setBusy).catch(() => setBusy(EMPTY_BUSY)); }, [form.date, event._id]);
  const field = k => ({ value: form[k] || '', onChange: e => setForm({ ...form, [k]: e.target.value }) });

  const save = async () => {
    const payload = { title: form.title, date: form.date, start: form.start || '', end: form.end || '', location: form.location || '', notes: form.notes || '',
      materials: Object.entries(quantities).filter(([, n]) => n > 0).map(([material, qty]) => ({ material, qty })) };
    try { await (isEdit ? eventsApi.update(event._id, payload) : eventsApi.create(payload)); onSaved(); } catch (e) { setError(e.message); }
  };
  const remove = async () => { if (confirm('Eliminare questo impegno?')) { await eventsApi.remove(event._id); onSaved(); } };

  return <Modal title={isEdit ? 'Modifica impegno' : 'Nuovo impegno'} onClose={onClose}
    actions={<><button className="y grow" onClick={save}>Salva</button>{isEdit && <button className="del" onClick={remove}>Elimina</button>}</>}>
    <label htmlFor="title">Titolo</label><input id="title" {...field('title')} />
    <div className="col2">
      <div><label htmlFor="date">Data</label><input id="date" type="date" {...field('date')} /></div>
      <div><label htmlFor="loc">Luogo</label><input id="loc" {...field('location')} /></div></div>
    <div className="pair">
      <div><label htmlFor="start">Inizio</label><input id="start" type="time" {...field('start')} /></div>
      <div><label htmlFor="end">Fine</label><input id="end" type="time" {...field('end')} /></div></div>
    <label htmlFor="notes">Note</label><textarea id="notes" rows="2" {...field('notes')} />
    <h3 className="mt">Materiale</h3>
    <MaterialPicker materials={materials} quantities={quantities} onChange={setQuantities} usedByDay={busy.materials} presets={presets} />
    <ErrorText>{error}</ErrorText>
  </Modal>;
}
