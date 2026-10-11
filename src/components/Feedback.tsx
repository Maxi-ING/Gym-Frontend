import Button from './Button';
export function ErrorState({message,retry}:{message:string;retry?:()=>void}){return <div className="feedback feedback-error" role="alert"><strong>No pudimos completar la solicitud</strong><p>{message}</p>{retry&&<Button variant="secondary" onClick={retry}>Reintentar</Button>}</div>;}
export function LoadingState(){return <div className="loading-state" role="status"><span className="spinner"/>Cargando tu información…</div>;}
export function EmptyState({title,children}:{title:string;children:React.ReactNode}){return <div className="empty-state"><span className="empty-mark">↗</span><h3>{title}</h3><p>{children}</p></div>;}
