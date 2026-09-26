import {useEffect,useState} from 'react';
import {dbDelete,dbGet,dbPatch,dbPost,firebaseConfigured} from '../api/firebaseRest';
import {categories as seed} from '../api/seed';
function token(){return JSON.parse(localStorage.getItem('electrowave_admin_auth')||'{}').idToken}
export default function Categories(){
  const [cats,setCats]=useState([]); const [form,setForm]=useState({name:'',emoji:'⚡'}); const [editing,setEditing]=useState(null); const [message,setMessage]=useState('');
  const load=async()=>{if(firebaseConfigured()){const c=await dbGet('categories',token());setCats(c?Object.entries(c).map(([id,x])=>({id,...x})):seed);}else setCats(seed)};
  useEffect(()=>{load().catch(err=>setMessage(err.message));},[]);
  const save=async e=>{e.preventDefault();if(!form.name.trim())return;const payload={name:form.name.trim(),emoji:form.emoji.trim()||'⚡'};try{if(editing){await dbPatch(`categories/${editing}`,payload,token());}else{await dbPost('categories',payload,token());}await load();setForm({name:'',emoji:'⚡'});setEditing(null);setMessage(editing?'Category updated':'Category created');setTimeout(()=>setMessage(''),1500);}catch(err){setMessage(err.message)}};
  const del=async id=>{if(!confirm('Delete category?'))return;try{await dbDelete(`categories/${id}`,token());await load();setMessage('Category deleted');setTimeout(()=>setMessage(''),1500);}catch(err){setMessage(err.message)}};
  return <><div className="page-title"><div><p className="eyebrow">ORGANIZE</p><h2>Categories</h2><p className="muted">The store is grouped into the eight core electronics collections.</p></div></div>{message&&<div className="toast">{message}</div>}
    <div className="split-grid"><section className="panel-card"><div className="panel-head"><h3>{editing?'Edit category':'Add category'}</h3></div><form className="compact-form" onSubmit={save}><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Icon emoji<input value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})}/></label><div className="modal-actions"><button className="admin-primary">{editing?'Update':'Create'}</button>{editing&&<button type="button" className="admin-secondary" onClick={()=>{setEditing(null);setForm({name:'',emoji:'⚡'})}}>Cancel</button>}</div></form></section>
    <section className="panel-card"><div className="category-admin-grid">{cats.map(c=><div className="category-admin" key={c.id}><span>{c.emoji}</span><div><b>{c.name}</b><small>{c.id}</small></div><button onClick={()=>{setEditing(c.id);setForm({name:c.name,emoji:c.emoji})}}>Edit</button><button className="danger" onClick={()=>del(c.id)}>Delete</button></div>)}</div></section></div></>;
}
