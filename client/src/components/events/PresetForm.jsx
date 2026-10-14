import { useState } from 'react'; import { presetsApi, materialsApi } from '../../api/index.js'; import { useAsync } from '../../hooks/useAsync.js';
import Modal from '../ui/Modal.jsx'; import ErrorText from '../ui/ErrorText.jsx'; import MaterialPicker from './MaterialPicker.jsx';
export default function PresetForm({ preset, onClose, onSaved }) {
  const isEdit = Boolean(preset?._id); const [name, setName] = useState(preset?.name || ''); const [error, setError] = useState('');
  const [quantities, setQuantities] = useState(Object.fromEntries((preset?.items || []).filter(i => i.material).map(i => [i.material._id, i.qty])));
  const { data: materials } = useAsync(materialsApi.list, [], []);
  const save = async () => {
    const body = { name, items: Object.entries(quantities).filter(([, n]) => n > 0).map(([material, qty]) => ({ material, qty })) };
    try { await (isEdit ? presetsApi.update(preset._id, body) : presetsApi.create(body)); onSaved(); } catch (e) { setError(e.message); }
  };
  const remove = async () => { if (confirm(`Eliminare il preset "${preset.name}"?`)) { await presetsApi.remove(preset._id); onSaved(); } };
  return <Modal title={isEdit ? 'Modifica preset' : 'Nuovo preset'} onClose={onClose}
    actions={<><button className="y grow" disabled={!name.trim()} onClick={save}>Salva preset</button>{isEdit && <button className="del" onClick={remove}>Elimina</button>}</>}>
    <label htmlFor="pn">Nome del preset</label><input id="pn" placeholder="Es. Festa baby" value={name} onChange={e => setName(e.target.value)} />
    <h3 className="mt">Cosa contiene</h3><MaterialPicker materials={materials} quantities={quantities} onChange={setQuantities} showAvailability={false} /><ErrorText>{error}</ErrorText>
  </Modal>;
}
