'use client';
import {useEffect,useState} from 'react';
import {browserDatabase,adminFetch} from '@/lib/supabase';
import Admin from './studio';
export default function AdminAccess() {
  const [ready,setReady] = useState(false), [allowed,setAllowed] = useState(false);
  const [email,setEmail] = useState('adityamohan132@gmail.com'), [password,setPassword] = useState('');
  const [busy,setBusy] = useState(false), [message,setMessage] = useState('');
  useEffect(()=>{
    let active = true;
    const check = async()=>{
      const response = await adminFetch('/api/admin');
      if(active){setAllowed(response.ok);setReady(true);}
    };
    void check().catch(()=>{if(active){setReady(true);setMessage('Unable to check your session. Please retry.');}});
    const {data:{subscription}} = browserDatabase().auth.onAuthStateChange(()=>{setTimeout(()=>void check().catch(()=>{if(active)setMessage('Unable to check your session.');}),0);});
    return()=>{active=false;subscription.unsubscribe();};
  },[]);
  async function signIn(create=false) {
    setBusy(true);setMessage('');
    try {
      if(email.trim().toLowerCase()!=='adityamohan132@gmail.com') throw Error('This studio is reserved for the portfolio owner.');
      const auth=browserDatabase().auth;
      const result=create ? await auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin+'/admin'}})
        : await auth.signInWithPassword({email:email.trim(),password});
      if(result.error) throw result.error;
      if(create&&!result.data.session) setMessage('Check your email to confirm your account. After confirming, return here to sign in.');
    } catch(error) {setMessage(error instanceof Error?error.message:'Unable to sign in.');}
    finally{setBusy(false);}
  }
  if(!ready)return <main className="unavailable"><p>Opening the editorial studio…</p></main>;
  if(allowed)return <><div className="admin-session"><button className="text-link" onClick={async()=>{await adminFetch('/api/admin',{method:'DELETE'});await browserDatabase().auth.signOut();}}>Sign out</button></div><Admin/></>;
  return <main className="unavailable admin-login"><span className="eyebrow">PRIVATE / ADMINISTRATOR</span><h1>Editorial studio.</h1><p>Sign in to manage your portfolio.</p>
    <form onSubmit={e=>{e.preventDefault();void signIn();}}>
      <label htmlFor="admin-email">Email</label><input id="admin-email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/>
      <label htmlFor="admin-password">Password</label><input id="admin-password" type="password" minLength={12} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/>
      <button className="button brass" disabled={busy}>{busy?'Please wait…':'Sign in'}</button>
      <button type="button" className="text-link" disabled={busy||password.length<12} onClick={()=>void signIn(true)}>First visit? Create your admin account</button>
    </form><p role="status">{message}</p><a className="text-link" href="/">Return to portfolio</a></main>;
}
