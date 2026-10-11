import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/users/AuthProvider';
import AuthPage from './features/users/AuthPage';
import Layout from './components/Layout';
import Button from './components/Button';
import { ErrorState, LoadingState } from './components/Feedback';
import './styles.css';
import ProfilePage from './features/users/ProfilePage';
import RecordsPage from './features/records/RecordsPage';

function Content(){const {user,loading,error,retry,signOut}=useAuth();if(loading)return <LoadingState/>;if(error)return <main className="page"><ErrorState message={error} retry={retry}/><Button variant="ghost" onClick={signOut}>Volver al acceso</Button></main>;if(!user)return <AuthPage/>;return <Routes><Route element={<Layout/>}><Route path="/perfil" element={<ProfilePage/>}/><Route path="/entrenamiento" element={<RecordsPage/>}/><Route path="*" element={<h1>Tu espacio de entrenamiento</h1>}/></Route></Routes>;}
export default function App(){return <BrowserRouter><AuthProvider><Content/></AuthProvider></BrowserRouter>;}
