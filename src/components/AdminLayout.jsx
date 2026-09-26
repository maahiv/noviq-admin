import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ensureDesiredCatalog } from '../api/catalog';
export default function AdminLayout(){
  const {user,logout}=useAdminAuth(); const nav=useNavigate();
  useEffect(()=>{ensureDesiredCatalog().catch(()=>{});},[]);
  const links=[['/','Products','◫'],['/dashboard','Overview','▦'],['/categories','Categories','◌'],['/orders','Orders','□']];
  const userAppUrl=import.meta.env.VITE_USER_APP_URL || 'http://localhost:5173';
  return <div className="admin-shell"><aside className="sidebar"><div className="admin-brand"><span>N</span><div>Noviq<small>ADMIN</small></div></div><nav>{links.map(([to,label,icon])=><NavLink key={to} to={to} end={to==='/' }><span>{icon}</span>{label}</NavLink>)}</nav><div className="side-bottom"><div className="admin-user"><div className="avatar">{(user?.name||user?.email||'A').slice(0,1).toUpperCase()}</div><div><b>{user?.name||'Administrator'}</b><small>{user?.email}</small></div></div><button onClick={()=>{logout();nav('/login')}}>↪ Logout</button></div></aside><div className="admin-content"><header className="admin-top"><div><span className="muted">Workspace</span><h1>Store control</h1></div><a className="view-store" href={userAppUrl} target="_blank" rel="noreferrer">Open store ↗</a></header><div className="admin-page"><Outlet/></div></div></div>
}
