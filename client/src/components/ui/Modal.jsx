import { useEffect } from 'react';
export default function Modal({ title, onClose, children, actions }) {
  useEffect(() => {
    const key = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', key);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = prev; };
  }, [onClose]);
  return <div className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="sheet">
      <div className="sheet-head"><h2>{title}</h2><button className="ghost sm" onClick={onClose}>Chiudi</button></div>
      {children}{actions && <div className="sheet-actions">{actions}</div>}
    </div></div>;
}
