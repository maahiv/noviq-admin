import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { dbGet, firebaseConfigured, refreshIdToken, signIn } from '../api/firebaseRest';
const Ctx=createContext(null);
export function AdminAuthProvider({children}){
  const [auth,setAuth]=useState(()=>JSON.parse(localStorage.getItem('electrowave_admin_auth')||'null'));
  const [loading,setLoading]=useState(false);
  useEffect(()=>{const saved=JSON.parse(localStorage.getItem('electrowave_admin_auth')||'null');if(!saved?.refreshToken||!firebaseConfigured())return;refreshIdToken(saved.refreshToken).then(t=>{setAuth({...saved,idToken:t.id_token,refreshToken:t.refresh_token||saved.refreshToken});}).catch(logout)},[]);
  const save=s=>{setAuth(s);localStorage.setItem('electrowave_admin_auth',JSON.stringify(s));};
  async function login(email,password){setLoading(true);try{if(!firebaseConfigured())throw new Error('Firebase env is missing. Configure .env first.');const data=await signIn(email,password);const profile=await dbGet(`users/${data.localId}`,data.idToken);if(profile?.role!=='admin')throw new Error('This account is not marked as admin. Set /users/<uid>/role to admin in Firebase.');save({uid:data.localId,email:data.email,idToken:data.idToken,refreshToken:data.refreshToken,profile});return profile;}finally{setLoading(false)}}
  function logout(){setAuth(null);localStorage.removeItem('electrowave_admin_auth');}
  const value=useMemo(()=>({auth,user:auth?.profile||null,loading,login,logout}),[auth,loading]);return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useAdminAuth(){return useContext(Ctx)}
