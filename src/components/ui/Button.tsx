import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantCls: Record<Variant, string> = {
  primary: 'mw-btn-primary',
  secondary: 'mw-btn-secondary',
  ghost: 'mw-btn-ghost',
  danger: 'mw-btn-danger'
};

const sizeCls: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: '',
  lg: 'h-12 px-6 text-base'
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button className={`${variantCls[variant]} ${sizeCls[size]} ${className}`} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
