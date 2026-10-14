export default function Stepper({ value, onChange, min = 0, max = Infinity, label }) {
  return <div className={'stepper' + (value > 0 ? ' on' : '')}>
    <button className="ghost" aria-label={`Meno ${label || ''}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
    <output aria-live="polite">{value}</output>
    <button aria-label={`Più ${label || ''}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
  </div>;
}
