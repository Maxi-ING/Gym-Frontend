import { useId, type SelectHTMLAttributes } from 'react';
interface Props extends SelectHTMLAttributes<HTMLSelectElement>{label:string}
export default function Select({label,id,children,...props}:Props){const generated=useId();const field=id||generated;return <div className="field"><label htmlFor={field}>{label}</label><select id={field} {...props}>{children}</select></div>;}
