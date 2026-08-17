interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const strength = passedChecks === 0 ? 0 : passedChecks <= 2 ? 1 : passedChecks <= 4 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Moderate', 'Strong'][strength];
  const strengthColor = ['', 'bg-destructive', 'bg-secondary', 'bg-accent'][strength];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 h-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`flex-1 transition-colors duration-300 ${
              level <= strength ? strengthColor : 'bg-border'
            }`}
          />
        ))}
      </div>

      {password && (
        <div className="space-y-1.5">
          <p className="text-xs tracking-wide opacity-70">{strengthLabel}</p>
          <ul className="space-y-1 text-xs opacity-60">
            <li className={checks.length ? 'opacity-100' : ''}>
              {checks.length ? '✓' : '○'} At least 8 characters
            </li>
            <li className={checks.uppercase ? 'opacity-100' : ''}>
              {checks.uppercase ? '✓' : '○'} Uppercase letter
            </li>
            <li className={checks.lowercase ? 'opacity-100' : ''}>
              {checks.lowercase ? '✓' : '○'} Lowercase letter
            </li>
            <li className={checks.number ? 'opacity-100' : ''}>
              {checks.number ? '✓' : '○'} Number
            </li>
            <li className={checks.special ? 'opacity-100' : ''}>
              {checks.special ? '✓' : '○'} Special character
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
