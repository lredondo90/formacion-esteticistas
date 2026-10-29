import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabase'
import './manager.css'

type Client = { id: string; name: string; phone: string; notes: string }
type Booking = { id: string; client: string; service: string; professional: string; date: string; time: string; status: 'Confirmada' | 'Pendiente' | 'Cancelada'; price: number }
const SERVICES = [{ name: 'Higiene facial', minutes: 60, price: 45 }, { name: 'Diseño de cejas', minutes: 30, price: 18 }, { name: 'Tratamiento hidratante', minutes: 45, price: 38 }, { name: 'Depilación', minutes: 20, price: 15 }]
const isoToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const money = (v:number) => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v)

export function ManagerHome() {
  const [session, setSession] = useState<Session | null>(null)
  const [recoveringPassword, setRecoveringPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [authReady, setAuthReady] = useState(false)
  const [authMode, setAuthMode] = useState<'login'|'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [center, setCenter] = useState<{id:string;name:string}|null>(null)
  const [centerReady, setCenterReady] = useState(false)
  const [centerLoadError, setCenterLoadError] = useState('')
  const [centerRetry, setCenterRetry] = useState(0)
  const [centerName, setCenterName] = useState('')

  useEffect(() => {
    if (!supabaseConfigured) { setAuthReady(true); return }
    void supabase.auth.getSession().then(({data,error}) => {
      if (error) setAuthMessage('No se pudo comprobar la sesión. Inténtalo de nuevo.')
      setSession(data.session)
      setAuthReady(true)
    })
    const {data:{subscription}} = supabase.auth.onAuthStateChange((event,nextSession) => {
      setSession(nextSession)
      if (event === 'PASSWORD_RECOVERY') setRecoveringPassword(true)
      setCenter(null)
      setCenterReady(!nextSession)
      setAuthMessage('')
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user.id) return
    let active = true
    setCenterReady(false)
    setCenterLoadError('')
    void (async () => {
      const {data:members,error} = await supabase.from('center_members').select('center_id').eq('user_id',session.user.id).eq('active',true)
      if (!active) return
      if (error) { setCenterLoadError('No se pudo cargar el centro. Comprueba las migraciones y las políticas RLS.'); setCenterReady(true); return }
      const centerId = members?.[0]?.center_id
      if (!centerId) { setCenter(null); setCenterReady(true); return }
      const {data:record,error:centerError} = await supabase.from('centers').select('id,name').eq('id',centerId).single()
      if (!active) return
      if (centerError || !record) setCenterLoadError('No se pudo cargar el centro asociado a tu cuenta.')
      else setCenter({id:record.id,name:record.name})
      setCenterReady(true)
    })()
    return () => { active = false }
  }, [session?.user.id,centerRetry])

  async function submitAuth(event:FormEvent) {
    event.preventDefault()
    setAuthBusy(true); setAuthMessage('')
    try {
      if (authMode === 'signup') {
        const {data,error} = await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:`${window.location.origin}/#/gestor`}})
        if (error) throw error
        if (!data.session) setAuthMessage('Cuenta creada. Revisa tu correo para confirmar la dirección y después inicia sesión.')
        else setAuthMessage('Cuenta creada. Ahora configura tu centro.')
      } else {
        const {error} = await supabase.auth.signInWithPassword({email:email.trim(),password})
        if (error) throw error
      }
    } catch (error) { setAuthMessage(authError(error)) }
    finally { setAuthBusy(false) }
  }

  async function resetPassword() {
    if (!email.trim()) { setAuthMessage('Escribe tu correo para enviarte el enlace de recuperación.'); return }
    setAuthBusy(true); setAuthMessage('')
    const {error} = await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/#/gestor`})
    setAuthMessage(error ? authError(error) : 'Si existe una cuenta con ese correo, recibirá un enlace de recuperación.')
    setAuthBusy(false)
  }

  async function updatePassword(event:FormEvent) {
    event.preventDefault(); setAuthBusy(true); setAuthMessage('')
    const {error} = await supabase.auth.updateUser({password:newPassword})
    if (error) setAuthMessage(authError(error))
    else { setRecoveringPassword(false); setAuthMessage('Contraseña actualizada.') }
    setAuthBusy(false)
  }

  async function createCenter(event:FormEvent) {
    event.preventDefault()
    if (!centerName.trim()) return
    setAuthBusy(true); setAuthMessage('')
    const {data,error} = await supabase.rpc('create_my_first_center',{p_name:centerName.trim()})
    if (error) setAuthMessage(authError(error))
    else setCenter({id:data,name:centerName.trim()})
    setAuthBusy(false)
  }

  if (!supabaseConfigured) return <AuthPanel title="Conecta Supabase para empezar" message="Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en el entorno de desarrollo. No se han cargado ni guardado datos de demostración de clientes." />
  if (recoveringPassword) return <section className="mgr mgr-auth"><div className="mgr-auth-card"><span className="mgr-kicker">SEGURIDAD DE LA CUENTA</span><h1>Elige una contraseña nueva</h1><form onSubmit={updatePassword}><label>Nueva contraseña<input required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} /></label><button className="mgr-primary" type="submit" disabled={authBusy}>Actualizar contraseña</button></form>{authMessage&&<p className="mgr-notice" role="status">{authMessage}</p>}</div></section>
  if (!authReady || (session && !centerReady)) return <div className="mgr"><p role="status">Comprobando tu sesión…</p></div>
  if (!session) return <section className="mgr mgr-auth"><div className="mgr-auth-card"><span className="mgr-kicker">AULA ESTÉTICA · MANAGER</span><h1>{authMode==='login'?'Inicia sesión':'Crea tu cuenta'}</h1><p>Acceso seguro a la gestión de tu centro.</p><form onSubmit={submitAuth}><label>Correo electrónico<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Contraseña<input required type="password" minLength={8} autoComplete={authMode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} /></label><button className="mgr-primary" type="submit" disabled={authBusy}>{authBusy?'Procesando…':authMode==='login'?'Entrar':'Crear cuenta'}</button></form>{authMode==='login'&&<button className="mgr-link" type="button" onClick={()=>void resetPassword()} disabled={authBusy}>He olvidado mi contraseña</button>}<button className="mgr-link" type="button" onClick={()=>{setAuthMode(authMode==='login'?'signup':'login');setAuthMessage('')}}>{authMode==='login'?'Crear una cuenta':'Ya tengo cuenta'}</button>{authMessage&&<p className="mgr-notice" role="status">{authMessage}</p>}<p className="mgr-footnote">Tu contraseña la gestiona Supabase Auth. Usa la confirmación de correo en el proyecto de desarrollo.</p></div></section>
  if (session && centerLoadError) return <section className="mgr mgr-auth"><div className="mgr-auth-card"><h1>No se pudo cargar tu centro</h1><p role="alert">{centerLoadError}</p><button className="mgr-primary" onClick={()=>setCenterRetry(value=>value+1)}>Reintentar</button><button className="mgr-link" onClick={()=>void supabase.auth.signOut()}>Cerrar sesión</button></div></section>
  if (!center) return <section className="mgr mgr-auth"><div className="mgr-auth-card"><span className="mgr-kicker">PRIMER PASO</span><h1>Configura tu centro</h1><p>El centro quedará asociado a tu cuenta como propietaria.</p><form onSubmit={createCenter}><label>Nombre del centro<input required minLength={2} maxLength={140} value={centerName} onChange={e=>setCenterName(e.target.value)} placeholder="Ej. Estudio Aura" /></label><button className="mgr-primary" type="submit" disabled={authBusy}>{authBusy?'Guardando…':'Crear mi centro'}</button></form>{authMessage&&<p className="mgr-notice" role="status">{authMessage}</p>}<button className="mgr-link" type="button" onClick={()=>void supabase.auth.signOut()}>Cerrar sesión</button></div></section>
  return <ManagerWorkspace key={center.id} center={center} email={session.user.email??''} onSignOut={()=>void supabase.auth.signOut()} />
}

