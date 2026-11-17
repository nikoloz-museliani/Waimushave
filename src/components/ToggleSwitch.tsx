import './ToggleSwitch.css'
interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  left: string
  right: string
}

// A real button provides keyboard support (Space/Enter) without custom handlers.
// aria-checked announces the same state as the visual sliding thumb.
export default function ToggleSwitch({ checked, onChange, label, left, right }: Props) {
  return (
    <div className="toggle-control">
      <span className={!checked ? 'toggle-label active' : 'toggle-label'}>{left}</span>
      <button
        className="toggle-track"
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-thumb" />
      </button>
      <span className={checked ? 'toggle-label active' : 'toggle-label'}>{right}</span>
    </div>
  )
}
