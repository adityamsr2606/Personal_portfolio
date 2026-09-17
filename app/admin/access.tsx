'use client';
import {useEffect,useState} from 'react';
import {browserDatabase,adminFetch} from '@/lib/supabase';
import Admin from './studio';

const ADMIN_EMAIL='adityamohan132@gmail.com';

export default function AdminAccess() {
  const [ready,setReady] = useState(false), [allowed,setAllowed] = useState(false);
  const [password,setPassword] = useState('');
  const [busy,setBusy] = useState(false), [message,setMessage] = useState('');
  const [securityOpen,setSecurityOpen] = useState(false);
  const [currentPassword,setCurrentPassword] = useState('');
  const [newPassword,setNewPassword] = useState('');
  const [confirmPassword,setConfirmPassword] = useState('');
  const [securityMessage,setSecurityMessage] = useState('');

  useEffect(()=>{
    let active = true;
    const check = async()=>{
      const response = await adminFetch('/api/admin');
      if(active){setAllowed(response.ok);setReady(true);}
    };
    void check().catch(()=>{if(active){setReady(true);setMessage('Unable to check your session. Please retry.');}});
    const {data:{subscription}} = browserDatabase().auth.onAuthStateChange(()=>{
      setTimeout(()=>void check().catch(()=>{if(active)setMessage('Unable to check your session.');}),0);
    });
    return()=>{active=false;subscription.unsubscribe();};
  },[]);

  async function signIn(create=false) {
    setBusy(true);setMessage('');
    try {
      const auth=browserDatabase().auth;
      const result=create
        ? await auth.signUp({email:ADMIN_EMAIL,password,options:{emailRedirectTo:window.location.origin+'/admin'}})
        : await auth.signInWithPassword({email:ADMIN_EMAIL,password});
      if(result.error) throw result.error;
      if(create&&!result.data.session) setMessage('Owner account created. Check the administrator email to confirm it, then return here and sign in.');
    } catch(error) {setMessage(error instanceof Error?error.message:'Unable to sign in.');}
    finally{setBusy(false);}
  }

  async function changePassword(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);setSecurityMessage('');
    try{
      if(newPassword.length<8) throw Error('New password must contain at least 8 characters.');
      if(newPassword!==confirmPassword) throw Error('The new passwords do not match.');
      const {error}=await browserDatabase().auth.updateUser({password:newPassword,current_password:currentPassword});
      if(error) throw error;
      setCurrentPassword('');setNewPassword('');setConfirmPassword('');
      setSecurityMessage('Password changed successfully.');
    }catch(error){setSecurityMessage(error instanceof Error?error.message:'Unable to change password.');}
    finally{setBusy(false);}
  }

  async function signOut(){
    await adminFetch('/api/admin',{method:'DELETE'});
    await browserDatabase().auth.signOut();
  }

  if(!ready)return <main className="unavailable"><p>Opening the editorial studio…</p></main>;

  if(allowed)return <>
    <div className="admin-session">
      <button className="text-link" onClick={()=>setSecurityOpen(v=>!v)}>Security</button>
      <button className="text-link" onClick={()=>void signOut()}>Sign out</button>
    </div>
    {securityOpen&&<section className="admin-security" aria-label="Admin security settings">
      <div className="eyebrow">ADMIN / SECURITY</div>
      <h2>Change password</h2>
      <p>Signed in as {ADMIN_EMAIL}</p>
      <form onSubmit={changePassword}>
        <label htmlFor="current-password">Current password</label>
        <input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required/>
        <label htmlFor="new-password">New password</label>
        <input id="new-password" type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required/>
        <label htmlFor="confirm-password">Confirm new password</label>
        <input id="confirm-password" type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required/>
        <div className="admin-security-actions"><button className="button brass" disabled={busy}>{busy?'Updating…':'Update password'}</button><button type="button" className="text-link" onClick={()=>setSecurityOpen(false)}>Close</button></div>
      </form>
      <p role="status">{securityMessage}</p>
    </section>}
    <Admin/>
  </>;

  return <main className="unavailable admin-login"><span className="eyebrow">PRIVATE / ADMINISTRATOR</span><h1>Editorial studio.</h1><p>Owner access only.</p>
    <form onSubmit={e=>{e.preventDefault();void signIn();}}>
      <label htmlFor="admin-email">Administrator email</label><input id="admin-email" type="email" autoComplete="username" value={ADMIN_EMAIL} readOnly aria-readonly="true"/>
      <label htmlFor="admin-password">Password</label><input id="admin-password" type="password" minLength={8} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/>
      <button className="button brass" disabled={busy}>{busy?'Please wait…':'Sign in'}</button>
      <button type="button" className="text-link" disabled={busy||password.length<8} onClick={()=>void signIn(true)}>First visit only: initialize owner account</button>
    </form><p role="status">{message}</p><a className="text-link" href="/">Return to portfolio</a></main>;
}
