import { checkPassword } from '../utils/passwordRules'

// Live checklist for choosing a NEW password. Each rule shows an icon AND hidden text
// ("met" / "not met"), so the state never depends on color alone. Not used on the login form.
function PasswordRequirements({ password, id }) {
  const { rules } = checkPassword(password)
  return (
    <ul className="requirements" id={id} aria-label="Password requirements">
      {rules.map((rule) => (
        <li key={rule.id} className={rule.met ? 'requirement met' : 'requirement'}>
          <span className="requirement-icon" aria-hidden="true">
            {rule.met ? '✓' : ''}
          </span>
          {rule.label}
          <span className="visually-hidden">{rule.met ? ' (met)' : ' (not met)'}</span>
        </li>
      ))}
    </ul>
  )
}

export default PasswordRequirements
