import { useState, useEffect, useCallback } from 'react';
// Carica dati da una funzione async e li ricarica quando cambiano le dipendenze
export function useAsync(fn, deps = [], initial = null) {
  const [data, setData] = useState(initial); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(() => { setLoading(true); return fn().then(d => { setData(d); setError(''); }).catch(e => setError(e.message)).finally(() => setLoading(false)); }, deps);
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload };
}
