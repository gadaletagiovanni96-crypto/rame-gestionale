import { useState } from 'react'; import { useNotifications } from '../../hooks/useNotifications.js';
export default function NotificationBell() {
  const { items, unread, markAllRead } = useNotifications(); const [open, setOpen] = useState(false);
  return <>
    <button className="bell" aria-label={`Notifiche (${unread} non lette)`} onClick={() => { if (open && unread) markAllRead(); setOpen(!open); }}>🔔{unread > 0 && <i>{unread}</i>}</button>
    {open && <div className="pop">{items.length ? items.map(n => <p key={n._id} className={n.read ? '' : 'new'}>{n.text}<br /><small>{new Date(n.createdAt).toLocaleString('it-IT')}</small></p>) : <p>Nessuna notifica.</p>}</div>}
  </>;
}
