import { useState } from 'react';
// Sezione a scomparsa. forceOpen la tiene aperta (es. durante una ricerca)
export default function Accordion({ title, badge, actions, defaultOpen = false, forceOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen); const isOpen = open || forceOpen;
  return <section className={'acc' + (isOpen ? ' open' : '')}>
    <div className="acc-h">
      <button className="acc-t" aria-expanded={isOpen} onClick={() => setOpen(!open)}>{title}{badge ? <span className="badge">{badge}</span> : null}<span className="chev">▶</span></button>
      {actions}
    </div>
    {isOpen && <div className="acc-b">{children}</div>}
  </section>;
}
