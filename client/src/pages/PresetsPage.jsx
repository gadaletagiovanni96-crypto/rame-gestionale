import { useState } from 'react'; import { presetsApi } from '../api/index.js'; import { useAsync } from '../hooks/useAsync.js'; import PresetForm from '../components/events/PresetForm.jsx';
// Titolare · preset di materiale (kit) che i responsabili possono scegliere al posto dei singoli articoli
export default function PresetsPage() {
  const { data: presets, reload, loading } = useAsync(presetsApi.list, [], []); const [editing, setEditing] = useState(null);
  return <><div className="row"><h2 className="grow">Preset materiale</h2><button className="y" onClick={() => setEditing({})}>+ Nuovo preset</button></div>
    <p className="mute" style={{ marginTop: 0 }}>Un preset è un kit (es. “Festa baby”: paracadute, bubble, bolle). Chi crea un evento può scegliere un preset oppure i materiali singoli: i pezzi vengono conteggiati comunque.</p>
    {!loading && !presets.length && <p>Nessun preset: crea il primo.</p>}
    {presets.map(p => <button key={p._id} className="card" style={{ width: '100%', textAlign: 'left', color: 'var(--ink)', display: 'block' }} onClick={() => setEditing(p)}>
      <b>🎁 {p.name}</b><div className="mute">{p.items.filter(i => i.material).map(i => `${i.material.name} ×${i.qty}`).join(' · ')}</div></button>)}
    {editing && <PresetForm preset={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
  </>;
}
