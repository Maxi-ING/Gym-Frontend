import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/users/AuthProvider';
import AuthPage from './features/users/AuthPage';
import Layout from './components/Layout';
import Button from './components/Button';
import { ErrorState, LoadingState } from './components/Feedback';
import './styles.css';
import ProfilePage from './features/users/ProfilePage';
import RecordsPage from './features/records/RecordsPage';
import DashboardPage from './features/dashboard/DashboardPage';
import PredictionPage from './features/predictions/PredictionPage';

function Content(){const {user,loading,error,retry,signOut}=useAuth();if(loading)return <LoadingState/>;if(error)return <main className="page"><ErrorState message={error} retry={retry}/><Button variant="ghost" onClick={signOut}>Volver al acceso</Button></main>;if(!user)return <AuthPage/>;return <Routes><Route element={<Layout/>}><Route index element={<DashboardPage/>}/><Route path="/perfil" element={<ProfilePage/>}/><Route path="/entrenamiento" element={<RecordsPage/>}/><Route path="/analisis" element={<PredictionPage/>}/><Route path="*" element={<section className="empty-state"><h1>Página no encontrada</h1><p>La dirección no corresponde a una página de tu espacio.</p><Link to="/" className="button button-primary">Volver al progreso</Link></section>}/></Route></Routes>;}
export default function App(){return <BrowserRouter><AuthProvider><Content/></AuthProvider></BrowserRouter>;}