function AuthPanel({title,message}:{title:string;message:string}) { return <section className="mgr mgr-auth"><div className="mgr-auth-card"><span className="mgr-kicker">AULA ESTÉTICA · MANAGER</span><h1>{title}</h1><p>{message}</p></div></section> }
function authError(error:unknown) { return error instanceof Error ? error.message : 'No se pudo completar la operación.' }

function ManagerWorkspace({center,email,onSignOut}:{center:{id:string;name:string};email:string;onSignOut:()=>void}) {
  const [tab,setTab] = useState<'inicio'|'agenda'|'clientes'|'servicios'>('inicio')
  const [clients,setClients] = useState<Client[]>([])
  const [clientsLoading,setClientsLoading] = useState(true)
  const [clientsError,setClientsError] = useState('')
  const [bookings,setBookings] = useState<Booking[]>([])
  const [day,setDay] = useState(isoToday())
  const [showNew,setShowNew] = useState(false)
  const [showClient,setShowClient] = useState(false)
  const [clientName,setClientName] = useState('')
  const [clientPhone,setClientPhone] = useState('')
  const [clientNotes,setClientNotes] = useState('')
  const [bookingClient,setBookingClient] = useState('')
  const [bookingService,setBookingService] = useState(SERVICES[0].name)
  const [bookingPro,setBookingPro] = useState('Ana')
  const [bookingDate,setBookingDate] = useState(isoToday())
  const [bookingTime,setBookingTime] = useState('11:00')
  const [notice,setNotice] = useState('')
  const [clientQuery,setClientQuery] = useState('')
  const filteredClients = useMemo(()=>clients.filter(c=>`${c.name} ${c.phone}`.toLowerCase().includes(clientQuery.toLowerCase().trim())),[clients,clientQuery])
  const clientVisitCount = (name:string)=>bookings.filter(b=>b.client===name&&b.status!=='Cancelada').length
  const todays = useMemo(()=>bookings.filter(b=>b.date===day&&b.status!=='Cancelada').sort((a,b)=>a.time.localeCompare(b.time)),[bookings,day])
  const confirmedRevenue = todays.filter(b=>b.status==='Confirmada').reduce((sum,b)=>sum+b.price,0)
  const saveBookings = (v:Booking[])=>setBookings(v)
  const loadClients = useCallback(async () => { setClientsLoading(true); setClientsError(''); const {data,error}=await supabase.from('clients').select('id,name,phone,operational_notes').eq('center_id',center.id).order('name'); if(error) setClientsError('No se pudieron cargar los clientes. Comprueba que las migraciones estén aplicadas y que tu rol tenga permiso.'); else setClients((data??[]).map(c=>({id:c.id,name:c.name,phone:c.phone??'',notes:c.operational_notes??''}))); setClientsLoading(false) },[center.id])
  useEffect(()=>{void loadClients()},[loadClients])
  async function createClient(e:FormEvent) { e.preventDefault(); if(!clientName.trim())return; setClientsError(''); const {data,error}=await supabase.from('clients').insert({center_id:center.id,name:clientName.trim(),phone:clientPhone.trim()||null,operational_notes:clientNotes.trim()||null}).select('id,name,phone,operational_notes').single(); if(error){setClientsError('No se pudo guardar el cliente. Revisa la conexión y los permisos del centro.');return} setClients(current=>[...current,{id:data.id,name:data.name,phone:data.phone??'',notes:data.operational_notes??''}].sort((a,b)=>a.name.localeCompare(b.name,'es')));setClientName('');setClientPhone('');setClientNotes('');setShowClient(false);setNotice('Cliente guardado en el centro.') }
  function createBooking(e:React.FormEvent) { e.preventDefault(); const service=SERVICES.find(s=>s.name===bookingService)!; const overlap=bookings.some(b=>b.date===bookingDate&&b.time===bookingTime&&b.professional===bookingPro&&b.status!=='Cancelada'); if(overlap){setNotice('Ese profesional ya tiene una cita a esa hora. Elige otro horario.');return} const next=[...bookings,{id:crypto.randomUUID(),client:bookingClient,service:service.name,professional:bookingPro,date:bookingDate,time:bookingTime,status:'Pendiente' as const,price:service.price}];saveBookings(next);setShowNew(false);setDay(bookingDate);setNotice('Cita de demostración creada. Aún no sincronizada con servidor.') }
  const nav=[['inicio','Resumen'],['agenda','Agenda'],['clientes','Clientes'],['servicios','Servicios']] as const
  return <div className="mgr">
    <div className="mgr-head"><div><span className="mgr-kicker">AULA ESTÉTICA · MANAGER</span><h1>{center.name}</h1><p>Sesión de {email}</p></div><div><button className="mgr-primary" onClick={()=>{setShowNew(true);setNotice('')}}>＋ Nueva cita</button> <button className="mgr-secondary" onClick={onSignOut}>Cerrar sesión</button></div></div>
    <div className="mgr-demo"><span>CLIENTES EN SUPABASE</span> El directorio se comparte dentro de este centro. La agenda y los servicios siguen siendo una demostración local.</div>
    <div className="mgr-tabs">{nav.map(([id,label])=><button key={id} className={tab===id?'selected':''} onClick={()=>setTab(id)}>{label}</button>)}</div>
    {notice&&<div className="mgr-notice" role="status">{notice}</div>}{clientsError&&<div className="mgr-notice mgr-error" role="alert">{clientsError} <button className="mgr-link" onClick={()=>void loadClients()}>Reintentar</button></div>}
    {tab==='inicio'&&<><div className="mgr-welcome"><div><span>VISTA DEL DÍA</span><h2>Un centro que fluye ✨</h2><p>Consulta tu agenda y empieza el día con todo en orden.</p></div><div className="mgr-date">{new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</div></div><div className="mgr-metrics"><article><span>Citas del día</span><strong>{todays.length}</strong><small>En la fecha seleccionada · demo</small></article><article><span>Clientes</span><strong>{clientsLoading?'…':clients.length}</strong><small>En este centro</small></article><article><span>Ingresos previstos*</span><strong>{money(todays.reduce((a,b)=>a+b.price,0))}</strong><small>*Agenda de demostración</small></article><article><span>Confirmadas</span><strong>{todays.filter(b=>b.status==='Confirmada').length}</strong><small>{money(confirmedRevenue)} · demo</small></article></div><section className="mgr-panel"><div className="mgr-section-head"><div><h2>Próximas citas</h2><p>Agenda de demostración · no compartida</p></div><button className="mgr-link" onClick={()=>setTab('agenda')}>Ver agenda →</button></div><div className="mgr-day"><label htmlFor="mgr-day">Día</label><input id="mgr-day" type="date" value={day} onChange={e=>setDay(e.target.value)}/></div><BookingRows bookings={todays} onCancel={id=>saveBookings(bookings.map(b=>b.id===id?{...b,status:'Cancelada'}:b))}/></section></>}
    {tab==='agenda'&&<section className="mgr-panel"><div className="mgr-section-head"><div><h2>Agenda</h2><p>Planifica las citas de tu centro</p></div><button className="mgr-primary" onClick={()=>setShowNew(true)}>＋ Nueva cita</button></div><div className="mgr-day"><label htmlFor="mgr-day2">Fecha</label><input id="mgr-day2" type="date" value={day} onChange={e=>setDay(e.target.value)}/></div><BookingRows bookings={todays} onCancel={id=>saveBookings(bookings.map(b=>b.id===id?{...b,status:'Cancelada'}:b))}/></section>}
    {tab==='clientes'&&<section className="mgr-panel"><div className="mgr-section-head"><div><h2>Clientes</h2><p>Relaciones y preferencias de {center.name}</p></div><button className="mgr-primary" onClick={()=>setShowClient(true)}>＋ Añadir cliente</button></div><label className="mgr-client-search">Buscar cliente<input type="search" value={clientQuery} onChange={e=>setClientQuery(e.target.value)} placeholder="Nombre o teléfono…"/></label>{clientsLoading?<p role="status">Cargando clientes…</p>:<><div className="mgr-table"><div className="mgr-table-head mgr-client-cols"><span>Cliente</span><span>Teléfono</span><span>Visitas</span><span>Notas</span></div>{filteredClients.map(c=><div className="mgr-table-row mgr-client-cols" key={c.id}><strong>{c.name}</strong><span>{c.phone||'—'}</span><span>{clientVisitCount(c.name)}</span><span>{c.notes||'—'}</span></div>)}</div>{!clients.length&&<p className="mgr-empty">Aún no tienes clientes.</p>}{clients.length>0&&!filteredClients.length&&<p className="mgr-empty">No hay coincidencias.</p>}</>}</section>}
    {tab==='servicios'&&<section className="mgr-panel"><div className="mgr-section-head"><div><h2>Servicios</h2><p>Catálogo inicial de demostración</p></div></div><div className="mgr-service-grid">{SERVICES.map(s=><article key={s.name}><span>✧</span><h3>{s.name}</h3><p>{s.minutes} min</p><strong>{money(s.price)}</strong></article>)}</div><p className="mgr-footnote">Los servicios se podrán personalizar desde la configuración en una siguiente iteración.</p></section>}
    {showNew&&<div className="mgr-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setShowNew(false)}}><form className="mgr-modal" onSubmit={createBooking}><div className="mgr-modal-head"><div><span className="mgr-kicker">AGENDA</span><h2>Crear cita</h2></div><button type="button" className="mgr-close" onClick={()=>setShowNew(false)}>×</button></div><label>Cliente<select required value={bookingClient} onChange={e=>setBookingClient(e.target.value)}><option value="">Selecciona cliente</option>{clients.map(c=><option key={c.id}>{c.name}</option>)}</select></label><label>Servicio<select value={bookingService} onChange={e=>setBookingService(e.target.value)}>{SERVICES.map(s=><option key={s.name}>{s.name}</option>)}</select></label><div className="mgr-form-grid"><label>Profesional<select value={bookingPro} onChange={e=>setBookingPro(e.target.value)}><option>Ana</option><option>Paula</option></select></label><label>Fecha<input required type="date" min={isoToday()} value={bookingDate} onChange={e=>setBookingDate(e.target.value)}/></label></div><label>Hora<input required type="time" value={bookingTime} onChange={e=>setBookingTime(e.target.value)}/></label><div className="mgr-form-actions"><button type="button" className="mgr-secondary" onClick={()=>setShowNew(false)}>Cancelar</button><button className="mgr-primary" type="submit" disabled={!clients.length}>Guardar cita</button></div><p className="mgr-footnote">Reserva provisional local; todavía no bloquea horarios entre usuarios o dispositivos.</p></form></div>}
    {showClient&&<div className="mgr-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setShowClient(false)}}><form className="mgr-modal" onSubmit={createClient}><div className="mgr-modal-head"><div><span className="mgr-kicker">CRM · {center.name}</span><h2>Nuevo cliente</h2></div><button type="button" className="mgr-close" onClick={()=>setShowClient(false)}>×</button></div><label>Nombre completo<input required autoFocus value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Nombre y apellidos"/></label><label>Teléfono<input type="tel" value={clientPhone} onChange={e=>setClientPhone(e.target.value)} placeholder="+34 600 000 000"/></label><label>Notas internas<textarea value={clientNotes} onChange={e=>setClientNotes(e.target.value)} rows={3} placeholder="Solo información operativa necesaria"/></label><div className="mgr-form-actions"><button type="button" className="mgr-secondary" onClick={()=>setShowClient(false)}>Cancelar</button><button className="mgr-primary" type="submit">Guardar cliente</button></div><p className="mgr-footnote">No incluyas diagnósticos ni datos de salud; las notas son visibles para personal autorizado del centro.</p></form></div>}
  </div>
}
function BookingRows({bookings,onCancel}:{bookings:Booking[];onCancel:(id:string)=>void}) { if(!bookings.length)return <div className="mgr-empty"><span>☀️</span><strong>No hay citas para este día</strong><p>Un hueco perfecto para organizarte o abrir reservas.</p></div>;return <div className="mgr-bookings">{bookings.map(b=><article key={b.id} className="mgr-booking"><div className="mgr-time">{b.time}</div><div className="mgr-booking-info"><strong>{b.client}</strong><span>{b.service} · {b.professional}</span></div><div className="mgr-booking-right"><span className={'mgr-status '+(b.status==='Confirmada'?'ok':'wait')}>{b.status}</span><strong>{money(b.price)}</strong></div>{b.status!=='Cancelada'&&<button className="mgr-cancel" title="Cancelar cita" onClick={()=>onCancel(b.id)}>Cancelar</button>}</article>)}</div> }
