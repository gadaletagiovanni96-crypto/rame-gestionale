import { useEffect, useRef, useState, useCallback } from 'react'; import { notificationsApi } from '../api/index.js';
const POLL_MS = 20000;
export function useNotifications() {
  const [items, setItems] = useState([]); const known = useRef(null);
  const load = useCallback(async () => {
    const list = await notificationsApi.list().catch(() => null); if (!list) return;
    if (known.current && 'Notification' in window && Notification.permission === 'granted')
      list.filter(n => !n.read && !known.current.has(n._id)).forEach(n => new Notification('Animazione', { body: n.text }));
    known.current = new Set(list.map(n => n._id)); setItems(list);
  }, []);
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    load(); const t = setInterval(load, POLL_MS); return () => clearInterval(t);
  }, [load]);
  const markAllRead = async () => { await notificationsApi.markAllRead(); setItems(i => i.map(n => ({ ...n, read: true }))); };
  return { items, unread: items.filter(n => !n.read).length, markAllRead };
}
