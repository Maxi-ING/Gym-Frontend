import type { ButtonHTMLAttributes } from 'react';
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost'; loading?: boolean }
export default function Button({variant='primary',loading=false,disabled,children,className='',type='button',...props}:Props) {
  return <button {...props} type={type} disabled={disabled||loading} className={`button button-${variant} ${className}`} aria-busy={loading}>{loading && <span className="spinner" aria-hidden="true" />}{children}</button>;
}
