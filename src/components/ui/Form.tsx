import { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface FieldProps {
  label?: string;
  hint?: string;
  children: ReactNode;
}
export function Field({ label, hint, children }: FieldProps) {
  return (
    <div>
      {label && <label className="mw-label">{label}</label>}
      {children}
      {hint && <p className="text-xs text-mw-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
}
export function Input({ leftIcon, className = '', ...rest }: InputProps) {
  if (leftIcon) {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mw-gray-400">{leftIcon}</span>
        <input className={`mw-input pl-9 ${className}`} {...rest} />
      </div>
    );
  }
  return <input className={`mw-input ${className}`} {...rest} />;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}
export function Select({ options, className = '', ...rest }: SelectProps) {
  return (
    <select className={`mw-input ${className}`} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
