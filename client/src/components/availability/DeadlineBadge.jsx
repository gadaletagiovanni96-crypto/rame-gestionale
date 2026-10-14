import { formatDay } from '../../utils/date.js';
export default function DeadlineBadge({ period }) {
  const d = period.deadline && formatDay(period.deadline, { day: 'numeric', month: 'long' });
  return <span className={'deadline ' + (period.closed || !period.deadline ? 'closed' : 'open')}>{!period.deadline ? '⚠ Nessun termine impostato' : period.closed ? `🔒 Chiuso il ${d}` : `⏰ Rispondi entro il ${d}`}</span>;
}
