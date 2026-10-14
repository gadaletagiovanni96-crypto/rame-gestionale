import { useState, useEffect } from 'react'; import { eventsApi, materialsApi, presetsApi } from '../../api/index.js'; import { useAsync } from '../../hooks/useAsync.js'; import { formatDay } from '../../utils/date.js';
import Modal from '../ui/Modal.jsx'; import ErrorText from '../ui/ErrorText.jsx'; import MaterialPicker from './MaterialPicker.jsx';
// Gestione del materiale di un evento direttamente dalla schermata Squadre
export default function MaterialForm({ event, onClose, onSaved }) {
  const [quantities, setQuantities] = useState(Object.fromEntries(event.materials.map(m => [m.material._id, m.qty])));
  const [ready, setReady] = useState(event.materialReady); const [used, setUsed] = useState({}); const [error, setError] = useState('');
  const { data: materials } = useAsync(materialsApi.list, [], []); const { data: presets } = useAsync(presetsApi.list, [], []);
  useEffect(() => { eventsApi.busy(event.date, event._id).then(b => setUsed(b.materials)).catch(() => {}); }, [event.date, event._id]);
  const save = async () => {
    try {
      await eventsApi.update(event._id, { title: event.title, date: event.date, start: event.start || '', end: event.end || '', location: event.location || '', notes: event.notes || '',
        materials: Object.entries(quantities).filter(([, n]) => n > 0).map(([material, qty]) => ({ material, qty })) });
      await eventsApi.setMaterialReady(event._id, ready); onSaved();
    } catch (e) { setError(e.message); }
  };
  return <Modal title={`Materiale · ${event.title}`} onClose={onClose} actions={<button className="y grow" onClick={save}>Salva materiale</button>}>
    <p className="mute" style={{ margin: '0 0 8px' }}>{formatDay(event.date)}</p>
    <label className={'pick' + (ready ? ' on' : '')}><input type="checkbox" checked={ready} onChange={e => setReady(e.target.checked)} />
      <span className="grow"><b>Materiale sistemato</b><span className="mute">Spunta quando è tutto pronto per l'evento</span></span></label>
    <h3 className="mt">Materiale</h3>
    <MaterialPicker materials={materials} quantities={quantities} onChange={q => { setQuantities(q); setReady(false); }} usedByDay={used} presets={presets} />
    <ErrorText>{error}</ErrorText>
  </Modal>;
}
