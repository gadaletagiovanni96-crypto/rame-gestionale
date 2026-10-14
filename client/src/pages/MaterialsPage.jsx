import { useState } from 'react'; import { materialsApi } from '../api/index.js'; import { useAsync } from '../hooks/useAsync.js';
import Accordion from '../components/ui/Accordion.jsx'; import Stepper from '../components/ui/Stepper.jsx'; import PromptModal from '../components/ui/PromptModal.jsx'; import ErrorText from '../components/ui/ErrorText.jsx';
const BLANK = { category: '', name: '', total: 1 };
export default function MaterialsPage() {
  const { data: items, reload } = useAsync(materialsApi.list, [], []);
  const [form, setForm] = useState(BLANK); const [error, setError] = useState(''); const [query, setQuery] = useState(''); const [prompt, setPrompt] = useState(null);
  const q = query.trim().toLowerCase(); const categories = [...new Set(items.map(m => m.category))];
  const visible = items.filter(m => !q || m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
  const act = async fn => { try { await fn(); setError(''); reload(); } catch (e) { setError(e.message); } };
  const add = () => act(async () => { await materialsApi.create(form); setForm({ ...BLANK, category: form.category }); });
  return <><h2>Materiale</h2>
    <Accordion title="➕ Aggiungi materiale" defaultOpen={!items.length}>
      <label htmlFor="cat">Categoria</label><input id="cat" list="cats" placeholder="Es. Grandi giochi" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
      <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
      <label htmlFor="nm">Nome</label><input id="nm" placeholder="Es. Bowling" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <div className="row mt"><span className="grow"><b>Quantità totale</b></span><Stepper value={+form.total} min={0} label="totale" onChange={n => setForm({ ...form, total: n })} /></div>
      <div className="mt"><button className="y" disabled={!form.category.trim() || !form.name.trim()} onClick={add}>Aggiungi</button></div>
    </Accordion>
    <ErrorText>{error}</ErrorText>
    <input type="search" className="mt" placeholder="🔍 Cerca materiale…" aria-label="Cerca materiale" value={query} onChange={e => setQuery(e.target.value)} />
    {[...new Set(visible.map(m => m.category))].map(cat => <Accordion key={cat} title={cat} badge={visible.filter(m => m.category === cat).length} forceOpen={Boolean(q)}
      actions={<button className="ghost sm" aria-label={`Rinomina categoria ${cat}`} onClick={() => setPrompt({ kind: 'cat', value: cat })}>✏️</button>}>
      {visible.filter(m => m.category === cat).map(m => <div className="item" key={m._id}>
        <div className="grow"><b>{m.name}</b></div>
        <button className="ghost sm" aria-label={`Rinomina ${m.name}`} onClick={() => setPrompt({ kind: 'item', value: m.name, id: m._id })}>✏️</button>
        <Stepper value={m.total} label={m.name} onChange={n => act(() => materialsApi.update(m._id, { total: n }))} />
        <button className="del sm" aria-label={`Elimina ${m.name}`} onClick={() => confirm(`Eliminare ${m.name}?`) && act(() => materialsApi.remove(m._id))}>🗑</button>
      </div>)}
    </Accordion>)}
    {prompt && <PromptModal title={prompt.kind === 'cat' ? 'Rinomina categoria' : 'Rinomina materiale'} label="Nuovo nome" initial={prompt.value} onClose={() => setPrompt(null)}
      onSave={async v => { await (prompt.kind === 'cat' ? materialsApi.renameCategory(prompt.value, v) : materialsApi.update(prompt.id, { name: v })); reload(); }} />}
  </>;
}
