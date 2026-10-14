import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext.jsx'; 
import NotificationBell from '../components/layout/NotificationBell.jsx';
// Importa il logo qui se si trova sotto /src/assets
// import logoImg from '../assets/tuo-logo.png'; 

const AREAS = {
  manage: { label: '🏢 Gestione', home: '/calendario', links: [
    { to: '/calendario', ico: '📅', label: 'Calendario' }, { to: '/squadre', ico: '🎯', label: 'Squadre' }, { to: '/materiale', ico: '📦', label: 'Materiale' },
    { to: '/periodi', ico: '🗓️', label: 'Periodi' }, { to: '/animatori', ico: '🙋', label: 'Staff' }] },
  me: { label: '🙋 Il mio spazio', home: '/programma', links: [{ to: '/programma', ico: '📋', label: 'Programma' }, { to: '/disponibilita', ico: '✅', label: 'Disponibilità' }] },
  owner: { label: '⭐ Titolare', home: '/titolare/disponibilita', links: [{ to: '/titolare/disponibilita', ico: '🔎', label: 'Disponibilità' }, { to: '/titolare/preset', ico: '🎁', label: 'Preset' }] }
};

export default function MainLayout() {
  const { user, isManager, isOwner, logout } = useAuth(); 
  const { pathname } = useLocation();
  const area = pathname.startsWith('/titolare') ? 'owner' : AREAS.me.links.some(l => pathname.startsWith(l.to)) || !isManager ? 'me' : 'manage';
  const available = ['manage', 'me', 'owner'].filter(k => k === 'me' || (k === 'manage' && isManager) || (k === 'owner' && isOwner));
  
  return <>
    <header>
      <div className="top">
        {/* Sostituito il testo con il logo */}
        <img src="/logo.png" alt="Logo Animazione" className="logo" />
        
        <span className="spacer" />
        <span className="who">{user.name}</span>
        <NotificationBell />
        <button className="y sm" onClick={logout}>Esci</button>
      </div>
      {available.length > 1 && <div className="groups" role="group" aria-label="Area">
        {available.map(k => <Link key={k} to={AREAS[k].home} className={area === k ? 'on' : ''} aria-current={area === k}>{AREAS[k].label}</Link>)}</div>}
      <nav className="nav" aria-label="Sezioni">{AREAS[area].links.map(l => <NavLink key={l.to} to={l.to}><span className="ico">{l.ico}</span><span>{l.label}</span></NavLink>)}</nav>
    </header>
    <main><Outlet /></main>
  </>;
}