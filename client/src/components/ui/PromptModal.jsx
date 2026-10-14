import { useState } from 'react'; import Modal from './Modal.jsx'; import ErrorText from './ErrorText.jsx';
export default function PromptModal({ title, label, initial = '', onSave, onClose }) {
  const [value, setValue] = useState(initial); const [error, setError] = useState('');
  const save = async () => { try { await onSave(value.trim()); onClose(); } catch (e) { setError(e.message); } };
  return <Modal title={title} onClose={onClose} actions={<button className="y" disabled={!value.trim()} onClick={save}>Salva</button>}>
    <label htmlFor="prompt">{label}</label><input id="prompt" autoFocus value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && value.trim() && save()} /><ErrorText>{error}</ErrorText></Modal>;
}
