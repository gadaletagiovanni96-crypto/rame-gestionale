import { useState } from 'react'; import { usersApi } from '../api/index.js'; import { useAsync } from '../hooks/useAsync.js'; import { useAuth } from '../context/AuthContext.jsx';
import Modal from '../components/ui/Modal.jsx'; import ErrorText from '../components/ui/ErrorText.jsx';
const BLANK = { name: '', email: '', password: '', role: 'animatore' };

function UserForm({ user, isSelf, onClose, onSaved }) {
  const { isOwner } = useAuth();
  const isEdit = Boolean(user._id); const [form, setForm] = useState({ ...BLANK, ...user, password: '' }); const [error, setError] = useState('');
  const set = k => e => setForm({ ...form, [k]: e.target.value });
  const save = async () => { try { await (isEdit ? usersApi.update(user._id, form) : usersApi.create(form)); onSaved(); } catch (e) { setError(e.message); } };
  const remove = async () => { if (confirm(`Eliminare ${user.name}?`)) { try { await usersApi.remove(user._id); onSaved(); } catch (e) { setError(e.message); } } };
  return <Modal title={isEdit ? 'Modifica account' : 'Nuovo account'} onClose={onClose}
    actions={<><button className="y grow" onClick={save}>Salva</button>{isEdit && !isSelf && <button className="del" onClick={remove}>Elimina</button>}</>}>
    <label htmlFor="n">Nome</label><input id="n" value={form.name} onChange={set('name')} />
    <label htmlFor="e">Email</label><input id="e" type="email" inputMode="email" autoCapitalize="none" value={form.email} onChange={set('email')} />
    <label htmlFor="r">Ruolo</label><select id="r" value={form.role} disabled={isSelf} onChange={set('role')}><option value="animatore">Animatore</option><option value="responsabile">Responsabile</option>{isOwner && <option value="titolare">Titolare</option>}</select>
    <label htmlFor="p">{isEdit ? 'Nuova password (lascia vuoto per non cambiarla)' : 'Password iniziale (min. 6)'}</label><input id="p" type="text" autoComplete="new-password" value={form.password} onChange={set('password')} />
    <ErrorText>{error}</ErrorText>
  </Modal>;
}

export default function StaffPage() {
  const { user: me, isOwner } = useAuth(); const { data: users, reload } = useAsync(usersApi.list, [], []); const [editing, setEditing] = useState(null);
  return <><div className="row"><h2 className="grow">Staff</h2><button className="y" onClick={() => setEditing({})}>+ Nuovo account</button></div>
    {users.map(u => <button key={u._id} className="card row" style={{ width: '100%', textAlign: 'left', color: 'var(--ink)' }} disabled={u.role === 'titolare' && !isOwner} onClick={() => setEditing(u)}>
      <span className="grow"><b>{u.name}</b>{u._id === me.id && ' (tu)'}<br /><span className="mute">{u.email}</span></span><span className="badge">{u.role}</span></button>)}
    {editing && <UserForm user={editing} isSelf={editing._id === me.id} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
  </>;
}
