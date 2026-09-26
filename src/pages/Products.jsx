import { useEffect, useMemo, useState } from 'react';
import { dbDelete, dbGet, dbPatch, dbPost, firebaseConfigured } from '../api/firebaseRest';
import { categories as seedCategories } from '../api/seed';

const blank={name:'',brand:'',categoryId:'headphones',price:'',oldPrice:'',image:'',description:'',badge:'NEW',rating:'4.5',reviews:'0'};
function token(){return JSON.parse(localStorage.getItem('electrowave_admin_auth')||'{}').idToken}

export default function Products(){
  const [products,setProducts]=useState([]);
  const [categories,setCategories]=useState(seedCategories);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(blank);
  const [message,setMessage]=useState('');
  const [query,setQuery]=useState('');
  const [loading,setLoading]=useState(true);

  const load=async()=>{
    setLoading(true);
    try{
      if(firebaseConfigured()){
        const [p,c]=await Promise.all([dbGet('products',token()),dbGet('categories',token())]);
        setProducts(Object.entries(p||{}).map(([id,x])=>({id,...x})));
        setCategories(c ? Object.entries(c).map(([id,x])=>({id,...x})) : seedCategories);
      } else {
        setProducts([]);
      }
    } finally { setLoading(false); }
  };

  useEffect(()=>{load().catch(err=>setMessage(err.message));},[]);

  const visibleProducts=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return products;
    return products.filter(p=>`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q));
  },[products,query]);

  const startAdd=()=>{setEditing('new');setForm({...blank,categoryId:categories[0]?.id||'headphones'});setMessage('');};
  const startEdit=p=>{setEditing(p.id);setForm({...blank,...p,price:p.price??'',oldPrice:p.oldPrice??''});setMessage('');};

  const save=async e=>{
    e.preventDefault();
    const payload={
      name:form.name.trim(),
      brand:form.brand.trim(),
      categoryId:form.categoryId,
      category:categories.find(c=>c.id===form.categoryId)?.name||form.categoryId,
      price:Number(form.price),
      oldPrice:Number(form.oldPrice||form.price),
      image:form.image.trim(),
      description:form.description.trim(),
      badge:form.badge.trim()||'NEW',
      rating:Number(form.rating||4.5),
      reviews:Number(form.reviews||0)
    };
    try{
      if(!firebaseConfigured()) throw new Error('Firebase is not configured.');
      if(editing==='new') await dbPost('products',payload,token());
      else await dbPatch(`products/${editing}`,payload,token());
      await load();
      setEditing(null);
      setMessage(editing==='new'?'Product added successfully':'Product updated successfully');
      setTimeout(()=>setMessage(''),1800);
    }catch(err){setMessage(err.message);}
  };

  const remove=async id=>{
    if(!confirm('Delete this product?')) return;
    try{
      await dbDelete(`products/${id}`,token());
      await load();
      setMessage('Product deleted');
      setTimeout(()=>setMessage(''),1600);
    }catch(err){setMessage(err.message);}
  };

  return <>
    <div className="page-title">
      <div><p className="eyebrow">CATALOGUE</p><h2>Products</h2><p className="muted">Every product here is read from Firebase and appears on the customer store.</p></div>
      <div className="title-actions"><button className="admin-secondary" onClick={()=>load().catch(err=>setMessage(err.message))}>↻ Refresh</button><button className="admin-primary" onClick={startAdd}>+ Add product</button></div>
    </div>
    {message&&<div className="toast">{message}</div>}

    <section className="panel-card product-manager">
      <div className="catalog-toolbar"><div><b>{products.length}</b><span>live products</span></div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, brands..."/></div>
      <div className="admin-table product-admin-table">
        <div className="tr th"><span>Product</span><span>Category</span><span>Price</span><span>Action</span></div>
        {loading?<div className="table-empty">Loading live catalogue…</div>:visibleProducts.map(p=><div className="tr" key={p.id}>
          <span className="product-cell"><img src={p.image} alt=""/><span><b>{p.name}</b><small>{p.brand}</small></span></span>
          <span>{p.category||categories.find(c=>c.id===p.categoryId)?.name||p.categoryId}</span>
          <span>₹{Number(p.price||0).toLocaleString('en-IN')}</span>
          <span className="actions"><button onClick={()=>startEdit(p)}>Edit</button><button className="danger" onClick={()=>remove(p.id)}>Delete</button></span>
        </div>)}
        {!loading&&!visibleProducts.length&&<div className="table-empty">No matching products.</div>}
      </div>
    </section>

    {editing&&<div className="modal-backdrop"><form className="modal" onSubmit={save}>
      <div className="modal-head"><div><p className="eyebrow">CATALOGUE</p><h3>{editing==='new'?'Add product':'Edit product'}</h3></div><button type="button" onClick={()=>setEditing(null)}>×</button></div>
      <div className="modal-grid">
        <label>Product name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label>Brand<input required value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/></label>
        <label>Category<select value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
        <label>Badge<input value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})}/></label>
        <label>Price<input type="number" min="0" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label>
        <label>Old price<input type="number" min="0" value={form.oldPrice} onChange={e=>setForm({...form,oldPrice:e.target.value})}/></label>
        <label>Image URL<input required value={form.image} onChange={e=>setForm({...form,image:e.target.value})}/></label>
        <label>Rating<input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})}/></label>
        <label>Reviews<input type="number" min="0" value={form.reviews} onChange={e=>setForm({...form,reviews:e.target.value})}/></label>
        <label className="wide">Description<textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
      </div>
      <div className="modal-actions"><button type="button" className="admin-secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="admin-primary">{editing==='new'?'Add product':'Save changes'}</button></div>
    </form></div>}
  </>;
}
