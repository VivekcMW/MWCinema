import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div className={`mw-card ${className}`} {...rest}>
      {children}
    </div>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}
export function CardHeader({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="flex items-start justify-between px-5 py-4 border-b border-mw-gray-100">
      <div>
        <h3 className="text-[14px] font-semibold text-mw-gray-900">{title}</h3>
        {subtitle && <p className="text-[12px] text-mw-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
