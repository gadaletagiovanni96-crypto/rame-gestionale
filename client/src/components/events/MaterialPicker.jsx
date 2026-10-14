import { useState } from 'react'; import Accordion from '../ui/Accordion.jsx'; import Stepper from '../ui/Stepper.jsx';

// Materiale per categoria (con ricerca) oppure per preset. Il materiale esaurito si può aggiungere comunque: compare un avviso rosso.
// Scegliere un preset aggiunge i suoi articoli ai contatori, quindi vengono conteggiati come qualsiasi altro pezzo.
export default function MaterialPicker({ materials, quantities, onChange, usedByDay = {}, presets = null, showAvailability = true }) {
  const [mode, setMode] = useState('single'); const [query, setQuery] = useState(''); const [applied, setApplied] = useState({});
  const q = query.trim().toLowerCase(), qty = id => quantities[id] || 0;
  if (!materials.length) return <p className="mute">Nessun materiale: aggiungilo dalla sezione Materiale.</p>;
  const selected = materials.filter(m => qty(m._id) > 0), pieces = selected.reduce((n, m) => n + qty(m._id), 0);
  const left = m => m.total - (usedByDay[m._id] || 0);

  const applyPreset = (p, n) => {
    const delta = n - (applied[p._id] || 0), next = { ...quantities };
    p.items.filter(i => i.material).forEach(i => { next[i.material._id] = Math.max(0, qty(i.material._id) + delta * i.qty); });
    onChange(next); setApplied({ ...applied, [p._id]: n });
  };
  const visible = materials.filter(m => !q || m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
  const categories = [...new Set(visible.map(m => m.category))];

  return <>
    {presets && <div className="seg" role="group" aria-label="Modalità materiale">
      <button className={mode === 'single' ? 'on' : ''} onClick={() => setMode('single')}>📦 Singoli</button>
      <button className={mode === 'preset' ? 'on' : ''} onClick={() => setMode('preset')}>🎁 Preset</button></div>}
    <div className="matbox"><h4>🧺 Selezionato · {pieces} {pieces === 1 ? 'pezzo' : 'pezzi'}</h4>
      {selected.length ? selected.map(m => <span key={m._id} className="badge" style={{ marginRight: 6, display: 'inline-block', marginBottom: 4 }}>{m.name} ×{qty(m._id)}</span>) : <span className="mute">Niente ancora</span>}</div>

    {mode === 'preset' && presets ? <>
      {!presets.length && <p className="mute">Nessun preset: li crea il titolare dalla sua area.</p>}
      {presets.map(p => { const items = p.items.filter(i => i.material);
        const out = showAvailability ? items.filter(i => left(i.material) <= 0) : [];
        return <div className="card" key={p._id}><div className="row">
          <div className="grow"><b>{p.name}</b><small className="mute" style={{ display: 'block' }}>{items.map(i => `${i.material.name} ×${i.qty}`).join(' · ')}</small>
            {out.length > 0 && <small className="warn" style={{ display: 'block' }}>Materiale già usato interamente in quella giornata: {out.map(i => i.material.name).join(', ')}</small>}</div>
          <Stepper value={applied[p._id] || 0} label={p.name} onChange={n => applyPreset(p, n)} /></div></div>; })}
    </> : <>
      <input type="search" placeholder="🔍 Cerca materiale…" aria-label="Cerca materiale" value={query} onChange={e => setQuery(e.target.value)} />
      {!categories.length && <p className="mute">Nessun risultato per “{query}”.</p>}
      {categories.map(cat => { const items = visible.filter(m => m.category === cat), picked = items.reduce((n, m) => n + qty(m._id), 0);
        return <Accordion key={cat} title={cat} badge={picked ? `${picked} sel.` : ''} forceOpen={Boolean(q)}>
          {items.map(m => { const l = left(m), n = qty(m._id);
            return <div className="item" key={m._id}>
              <div className="grow"><b>{m.name}</b>
                <small>{showAvailability ? `${Math.max(l, 0)} disponibili su ${m.total}${m.total - l > 0 ? ` · già usati quel giorno: ${m.total - l}` : ''}` : `Totale in magazzino: ${m.total}`}</small>
                {showAvailability && l <= 0 && <small className="warn">Materiale già usato interamente in quella giornata</small>}
                {showAvailability && l > 0 && n > l && <small className="warn">Oltre la disponibilità: ne mancano {n - l}</small>}</div>
              <Stepper value={n} label={m.name} onChange={v => onChange({ ...quantities, [m._id]: v })} />
            </div>; })}
        </Accordion>; })}
    </>}
  </>;
}
