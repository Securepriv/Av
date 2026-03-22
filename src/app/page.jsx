'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

// ─── SUPABASE CLIENT ────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const T = {
  bg:          '#08090A',
  surface:     '#111214',
  surfaceHigh: '#18191C',
  surfaceTop:  '#1F2023',
  border:      '#25262A',
  borderHover: '#35363C',
  accent:      '#E8FF6B',
  accentDim:   '#B5C94E',
  text:        '#ECEAE3',
  textMuted:   '#7A7870',
  textDim:     '#45443F',
  success:     '#52D68A',
  warning:     '#F5A623',
  danger:      '#FF5F57',
  info:        '#5BA4F5',
}

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:${T.bg};color:${T.text};font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
input,textarea,select,button{font-family:'Plus Jakarta Sans',sans-serif;outline:none}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
@keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
.fade-up{animation:fadeUp 0.35s cubic-bezier(.22,1,.36,1) both}
.stagger-1{animation-delay:.05s}.stagger-2{animation-delay:.1s}.stagger-3{animation-delay:.15s}.stagger-4{animation-delay:.2s}
.mono{font-family:'JetBrains Mono',monospace}
`

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{width:16,height:16,border:`2px solid ${T.border}`,borderTopColor:T.accent,borderRadius:'50%',animation:'spin .6s linear infinite'}}/>
)

const Btn = ({ children, variant='primary', onClick, small, full, loading, disabled, style:st }) => {
  const base = {
    display:'inline-flex',alignItems:'center',justifyContent:'center',gap:7,
    border:'none',borderRadius:8,fontWeight:600,cursor:disabled||loading?'not-allowed':'pointer',
    fontSize:small?12:13,padding:small?'6px 14px':'10px 22px',
    width:full?'100%':'auto',transition:'all .15s',opacity:disabled?0.5:1,...st
  }
  const vars = {
    primary:{background:T.accent,color:'#08090A'},
    ghost:{background:'transparent',color:T.text,border:`1px solid ${T.border}`},
    danger:{background:'transparent',color:T.danger,border:`1px solid ${T.danger}40`},
    subtle:{background:T.surfaceHigh,color:T.textMuted,border:`1px solid ${T.border}`},
  }
  return (
    <button style={{...base,...vars[variant]}} onClick={!loading&&!disabled?onClick:undefined}
      onMouseEnter={e=>{if(!loading&&!disabled){if(variant==='primary')e.currentTarget.style.background=T.accentDim;else e.currentTarget.style.borderColor=T.borderHover}}}
      onMouseLeave={e=>{if(variant==='primary')e.currentTarget.style.background=T.accent;else e.currentTarget.style.borderColor=T.border}}
    >
      {loading?<Spinner/>:children}
    </button>
  )
}

const Card = ({ children, style:st, onClick, glow }) => (
  <div onClick={onClick} style={{
    background:T.surface,border:`1px solid ${glow?T.accent+'40':T.border}`,
    borderRadius:14,padding:'22px 24px',transition:'border-color .15s',
    cursor:onClick?'pointer':'default',boxShadow:glow?`0 0 20px ${T.accent}10`:'none',...st
  }}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.borderColor=T.borderHover}}
    onMouseLeave={e=>{if(onClick)e.currentTarget.style.borderColor=glow?T.accent+'40':T.border}}
  >{children}</div>
)

const Input = ({ label, value, onChange, type='text', placeholder, style:st, error }) => (
  <div style={{display:'flex',flexDirection:'column',gap:6,...st}}>
    {label&&<label style={{fontSize:12,color:T.textMuted,fontWeight:500,letterSpacing:'0.02em'}}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{background:T.surfaceHigh,border:`1px solid ${error?T.danger:T.border}`,borderRadius:8,padding:'10px 14px',color:T.text,fontSize:13,width:'100%',transition:'border-color .15s'}}
      onFocus={e=>e.target.style.borderColor=T.accent}
      onBlur={e=>e.target.style.borderColor=error?T.danger:T.border}
    />
    {error&&<span style={{fontSize:11,color:T.danger}}>{error}</span>}
  </div>
)

const Badge = ({ status }) => {
  const map = {
    'payée':    {bg:'#0D2B1A',color:T.success,dot:T.success},
    'envoyée':  {bg:'#0D1E35',color:T.info,dot:T.info},
    'en retard':{bg:'#2B0D0D',color:T.danger,dot:T.danger},
    'brouillon':{bg:T.surfaceHigh,color:T.textMuted,dot:T.textDim},
    'accepté':  {bg:'#0D2B1A',color:T.success,dot:T.success},
    'refusé':   {bg:'#2B0D0D',color:T.danger,dot:T.danger},
    'envoyé':   {bg:'#0D1E35',color:T.info,dot:T.info},
  }
  const s = map[status]||map['brouillon']
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:5,background:s.bg,color:s.color,fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20}}>
      <span style={{width:5,height:5,borderRadius:'50%',background:s.dot,flexShrink:0}}/>
      {status}
    </span>
  )
}

const Empty = ({ icon, text, sub }) => (
  <div style={{textAlign:'center',padding:'52px 24px'}}>
    <div style={{fontSize:32,marginBottom:12,opacity:0.3}}>{icon}</div>
    <div style={{fontWeight:600,color:T.textMuted,marginBottom:4}}>{text}</div>
    {sub&&<div style={{fontSize:13,color:T.textDim}}>{sub}</div>}
  </div>
)

const Toast = ({ msg, type }) => (
  msg ? <div style={{
    position:'fixed',bottom:24,right:24,zIndex:9999,padding:'12px 20px',
    background:type==='error'?'#2B0D0D':T.surfaceTop,
    border:`1px solid ${type==='error'?T.danger+'50':T.border}`,
    borderRadius:10,fontSize:13,color:type==='error'?T.danger:T.text,
    boxShadow:'0 8px 32px #00000080',animation:'fadeUp .25s ease',
    display:'flex',alignItems:'center',gap:8
  }}>
    <span>{type==='error'?'✕':'✓'}</span>{msg}
  </div> : null
)

// ─── VA SERVICES ─────────────────────────────────────────────────────────────
const VA_SERVICES = [
  'Gestion inbox','Gestion agenda','Rédaction emails','Posts réseaux sociaux',
  'Saisie de données','Service client','Recherche web','Création de contenu',
  'Support administratif','Traduction','Transcription','Mise en page documents',
]

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
const AuthPage = ({ onAuth }) => {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handle = async () => {
    setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (error) throw error
        onAuth(data.user)
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { data: { full_name: form.name } }
        })
        if (error) throw error
        setSuccess('Compte créé ! Connecte-toi maintenant.')
        setMode('login')
      }
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className="fade-up" style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:28,fontWeight:800,letterSpacing:'-1px'}}>
            <span style={{color:T.accent}}>VA</span>Billing
          </div>
          <div style={{fontSize:13,color:T.textDim,marginTop:6}}>Facturation pensée pour les assistantes virtuelles</div>
        </div>
        <Card glow>
          <div style={{marginBottom:24}}>
            <h2 style={{fontSize:18,fontWeight:700}}>{mode==='login'?'Bon retour 👋':'Créer un compte'}</h2>
            <p style={{fontSize:13,color:T.textMuted,marginTop:4}}>{mode==='login'?'Connecte-toi à ton espace.':'Commence gratuitement, sans carte.'}</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {mode==='register'&&<Input label="Prénom / Nom" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="Marie Dupont"/>}
            <Input label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="marie@email.com"/>
            <Input label="Mot de passe" type="password" value={form.password} onChange={v=>setForm({...form,password:v})} placeholder="••••••••"/>
          </div>
          {error&&<div style={{marginTop:14,padding:'10px 14px',background:'#2B0D0D',border:`1px solid ${T.danger}40`,borderRadius:8,fontSize:13,color:T.danger}}>{error}</div>}
          {success&&<div style={{marginTop:14,padding:'10px 14px',background:'#0D2B1A',border:`1px solid ${T.success}40`,borderRadius:8,fontSize:13,color:T.success}}>{success}</div>}
          <Btn full onClick={handle} loading={loading} style={{marginTop:20}}>{mode==='login'?'Se connecter':'Créer mon compte'}</Btn>
          <div style={{marginTop:18,textAlign:'center',fontSize:13,color:T.textMuted}}>
            {mode==='login'?'Pas de compte ? ':'Déjà un compte ? '}
            <span onClick={()=>{setMode(mode==='login'?'register':'login');setError('');setSuccess('')}} style={{color:T.accent,cursor:'pointer',fontWeight:600}}>
              {mode==='login'?'Créer un compte':'Se connecter'}
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:'dashboard', label:'Dashboard',    icon:'▦' },
  { id:'clients',   label:'Clients',      icon:'◎' },
  { id:'timer',     label:'Timer',        icon:'◷' },
  { id:'invoices',  label:'Factures',     icon:'▣' },
  { id:'quotes',    label:'Devis',        icon:'◈' },
  { id:'settings',  label:'Paramètres',   icon:'⊙' },
]

const Sidebar = ({ page, setPage, user, onSignOut }) => (
  <div style={{width:210,background:T.surface,borderRight:`1px solid ${T.border}`,height:'100vh',position:'sticky',top:0,display:'flex',flexDirection:'column',flexShrink:0}}>
    <div style={{padding:'22px 18px 18px',borderBottom:`1px solid ${T.border}`}}>
      <div style={{fontSize:19,fontWeight:800,letterSpacing:'-0.5px'}}>
        <span style={{color:T.accent}}>VA</span>Billing
      </div>
      <div style={{fontSize:10,color:T.textDim,marginTop:3,letterSpacing:'0.05em',textTransform:'uppercase'}}>Espace facturation</div>
    </div>
    <nav style={{flex:1,padding:'10px 8px',overflowY:'auto'}}>
      {NAV.map(n=>(
        <div key={n.id} onClick={()=>setPage(n.id)} style={{
          display:'flex',alignItems:'center',gap:9,padding:'9px 12px',
          borderRadius:8,marginBottom:1,cursor:'pointer',
          background:page===n.id?`${T.accent}15`:'transparent',
          color:page===n.id?T.accent:T.textMuted,
          fontWeight:page===n.id?600:400,fontSize:13,transition:'all .12s',
        }}
          onMouseEnter={e=>{if(page!==n.id){e.currentTarget.style.background=T.surfaceHigh;e.currentTarget.style.color=T.text}}}
          onMouseLeave={e=>{if(page!==n.id){e.currentTarget.style.background='transparent';e.currentTarget.style.color=T.textMuted}}}
        >
          <span style={{fontSize:13,opacity:0.8}}>{n.icon}</span>{n.label}
          {n.id==='invoices'&&<span style={{marginLeft:'auto',background:`${T.warning}25`,color:T.warning,fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>!</span>}
        </div>
      ))}
    </nav>
    <div style={{padding:'14px 16px',borderTop:`1px solid ${T.border}`}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
        <div style={{width:30,height:30,borderRadius:'50%',background:`${T.accent}20`,border:`1.5px solid ${T.accent}40`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,color:T.accent,flexShrink:0}}>
          {(user?.email||'?')[0].toUpperCase()}
        </div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.user_metadata?.full_name||'Mon compte'}</div>
          <div style={{fontSize:10,color:T.textDim,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</div>
        </div>
      </div>
      <Btn small variant="ghost" full onClick={onSignOut}>Déconnexion</Btn>
    </div>
  </div>
)

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({ setPage, user }) => {
  const [stats, setStats] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const load = async () => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0]
      const weekAgo = new Date(Date.now()-7*86400000).toISOString().split('T')[0]

      const [invRes, sesRes, cliRes] = await Promise.all([
        supabase.from('invoices').select('*,clients(name)').order('created_at',{ascending:false}),
        supabase.from('sessions').select('duration,date').gte('date',weekAgo),
        supabase.from('clients').select('id',{count:'exact',head:true}),
      ])

      const allInv = invRes.data||[]
      const monthInv = allInv.filter(i=>i.created_at>=firstDay)
      const pending = allInv.filter(i=>i.status==='envoyée'||i.status==='en retard')
      const weekH = (sesRes.data||[]).reduce((s,h)=>s+Number(h.duration),0)

      setStats({
        billed: monthInv.reduce((s,i)=>s+Number(i.amount),0),
        pending: pending.reduce((s,i)=>s+Number(i.amount),0),
        pendingCount: pending.length,
        weekHours: weekH.toFixed(1),
        clients: cliRes.count||0,
      })
      setInvoices(allInv.slice(0,4))
      setLoading(false)
    }
    load()
  },[])

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'toi'
  const hour = new Date().getHours()
  const greet = hour<12?'Bonjour':hour<18?'Bon après-midi':'Bonsoir'

  if (loading) return <div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner/></div>

  return (
    <div style={{padding:'32px 36px'}}>
      <div className="fade-up" style={{marginBottom:32}}>
        <h1 style={{fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>{greet}, {name} 👋</h1>
        <p style={{color:T.textMuted,fontSize:14,marginTop:5}}>Voici un résumé de ton activité ce mois-ci.</p>
      </div>

      <div className="fade-up stagger-1" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        {[
          {label:'Facturé ce mois',value:`${(stats?.billed||0).toLocaleString('fr')} €`,sub:'Revenus confirmés',color:T.accent},
          {label:'En attente',value:`${(stats?.pending||0).toLocaleString('fr')} €`,sub:`${stats?.pendingCount||0} facture(s)`,color:T.warning},
          {label:'Heures cette semaine',value:`${stats?.weekHours||0}h`,sub:'Toutes sessions',color:T.info},
          {label:'Clients actifs',value:stats?.clients||0,sub:'Dans ta base',color:T.text},
        ].map(s=>(
          <Card key={s.label}>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:10,fontWeight:500}}>{s.label}</div>
            <div className="mono" style={{fontSize:26,fontWeight:500,color:s.color,lineHeight:1}}>{s.value}</div>
            <div style={{fontSize:12,color:T.textDim,marginTop:6}}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="fade-up stagger-2" style={{display:'grid',gridTemplateColumns:'1.7fr 1fr',gap:16}}>
        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
            <div style={{fontWeight:700,fontSize:14}}>Dernières factures</div>
            <Btn small variant="ghost" onClick={()=>setPage('invoices')}>Voir tout →</Btn>
          </div>
          {invoices.length===0
            ? <Empty icon="▣" text="Aucune facture" sub="Crée ta première facture"/>
            : invoices.map((inv,i)=>(
              <div key={inv.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:i<invoices.length-1?`1px solid ${T.border}`:'none'}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{inv.invoice_number}</div>
                  <div style={{fontSize:12,color:T.textMuted,marginTop:1}}>{inv.clients?.name}</div>
                </div>
                <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                  <span className="mono" style={{fontSize:13,fontWeight:500}}>{Number(inv.amount).toLocaleString('fr')} €</span>
                  <Badge status={inv.status}/>
                </div>
              </div>
            ))
          }
        </Card>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>Actions rapides</div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              <Btn full onClick={()=>setPage('invoices')}>+ Nouvelle facture</Btn>
              <Btn full variant="ghost" onClick={()=>setPage('quotes')}>+ Nouveau devis</Btn>
              <Btn full variant="ghost" onClick={()=>setPage('timer')}>▶ Démarrer timer</Btn>
              <Btn full variant="ghost" onClick={()=>setPage('clients')}>+ Ajouter client</Btn>
            </div>
          </Card>
          {(stats?.pendingCount||0)>0&&(
            <Card style={{background:`${T.warning}08`,borderColor:`${T.warning}30`}}>
              <div style={{fontSize:12,color:T.warning,fontWeight:700,marginBottom:5}}>Rappel</div>
              <div style={{fontSize:12,color:T.textMuted,lineHeight:1.6}}>{stats.pendingCount} facture(s) en attente de paiement pour un total de {(stats.pending||0).toLocaleString('fr')} €.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
const COLORS_LIST = [T.accent,'#5BA4F5','#F5A623','#52D68A','#FF5F57','#C084FC','#FB7185']

const Clients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({name:'',email:'',company:'',rate:'',color:T.accent})

  const notify = (msg,type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = useCallback(async()=>{
    const {data} = await supabase.from('clients').select('*').order('created_at',{ascending:false})
    setClients(data||[]); setLoading(false)
  },[])
  useEffect(()=>{load()},[load])

  const add = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const {data:{user}} = await supabase.auth.getUser()
    const {error} = await supabase.from('clients').insert({user_id:user.id,...form,rate:Number(form.rate)||0})
    if (error) notify(error.message,'error')
    else { notify('Client ajouté !'); setShowForm(false); setForm({name:'',email:'',company:'',rate:'',color:T.accent}); load() }
    setSaving(false)
  }

  const del = async (id) => {
    await supabase.from('clients').delete().eq('id',id)
    notify('Client supprimé.'); load()
  }

  return (
    <div style={{padding:'32px 36px'}}>
      <Toast msg={toast?.msg} type={toast?.type}/>
      <div className="fade-up" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>Clients</h1>
          <p style={{color:T.textMuted,fontSize:14,marginTop:4}}>{clients.length} client(s) dans ta base</p>
        </div>
        <Btn onClick={()=>setShowForm(!showForm)}>+ Ajouter client</Btn>
      </div>

      {showForm&&(
        <Card glow style={{marginBottom:20}} className="fade-up">
          <div style={{fontWeight:700,marginBottom:18,fontSize:15}}>Nouveau client</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <Input label="Nom complet *" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="Sophie Martin"/>
            <Input label="Email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="sophie@email.com"/>
            <Input label="Entreprise" value={form.company} onChange={v=>setForm({...form,company:v})} placeholder="Agence Créa"/>
            <Input label="Tarif horaire (€)" type="number" value={form.rate} onChange={v=>setForm({...form,rate:v})} placeholder="35"/>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:8,fontWeight:500}}>Couleur</div>
            <div style={{display:'flex',gap:8}}>
              {COLORS_LIST.map(c=>(
                <div key={c} onClick={()=>setForm({...form,color:c})} style={{width:24,height:24,borderRadius:'50%',background:c,cursor:'pointer',border:form.color===c?`2px solid ${T.text}`:'2px solid transparent',transition:'all .15s'}}/>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={add} loading={saving}>Enregistrer</Btn>
            <Btn variant="ghost" onClick={()=>setShowForm(false)}>Annuler</Btn>
          </div>
        </Card>
      )}

      {loading ? <div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner/></div>
      : clients.length===0 ? <Empty icon="◎" text="Aucun client" sub="Ajoute ton premier client pour commencer"/>
      : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {clients.map((c,i)=>(
            <Card key={c.id} className={`fade-up stagger-${Math.min(i+1,4)}`}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                <div style={{width:42,height:42,borderRadius:'50%',background:c.color+'20',border:`2px solid ${c.color}50`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,color:c.color,flexShrink:0}}>
                  {c.name[0].toUpperCase()}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                  <div style={{fontSize:12,color:T.textMuted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.company||'—'}</div>
                </div>
              </div>
              <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:11,color:T.textDim,marginBottom:2}}>Email</div>
                  <div style={{fontSize:12,color:T.textMuted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:130}}>{c.email||'—'}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11,color:T.textDim,marginBottom:2}}>Tarif</div>
                  <div className="mono" style={{fontSize:15,fontWeight:500,color:T.accent}}>{c.rate} €/h</div>
                </div>
              </div>
              <div style={{marginTop:12,display:'flex',justifyContent:'flex-end'}}>
                <Btn small variant="danger" onClick={()=>del(c.id)}>Supprimer</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TIMER ────────────────────────────────────────────────────────────────────
const Timer = () => {
  const [clients, setClients] = useState([])
  const [sessions, setSessions] = useState([])
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [clientId, setClientId] = useState('')
  const [task, setTask] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const ref = useRef(null)

  const notify = (msg,type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(()=>{
    supabase.from('clients').select('*').order('name').then(({data})=>{ setClients(data||[]); if(data?.length) setClientId(data[0].id) })
    supabase.from('sessions').select('*,clients(name,color)').order('date',{ascending:false}).limit(20).then(({data})=>setSessions(data||[]))
  },[])

  useEffect(()=>{
    if(running) ref.current = setInterval(()=>setSeconds(s=>s+1),1000)
    else clearInterval(ref.current)
    return ()=>clearInterval(ref.current)
  },[running])

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const stop = async () => {
    if (seconds<5) { setRunning(false); return }
    setSaving(true)
    const {data:{user}} = await supabase.auth.getUser()
    const {data,error} = await supabase.from('sessions').insert({
      user_id:user.id, client_id:clientId,
      task:task||'Tâche sans titre',
      duration:+(seconds/3600).toFixed(2),
      date:new Date().toISOString().split('T')[0]
    }).select('*,clients(name,color)').single()
    if(error) notify(error.message,'error')
    else { setSessions(s=>[data,...s]); notify('Session sauvegardée !') }
    setRunning(false); setSeconds(0); setTask(''); setSaving(false)
  }

  const delSession = async (id) => {
    await supabase.from('sessions').delete().eq('id',id)
    setSessions(s=>s.filter(x=>x.id!==id))
    notify('Session supprimée.')
  }

  const totalH = sessions.reduce((a,s)=>a+Number(s.duration),0).toFixed(1)
  const client = clients.find(c=>c.id===clientId)

  return (
    <div style={{padding:'32px 36px'}}>
      <Toast msg={toast?.msg} type={toast?.type}/>
      <h1 className="fade-up" style={{fontSize:26,fontWeight:800,letterSpacing:'-0.5px',marginBottom:28}}>Timer & heures</h1>
      <div style={{display:'grid',gridTemplateColumns:'380px 1fr',gap:20}}>
        <Card glow={running} className="fade-up">
          <div style={{textAlign:'center',padding:'16px 0 24px'}}>
            <div className="mono" style={{fontSize:58,fontWeight:300,color:running?T.accent:T.text,letterSpacing:4,lineHeight:1,transition:'color .3s',animation:running?'blink 2s ease infinite':'none'}}>
              {fmt(seconds)}
            </div>
            {running&&client&&(
              <div style={{marginTop:12,display:'inline-flex',alignItems:'center',gap:6,background:`${client.color}15`,border:`1px solid ${client.color}40`,borderRadius:20,padding:'4px 12px'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:T.danger,animation:'blink .8s ease infinite'}}/>
                <span style={{fontSize:12,color:client.color,fontWeight:600}}>{client.name}</span>
              </div>
            )}
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Client</label>
            <select value={clientId} onChange={e=>setClientId(e.target.value)} disabled={running}
              style={{width:'100%',background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'10px 14px',color:T.text,fontSize:13}}>
              {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input placeholder="Description de la tâche..." value={task} onChange={setTask} style={{marginBottom:20}}/>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            {!running
              ? <Btn onClick={()=>setRunning(true)} disabled={!clientId}>▶ Démarrer</Btn>
              : <Btn variant="danger" onClick={stop} loading={saving}>⏹ Arrêter & sauver</Btn>
            }
          </div>
        </Card>

        <Card className="fade-up stagger-1">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
            <div style={{fontWeight:700,fontSize:14}}>Sessions récentes</div>
            <div className="mono" style={{fontSize:13,color:T.accent,fontWeight:500}}>{totalH}h total</div>
          </div>
          {sessions.length===0
            ? <Empty icon="◷" text="Aucune session" sub="Démarre ton premier timer"/>
            : sessions.map(s=>(
              <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:`1px solid ${T.border}`}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:s.clients?.color||T.accent,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:500}}>{s.task}</div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{s.clients?.name} · {s.date}</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span className="mono" style={{fontSize:13,color:T.accent,fontWeight:500}}>{s.duration}h</span>
                  <Btn small variant="danger" onClick={()=>delSession(s.id)}>✕</Btn>
                </div>
              </div>
            ))
          }
        </Card>
      </div>
    </div>
  )
}

// ─── INVOICES ─────────────────────────────────────────────────────────────────
const Invoices = () => {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [sessions, setSessions] = useState([])      // heures non facturées du client sélectionné
  const [loading, setLoading] = useState(true)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('toutes')
  const [toast, setToast] = useState(null)
  const [selectedSessions, setSelectedSessions] = useState([])  // sessions cochées
  const [extraItems, setExtraItems] = useState([])               // lignes manuelles optionnelles
  const [form, setForm] = useState({clientId:'', dueDate:''})

  const notify = (msg,type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = useCallback(async()=>{
    const [{data:inv},{data:cli}] = await Promise.all([
      supabase.from('invoices').select('*,clients(name,email)').order('created_at',{ascending:false}),
      supabase.from('clients').select('*').order('name'),
    ])
    setInvoices(inv||[]); setClients(cli||[])
    if(cli?.length) setForm(f=>({...f,clientId:cli[0].id}))
    setLoading(false)
  },[])
  useEffect(()=>{load()},[load])

  // Quand on change de client → charger ses heures non encore facturées
  const loadSessions = useCallback(async(clientId)=>{
    if(!clientId) return
    setLoadingSessions(true)
    setSelectedSessions([])
    const {data} = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .eq('invoiced', false)   // seulement les heures pas encore facturées
      .order('date', {ascending:false})
    setSessions(data||[])
    setLoadingSessions(false)
  },[])

  useEffect(()=>{ if(form.clientId) loadSessions(form.clientId) },[form.clientId, loadSessions])

  const toggleSession = (id) => {
    setSelectedSessions(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id])
  }
  const toggleAll = () => {
    setSelectedSessions(s => s.length === sessions.length ? [] : sessions.map(x=>x.id))
  }

  const client = clients.find(c=>c.id===form.clientId)
  const checkedSessions = sessions.filter(s=>selectedSessions.includes(s.id))
  const hoursTotal = checkedSessions.reduce((a,s)=>a+Number(s.duration),0)
  const hoursAmount = hoursTotal * (client?.rate||0)
  const extraAmount = extraItems.reduce((a,i)=>a+Number(i.qty||0)*Number(i.rate||0),0)
  const grandTotal = hoursAmount + extraAmount

  const addExtraItem = () => setExtraItems(e=>[...e,{service:'',qty:1,rate:0}])
  const updateExtra = (i,k,v) => { const items=[...extraItems]; items[i]={...items[i],[k]:v}; setExtraItems(items) }

  const create = async () => {
    if(!form.clientId) return
    setSaving(true)
    const {data:{user}} = await supabase.auth.getUser()
    const {count} = await supabase.from('invoices').select('*',{count:'exact',head:true}).eq('user_id',user.id)
    const num = `FAC-${String((count||0)+1).padStart(3,'0')}`

    // Construire les lignes de la facture
    const items = [
      // Ligne des heures groupées par session
      ...checkedSessions.map(s=>({
        service: s.task||'Heures travaillées',
        qty: Number(s.duration),
        rate: client?.rate||0,
        date: s.date,
        session_id: s.id,
      })),
      // Lignes manuelles supplémentaires
      ...extraItems.filter(i=>i.service&&Number(i.rate)>0),
    ]

    const {error} = await supabase.from('invoices').insert({
      user_id:user.id, client_id:form.clientId,
      invoice_number:num, items,
      amount:grandTotal, due_date:form.dueDate||null, status:'brouillon'
    })

    if(error){ notify(error.message,'error'); setSaving(false); return }

    // Marquer les sessions comme facturées
    if(selectedSessions.length>0){
      await supabase.from('sessions').update({invoiced:true}).in('id', selectedSessions)
    }

    notify('Facture créée !'); setShowForm(false)
    setSelectedSessions([]); setExtraItems([]); setSessions([])
    setForm(f=>({...f,dueDate:''})); load()
    setSaving(false)
  }

  const changeStatus = async (id,status) => {
    await supabase.from('invoices').update({status}).eq('id',id)
    setInvoices(inv=>inv.map(i=>i.id===id?{...i,status}:i))
    notify('Statut mis à jour.')
  }

  const del = async (id) => {
    await supabase.from('invoices').delete().eq('id',id)
    setInvoices(inv=>inv.filter(i=>i.id!==id)); notify('Facture supprimée.')
  }

  const FILTERS = ['toutes','brouillon','envoyée','en retard','payée']
  const filtered = filter==='toutes' ? invoices : invoices.filter(i=>i.status===filter)

  return (
    <div style={{padding:'32px 36px'}}>
      <Toast msg={toast?.msg} type={toast?.type}/>
      <div className="fade-up" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>Factures</h1>
          <p style={{color:T.textMuted,fontSize:14,marginTop:4}}>{invoices.length} facture(s) au total</p>
        </div>
        <Btn onClick={()=>setShowForm(!showForm)}>+ Nouvelle facture</Btn>
      </div>

      <div className="fade-up stagger-1" style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {FILTERS.map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'6px 16px',borderRadius:20,border:`1px solid ${filter===f?T.accent:T.border}`,background:filter===f?`${T.accent}15`:'transparent',color:filter===f?T.accent:T.textMuted,fontSize:12,cursor:'pointer',fontWeight:filter===f?600:400,transition:'all .15s',textTransform:'capitalize',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            {f}
          </button>
        ))}
      </div>

      {showForm&&(
        <Card glow style={{marginBottom:20}} className="fade-up">
          <div style={{fontWeight:700,marginBottom:18,fontSize:15}}>Nouvelle facture</div>

          {/* ÉTAPE 1 — Client + échéance */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
            <div>
              <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Client *</label>
              <select value={form.clientId} onChange={e=>setForm({...form,clientId:e.target.value})}
                style={{width:'100%',background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'10px 14px',color:T.text,fontSize:13}}>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name} — {c.rate}€/h</option>)}
              </select>
            </div>
            <Input label="Date d'échéance" type="date" value={form.dueDate} onChange={v=>setForm({...form,dueDate:v})}/>
          </div>

          {/* ÉTAPE 2 — Heures enregistrées du client */}
          <div style={{marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:12,color:T.textMuted,fontWeight:600}}>
                Heures enregistrées pour {client?.name||'ce client'}
              </div>
              {sessions.length>0&&(
                <button onClick={toggleAll} style={{fontSize:11,color:T.accent,background:'none',border:'none',cursor:'pointer',fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600}}>
                  {selectedSessions.length===sessions.length?'Tout décocher':'Tout cocher'}
                </button>
              )}
            </div>

            {loadingSessions ? (
              <div style={{padding:'16px 0',display:'flex',justifyContent:'center'}}><Spinner/></div>
            ) : sessions.length===0 ? (
              <div style={{padding:'14px 16px',background:T.surfaceHigh,borderRadius:8,fontSize:13,color:T.textDim,textAlign:'center'}}>
                Aucune heure non facturée pour ce client — utilise le Timer pour en ajouter.
              </div>
            ) : (
              <div style={{border:`1px solid ${T.border}`,borderRadius:10,overflow:'hidden'}}>
                {sessions.map((s,i)=>{
                  const checked = selectedSessions.includes(s.id)
                  const amount = Number(s.duration)*(client?.rate||0)
                  return (
                    <div key={s.id} onClick={()=>toggleSession(s.id)} style={{
                      display:'flex',alignItems:'center',gap:12,padding:'11px 14px',
                      borderBottom:i<sessions.length-1?`1px solid ${T.border}`:'none',
                      cursor:'pointer',background:checked?`${T.accent}08`:'transparent',
                      transition:'background .12s',
                    }}>
                      {/* Checkbox */}
                      <div style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${checked?T.accent:T.border}`,background:checked?T.accent:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s'}}>
                        {checked&&<span style={{fontSize:10,color:'#08090A',fontWeight:700}}>✓</span>}
                      </div>
                      {/* Info session */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.task||'Tâche sans titre'}</div>
                        <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{s.date}</div>
                      </div>
                      {/* Heures + montant */}
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div className="mono" style={{fontSize:13,color:T.accent,fontWeight:500}}>{s.duration}h</div>
                        <div className="mono" style={{fontSize:11,color:T.textMuted}}>{amount.toFixed(2)} €</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Résumé heures sélectionnées */}
            {selectedSessions.length>0&&(
              <div style={{marginTop:10,padding:'10px 14px',background:`${T.accent}10`,border:`1px solid ${T.accent}30`,borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:12,color:T.accent,fontWeight:600}}>{selectedSessions.length} session(s) · {hoursTotal.toFixed(2)}h · {client?.rate}€/h</span>
                <span className="mono" style={{fontSize:14,color:T.accent,fontWeight:700}}>{hoursAmount.toFixed(2)} €</span>
              </div>
            )}
          </div>

          {/* ÉTAPE 3 — Lignes supplémentaires optionnelles */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:T.textMuted,fontWeight:600,marginBottom:8}}>Prestations supplémentaires (optionnel)</div>
            {extraItems.map((item,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 70px 110px 36px',gap:8,marginBottom:8,alignItems:'center'}}>
                <select value={item.service} onChange={e=>updateExtra(i,'service',e.target.value)}
                  style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 12px',color:item.service?T.text:T.textDim,fontSize:13}}>
                  <option value="">Choisir service...</option>
                  {VA_SERVICES.map(s=><option key={s}>{s}</option>)}
                </select>
                <input type="number" placeholder="Qté" value={item.qty} onChange={e=>updateExtra(i,'qty',e.target.value)}
                  style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 10px',color:T.text,fontSize:13,textAlign:'center'}}/>
                <input type="number" placeholder="Tarif €" value={item.rate||''} onChange={e=>updateExtra(i,'rate',e.target.value)}
                  style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 12px',color:T.text,fontSize:13}}/>
                <button onClick={()=>setExtraItems(e=>e.filter((_,j)=>j!==i))}
                  style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,color:T.danger,cursor:'pointer',padding:'9px',fontSize:12}}>✕</button>
              </div>
            ))}
            <Btn small variant="subtle" onClick={addExtraItem}>+ Ligne manuelle</Btn>
          </div>

          {/* TOTAL + actions */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:`1px solid ${T.border}`,paddingTop:16}}>
            <div>
              <div className="mono" style={{fontSize:20,fontWeight:500}}>Total : <span style={{color:T.accent}}>{grandTotal.toFixed(2)} €</span></div>
              {selectedSessions.length>0&&<div style={{fontSize:11,color:T.textMuted,marginTop:3}}>{hoursTotal.toFixed(2)}h × {client?.rate}€/h {extraAmount>0?`+ ${extraAmount.toFixed(2)}€ extras`:''}</div>}
            </div>
            <div style={{display:'flex',gap:10}}>
              <Btn onClick={create} loading={saving} disabled={!form.clientId||(selectedSessions.length===0&&extraItems.length===0)}>Créer la facture</Btn>
              <Btn variant="ghost" onClick={()=>{setShowForm(false);setSelectedSessions([]);setExtraItems([])}}>Annuler</Btn>
            </div>
          </div>
        </Card>
      )}

      {loading ? <div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner/></div>
      : filtered.length===0 ? <Empty icon="▣" text="Aucune facture" sub="Crée ta première facture"/>
      : (
        <Card style={{padding:0,overflow:'hidden'}} className="fade-up stagger-2">
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${T.border}`}}>
                {['Numéro','Client','Montant','Date','Échéance','Statut','Actions'].map(h=>(
                  <th key={h} style={{padding:'13px 18px',textAlign:'left',fontSize:11,color:T.textDim,fontWeight:500,letterSpacing:'0.04em',textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv,idx)=>(
                <tr key={inv.id} style={{borderBottom:idx<filtered.length-1?`1px solid ${T.border}`:'none',transition:'background .1s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHigh}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <td style={{padding:'13px 18px'}}><span className="mono" style={{fontSize:13,fontWeight:500,color:T.accent}}>{inv.invoice_number}</span></td>
                  <td style={{padding:'13px 18px',fontSize:13,fontWeight:500}}>{inv.clients?.name}</td>
                  <td style={{padding:'13px 18px'}}><span className="mono" style={{fontSize:13,fontWeight:500}}>{Number(inv.amount).toLocaleString('fr')} €</span></td>
                  <td style={{padding:'13px 18px',fontSize:12,color:T.textMuted}}>{inv.date}</td>
                  <td style={{padding:'13px 18px',fontSize:12,color:inv.due_date&&new Date(inv.due_date)<new Date()?T.danger:T.textMuted}}>{inv.due_date||'—'}</td>
                  <td style={{padding:'13px 18px'}}><Badge status={inv.status}/></td>
                  <td style={{padding:'13px 18px'}}>
                    <div style={{display:'flex',gap:6}}>
                      {inv.status!=='payée'&&<Btn small variant="subtle" onClick={()=>changeStatus(inv.id,'payée')}>✓ Payée</Btn>}
                      {inv.status==='brouillon'&&<Btn small variant="subtle" onClick={()=>changeStatus(inv.id,'envoyée')}>Envoyer</Btn>}
                      <Btn small variant="danger" onClick={()=>del(inv.id)}>✕</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

// ─── QUOTES ───────────────────────────────────────────────────────────────────
const Quotes = () => {
  const [clients, setClients] = useState([])
  const [quotes, setQuotes] = useState([])
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({clientId:'',services:[],note:''})
  const [sent, setSent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = (msg,type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(()=>{
    supabase.from('clients').select('*').order('name').then(({data})=>{ setClients(data||[]); if(data?.length) setForm(f=>({...f,clientId:data[0].id})) })
    supabase.from('quotes').select('*,clients(name)').order('created_at',{ascending:false}).then(({data})=>setQuotes(data||[]))
  },[])

  const toggleService = s => setForm(f=>({...f,services:f.services.includes(s)?f.services.filter(x=>x!==s):[...f.services,s]}))
  const client = clients.find(c=>c.id===form.clientId)
  const total = form.services.length * (client?.rate||0)

  const send = async () => {
    setSaving(true)
    const {data:{user}} = await supabase.auth.getUser()
    const {data,error} = await supabase.from('quotes').insert({
      user_id:user.id, client_id:form.clientId,
      services:form.services, amount:total, note:form.note, status:'envoyé'
    }).select('*,clients(name)').single()
    if(error) notify(error.message,'error')
    else { setQuotes(q=>[data,...q]); setSent(true); notify('Devis envoyé !') }
    setSaving(false)
  }

  return (
    <div style={{padding:'32px 36px'}}>
      <Toast msg={toast?.msg} type={toast?.type}/>
      <h1 className="fade-up" style={{fontSize:26,fontWeight:800,letterSpacing:'-0.5px',marginBottom:6}}>Devis</h1>
      <p className="fade-up stagger-1" style={{color:T.textMuted,fontSize:14,marginBottom:28}}>Crée et envoie un devis professionnel en quelques clics.</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:28}}>
        {!sent ? (
          <>
            <Card glow className="fade-up stagger-1">
              <div style={{display:'flex',gap:6,marginBottom:22}}>
                {[1,2,3].map(n=>(
                  <div key={n} style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:24,height:24,borderRadius:'50%',background:step>=n?T.accent:T.surfaceTop,color:step>=n?'#08090A':T.textDim,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,transition:'all .2s'}}>{n}</div>
                    <span style={{fontSize:12,color:step===n?T.text:T.textDim}}>{['Client','Services','Note'][n-1]}</span>
                    {n<3&&<div style={{width:20,height:1,background:T.border,margin:'0 2px'}}/>}
                  </div>
                ))}
              </div>

              {step===1&&(
                <div>
                  {clients.map(c=>(
                    <div key={c.id} onClick={()=>setForm(f=>({...f,clientId:c.id}))} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,border:`1px solid ${form.clientId===c.id?T.accent:T.border}`,marginBottom:10,cursor:'pointer',background:form.clientId===c.id?`${T.accent}08`:'transparent',transition:'all .15s'}}>
                      <div style={{width:36,height:36,borderRadius:'50%',background:(c.color||T.accent)+'20',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:c.color||T.accent,flexShrink:0}}>{c.name[0]}</div>
                      <div><div style={{fontWeight:600,fontSize:13}}>{c.name}</div><div style={{fontSize:12,color:T.textMuted}}>{c.company} · {c.rate} €/h</div></div>
                    </div>
                  ))}
                  <Btn full onClick={()=>setStep(2)} style={{marginTop:8}} disabled={!form.clientId}>Continuer →</Btn>
                </div>
              )}
              {step===2&&(
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
                    {VA_SERVICES.map(s=>(
                      <div key={s} onClick={()=>toggleService(s)} style={{padding:'10px 12px',borderRadius:8,border:`1px solid ${form.services.includes(s)?T.accent:T.border}`,cursor:'pointer',fontSize:12,fontWeight:form.services.includes(s)?600:400,color:form.services.includes(s)?T.accent:T.textMuted,background:form.services.includes(s)?`${T.accent}10`:'transparent',transition:'all .15s'}}>
                        {form.services.includes(s)?'✓ ':''}{s}
                      </div>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:10}}><Btn variant="ghost" onClick={()=>setStep(1)}>← Retour</Btn><Btn onClick={()=>setStep(3)} disabled={form.services.length===0}>Continuer →</Btn></div>
                </div>
              )}
              {step===3&&(
                <div>
                  <textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Message optionnel pour le client..." rows={5} style={{width:'100%',background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'12px 14px',color:T.text,fontSize:13,resize:'vertical',fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:16}}/>
                  <div style={{display:'flex',gap:10}}><Btn variant="ghost" onClick={()=>setStep(2)}>← Retour</Btn><Btn onClick={send} loading={saving}>Envoyer le devis</Btn></div>
                </div>
              )}
            </Card>

            <Card className="fade-up stagger-2">
              <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>Aperçu</div>
              <div style={{background:T.surfaceHigh,borderRadius:10,padding:14,marginBottom:14}}>
                <div style={{fontSize:11,color:T.textDim,marginBottom:3,letterSpacing:'0.05em'}}>POUR</div>
                <div style={{fontWeight:700}}>{client?.name||'—'}</div>
                <div style={{fontSize:12,color:T.textMuted}}>{client?.company}</div>
              </div>
              {form.services.length>0 ? (
                <>
                  {form.services.map(s=>(
                    <div key={s} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${T.border}`,fontSize:13}}>
                      <span>{s}</span><span className="mono">{client?.rate||0} €</span>
                    </div>
                  ))}
                  <div style={{display:'flex',justifyContent:'space-between',padding:'14px 0 0',fontWeight:700}}>
                    <span>Total</span><span className="mono" style={{color:T.accent,fontSize:18}}>{total.toLocaleString('fr')} €</span>
                  </div>
                </>
              ) : <Empty icon="◈" text="Aucun service" sub="Sélectionne des services"/>}
            </Card>
          </>
        ) : (
          <Card glow style={{gridColumn:'1/-1',textAlign:'center',padding:'52px 32px'}} className="fade-up">
            <div style={{fontSize:42,marginBottom:16,color:T.success}}>✓</div>
            <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>Devis envoyé !</div>
            <div style={{color:T.textMuted,marginBottom:28,fontSize:14}}>Le devis a été envoyé à {client?.name}. Tu recevras une notification quand il sera accepté.</div>
            <Btn onClick={()=>{setSent(false);setStep(1);setForm(f=>({...f,services:[],note:''}))}}>Créer un nouveau devis</Btn>
          </Card>
        )}
      </div>

      {quotes.length>0&&(
        <Card className="fade-up stagger-3">
          <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>Devis envoyés</div>
          {quotes.map((q,i)=>(
            <div key={q.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:i<quotes.length-1?`1px solid ${T.border}`:'none'}}>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>{q.clients?.name}</div>
                <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{Array.isArray(q.services)?q.services.join(', '):''}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span className="mono" style={{fontSize:13,color:T.accent}}>{Number(q.amount).toLocaleString('fr')} €</span>
                <Badge status={q.status}/>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
const Settings = ({ user }) => {
  const [profile, setProfile] = useState({full_name:'',siret:'',tva_number:''})
  const [reminders, setReminders] = useState({reminder_before:3,reminder_after:7})
  const [plan] = useState('Pro')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = (msg,type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(()=>{
    supabase.from('settings').select('*').eq('user_id',user.id).single().then(({data})=>{
      if(data){
        setProfile({full_name:data.full_name||'',siret:data.siret||'',tva_number:data.tva_number||''})
        setReminders({reminder_before:data.reminder_before||3,reminder_after:data.reminder_after||7})
      }
      setLoading(false)
    })
  },[user.id])

  const save = async () => {
    setSaving(true)
    const {error} = await supabase.from('settings').update({...profile,...reminders,updated_at:new Date().toISOString()}).eq('user_id',user.id)
    if(error) notify(error.message,'error')
    else notify('Paramètres sauvegardés !')
    setSaving(false)
  }

  if(loading) return <div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner/></div>

  return (
    <div style={{padding:'32px 36px'}}>
      <Toast msg={toast?.msg} type={toast?.type}/>
      <h1 className="fade-up" style={{fontSize:26,fontWeight:800,letterSpacing:'-0.5px',marginBottom:28}}>Paramètres</h1>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <Card className="fade-up stagger-1">
          <div style={{fontWeight:700,fontSize:15,marginBottom:20}}>Profil & entreprise</div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Input label="Nom / Prénom" value={profile.full_name} onChange={v=>setProfile({...profile,full_name:v})} placeholder="Marie Dupont"/>
            <div>
              <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Email</label>
              <div style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'10px 14px',color:T.textMuted,fontSize:13}}>{user.email}</div>
            </div>
            <Input label="SIRET" value={profile.siret} onChange={v=>setProfile({...profile,siret:v})} placeholder="123 456 789 00010"/>
            <Input label="Numéro TVA (optionnel)" value={profile.tva_number} onChange={v=>setProfile({...profile,tva_number:v})} placeholder="FR12345678901"/>
            <Btn onClick={save} loading={saving}>Sauvegarder</Btn>
          </div>
        </Card>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Card className="fade-up stagger-2">
            <div style={{fontWeight:700,fontSize:15,marginBottom:18}}>Rappels automatiques</div>
            <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:16}}>
              <div>
                <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Rappel avant échéance (jours)</label>
                <input type="number" value={reminders.reminder_before} onChange={e=>setReminders({...reminders,reminder_before:Number(e.target.value)})} style={{width:'100%',background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'10px 14px',color:T.text,fontSize:13}}/>
              </div>
              <div>
                <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Relance si non payé après (jours)</label>
                <input type="number" value={reminders.reminder_after} onChange={e=>setReminders({...reminders,reminder_after:Number(e.target.value)})} style={{width:'100%',background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'10px 14px',color:T.text,fontSize:13}}/>
              </div>
            </div>
            <Btn onClick={save} loading={saving}>Sauvegarder</Btn>
          </Card>

          <Card className="fade-up stagger-3">
            <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>Abonnement</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontWeight:600,fontSize:14}}>Plan {plan}</div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:3}}>9 $/mois · Factures illimitées</div>
              </div>
              <span style={{background:`${T.accent}20`,color:T.accent,fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20}}>Actif</span>
            </div>
            <Btn variant="ghost" full>Gérer l'abonnement</Btn>
          </Card>

          <Card className="fade-up stagger-4" style={{background:`${T.accent}06`,borderColor:`${T.accent}20`}}>
            <div style={{fontWeight:700,fontSize:13,color:T.accent,marginBottom:8}}>Extension Chrome</div>
            <div style={{fontSize:12,color:T.textMuted,lineHeight:1.6,marginBottom:12}}>Timer directement dans ton navigateur. Compatible Gmail, Notion, Trello et plus.</div>
            <Btn small variant="ghost">Installer l'extension →</Btn>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(undefined)
  const [page, setPage] = useState('dashboard')

  useEffect(()=>{
    supabase.auth.getUser().then(({data:{user}})=>setUser(user||null))
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>setUser(session?.user||null))
    return ()=>subscription.unsubscribe()
  },[])

  const signOut = async () => { await supabase.auth.signOut(); setUser(null) }

  if(user===undefined) return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <Spinner/>
    </div>
  )

  if(!user) return <AuthPage onAuth={setUser}/>

  const pages = {
    dashboard: <Dashboard setPage={setPage} user={user}/>,
    clients:   <Clients/>,
    timer:     <Timer/>,
    invoices:  <Invoices/>,
    quotes:    <Quotes/>,
    settings:  <Settings user={user}/>,
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{display:'flex',minHeight:'100vh'}}>
        <Sidebar page={page} setPage={setPage} user={user} onSignOut={signOut}/>
        <main style={{flex:1,overflowY:'auto',minHeight:'100vh',background:T.bg}}>
          {pages[page]}
        </main>
      </div>
    </>
  )
}
