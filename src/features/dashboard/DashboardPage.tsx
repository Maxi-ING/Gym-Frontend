import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../users/AuthProvider';
import { useResource } from '../../hooks/useResource';
import { dashboardService } from './dashboardService';
import { recordService } from '../records/recordService';
import MetricsCards from './MetricsCards';
import ProgressChart from './ProgressChart';
import SessionTable from '../records/SessionTable';
import Select from '../../components/Select';
import Input from '../../components/Input';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { ErrorState, LoadingState } from '../../components/Feedback';
import { today } from '../../lib/format';
import type { ProgressFilters } from '../../types';
export default function DashboardPage(){
  const {user}=useAuth();const [filters,setFilters]=useState<ProgressFilters>({});
  const catalog=useResource(useCallback((signal:AbortSignal)=>recordService.exercises(signal),[]));
  const history=useResource(useCallback((signal:AbortSignal)=>recordService.sessions(signal),[]));
  const progress=useResource(useCallback((signal:AbortSignal)=>dashboardService.progress(filters,signal),[filters]));
  const invalidRange=!!(filters.desde&&filters.hasta&&filters.desde>filters.hasta);
  return <><div className="page-heading"><div><div className="eyebrow">VAMOS PASO A PASO</div><h1>Tu progreso, {user?.nombre.split(' ')[0]}.</h1><p>Una mirada a tu entrenamiento y a todo lo que estás construyendo.</p></div><Link to="/entrenamiento" className="button button-primary"><Icon name="plus" size={17}/>Registrar sesión</Link></div><section className="panel" style={{marginBottom:22}} aria-label="Filtros del progreso"><div className="filter-bar" style={{margin:0,padding:0,border:0}}><Select label="Ejercicio" value={filters.ejercicio_id??''} disabled={catalog.loading} onChange={e=>setFilters(f=>({...f,ejercicio_id:e.target.value?Number(e.target.value):undefined}))}><option value="">Todos los ejercicios</option>{catalog.data?.map(e=><option key={e.id} value={e.id}>{e.nombre}</option>)}</Select><Input label="Desde" type="date" value={filters.desde??''} max={filters.hasta||today()} onChange={e=>setFilters(f=>({...f,desde:e.target.value||undefined}))}/><Input label="Hasta" type="date" value={filters.hasta??''} max={today()} min={filters.desde} onChange={e=>setFilters(f=>({...f,hasta:e.target.value||undefined}))}/><Button variant="ghost" onClick={()=>setFilters({})}>Limpiar filtros</Button></div>{catalog.error&&<ErrorState message={catalog.error} retry={catalog.reload}/>}</section>{invalidRange?<ErrorState message="La fecha inicial debe ser anterior o igual a la fecha final."/>:progress.loading?<LoadingState/>:progress.error?<ErrorState message={progress.error} retry={progress.reload}/>:progress.data&&<><MetricsCards progress={progress.data}/><div className="dashboard-grid"><section className="panel"><div className="panel-header"><div><h2>{filters.ejercicio_id?'Evolución de la carga':'Volumen por fecha'}</h2><p>{filters.ejercicio_id?'Compara la carga del mismo ejercicio a lo largo del tiempo.':'Trabajo registrado en tus entrenamientos, según los filtros.'}</p></div><span className="tag"><span className="status-dot"/>Datos registrados</span></div><ProgressChart points={progress.data.puntos} metric={filters.ejercicio_id?'carga_kg':'volumen_kg'}/></section><aside className="panel insight-panel"><div><div className="insight-symbol"><Icon name="spark" size={23}/></div><div className="eyebrow" style={{color:'#789356',marginBottom:12}}>UNA NUEVA PERSPECTIVA</div><h2>¿Hacia dónde va<br/>tu entrenamiento?</h2><p>Consulta una tendencia por ejercicio y comprende cómo se relaciona con tu meta.</p></div><Link to="/analisis" className="button button-primary">Analizar mi progreso<Icon name="arrow" size={17}/></Link></aside></div></>}<section className="panel table-panel"><div className="panel-header"><div><h2>Sesiones recientes</h2><p>Tu historial general más reciente, independiente de los filtros del gráfico.</p></div><Link to="/entrenamiento" className="link">Ver historial ↗</Link></div>{history.loading?<LoadingState/>:history.error?<ErrorState message={history.error} retry={history.reload}/>:history.data&&<SessionTable sessions={history.data.slice(0,5)} exercises={catalog.data??[]}/>}</section></>;
}
