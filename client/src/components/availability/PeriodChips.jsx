export default function PeriodChips({ periods, value, onChange }) {
  return <div className="chips" role="group" aria-label="Periodo">{periods.map(p => <button key={p._id} className={'fchip' + (p._id === value ? ' on' : '')} onClick={() => onChange(p._id)}>{p.closed ? '🔒 ' : ''}{p.title}</button>)}</div>;
}
