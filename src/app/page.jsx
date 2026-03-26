'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ─── THEME ───────────────────────────────────────────────────────────────────
const THEMES = {
  light: {
    bg: '#F8F7F4',
    surface: '#FFFFFF',
    surfaceHigh: '#F2F1EE',
    surfaceTop: '#E8E7E3',
    border: '#E0DED8',
    borderHover: '#C8C6BF',
    accent: '#1A6B4A',
    accentLight: '#E8F5EE',
    accentText: '#FFFFFF',
    text: '#1A1916',
    textMuted: '#6B6963',
    textDim: '#A8A5A0',
    success: '#15803D',
    successBg: '#DCFCE7',
    warning: '#B45309',
    warningBg: '#FEF3C7',
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
    info: '#1D4ED8',
    infoBg: '#DBEAFE',
    sidebar: '#1A1916',
    sidebarText: '#E8E6E1',
    sidebarMuted: '#7A7870',
    sidebarActive: '#E8FF6B',
    shadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  },
  dark: {
    bg: '#08090A',
    surface: '#111214',
    surfaceHigh: '#18191C',
    surfaceTop: '#1F2023',
    border: '#25262A',
    borderHover: '#35363C',
    accent: '#E8FF6B',
    accentLight: '#E8FF6B18',
    accentText: '#08090A',
    text: '#ECEAE3',
    textMuted: '#7A7870',
    textDim: '#45443F',
    success: '#52D68A',
    successBg: '#0D2B1A',
    warning: '#F5A623',
    warningBg: '#2B1A0D',
    danger: '#FF5F57',
    dangerBg: '#2B0D0D',
    info: '#5BA4F5',
    infoBg: '#0D1E35',
    sidebar: '#111214',
    sidebarText: '#ECEAE3',
    sidebarMuted: '#7A7870',
    sidebarActive: '#E8FF6B',
    shadow: '0 1px 3px rgba(0,0,0,0.4)',
    shadowMd: '0 4px 12px rgba(0,0,0,0.5)',
  }
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const makeCSS = (T) => `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
*,::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px}
body{background:${T.bg};color:${T.text};font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;transition:background .2s,color .2s}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
input,textarea,select,button{font-family:'Plus Jakarta Sans',sans-serif;outline:none}
.mono{font-family:'JetBrains Mono',monospace}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.fade-up{animation:fadeUp .3s cubic-bezier(.22,1,.36,1) both}
.s1{animation-delay:.04s}.s2{animation-delay:.08s}.s3{animation-delay:.12s}.s4{animation-delay:.16s}
@media(max-width:768px){
.desktop-only{display:none!important}
.sidebar{width:100%!important;height:auto!important;position:relative!important;flex-direction:row!important;align-items:center!important;padding:10px 16px!important;overflow-x:auto!important}
.sidebar-nav{flex-direction:row!important;padding:0!important;gap:4px!important}
.sidebar-footer{display:none!important}
.main-content{padding:16px!important}
.grid-2{grid-template-columns:1fr!important}
.grid-3{grid-template-columns:1fr!important}
.grid-4{grid-template-columns:1fr 1fr!important}
.stats-grid{grid-template-columns:1fr 1fr!important}
.app-layout{flex-direction:column!important}
.page-header{flex-direction:column!important;align-items:flex-start!important;gap:12px!important}
}
@media(max-width:480px){
.grid-4{grid-template-columns:1fr!important}
.stats-grid{grid-template-columns:1fr!important}
.invoice-table{display:none!important}
.invoice-cards{display:flex!important}
}
`

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Spinner = ({T}) => (
  <div style={{width:16,height:16,border:`2px solid ${T.border}`,borderTopColor:T.accent,borderRadius:'50%',animation:'spin .6s linear infinite'}}/>
)

const Btn = ({children,variant='primary',onClick,small,full,loading,disabled,style:st,T}) => {
  const base = {
    display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,
    border:'none',borderRadius:8,fontWeight:600,cursor:disabled||loading?'not-allowed':'pointer',
    fontSize:small?12:13,padding:small?'6px 14px':'10px 20px',
    width:full?'100%':'auto',transition:'all .15s',opacity:disabled?.5:1,
    letterSpacing:'0.01em',...st
  }
  const vars = { 
    primary:{background:T.accent,color:T.accentText,boxShadow:`0 2px 8px ${T.accent}40`},
    ghost:{background:'transparent',color:T.text,border:`1px solid ${T.border}`},
    danger:{background:'transparent',color:T.danger,border:`1px solid ${T.dangerBg}`},
    subtle:{background:T.surfaceHigh,color:T.textMuted,border:`1px solid ${T.border}`},
    success:{background:T.successBg,color:T.success,border:`1px solid ${T.success}30`},
  }
  return (
    <button style={{...base,...vars[variant]}} onClick={!loading&&!disabled?onClick:undefined}
      onMouseEnter={e=>{if(!disabled&&!loading){const el=e.currentTarget;el.style.opacity='0.85';el.style.transform='translateY(-1px)'}}}
      onMouseLeave={e=>{const el=e.currentTarget;el.style.opacity='1';el.style.transform='translateY(0)'}}
    >{loading?<Spinner T={T}/>:children}</button>
  )
}

const Card = ({children,style:st,onClick,accent,T}) => (
  <div onClick={onClick} style={{background:accent?T.accentLight:T.surface,border:`1px solid ${accent?T.accent+'50':T.border}`,borderRadius:12,padding:20,boxShadow:T.shadow,transition:'all .2s',...st}}
    onMouseEnter={e=>{if(onClick){e.currentTarget.style.borderColor=T.borderHover;e.currentTarget.style.boxShadow=T.shadowMd}}}
    onMouseLeave={e=>{if(onClick){e.currentTarget.style.borderColor=accent?T.accent+'50':T.border;e.currentTarget.style.boxShadow=accent?`0 0 20px ${T.accent}12`:T.shadow}}}
  >{children}</div>
)

const Input = ({label,value,onChange,type='text',placeholder,style:st,error,T,readOnly,suffix}) => (
  <div style={{display:'flex',flexDirection:'column',gap:6,width:'100%',...st}}>
    {label&&<label style={{fontSize:12,color:T.textMuted,fontWeight:600}}>{label}</label>}
    <div style={{position:'relative',display:'flex',alignItems:'center'}}>
      <input value={value} type={type} readOnly={readOnly}
        onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder}
        style={{background:readOnly?T.surfaceHigh:T.surface,border:`1px solid ${error?T.danger:T.border}`,borderRadius:8,padding:'9px 13px',color:T.text,fontSize:13,width:'100%',transition:'border-color .15s',paddingRight:suffix?'30px':'13px'}}
        onFocus={e=>{if(!readOnly)e.target.style.borderColor=T.accent}}
        onBlur={e=>e.target.style.borderColor=error?T.danger:T.border}
      />
      {suffix&&<span style={{position:'absolute',right:10,color:T.textDim,fontSize:12,pointerEvents:'none'}}>{suffix}</span>}
    </div>
    {error&&<div style={{fontSize:11,color:T.danger,marginTop:2}}>{error}</div>}
  </div>
)

const Badge = ({status,T}) => {
  const map = {
    'payée':{bg:T.successBg,color:T.success},
    'envoyée':{bg:T.infoBg,color:T.info},
    'en retard':{bg:T.dangerBg,color:T.danger},
    'brouillon':{bg:T.surfaceHigh,color:T.textMuted},
    'accepté':{bg:T.successBg,color:T.success},
    'refusé':{bg:T.dangerBg,color:T.danger},
    'envoyé':{bg:T.infoBg,color:T.info},
  }
  const s = map[status]||map['brouillon']
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,background:s.bg,color:s.color,fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20}}><span style={{width:5,height:5,borderRadius:'50%',background:s.color,flexShrink:0}}/>{status}</span>
}

const Empty = ({icon,text,sub,T}) => (
  <div style={{textAlign:'center',padding:'40px 20px',color:T.textMuted}}>
    <div style={{fontSize:32,marginBottom:12,opacity:.5}}>{icon}</div>
    <div style={{fontWeight:600,marginBottom:4}}>{text}</div>
    {sub&&<div style={{fontSize:13}}>{sub}</div>}
  </div>
)

const Toast = ({msg,type,T}) => (
  msg?<div style={{position:'fixed',bottom:24,right:24,zIndex:9999,padding:'12px 20px',background:type==='error'?T.dangerBg:T.surface,border:`1px solid ${type==='error'?T.danger+'50':T.border}`,borderRadius:10,fontSize:13,color:type==='error'?T.danger:T.text,boxShadow:T.shadowMd,animation:'fadeUp .2s ease',display:'flex',alignItems:'center',gap:8}}>
    <span style={{fontSize:14}}>{type==='error'?'⚠':'✓'}</span>{msg}
  </div>:null
)

const VA_SERVICES = ['Gestion inbox','Gestion agenda','Rédaction emails','Posts réseaux sociaux','Saisie de données','Service client','Recherche web','Création de contenu','Support administratif','Traduction','Transcription','Mise en page documents']
const CLIENT_COLORS = ['#1A6B4A','#1D4ED8','#B45309','#DC2626','#7C3AED','#0E7490','#BE185D','#15803D']

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const AuthPage = ({onAuth}) => {
  const T = THEMES.light
  const [mode,setMode] = useState('login')
  const [form,setForm] = useState({name:'',email:'',password:''})
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [success,setSuccess] = useState('')
  
  const handle = async () => {
    setError('');setLoading(true)
    try {
      if(mode==='login'){
        const {data,error} = await supabase.auth.signInWithPassword({email:form.email,password:form.password})
        if(error) throw error
        onAuth(data.user)
      } else {
        const {error} = await supabase.auth.signUp({email:form.email,password:form.password,options:{data:{full_name:form.name}}})
        if(error) throw error
        setSuccess('Compte créé ! Connecte-toi maintenant.')
        setMode('login')
      }
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }
  
  return (
    <div style={{minHeight:'100vh',background:'#F8F7F4',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div className="fade-up" style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:'#1A1916',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{color:'#E8FF6B',fontWeight:800,fontSize:14}}>VA<span style={{fontSize:20,fontWeight:800,color:'#1A1916',letterSpacing:'-0.5px'}}>Billing</span></span>
            </div>
          </div>
          <div style={{fontSize:13,color:'#6B6963'}}>Facturation pensée pour les assistantes virtuelles</div>
        </div>
        <div style={{background:'#FFFFFF',border:'1px solid #E0DED8',borderRadius:16,padding:'32px 28px',boxShadow:'0 4px 24px rgba(0,0,0,0.06)'}}>
          <h2 style={{fontSize:20,fontWeight:700,marginBottom:4,color:'#1A1916'}}>{mode==='login'?'Bon retour 👋':'Créer un compte'}</h2>
          <p style={{fontSize:13,color:'#6B6963',marginBottom:24}}>{mode==='login'?'Connecte-toi à ton espace VABilling.':'Commence gratuitement, sans carte bancaire.'}</p>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {mode==='register'&&<FField label="Nom complet" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="Marie Dupont"/>}
            <FField label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="marie@email.com"/>
            <FField label="Mot de passe" type="password" value={form.password} onChange={v=>setForm({...form,password:v})} placeholder="••••••••" onEnter={handle}/>
            {error&&<div style={{marginTop:14,padding:'10px 14px',background:'#FEE2E2',border:'1px solid #DC262630',borderRadius:8,fontSize:13,color:'#DC2626'}}>{error}</div>}
            {success&&<div style={{marginTop:14,padding:'10px 14px',background:'#DCFCE7',border:'1px solid #15803D30',borderRadius:8,fontSize:13,color:'#15803D'}}>{success}</div>}
            <button onClick={handle} disabled={loading} style={{marginTop:20,width:'100%',padding:'11px',borderRadius:8,border:'none',background:'#1A1916',color:'#FFFFFF',fontWeight:700,fontSize:14,cursor:loading?'not-allowed':'pointer',fontFamily:'inherit',opacity:loading?.7:1}}>
              {loading?'Chargement...':(mode==='login'?'Se connecter':'Créer mon compte')}
            </button>
            <div style={{marginTop:18,textAlign:'center',fontSize:13,color:'#6B6963'}}>
              {mode==='login'?'Pas de compte ? ':'Déjà un compte ? '}
              <span onClick={()=>{setMode(mode==='login'?'register':'login');setError('');setSuccess('')}} style={{color:'#1A6B4A',cursor:'pointer',fontWeight:600}}>
                {mode==='login'?'Créer un compte':'Se connecter'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const FField = ({label,value,onChange,type='text',placeholder,onEnter}) => (
  <div style={{display:'flex',flexDirection:'column',gap:6}}>
    <label style={{fontSize:12,color:'#6B6963',fontWeight:600}}>{label}</label>
    <input value={value} type={type} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      onKeyDown={e=>e.key==='Enter'&&onEnter&&onEnter()}
      style={{background:'#F8F7F4',border:'1px solid #E0DED8',borderRadius:8,padding:'10px 13px',color:'#1A1916',fontSize:13}}/>
  </div>
)

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  {id:'dashboard',label:'Dashboard',icon:'▦'},
  {id:'clients',label:'Clients',icon:'◎'},
  {id:'paidwork',label:'Travaux payés',icon:'✓'},
  {id:'timer',label:'Timer',icon:'◷'},
  {id:'invoices',label:'Factures',icon:'▣'},
  {id:'quotes',label:'Devis',icon:'◈'},
  {id:'settings',label:'Paramètres',icon:'⊙'},
]

const Sidebar = ({page,setPage,user,onSignOut,T}) => {
  const [tooltip,setTooltip] = useState(null)
  return (
    <div className="sidebar" style={{width:260,background:T.sidebar,color:T.sidebarText,display:'flex',flexDirection:'column',padding:20,gap:20,flexShrink:0,position:'relative'}}>
      {tooltip&&(
        <div style={{position:'fixed',left:tooltip.x,top:tooltip.y,background:T.surface,color:T.text,padding:'6px 10px',borderRadius:6,fontSize:12,boxShadow:T.shadowMd,pointerEvents:'none',zIndex:100}}>
          {tooltip.text}
        </div>
      )}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
        <div style={{width:32,height:32,background:T.accent,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:T.accentText,fontWeight:800,fontSize:16}}>VA</div>
        <div>
          <div style={{fontWeight:800,fontSize:16,letterSpacing:'-0.5px'}}>Billing</div>
          <div style={{fontSize:11,color:T.sidebarMuted}}>Espace facturation</div>
        </div>
      </div>
      <div className="sidebar-nav" style={{display:'flex',flexDirection:'column',gap:4}}>
        {NAV.map(n=>(
          <div key={n.id} onClick={()=>setPage(n.id)}
            onMouseEnter={e=>{
              const rect=e.currentTarget.getBoundingClientRect()
              setTooltip({text:n.label,x:rect.right+10,y:rect.top+(rect.height/2)-12})
              if(page!==n.id){e.currentTarget.style.background='#FFFFFF0A';e.currentTarget.style.color='#ECEAE3'}
            }}
            onMouseLeave={e=>{
              setTooltip(null)
              if(page!==n.id){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#7A7870'}
            }}
            style={{display:'flex',alignItems:'center',gap:9,padding:'9px 12px',borderRadius:8,marginBottom:1,cursor:'pointer',fontSize:13,transition:'all .12s',background:page===n.id?'#E8FF6B18':'transparent',color:page===n.id?'#E8FF6B':'#7A7870',fontWeight:page===n.id?600:400}}
          >
            <span style={{fontSize:16,opacity:.8}}>{n.icon}</span>
            {n.label}
          </div>
        ))}
      </div>
      <div className="sidebar-footer" style={{marginTop:'auto',paddingTop:20,borderTop:`1px solid ${T.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
          <div style={{width:32,height:32,background:T.surfaceHigh,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,color:T.text}}>
            {(user?.email||'?')[0].toUpperCase()}
          </div>
          <div style={{overflow:'hidden'}}>
            <div style={{fontSize:13,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.user_metadata?.full_name||'Mon compte'}</div>
            <div style={{fontSize:11,color:T.sidebarMuted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.email}</div>
          </div>
        </div>
        <button onClick={onSignOut}
          onMouseEnter={e=>{
            e.currentTarget.style.borderColor='#FF5F5750';e.currentTarget.style.color='#FF5F57'
            const rect=e.currentTarget.getBoundingClientRect()
            setTooltip({text:'Se déconnecter',x:rect.right+10,y:rect.top+(rect.height/2)-12})
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.borderColor='#2A2A27';e.currentTarget.style.color='#7A7870'
            setTooltip(null)
          }}
          style={{width:'100%',background:'transparent',border:'1px solid #2A2A27',borderRadius:8,padding:'7px',fontSize:12,color:'#7A7870',cursor:'pointer',fontFamily:'inherit',transition:'all .15s',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}
        >
          <span>⏻</span>Déconnexion
        </button>
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({setPage,user,T}) => {
  const [stats,setStats] = useState(null)
  const [pendingInvoices,setPendingInvoices] = useState([])
  const [loading,setLoading] = useState(true)
  
  useEffect(()=>{
    const load = async () => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0]
      const weekAgo = new Date(Date.now()-7*86400000).toISOString().split('T')[0]
      const [invRes,sesRes,cliRes] = await Promise.all([
        supabase.from('invoices').select('*,clients(name)').order('created_at',{ascending:false}),
        supabase.from('sessions').select('duration,date').gte('date',weekAgo),
        supabase.from('clients').select('id',{count:'exact',head:true}),
      ])
      const allInv = invRes.data||[]
      const monthInv = allInv.filter(i=>i.created_at>=firstDay)
      const pending = allInv.filter(i=>i.status==='envoyée'||i.status==='en retard')
      const weekH = (sesRes.data||[]).reduce((s,h)=>s+Number(h.duration),0)
      setStats({
        billed:monthInv.filter(i=>i.status==='payée').reduce((s,i)=>s+Number(i.amount),0),
        pending:pending.reduce((s,i)=>s+Number(i.amount),0),
        pendingCount:pending.length,
        weekHours:weekH.toFixed(1),
        clients:cliRes.count||0,
      })
      setPendingInvoices(pending.slice(0,5))
      setLoading(false)
    }
    load()
  },[])
  
  const name = user?.user_metadata?.full_name?.split(' ')[0]||'toi'
  const hour = new Date().getHours()
  const greet = hour<12?'Bonjour':hour<18?'Bon après-midi':'Bonsoir'
  
  if(loading) return <div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner T={T}/></div>
  
  return (
    <div className="main-content" style={{padding:'28px 32px'}}>
      <div className="fade-up" style={{marginBottom:28}}>
        <h1 style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px',color:T.text}}>{greet}, {name} 👋</h1>
        <p style={{color:T.textMuted,fontSize:14,marginTop:4}}>Voici un résumé de ton activité ce mois-ci.</p>
      </div>
      <div className="fade-up s1 stats-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        {[
          {label:'Encaissé ce mois',value:`${(stats?.billed||0).toLocaleString('fr')} €`,sub:'Factures payées uniquement',color:T.accent},
          {label:'En attente paiement',value:`${(stats?.pending||0).toLocaleString('fr')} €`,sub:`${stats?.pendingCount||0} facture(s) envoyée(s)`,color:T.warning},
          {label:'Heures / semaine',value:`${stats?.weekHours||0}h`,sub:'7 derniers jours',color:T.info},
          {label:'Clients actifs',value:stats?.clients||0,sub:'Dans ta base',color:T.text},
        ].map(s=>(
          <Card key={s.label} T={T} style={{position:'relative',overflow:'hidden'}}>
            <div style={{fontSize:11,color:T.textMuted,fontWeight:500,marginBottom:10,textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.label}</div>
            <div className="mono" style={{fontSize:24,fontWeight:500,color:s.color,lineHeight:1}}>{s.value}</div>
            <div style={{fontSize:12,color:T.textDim,marginTop:6}}>{s.sub}</div>
            <div style={{position:'absolute',right:-10,top:-10,width:60,height:60,borderRadius:'50%',background:s.color,opacity:.06}}/>
          </Card>
        ))}
      </div>
      <div className="fade-up s2 grid-2" style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:16}}>
        <Card T={T}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={{fontWeight:700,fontSize:14,color:T.text}}>Factures en attente de paiement</div>
            <Btn small variant="ghost" onClick={()=>setPage('invoices')} T={T}>Voir tout →</Btn>
          </div>
          <div style={{fontSize:12,color:T.info,background:T.infoBg,borderRadius:8,padding:'8px 12px',marginBottom:14,lineHeight:1.6}}>
            ℹ️ Factures avec statut <strong>Envoyée</strong> ou <strong>En retard</strong> — transmises au client mais pas encore réglées.
          </div>
          {pendingInvoices.length===0
            ?<Empty icon="✓" text="Aucune facture en attente !" sub="Toutes tes factures sont réglées." T={T}/>
            :pendingInvoices.map((inv,i)=>(
              <div key={inv.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',borderBottom:i<pendingInvoices.length-1?`1px solid ${T.border}`:'none'}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>{inv.invoice_number}
                  <div style={{fontSize:12,color:T.textMuted,marginTop:1}}>{inv.clients?.name} · Échéance : {inv.due_date||'—'}</div>
                </div>
                <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                  <span className="mono" style={{fontSize:13,fontWeight:500,color:T.text}}>{Number(inv.amount).toLocaleString('fr')} €</span>
                  <Badge status={inv.status} T={T}/>
                </div>
              </div>
            ))
          }
        </Card>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card T={T}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:T.text}}>Actions rapides</div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              <Btn full onClick={()=>setPage('invoices')} T={T}>+ Nouvelle facture</Btn>
              <Btn full variant="ghost" onClick={()=>setPage('quotes')} T={T}>+ Nouveau devis</Btn>
              <Btn full variant="ghost" onClick={()=>setPage('timer')} T={T}>▶ Démarrer timer</Btn>
              <Btn full variant="ghost" onClick={()=>setPage('clients')} T={T}>+ Ajouter client</Btn>
            </div>
          </Card>
          {(stats?.pendingCount||0)>0&&(
            <Card T={T} style={{background:T.warningBg,borderColor:`${T.warning}30`}}>
              <div style={{fontSize:12,color:T.warning,fontWeight:700,marginBottom:5}}>⚠ Rappel paiement</div>
              <div style={{fontSize:12,color:T.textMuted,lineHeight:1.6}}>{stats.pendingCount} facture(s) non réglée(s) · <strong style={{color:T.text}}>{(stats.pending||0).toLocaleString('fr')} €</strong> en attente.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
const Clients = ({T,setPage}) => {
  const [clients,setClients] = useState([])
  const [loading,setLoading] = useState(true)
  const [showForm,setShowForm] = useState(false)
  const [saving,setSaving] = useState(false)
  const [toast,setToast] = useState(null)
  const [editId,setEditId] = useState(null)
  const [selectedClient,setSelectedClient] = useState(null)
  const [clientDetail,setClientDetail] = useState(null)
  const [loadingDetail,setLoadingDetail] = useState(false)
  const emptyForm = {firstName:'',lastName:'',email:'',phone:'',company:'',vatId:'',color:CLIENT_COLORS[0],customFields:[],rate:''}
  const [form,setForm] = useState(emptyForm)
  
  const notify = (msg,type='ok') => {setToast({msg,type});setTimeout(()=>setToast(null),3000)}
  
  const load = useCallback(async ()=>{
    const {data} = await supabase.from('clients').select('*').order('created_at',{ascending:false})
    setClients(data||[]);setLoading(false)
  },[])
  
  useEffect(()=>{load()},[load])
  
  const openDetail = async (c) => {
    setSelectedClient(c);setLoadingDetail(true)
    const [sesRes,invRes] = await Promise.all([
      supabase.from('sessions').select('').eq('client_id',c.id).order('date',{ascending:false}),
      supabase.from('invoices').select('').eq('client_id',c.id).order('created_at',{ascending:false}),
    ])
    setClientDetail({sessions:sesRes.data||[],invoices:invRes.data||[]})
    setLoadingDetail(false)
  }
  
  const openEdit = (c,e) => {
    e.stopPropagation()
    setForm({firstName:c.first_name||'',lastName:c.last_name||'',email:c.email||'',phone:c.phone||'',company:c.company||'',vatId:c.vat_id||'',color:c.color||CLIENT_COLORS[0],customFields:Array.isArray(c.custom_fields)?c.custom_fields:[],rate:c.rate||''})
    setEditId(c.id);setShowForm(true)
  }
  
  const addCustomField = () => setForm(f=>({...f,customFields:[...f.customFields,{label:'',value:''}]}))
  const updateCustomField = (i,k,v) => {const cf=[...form.customFields];cf[i]={...cf[i],[k]:v};setForm(f=>({...f,customFields:cf}))}
  const removeCustomField = (i) => setForm(f=>({...f,customFields:f.customFields.filter((_,j)=>j!==i)}))
  
  const save = async () => {
    if(!form.firstName.trim()&&!form.lastName.trim()) return
    setSaving(true)
    const {data:{user}} = await supabase.auth.getUser()
    const payload = {user_id:user.id,first_name:form.firstName,last_name:form.lastName,name:`${form.firstName} ${form.lastName}`.trim(),email:form.email,phone:form.phone,company:form.company,vat_id:form.vatId,color:form.color,rate:Number(form.rate)||0,custom_fields:form.customFields.filter(f=>f.label.trim())}
    const {error} = editId?await supabase.from('clients').update(payload).eq('id',editId):await supabase.from('clients').insert(payload)
    if(error) notify(error.message,'error')
    else {notify(editId?'Client mis à jour !':'Client ajouté !');setShowForm(false);setForm(emptyForm);setEditId(null);load()}
    setSaving(false)
  }
  
  const del = async (id,e) => {
    e.stopPropagation()
    if(!confirm('Supprimer ce client ?')) return
    await supabase.from('clients').delete().eq('id',id)
    notify('Client supprimé.');load()
    if(selectedClient?.id===id) setSelectedClient(null)
  }
  
  if(selectedClient){
    const unpaid = clientDetail?.sessions?.filter(s=>!s.invoiced)||[]
    const paid = clientDetail?.sessions?.filter(s=>s.invoiced)||[]
    const totalUnpaidH = unpaid.reduce((a,s)=>a+Number(s.duration),0)
    const totalPaidH = paid.reduce((a,s)=>a+Number(s.duration),0)
    const totalRevenue = clientDetail?.invoices?.filter(i=>i.status==='payée').reduce((a,i)=>a+Number(i.amount),0)||0
    
    return (
      <div className="main-content" style={{padding:'28px 32px'}}>
        <Toast msg={toast?.msg} type={toast?.type} T={T}/>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <Btn variant="ghost" onClick={()=>setSelectedClient(null)} T={T}>← Retour</Btn>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:(selectedClient.color||T.accent)+'20',border:`2px solid ${selectedClient.color||T.accent}50`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:18,color:selectedClient.color||T.accent}}>
              {(selectedClient.first_name||selectedClient.name||'?')[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{fontSize:22,fontWeight:800,color:T.text,letterSpacing:'-0.5px'}}>{selectedClient.name}</h1>
              <div style={{fontSize:13,color:T.textMuted}}>{selectedClient.company||'—'} · {selectedClient.rate||0}€/h</div>
            </div>
          </div>
        </div>
        {loadingDetail?<div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner T={T}/></div>:(
          <>
            <div className="stats-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
              {[
                {label:'Heures non facturées',value:`${totalUnpaidH.toFixed(1)}h`,sub:`${((totalUnpaidH)*(selectedClient.rate||0)).toFixed(0)} € à facturer`,color:T.warning},
                {label:'Heures facturées',value:`${totalPaidH.toFixed(1)}h`,sub:'Travail payé',color:T.success},
                {label:'Chiffre d\'affaires',value:`${totalRevenue.toLocaleString('fr')} €`,sub:'Factures payées',color:T.accent},
                {label:'Factures totales',value:clientDetail?.invoices?.length||0,sub:'Toutes factures',color:T.text},
              ].map(s=>(
                <Card key={s.label} T={T}>
                  <div style={{fontSize:11,color:T.textMuted,fontWeight:500,marginBottom:8,textTransform:'uppercase',letterSpacing:'.05em'}}>{s.label}</div>
                  <div className="mono" style={{fontSize:22,fontWeight:500,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:12,color:T.textDim,marginTop:4}}>{s.sub}</div>
                </Card>
              ))}
            </div>
            <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <Card T={T}>
                <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:4}}>Travaux non encore facturés</div>
                <div style={{fontSize:12,color:T.warning,marginBottom:14}}>⚠ Ces heures ne sont pas encore dans une facture</div>
                {unpaid.length===0
                  ?<Empty icon="✓" text="Tout est facturé !" sub="Aucune heure en attente" T={T}/>
                  :unpaid.map((s,i)=>(
                    <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:i<unpaid.length-1?`1px solid ${T.border}`:'none'}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:500,color:T.text}}>{s.task||'Tâche sans titre'}</div>
                        <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{s.date}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div className="mono" style={{fontSize:13,color:T.warning,fontWeight:500}}>{s.duration}h</div>
                        <div className="mono" style={{fontSize:11,color:T.textDim}}>{((Number(s.duration))*(selectedClient.rate||0)).toFixed(2)} €</div>
                      </div>
                    </div>
                  ))
                }
                {unpaid.length>0&&(
                  <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span className="mono" style={{fontSize:13,color:T.warning,fontWeight:600}}>Total : {totalUnpaidH.toFixed(2)}h = {((totalUnpaidH)*(selectedClient.rate||0)).toFixed(2)} €</span>
                    <Btn small onClick={()=>setPage('invoices')} T={T}>Créer facture →</Btn>
                  </div>
                )}
              </Card>
              <Card T={T}>
                <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:14}}>Historique des factures</div>
                {clientDetail?.invoices?.length===0
                  ?<Empty icon="▣" text="Aucune facture" sub="Pas encore de facture pour ce client" T={T}/>
                  :clientDetail.invoices.map((inv,i)=>(
                    <div key={inv.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:i<clientDetail.invoices.length-1?`1px solid ${T.border}`:'none'}}>
                      <div>
                        <div className="mono" style={{fontSize:12,fontWeight:600,color:T.accent}}>{inv.invoice_number}</div>
                        <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{inv.date} · éch. {inv.due_date||'—'}</div>
                      </div>
                      <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                        <span className="mono" style={{fontSize:13,fontWeight:500,color:T.text}}>{Number(inv.amount).toLocaleString('fr')} €</span>
                        <Badge status={inv.status} T={T}/>
                      </div>
                    </div>
                  ))
                }
              </Card>
            </div>
          </>
        )}
      </div>
    )
  }
  
  return (
    <div className="main-content" style={{padding:'28px 32px'}}>
      <Toast msg={toast?.msg} type={toast?.type} T={T}/>
      <div className="fade-up page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
        <h1 style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px',color:T.text}}>Clients</h1>
        <p style={{color:T.textMuted,fontSize:14,marginTop:4}}>{clients.length} client(s) · Clique sur une carte pour voir le détail</p>
        <Btn onClick={()=>{setShowForm(!showForm);setEditId(null);setForm(emptyForm)}} T={T}>+ Ajouter client</Btn>
      </div>
      {showForm&&(
        <Card accent T={T} style={{marginBottom:20}}>
          <div style={{fontWeight:700,marginBottom:20,fontSize:15,color:T.text}}>{editId?'Modifier le client':'Nouveau client'}</div>
          <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <Input label="Prénom *" value={form.firstName} onChange={v=>setForm({...form,firstName:v})} placeholder="Marie" T={T}/>
            <Input label="Nom *" value={form.lastName} onChange={v=>setForm({...form,lastName:v})} placeholder="Dupont" T={T}/>
            <Input label="Email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="marie@email.com" T={T}/>
            <Input label="Téléphone" value={form.phone} onChange={v=>setForm({...form,phone:v})} placeholder="+33 6 12 34 56 78" T={T}/>
            <Input label="Société" value={form.company} onChange={v=>setForm({...form,company:v})} placeholder="Agence Créa" T={T}/>
            <Input label="Numéro TVA" value={form.vatId} onChange={v=>setForm({...form,vatId:v})} placeholder="FR12345678901" T={T}/>
            <Input label="Tarif horaire (€)" type="number" value={form.rate} onChange={v=>setForm({...form,rate:v})} placeholder="35" T={T}/>
            <div>
              <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Couleur</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {CLIENT_COLORS.map(c=>(
                  <div key={c} onClick={()=>setForm({...form,color:c})} style={{width:26,height:26,borderRadius:'50%',background:c,cursor:'pointer',border:form.color===c?`3px solid ${T.text}`:'3px solid transparent',transition:'all .15s'}}/>
                ))}
              </div>
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:T.textMuted,fontWeight:600,marginBottom:10}}>Champs supplémentaires</div>
            {form.customFields.map((cf,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 36px',gap:8,marginBottom:8,alignItems:'center'}}>
                <input value={cf.label} onChange={e=>updateCustomField(i,'label',e.target.value)} placeholder="Nom du champ" style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'8px 12px',color:T.text,fontSize:13}}/>
                <input value={cf.value} onChange={e=>updateCustomField(i,'value',e.target.value)} placeholder="Valeur" style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'8px 12px',color:T.text,fontSize:13}}/>
                <button onClick={()=>removeCustomField(i)} style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,color:T.danger,cursor:'pointer',padding:'8px',fontSize:12}}>✕</button>
              </div>
            ))}
            <Btn small variant="subtle" onClick={addCustomField} T={T}>+ Ajouter un champ</Btn>
          </div>
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={save} loading={saving} T={T}>Enregistrer</Btn>
            <Btn variant="ghost" onClick={()=>{setShowForm(false);setEditId(null);setForm(emptyForm)}} T={T}>Annuler</Btn>
          </div>
        </Card>
      )}
      {loading?<div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner T={T}/></div>
      :clients.length===0?<Empty icon="◎" text="Aucun client" sub="Ajoute ton premier client" T={T}/>
      :(
        <div className="grid-3 fade-up s1" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {clients.map(c=>(
            <Card key={c.id} T={T} onClick={()=>openDetail(c)} style={{cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:c.color+'20',border:`2px solid ${c.color}50`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,color:c.color,flexShrink:0}}>
                  {(c.first_name||c.name||'?')[0].toUpperCase()}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name||`${c.first_name||''} ${c.last_name||''}`}</div>
                  <div style={{fontSize:12,color:T.textMuted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.company||'—'}</div>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:5,borderTop:`1px solid ${T.border}`,paddingTop:12,marginBottom:12}}>
                {c.email&&<div style={{display:'flex',gap:8}}><span style={{fontSize:11,color:T.textDim,width:46,flexShrink:0}}>Email</span><span style={{fontSize:12,color:T.textMuted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.email}</span></div>}
                {c.phone&&<div style={{display:'flex',gap:8}}><span style={{fontSize:11,color:T.textDim,width:46,flexShrink:0}}>Tél</span><span style={{fontSize:12,color:T.textMuted}}>{c.phone}</span></div>}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span className="mono" style={{fontSize:14,fontWeight:600,color:T.accent}}>{c.rate||0} €/h</span>
                <div style={{display:'flex',gap:6}}>
                  <Btn small variant="subtle" onClick={(e)=>openEdit(c,e)} T={T}>Modifier</Btn>
                  <Btn small variant="danger" onClick={(e)=>del(c.id,e)} T={T}>✕</Btn>
                </div>
              </div>
              <div style={{marginTop:10,fontSize:12,color:T.accent,fontWeight:500}}>Voir le détail →</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TRAVAUX PAYÉS ─────────────────────────────────────────────────────────────
const PaidWork = ({T}) => {
  const [clients,setClients] = useState([])
  const [selected,setSelected] = useState(null)
  const [paidSessions,setPaidSessions] = useState([])
  const [paidInvoices,setPaidInvoices] = useState([])
  const [loading,setLoading] = useState(true)
  const [loadingDetail,setLoadingDetail] = useState(false)
  
  useEffect(()=>{
    supabase.from('clients').select('*').order('name').then(({data})=>{setClients(data||[]);setLoading(false)})
  },[])
  
  const openClient = async (c) => {
    setSelected(c);setLoadingDetail(true)
    const [sesRes,invRes] = await Promise.all([
      supabase.from('sessions').select('').eq('client_id',c.id).eq('invoiced',true).order('date',{ascending:false}),
      supabase.from('invoices').select('').eq('client_id',c.id).eq('status','payée').order('created_at',{ascending:false}),
    ])
    setPaidSessions(sesRes.data||[])
    setPaidInvoices(invRes.data||[])
    setLoadingDetail(false)
  }
  
  if(selected){
    const totalH = paidSessions.reduce((a,s)=>a+Number(s.duration),0)
    const totalRev = paidInvoices.reduce((a,i)=>a+Number(i.amount),0)
    
    return (
      <div className="main-content" style={{padding:'28px 32px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <Btn variant="ghost" onClick={()=>setSelected(null)} T={T}>← Retour</Btn>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:(selected.color||T.accent)+'20',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,color:selected.color||T.accent}}>
              {(selected.first_name||selected.name||'?')[0].toUpperCase()}
            </div>
            <h1 style={{fontSize:20,fontWeight:800,color:T.text}}>{selected.name} — Travaux payés</h1>
          </div>
          <div style={{fontSize:13,color:T.success}}>{totalH.toFixed(1)}h travaillées · {totalRev.toLocaleString('fr')} € encaissés</div>
        </div>
        {loadingDetail?<div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner T={T}/></div>:(
          <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <Card T={T}>
              <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:14}}>Sessions payées</div>
              {paidSessions.length===0?<Empty icon="◷" text="Aucune session payée" sub="" T={T}/>
              :paidSessions.map((s,i)=>(
                <div key={s.id} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:i<paidSessions.length-1?`1px solid ${T.border}`:'none'}}>
                  <div style={{fontSize:13,fontWeight:500,color:T.text}}>{s.task||'Tâche'}
                    <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{s.date}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <span className="mono" style={{fontSize:13,color:T.success,fontWeight:500}}>{s.duration}h</span>
                    <div style={{fontSize:10,background:T.successBg,color:T.success,padding:'1px 6px',borderRadius:6,fontWeight:600,marginTop:3,textAlign:'center'}}>Payée</div>
                  </div>
                </div>
              ))}
            </Card>
            <Card T={T}>
              <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:14}}>Factures payées</div>
              {paidInvoices.length===0?<Empty icon="▣" text="Aucune facture payée" sub="" T={T}/>
              :paidInvoices.map((inv,i)=>(
                <div key={inv.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:i<paidInvoices.length-1?`1px solid ${T.border}`:'none'}}>
                  <div className="mono" style={{fontSize:12,fontWeight:600,color:T.accent}}>{inv.invoice_number}
                    <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{inv.date}</div>
                  </div>
                  <span className="mono" style={{fontSize:14,fontWeight:600,color:T.success}}>{Number(inv.amount).toLocaleString('fr')} €</span>
                </div>
              ))}
              {paidInvoices.length>0&&(
                <div style={{borderTop:`2px solid ${T.border}`,paddingTop:12,marginTop:8,display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:13,fontWeight:600,color:T.text}}>Total encaissé</span>
                  <span className="mono" style={{fontSize:15,fontWeight:700,color:T.success}}>{totalRev.toLocaleString('fr')} €</span>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="main-content" style={{padding:'28px 32px'}}>
      <div className="fade-up" style={{marginBottom:28}}>
        <h1 style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px',color:T.text}}>Travaux payés</h1>
        <p style={{color:T.textMuted,fontSize:14,marginTop:4}}>Clique sur un client pour voir tout le travail payé et facturé.</p>
      </div>
      {loading?<div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner T={T}/></div>
      :clients.length===0?<Empty icon="◎" text="Aucun client" sub="Ajoute des clients pour commencer" T={T}/>
      :(
        <div className="grid-3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
          {clients.map(c=>(
            <Card key={c.id} T={T} onClick={()=>openClient(c)} style={{cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:c.color+'20',border:`2px solid ${c.color}50`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,color:c.color,flexShrink:0}}>
                  {(c.first_name||c.name||'?')[0].toUpperCase()}
                </div>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>{c.name}</div>
              </div>
              <div style={{fontSize:12,color:T.textMuted}}>{c.company||'—'}</div>
              <div style={{fontSize:12,color:T.success,fontWeight:600}}>Voir travaux payés →</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TIMER ──────────────────────────────────────────────────────────────────
const Timer = ({T, timerState, timerActions}) => {
  const {running,paused,seconds,clientId,task,clients,sessions} = timerState
  const {start,pause,resume,stop,setClientId,setTask,reloadSessions} = timerActions
  const [saving,setSaving] = useState(false)
  const [toast,setToast] = useState(null)
  
  const notify = (msg,type='ok') => {setToast({msg,type});setTimeout(()=>setToast(null),3000)}
  
  useEffect(()=>{reloadSessions()},[])
  
  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  
  const handleStop = async () => {
    if(seconds<5){stop(null);return}
    setSaving(true)
    const saved = await stop(async(sec,cId,tsk)=>{
      const {data:{user}} = await supabase.auth.getUser()
      const {data,error} = await supabase.from('sessions').insert({
        user_id:user.id,
        client_id:cId,
        task:tsk||'Tâche sans titre',
        duration:+(sec/3600).toFixed(2),
        date:new Date().toISOString().split('T')[0],
        invoiced:false
      }).select('*,clients(name,color)').single()
      if(error) throw error
      return data
    })
    if(saved) notify('Session sauvegardée !')
    else notify('Erreur lors de la sauvegarde','error')
    setSaving(false)
    reloadSessions()
  }
  
  const client = clients.find(c=>c.id===clientId)
  const totalH = sessions.reduce((a,s)=>a+Number(s.duration),0).toFixed(1)
  const isActive = running&&!paused
  
  return (
    <div className="main-content" style={{padding:'28px 32px'}}>
      <Toast msg={toast?.msg} type={toast?.type} T={T}/>
      <h1 className="fade-up" style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px',color:T.text,marginBottom:28}}>Timer & heures</h1>
      <div className="fade-up grid-2" style={{display:'grid',gridTemplateColumns:'380px 1fr',gap:20}}>
        <Card accent={isActive} T={T} style={{position:'relative',overflow:'hidden'}}>
          {running&&(
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:T.border}}>
              <div style={{height:'100%',background:paused?T.warning:T.accent,width:`${Math.min((seconds%3600)/3600*100,100)}%`,transition:'width 1s linear,background .3s'}}/>
            </div>
          )}
          <div style={{textAlign:'center',padding:'20px 0 22px'}}>
            <div className="mono" style={{fontSize:54,fontWeight:300,letterSpacing:3,lineHeight:1,transition:'color .3s',color:isActive?T.accent:paused?T.warning:T.text,animation:isActive?'blink 2.5s ease infinite':'none'}}>
              {fmt(seconds)}
            </div>
            <div style={{marginTop:12,minHeight:28,display:'flex',justifyContent:'center'}}>
              {running&&client&&(
                <div style={{display:'inline-flex',alignItems:'center',gap:6,background:paused?T.warningBg:T.dangerBg,border:`1px solid ${paused?T.warning:T.danger}40`,borderRadius:20,padding:'4px 14px',transition:'all .3s'}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:paused?T.warning:T.danger,animation:isActive?'blink .8s ease infinite':'none'}}/>
                  <span style={{fontSize:12,color:paused?T.warning:T.danger,fontWeight:600}}>{paused?'En pause — ':''}{client.name}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Client</label>
            <select value={clientId} onChange={e=>setClientId(e.target.value)} disabled={running}
              style={{width:'100%',background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 12px',color:T.text,fontSize:13,cursor:running?'not-allowed':'pointer',opacity:running?.7:1}}>
              {clients.map(c=><option key={c.id} value={c.id}>{c.name} — {c.rate}€/h</option>)}
            </select>
          </div>
          <Input placeholder="Description de la tâche..." value={task} onChange={v=>{if(!running)setTask(v)}} style={{marginBottom:18}} T={T}/>
          {!running?(
            <Btn full onClick={()=>start()} disabled={!clientId} T={T}>▶ Démarrer</Btn>
          ):(
            <div style={{display:'flex',gap:8}}>
              {!paused?(
                <button onClick={pause} style={{flex:1,padding:'10px',borderRadius:8,border:`1px solid ${T.warning}50`,background:T.warningBg,color:T.warning,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit',transition:'all .15s',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}
                  onMouseEnter={e=>e.currentTarget.style.opacity='.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>⏸ Pause</button>
              ):(
                <button onClick={resume} style={{flex:1,padding:'10px',borderRadius:8,border:`1px solid ${T.accent}50`,background:T.accentLight,color:T.accent,fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit',transition:'all .15s',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}
                  onMouseEnter={e=>e.currentTarget.style.opacity='.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>▶ Reprendre</button>
              )}
              <button onClick={handleStop} disabled={saving} style={{flex:1,padding:'10px',borderRadius:8,border:`1px solid ${T.danger}40`,background:T.dangerBg,color:T.danger,fontWeight:700,fontSize:13,cursor:saving?'not-allowed':'pointer',fontFamily:'inherit',transition:'all .15s',display:'flex',alignItems:'center',justifyContent:'center',gap:7,opacity:saving?.7:1}}
                onMouseEnter={e=>{if(!saving)e.currentTarget.style.opacity='.8'}} onMouseLeave={e=>e.currentTarget.style.opacity=saving?'.7':'1'}>
                {saving?<div style={{width:13,height:13,border:`2px solid ${T.danger}40`,borderTopColor:T.danger,borderRadius:'50%',animation:'spin .6s linear infinite'}}/>:'⏹'}
                {saving?'Sauvegarde...':'Arrêter & sauver'}
              </button>
            </div>
          )}
          {running&&(
            <div style={{marginTop:14,padding:'10px 14px',background:T.surfaceHigh,borderRadius:8,display:'flex',justifyContent:'space-between',fontSize:12,color:T.textMuted}}>
              <span>Durée effective</span>
              <span className="mono" style={{color:T.accent,fontWeight:600}}>{(seconds/3600).toFixed(2)}h · {((seconds/3600)*(client?.rate||0)).toFixed(2)} €</span>
            </div>
          )}
        </Card>
        <Card T={T}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
            <div style={{fontWeight:700,fontSize:14,color:T.text}}>Sessions récentes</div>
            <div className="mono" style={{fontSize:13,color:T.accent,fontWeight:500}}>{totalH}h total</div>
          </div>
          {sessions.length===0
            ?<Empty icon="◷" text="Aucune session" sub="Démarre ton premier timer" T={T}/>
            :sessions.map(s=>(
              <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${T.border}`}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:s.clients?.color||T.accent,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:T.text}}>{s.task}</div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{s.clients?.name} · {s.date}</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span className="mono" style={{fontSize:13,color:T.accent,fontWeight:500}}>{s.duration}h</span>
                  {s.invoiced&&<span style={{fontSize:10,background:T.successBg,color:T.success,padding:'2px 6px',borderRadius:6,fontWeight:600}}>Facturée</span>}
                </div>
              </div>
            ))
          }
        </Card>
      </div>
    </div>
  )
}

// ─── PDF GENERATOR ────────────────────────────────────────────────────────────
const generatePDF = (invoice, client, settings, visibleFields) => {
  const fmt = n => Number(n||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})
  const show = (key) => visibleFields[key] !== false
  const tvaRate = invoice.tva_rate || 0
  const htAmount = invoice.amount_ht || invoice.amount
  const tvaAmount = htAmount * (tvaRate / 100)
  const ttcAmount = htAmount + tvaAmount

  const html = `
<!DOCTYPE html>
<html>
<head><title>Facture ${invoice.invoice_number}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#1A1916;background:#FFFFFF;padding:48px}
  @media print{@page{margin:0;size:A4}body{padding:32px 40px}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:44px;padding-bottom:22px;border-bottom:2px solid #1A1916}
  .logo{font-size:26px;font-weight:800;letter-spacing:-1px;color:#1A1916}.logo span{color:#1A6B4A}
  .invoice-title{text-align:right}.invoice-title h1{font-size:30px;font-weight:800;letter-spacing:-1px;color:#1A1916;margin-bottom:4px}
  .invoice-title .num{font-size:13px;font-weight:500;color:#6B6963;font-family:monospace}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:36px}
  .party-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#A8A5A0;margin-bottom:8px}
  .party-name{font-size:15px;font-weight:700;color:#1A1916;margin-bottom:4px}
  .party-detail{font-size:12px;color:#6B6963;line-height:1.7}
  .dates{display:grid;grid-template-columns:1fr 1fr;gap:16px;background:#F8F7F4;border-radius:10px;padding:16px 18px;margin-bottom:30px}
  .date-item label{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#A8A5A0;display:block;margin-bottom:4px}
  .date-item span{font-size:14px;font-weight:600;color:#1A1916}
  table{width:100%;border-collapse:collapse;margin-bottom:22px}
  thead tr{background:#1A1916;color:#FFFFFF}
  thead th{padding:11px 14px;text-align:left;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
  thead th:last-child{text-align:right}
  tbody tr{border-bottom:1px solid #E0DED8}tbody tr:last-child{border-bottom:none}
  tbody td{padding:12px 14px;font-size:13px;color:#1A1916}tbody td:last-child{text-align:right;font-weight:600;font-family:monospace}
  .totals{display:flex;justify-content:flex-end;margin-bottom:36px}.totals-box{width:280px}
  .total-row{display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#6B6963;border-bottom:1px solid #E0DED8}
  .total-row.grand{border-bottom:none;padding-top:14px;margin-top:4px;font-size:18px;font-weight:800;color:#1A1916;border-top:2px solid #1A1916}
  .total-row.grand span:last-child{color:#1A6B4A;font-family:monospace}
  .payment{background:#F8F7F4;border-radius:10px;padding:18px 20px;margin-bottom:30px}
  .payment h3{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#A8A5A0;margin-bottom:8px}
  .payment p{font-size:12px;color:#6B6963;line-height:1.8;font-family:monospace}
  .footer{border-top:1px solid #E0DED8;padding-top:18px;text-align:center;font-size:11px;color:#A8A5A0;line-height:1.8}
</style></head>
<body>
  <div class="header">
    <div class="logo">VA <span>Billing</span></div>
    <div class="invoice-title"><h1>FACTURE</h1><div class="num">${invoice.invoice_number}</div></div>
  </div>
  <div class="parties">
    <div>
      <div class="party-label">Émetteur</div>
      <div class="party-name">${show('av_name')?(settings?.full_name||'Votre nom'):''}</div>
      <div class="party-detail">
        ${show('av_email')&&settings?.email?`${settings.email}<br/>`:''}
        ${show('av_siret')&&settings?.siret?`SIRET : ${settings.siret}<br/>`:''}
        ${show('av_tva')&&settings?.tva_number?`TVA : ${settings.tva_number}<br/>`:''}
      </div>
    </div>
    <div>
      <div class="party-label">Client</div>
      <div class="party-name">${show('client_name')?(client?.name||invoice.free_client_name||''):''}</div>
      <div class="party-detail">
        ${show('client_company')&&client?.company?`${client.company}<br/>`:''}
        ${show('client_email')&&(client?.email||invoice.free_client_email)?`${client?.email||invoice.free_client_email}<br/>`:''}
        ${show('client_phone')&&client?.phone?`Tél : ${client.phone}<br/>`:''}
        ${show('client_vat')&&client?.vat_id?`TVA : ${client.vat_id}<br/>`:''}
      </div>
    </div>
  </div>
  ${show('invoice_date')?`
  <div class="dates">
    <div class="date-item"><label>Date d'émission</label><span>${invoice.date||new Date().toLocaleDateString('fr-FR')}</span></div>
    <div class="date-item"><label>Date d'échéance</label><span>${invoice.due_date||'—'}</span></div>
  </div>`:''}
  <table>
    <thead><tr><th>Description</th><th style="text-align:right">Qté</th><th style="text-align:right">Tarif unitaire</th><th style="text-align:right">Montant</th></tr></thead>
    <tbody>
      ${(invoice.items||[]).map(item=>`
      <tr>
        <td>${item.service||item.task||'Prestation'}</td>
        <td style="text-align:right">${Number(item.qty||item.duration||0).toFixed(2)} ${item.unit||'h'}</td>
        <td style="text-align:right">${fmt(item.rate)} €</td>
        <td style="text-align:right">${fmt(Number(item.qty||item.duration||0)*Number(item.rate||0))} €</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <div class="totals">
    <div class="totals-box">
      <div class="total-row"><span>Total HT</span><span>${fmt(htAmount)} €</span></div>
      ${tvaRate>0?`
      <div class="total-row"><span>TVA (${tvaRate}%)</span><span>${fmt(tvaAmount)} €</span></div>`:`
      <div class="total-row"><span>TVA</span><span>N/A</span></div>`}
      <div class="total-row grand"><span>TOTAL TTC</span><span>${fmt(ttcAmount)} €</span></div>
    </div>
  </div>
  ${show('av_bank')&&settings?.bank_details?`<div class="payment"><h3>Coordonnées bancaires</h3><p>${settings.bank_details.replace(/\n/g,'<br/>')}</p></div>`:''}
  <div class="footer">${settings?.full_name||''} ${settings?.siret?`· SIRET ${settings.siret}`:''} ${settings?.tva_number?`· TVA ${settings.tva_number}`:''}<br/>Merci pour votre confiance.</div>
  <script>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){window.close()},500)},300)}</script>
</body></html>`

  const win = window.open('','_blank','width=900,height=700,menubar=no,toolbar=no,location=no,status=no')
  if(win){win.document.write(html);win.document.close()}
}

// ─── INVOICES ─────────────────────────────────────────────────────────────────
const Invoices = ({T}) => {
  const [invoices,setInvoices] = useState([])
  const [clients,setClients] = useState([])
  const [sessions,setSessions] = useState([])
  const [settings,setSettings] = useState(null)
  const [loading,setLoading] = useState(true)
  const [loadingSessions,setLoadingSessions] = useState(false)
  const [showForm,setShowForm] = useState(false)
  const [invoiceMode,setInvoiceMode] = useState('hours')
  const [saving,setSaving] = useState(false)
  const [filter,setFilter] = useState('toutes')
  const [toast,setToast] = useState(null)
  const [selectedSessions,setSelectedSessions] = useState([])
  const [freeItems,setFreeItems] = useState([{service:'',qty:1,rate:0,unit:'forfait'}])
  const [form,setForm] = useState({clientId:'',dueDate:'',freeClientName:'',freeClientEmail:'',tvaRate:''})
  const [pdfInvoice,setPdfInvoice] = useState(null)
  const [pdfClient,setPdfClient] = useState(null)
  const [visibleFields,setVisibleFields] = useState({invoice_date:true,av_name:true,av_email:true,av_siret:true,av_tva:true,av_bank:true,client_name:true,client_company:true,client_email:true,client_phone:true,client_vat:true})
  
  const notify = (msg,type='ok') => {setToast({msg,type});setTimeout(()=>setToast(null),3000)}
  
  const load = useCallback(async ()=>{
    const {data:{user}} = await supabase.auth.getUser()
    const [{data:inv},{data:cli},{data:set}] = await Promise.all([
      supabase.from('invoices').select('*,clients(name,email,company,phone,vat_id,color)').order('created_at',{ascending:false}),
      supabase.from('clients').select('').order('name'),
      supabase.from('settings').select('*').eq('user_id',user.id).single(),
    ])
    setInvoices(inv||[])
    setClients(cli||[])
    setSettings(set ? {...set, email: user.email} : {email: user.email})
    if(cli?.length) setForm(f=>({...f,clientId:cli[0].id}))
    setLoading(false)
  },[])
  
  useEffect(()=>{load()},[load])
  
  const loadSessions = useCallback(async (clientId) => {
    if(!clientId) return
    setLoadingSessions(true);setSelectedSessions([])
    const {data} = await supabase.from('sessions').select('*').eq('client_id',clientId).eq('invoiced',false).order('date',{ascending:false})
    setSessions(data||[])
    setLoadingSessions(false)
  },[])
  
  useEffect(()=>{if(form.clientId&&invoiceMode==='hours') loadSessions(form.clientId)},[form.clientId,invoiceMode,loadSessions])
  
  const toggleSession = (id) => setSelectedSessions(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])
  const toggleAll = () => setSelectedSessions(s=>s.length===sessions.length?[]:sessions.map(x=>x.id))
  
  const client = clients.find(c=>c.id===form.clientId)
  const checkedSessions = sessions.filter(s=>selectedSessions.includes(s.id))
  const hoursTotal = checkedSessions.reduce((a,s)=>a+Number(s.duration),0)
  const hoursAmount = hoursTotal*(client?.rate||0)
  const freeTotal = freeItems.reduce((a,i)=>a+Number(i.qty||0)*Number(i.rate||0),0)
  const htTotal = invoiceMode==='hours'?hoursAmount:freeTotal
  const tvaRate = form.tvaRate ? Number(form.tvaRate) : 0
  const tvaAmount = htTotal * (tvaRate / 100)
  const grandTotal = htTotal + tvaAmount
  
  const addFreeItem = () => setFreeItems(e=>[...e,{service:'',qty:1,rate:0,unit:'forfait'}])
  const updateFreeItem = (i,k,v) => {const items=[...freeItems];items[i]={...items[i],[k]:v};setFreeItems(items)}
  
  const create = async () => {
    if(invoiceMode==='hours'&&!form.clientId) return
    if(invoiceMode==='free'&&!form.freeClientName.trim()) return notify('Le nom du client est requis.','error')
    if(grandTotal===0) return notify('Le montant total doit être supérieur à 0.','error')
    setSaving(true)
    const {data:{user}} = await supabase.auth.getUser()
    const {count} = await supabase.from('invoices').select('*',{count:'exact',head:true}).eq('user_id',user.id)
    const num = `FAC-${String((count||0)+1).padStart(3,'0')}`
    
    let items = []
    let clientIdToSave = form.clientId||null
    
    if(invoiceMode==='hours'){
      items = checkedSessions.map(s=>({
        service:s.task||'Heures travaillées',
        qty:Number(s.duration),
        rate:client?.rate||0,
        date:s.date,
        session_id:s.id,
        unit:'h'
      }))
    } else {
      items = freeItems.filter(i=>i.service&&Number(i.rate)>0).map(i=>({
        service:i.service,
        qty:Number(i.qty||1),
        rate:Number(i.rate||0),
        unit:i.unit||'forfait',
        description:i.description||''
      }))
    }
    
    const payload = {
      user_id:user.id,
      client_id:clientIdToSave,
      invoice_number:num,
      items,
      amount:grandTotal,
      amount_ht:htTotal,
      tva_rate:tvaRate,
      due_date:form.dueDate||null,
      status:'brouillon',
      av_snapshot:{
        full_name:settings?.full_name||'',
        email:settings?.email||user.email||'',
        siret:settings?.siret||'',
        tva_number:settings?.tva_number||'',
        bank_details:settings?.bank_details||'',
      },
      free_client_name:invoiceMode==='free'?form.freeClientName:null,
      free_client_email:invoiceMode==='free'?form.freeClientEmail:null,
    }
    
    const {error} = await supabase.from('invoices').insert(payload)
    if(error){notify(error.message,'error');setSaving(false);return}
    
    if(invoiceMode==='hours'&&selectedSessions.length>0){
      await supabase.from('sessions').update({invoiced:true}).in('id',selectedSessions)
    }
    
    notify('Facture créée !')
    setShowForm(false);setSelectedSessions([]);setFreeItems([{service:'',qty:1,rate:0,unit:'forfait'}])
    setForm(f=>({...f,dueDate:'',freeClientName:'',freeClientEmail:'',tvaRate:''}))
    load()
    setSaving(false)
  }
  
  const changeStatus = async (id,status) => {
    await supabase.from('invoices').update({status}).eq('id',id)
    setInvoices(inv=>inv.map(i=>i.id===id?{...i,status}:i))
    if(status==='payée'){
      const invoice = invoices.find(i=>i.id===id)
      if(invoice?.items){
        const sessionIds = (invoice.items||[]).filter(item=>item.session_id).map(item=>item.session_id)
        if(sessionIds.length>0){
          await supabase.from('sessions').update({invoiced:true}).in('id',sessionIds)
        }
      }
      if(form.clientId) loadSessions(form.clientId)
    }
    notify('Statut mis à jour.')
  }
  
  const del = async (id) => {
    if(!confirm('Supprimer cette facture ?')) return
    await supabase.from('invoices').delete().eq('id',id)
    setInvoices(inv=>inv.filter(i=>i.id!==id));notify('Facture supprimée.')
  }
  
  const openPDF = (inv) => {
    const c = clients.find(x=>x.id===inv.client_id)||inv.clients
    const avData = inv.av_snapshot||settings
    setPdfInvoice({...inv,_avData:avData})
    setPdfClient(c)
    setVisibleFields({invoice_date:true,av_name:!!(avData?.full_name),av_email:!!(avData?.email),av_siret:!!(avData?.siret),av_tva:!!(avData?.tva_number),av_bank:!!(avData?.bank_details),client_name:true,client_company:!!(c?.company),client_email:!!(c?.email),client_phone:!!(c?.phone),client_vat:!!(c?.vat_id)})
  }
  
  const sendByEmail = (inv,c) => {
    const avData = inv._avData||inv.av_snapshot||settings
    const subject = encodeURIComponent(`Facture ${inv.invoice_number}`)
    const body = encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint la facture ${inv.invoice_number} d'un montant de ${Number(inv.amount).toLocaleString('fr')} €.\n\nCordialement,\n${avData?.full_name||''}`)
    window.open(`mailto:${c?.email||inv.free_client_email||''}?subject=${subject}&body=${body}`)
  }
  
  const FILTERS = ['toutes','brouillon','envoyée','en retard','payée']
  const filtered = filter==='toutes'?invoices:invoices.filter(i=>i.status===filter)
  
  if(pdfInvoice){
    const avData = pdfInvoice._avData||pdfInvoice.av_snapshot||settings
    const clientName = pdfClient?.name||pdfInvoice.free_client_name||'—'
    const clientEmail = pdfClient?.email||pdfInvoice.free_client_email||''
    const fields = [
      {key:'invoice_date',label:`📅 Date d'émission`,warn:false},
      {key:'av_name',label:`Ton nom : ${avData?.full_name||'Non renseigné'}`,warn:!avData?.full_name},
      {key:'av_email',label:`Ton email : ${avData?.email||'Non renseigné'}`,warn:!avData?.email},
      {key:'av_siret',label:`SIRET : ${avData?.siret||'Non renseigné'}`,warn:!avData?.siret},
      {key:'av_tva',label:`N° TVA : ${avData?.tva_number||'Non renseigné'}`,warn:false},
      {key:'av_bank',label:`Coordonnées bancaires`,warn:false},
      {key:'client_name',label:`Client : ${clientName}`,warn:false},
      {key:'client_company',label:`Société : ${pdfClient?.company||'—'}`,warn:false},
      {key:'client_email',label:`Email client : ${clientEmail||'—'}`,warn:false},
      {key:'client_phone',label:`Tél client : ${pdfClient?.phone||'—'}`,warn:false},
      {key:'client_vat',label:`TVA client : ${pdfClient?.vat_id||'—'}`,warn:false},
    ]
    
    const htAmount = pdfInvoice.amount_ht||pdfInvoice.amount
    const tvaRate = pdfInvoice.tva_rate||0
    const tvaAmount = htAmount*(tvaRate/100)
    const ttcAmount = htAmount+tvaAmount
    
    return (
      <div className="main-content" style={{padding:'28px 32px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <Btn variant="ghost" onClick={()=>setPdfInvoice(null)} T={T}>← Retour</Btn>
          <h1 style={{fontSize:20,fontWeight:800,color:T.text}}>Aperçu — {pdfInvoice.invoice_number}</h1>
        </div>
        {(!avData?.full_name||!avData?.siret)&&(
          <div style={{padding:'10px 16px',background:T.warningBg,border:`1px solid ${T.warning}40`,borderRadius:10,fontSize:13,color:T.warning,marginBottom:16}}>
            ⚠ Certaines informations de ton profil sont manquantes. Va dans <strong>Paramètres</strong> pour les compléter.
          </div>
        )}
        <div className="grid-2" style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:20,alignItems:'start'}}>
          <Card T={T}>
            <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:12}}>Informations incluses</div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:12}}>Clique pour masquer/afficher dans le PDF.</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {fields.map(f=>{
                const visible = visibleFields[f.key]!==false
                return (
                  <div key={f.key} onClick={()=>setVisibleFields(v=>({...v,[f.key]:!visible}))}
                    style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 10px',borderRadius:8,background:visible?T.accentLight:T.surfaceHigh,border:`1px solid ${visible?T.accent+'40':T.border}`,cursor:'pointer',transition:'all .15s'}}>
                    <span style={{fontSize:11,color:visible?T.text:T.textDim,textDecoration:visible?'none':'line-through',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.label}</span>
                    {f.warn&&visible&&<span style={{fontSize:10,color:T.warning,marginRight:4}}>!</span>}
                    <span style={{fontSize:10,color:visible?T.accent:T.textDim,fontWeight:600,flexShrink:0,marginLeft:6}}>{visible?'✓':'—'}</span>
                  </div>
                )
              })}
            </div>
            <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:8}}>
              <Btn full onClick={()=>generatePDF(pdfInvoice,pdfClient,avData,visibleFields)} T={T}>⬇ Télécharger / Imprimer</Btn>
              <Btn full variant="success" onClick={()=>sendByEmail(pdfInvoice,pdfClient)} T={T}>✉ Envoyer par email</Btn>
              <Btn full variant="ghost" onClick={()=>setPdfInvoice(null)} T={T}>Fermer</Btn>
            </div>
          </Card>
          <Card T={T} style={{padding:0,overflow:'hidden'}}>
            <div style={{background:'#FFFFFF',padding:'36px',fontFamily:'Helvetica Neue,Arial,sans-serif',color:'#1A1916',minHeight:600}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:32,paddingBottom:18,borderBottom:'2px solid #1A1916'}}>
                <div style={{fontSize:20,fontWeight:800}}><span style={{color:'#1A6B4A'}}>VA</span> Billing</div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:24,fontWeight:800}}>FACTURE</div>
                  <div style={{fontSize:12,color:'#6B6963',fontFamily:'monospace'}}>{pdfInvoice.invoice_number}</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:28,marginBottom:24}}>
                <div>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#A8A5A0',marginBottom:6}}>ÉMETTEUR</div>
                  {visibleFields.av_name!==false&&<div style={{fontWeight:700,marginBottom:2,fontSize:13}}>{avData?.full_name||<span style={{color:'#DC2626',fontStyle:'italic'}}>Nom non renseigné</span>}</div>}
                  <div style={{fontSize:11,color:'#6B6963',lineHeight:1.8}}>
                    {visibleFields.av_email!==false&&<div>{avData?.email||''}</div>}
                    {visibleFields.av_siret!==false&&avData?.siret&&<div>SIRET : {avData.siret}</div>}
                    {visibleFields.av_tva!==false&&avData?.tva_number&&<div>TVA : {avData.tva_number}</div>}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#A8A5A0',marginBottom:6}}>CLIENT</div>
                  {visibleFields.client_name!==false&&<div style={{fontWeight:700,marginBottom:2,fontSize:13}}>{clientName}</div>}
                  <div style={{fontSize:11,color:'#6B6963',lineHeight:1.8}}>
                    {visibleFields.client_company!==false&&pdfClient?.company&&<div>{pdfClient.company}</div>}
                    {visibleFields.client_email!==false&&clientEmail&&<div>{clientEmail}</div>}
                    {visibleFields.client_phone!==false&&pdfClient?.phone&&<div>Tél : {pdfClient.phone}</div>}
                    {visibleFields.client_vat!==false&&pdfClient?.vat_id&&<div>TVA : {pdfClient.vat_id}</div>}
                  </div>
                </div>
              </div>
              {visibleFields.invoice_date!==false&&(
                <div style={{background:'#F8F7F4',borderRadius:8,padding:'12px 14px',display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:20}}>
                  <div><div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#A8A5A0',marginBottom:2}}>Date d'émission</div><div style={{fontSize:12,fontWeight:600}}>{pdfInvoice.date||new Date().toLocaleDateString('fr')}</div></div>
                  <div><div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#A8A5A0',marginBottom:2}}>Échéance</div><div style={{fontSize:12,fontWeight:600}}>{pdfInvoice.due_date||'—'}</div></div>
                </div>
              )}
              <table style={{width:'100%',borderCollapse:'collapse',marginBottom:16}}>
                <thead><tr style={{background:'#1A1916',color:'#fff'}}>
                  <th style={{padding:'9px 12px',textAlign:'left',fontSize:10,letterSpacing:'.05em'}}>DESCRIPTION</th>
                  <th style={{padding:'9px 12px',textAlign:'right',fontSize:10}}>QTÉ</th>
                  <th style={{padding:'9px 12px',textAlign:'right',fontSize:10}}>TARIF</th>
                  <th style={{padding:'9px 12px',textAlign:'right',fontSize:10}}>MONTANT</th>
                </tr></thead>
                <tbody>
                  {(pdfInvoice.items||[]).map((item,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid #E0DED8'}}>
                      <td style={{padding:'9px 12px',fontSize:11}}>{item.service||item.task}</td>
                      <td style={{padding:'9px 12px',textAlign:'right',fontSize:11,fontFamily:'monospace'}}>{Number(item.qty||item.duration||0).toFixed(2)} {item.unit||'h'}</td>
                      <td style={{padding:'9px 12px',textAlign:'right',fontSize:11,fontFamily:'monospace'}}>{Number(item.rate||0).toFixed(2)} €</td>
                      <td style={{padding:'9px 12px',textAlign:'right',fontSize:11,fontWeight:600,fontFamily:'monospace'}}>{(Number(item.qty||item.duration||0)*Number(item.rate||0)).toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <div style={{width:200,borderTop:'2px solid #1A1916',paddingTop:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#6B6963',marginBottom:4}}>
                    <span>Total HT</span>
                    <span style={{fontFamily:'monospace'}}>{Number(htAmount||0).toLocaleString('fr-FR',{minimumFractionDigits:2})} €</span>
                  </div>
                  {tvaRate>0?(
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#6B6963',marginBottom:4}}>
                      <span>TVA ({tvaRate}%)</span>
                      <span style={{fontFamily:'monospace'}}>{Number(tvaAmount||0).toLocaleString('fr-FR',{minimumFractionDigits:2})} €</span>
                    </div>
                  ):(
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#6B6963',marginBottom:4}}>
                      <span>TVA</span>
                      <span style={{fontFamily:'monospace'}}>N/A</span>
                    </div>
                  )}
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:15,fontWeight:800}}>
                    <span>TOTAL TTC</span>
                    <span style={{color:'#1A6B4A',fontFamily:'monospace'}}>{Number(ttcAmount||0).toLocaleString('fr-FR',{minimumFractionDigits:2})} €</span>
                  </div>
                </div>
              </div>
              {visibleFields.av_bank!==false&&avData?.bank_details&&(
                <div style={{marginTop:20,padding:'12px 14px',background:'#F8F7F4',borderRadius:8}}>
                  <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#A8A5A0',marginBottom:6}}>COORDONNÉES BANCAIRES</div>
                  <div style={{fontSize:11,fontFamily:'monospace',color:'#6B6963',lineHeight:1.7,whiteSpace:'pre-line'}}>{avData.bank_details}</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="main-content" style={{padding:'28px 32px'}}>
      <Toast msg={toast?.msg} type={toast?.type} T={T}/>
      <div className="fade-up page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px',color:T.text}}>Factures</h1>
        <p style={{color:T.textMuted,fontSize:14,marginTop:4}}>{invoices.length} facture(s) au total</p>
        <Btn onClick={()=>setShowForm(!showForm)} T={T}>+ Nouvelle facture</Btn>
      </div>
      <div className="fade-up s1" style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {FILTERS.map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'6px 16px',borderRadius:20,border:`1px solid ${filter===f?T.accent:T.border}`,background:filter===f?T.accentLight:'transparent',color:filter===f?T.accent:T.textMuted,fontSize:12,cursor:'pointer',fontWeight:filter===f?600:400,transition:'all .15s',textTransform:'capitalize',fontFamily:'inherit'}}>{f}</button>
        ))}
      </div>
      {showForm&&(
        <Card accent T={T} style={{marginBottom:20}} className="fade-up">
          <div style={{fontWeight:700,marginBottom:18,fontSize:15,color:T.text}}>Nouvelle facture</div>
          <div style={{display:'flex',gap:8,marginBottom:20}}>
            {[{id:'hours',label:'Par heures (client existant)',icon:'◷'},{id:'free',label:'Libre (forfait, mission ponctuelle)',icon:'◈'}].map(m=>(
              <button key={m.id} onClick={()=>setInvoiceMode(m.id)} style={{flex:1,padding:'10px 14px',borderRadius:10,border:`1px solid ${invoiceMode===m.id?T.accent:T.border}`,background:invoiceMode===m.id?T.accentLight:'transparent',color:invoiceMode===m.id?T.accent:T.textMuted,fontSize:13,fontWeight:invoiceMode===m.id?600:400,cursor:'pointer',fontFamily:'inherit',transition:'all .15s',textAlign:'left'}}>
                <span style={{marginRight:6}}>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
          <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
            {invoiceMode==='hours'?(
              <div>
                <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Client *</label>
                <select value={form.clientId} onChange={e=>setForm({...form,clientId:e.target.value})}
                  style={{width:'100%',background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 12px',color:T.text,fontSize:13}}>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name} — {c.rate}€/h</option>)}
                </select>
              </div>
            ):(
              <Input label="Nom du client *" value={form.freeClientName} onChange={v=>setForm({...form,freeClientName:v})} placeholder="Jean Martin" T={T}/>
            )}
            <Input label="Date d'échéance" type="date" value={form.dueDate} onChange={v=>setForm({...form,dueDate:v})} T={T}/>
            {invoiceMode==='free'&&(
              <Input label="Email client (pour envoi)" value={form.freeClientEmail} onChange={v=>setForm({...form,freeClientEmail:v})} placeholder="jean@email.com" T={T}/>
            )}
          </div>
          
          {/* TVA Field - CORRECTED */}
          <div style={{marginBottom:16,padding:'14px',background:T.surfaceHigh,borderRadius:10,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:12,color:T.textMuted,fontWeight:600,marginBottom:10,textTransform:'uppercase',letterSpacing:'.05em'}}>💰 TVA</div>
            <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <Input label="Taux TVA (%)" type="number" value={form.tvaRate} onChange={v=>setForm({...form,tvaRate:v})} placeholder="21" suffix="%" T={T}/>
              <div>
                <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Calcul automatique</label>
                <div style={{fontSize:12,color:T.text,background:T.surface,padding:'9px 13px',borderRadius:8,border:`1px solid ${T.border}`}}>
                  {tvaRate>0?(
                    <span style={{color:T.success}}>✓ TVA {tvaRate}% appliquée</span>
                  ):(
                    <span style={{color:T.textDim}}>N/A (Non assujetti)</span>
                  )}
                </div>
              </div>
            </div>
            <div style={{fontSize:11,color:T.textDim,marginTop:8}}>
              Laissez vide ou 0 si non assujetti. Formule : TVA = HT × {form.tvaRate||0}%
            </div>
          </div>
          
          {invoiceMode==='hours'&&(
            <div style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div style={{fontSize:12,color:T.textMuted,fontWeight:600}}>Heures non facturées — {client?.name}</div>
                {sessions.length>0&&<button onClick={toggleAll} style={{fontSize:11,color:T.accent,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>{selectedSessions.length===sessions.length?'Tout décocher':'Tout cocher'}</button>}
              </div>
              {loadingSessions?<div style={{padding:16,display:'flex',justifyContent:'center'}}><Spinner T={T}/></div>
              :sessions.length===0
                ?<div style={{padding:'12px 16px',background:T.surfaceHigh,borderRadius:8,fontSize:13,color:T.textDim,textAlign:'center'}}>Aucune heure non facturée pour ce client.</div>
                :(
                  <div style={{border:`1px solid ${T.border}`,borderRadius:10,overflow:'hidden'}}>
                    {sessions.map((s,i)=>{
                      const checked = selectedSessions.includes(s.id)
                      const amount = Number(s.duration)*(client?.rate||0)
                      return (
                        <div key={s.id} onClick={()=>toggleSession(s.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderBottom:i<sessions.length-1?`1px solid ${T.border}`:'none',cursor:'pointer',background:checked?T.accentLight:'transparent',transition:'background .12s'}}>
                          <div style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${checked?T.accent:T.border}`,background:checked?T.accent:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s'}}>
                            {checked&&<span style={{fontSize:10,color:T.accentText,fontWeight:700}}>✓</span>}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:500,color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.task||'Tâche sans titre'}</div>
                            <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{s.date}</div>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0}}>
                            <div className="mono" style={{fontSize:13,color:T.accent,fontWeight:500}}>{s.duration}h</div>
                            <div className="mono" style={{fontSize:11,color:T.textMuted}}>{amount.toFixed(2)} €</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              }
              {selectedSessions.length>0&&(
                <div style={{marginTop:10,padding:'10px 14px',background:T.accentLight,border:`1px solid ${T.accent}30`,borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,color:T.accent,fontWeight:600}}>{selectedSessions.length} session(s) · {hoursTotal.toFixed(2)}h · {client?.rate}€/h</span>
                  <span className="mono" style={{fontSize:14,color:T.accent,fontWeight:700}}>{hoursAmount.toFixed(2)} €</span>
                </div>
              )}
            </div>
          )}
          
          {invoiceMode==='free'&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,color:T.textMuted,fontWeight:600,marginBottom:10}}>Lignes de prestation</div>
              <div style={{background:T.surfaceHigh,borderRadius:10,overflow:'hidden',marginBottom:10}}>
                <div style={{display:'grid',gridTemplateColumns:'2fr 90px 110px 100px 36px',gap:8,padding:'8px 12px',borderBottom:`1px solid ${T.border}`}}>
                  {['Description','Qté','Prix unit.','Unité',''].map(h=>(<div key={h} style={{fontSize:10,color:T.textDim,fontWeight:600,textTransform:'uppercase',letterSpacing:'.04em'}}>{h}</div>))}
                </div>
                {freeItems.map((item,i)=>{
                  const lineTotal = Number(item.qty||0)*Number(item.rate||0)
                  return (
                    <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 90px 110px 100px 36px',gap:8,padding:'8px 12px',borderBottom:i<freeItems.length-1?`1px solid ${T.border}`:'none',alignItems:'center'}}>
                      <input value={item.service} onChange={e=>updateFreeItem(i,'service',e.target.value)} placeholder="Ex: Mise en page 30 docs" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:'7px 10px',color:T.text,fontSize:13}}/>
                      <input type="number" value={item.qty||''} onChange={e=>updateFreeItem(i,'qty',e.target.value)} placeholder="1" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:'7px 8px',color:T.text,fontSize:13,textAlign:'center'}}/>
                      <div style={{position:'relative'}}>
                        <input type="number" value={item.rate||''} onChange={e=>updateFreeItem(i,'rate',e.target.value)} placeholder="25" style={{width:'100%',background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:'7px 24px 7px 10px',color:T.text,fontSize:13}}/>
                        <span style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',fontSize:11,color:T.textDim}}>€</span>
                      </div>
                      <select value={item.unit||'forfait'} onChange={e=>updateFreeItem(i,'unit',e.target.value)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:'7px 8px',color:T.text,fontSize:12}}>
                        <option value="forfait">Forfait</option>
                        <option value="h">/ heure</option>
                        <option value="page">/ page</option>
                        <option value="doc">/ doc</option>
                        <option value="mot">/ mot</option>
                        <option value="unité">/ unité</option>
                      </select>
                      <button onClick={()=>setFreeItems(e=>e.filter((_,j)=>j!==i))} disabled={freeItems.length===1} style={{background:'none',border:'none',color:freeItems.length===1?T.textDim:T.danger,cursor:freeItems.length===1?'not-allowed':'pointer',fontSize:14,padding:4}}>✕</button>
                    </div>
                  )
                })}
              </div>
              <Btn small variant="subtle" onClick={addFreeItem} T={T}>+ Ajouter une ligne</Btn>
            </div>
          )}
          
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:`1px solid ${T.border}`,paddingTop:16}}>
            <div>
              <div className="mono" style={{fontSize:20,fontWeight:600,color:T.text}}>
                Total TTC : <span style={{color:T.accent}}>{grandTotal.toFixed(2)} €</span>
              </div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:3}}>
                HT: {htTotal.toFixed(2)} € {tvaRate>0?`· TVA (${tvaRate}%): ${tvaAmount.toFixed(2)} €`:'· TVA: N/A'}
              </div>
              {invoiceMode==='hours'&&selectedSessions.length>0&&(
                <div style={{fontSize:11,color:T.textMuted,marginTop:3}}>{hoursTotal.toFixed(2)}h × {client?.rate}€/h</div>
              )}
            </div>
            <div style={{display:'flex',gap:10}}>
              <Btn onClick={create} loading={saving} disabled={invoiceMode==='hours'?(!form.clientId||selectedSessions.length===0):(!form.freeClientName||freeTotal===0)} T={T}>Créer la facture</Btn>
              <Btn variant="ghost" onClick={()=>{setShowForm(false);setSelectedSessions([]);setFreeItems([{service:'',qty:1,rate:0,unit:'forfait'}])}} T={T}>Annuler</Btn>
            </div>
          </div>
        </Card>
      )}
      {loading?<div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner T={T}/></div>
      :filtered.length===0?<Empty icon="▣" text="Aucune facture" sub="Crée ta première facture" T={T}/>
      :(
        <>
          <Card invoice-table T={T} style={{padding:0,overflow:'hidden'}} className="fade-up s2 invoice-table">
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${T.border}`,background:T.surfaceHigh}}>
                  {['Numéro','Client','Montant','Date','Échéance','Statut','Actions'].map(h=>(<th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:11,color:T.textDim,fontWeight:600,letterSpacing:'.04em',textTransform:'uppercase'}}>{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv,idx)=>(
                  <tr key={inv.id} style={{borderBottom:idx<filtered.length-1?`1px solid ${T.border}`:'none',transition:'background .1s'}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.surfaceHigh}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{padding:'12px 16px'}}><span className="mono" style={{fontSize:13,fontWeight:600,color:T.accent}}>{inv.invoice_number}</span></td>
                    <td style={{padding:'12px 16px',fontSize:13,fontWeight:500,color:T.text}}>{inv.clients?.name}</td>
                    <td style={{padding:'12px 16px'}}><span className="mono" style={{fontSize:13,fontWeight:500,color:T.text}}>{Number(inv.amount).toLocaleString('fr')} €</span></td>
                    <td style={{padding:'12px 16px',fontSize:12,color:T.textMuted}}>{inv.date}</td>
                    <td style={{padding:'12px 16px',fontSize:12,color:inv.due_date&&new Date(inv.due_date)<new Date()?T.danger:T.textMuted}}>{inv.due_date||'—'}</td>
                    <td style={{padding:'12px 16px'}}><Badge status={inv.status} T={T}/></td>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{display:'flex',gap:6}}>
                        <Btn small variant="subtle" onClick={()=>openPDF(inv)} T={T}>PDF</Btn>
                        <Btn small variant="success" onClick={()=>{const c=clients.find(x=>x.id===inv.client_id)||inv.clients;sendByEmail(inv,c)}} T={T}>✉</Btn>
                        {inv.status!=='payée'&&<Btn small variant="subtle" onClick={()=>changeStatus(inv.id,'payée')} T={T}>✓</Btn>}
                        <Btn small variant="danger" onClick={()=>del(inv.id)} T={T}>✕</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="invoice-cards" style={{display:'none',flexDirection:'column',gap:12}}>
            {filtered.map(inv=>(
              <Card key={inv.id} T={T}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div>
                    <div className="mono" style={{fontSize:13,fontWeight:600,color:T.accent}}>{inv.invoice_number}</div>
                    <div style={{fontSize:14,fontWeight:600,color:T.text,marginTop:2}}>{inv.clients?.name}</div>
                  </div>
                  <Badge status={inv.status} T={T}/>
                </div>
                <div className="mono" style={{fontSize:22,fontWeight:600,color:T.text,marginBottom:12}}>{Number(inv.amount).toLocaleString('fr')} €</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <Btn small variant="subtle" onClick={()=>openPDF(inv)} T={T}>PDF</Btn>
                  <Btn small variant="success" onClick={()=>sendByEmail(inv,clients.find(x=>x.id===inv.client_id))} T={T}>✉ Email</Btn>
                  {inv.status!=='payée'&&<Btn small variant="subtle" onClick={()=>changeStatus(inv.id,'payée')} T={T}>✓ Payée</Btn>}
                  <Btn small variant="danger" onClick={()=>del(inv.id)} T={T}>Supprimer</Btn>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── QUOTE PDF GENERATOR ──────────────────────────────────────────────────────
const generateQuotePDF = (quote, settings) => {
  const fmt = n => Number(n||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})
  const tvaRate = quote.tva_rate||0
  const htAmount = quote.amount_ht||quote.amount
  const tvaAmount = htAmount*(tvaRate/100)
  const ttcAmount = htAmount+tvaAmount
  
  const html = `
<!DOCTYPE html>
<html>
<head><title>Devis ${quote.ref}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#1A1916;padding:48px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:20px;border-bottom:2px solid #1A1916}
  .logo{font-size:24px;font-weight:800;color:#1A1916}.logo span{color:#1A6B4A}
  h1{font-size:28px;font-weight:800;color:#1A1916}
  .ref{font-size:13px;color:#6B6963;font-family:monospace;margin-top:4px}
  .parties{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:32px}
  .label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#A8A5A0;margin-bottom:8px}
  .name{font-size:15px;font-weight:700;margin-bottom:4px}
  .detail{font-size:12px;color:#6B6963;line-height:1.7}
  .info-box{background:#F8F7F4;border-radius:10px;padding:16px;margin-bottom:28px;display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
  .info-item label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#A8A5A0;display:block;margin-bottom:3px}
  .info-item span{font-size:13px;font-weight:600}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  thead tr{background:#1A1916;color:#fff}
  thead th{padding:11px 14px;text-align:left;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase}
  tbody tr{border-bottom:1px solid #E0DED8}
  tbody td{padding:12px 14px;font-size:13px}
  .right{text-align:right;font-family:monospace;font-weight:600}
  .totals{display:flex;justify-content:flex-end;margin-bottom:32px}.totals-box{width:260px}
  .total-row{display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#6B6963;border-bottom:1px solid #E0DED8}
  .total-grand{border:none;padding-top:14px;border-top:2px solid #1A1916;font-size:17px;font-weight:800;color:#1A1916}
  .total-grand span:last-child{color:#1A6B4A;font-family:monospace}
  .note{background:#F8F7F4;border-radius:10px;padding:16px;margin-bottom:28px;font-size:13px;color:#6B6963;line-height:1.7}
  .footer{border-top:1px solid #E0DED8;padding-top:16px;text-align:center;font-size:11px;color:#A8A5A0}
  .validity{background:#E8F5EE;border-radius:8px;padding:10px 16px;font-size:12px;color:#15803D;margin-bottom:28px}
</style></head>
<body>
  <div class="header"><div class="logo">VA <span>Billing</span></div><div><h1>DEVIS</h1><div class="ref">${quote.ref||'DEV-001'}</div></div></div>
  <div class="parties">
    <div><div class="label">Émetteur</div><div class="name">${settings?.full_name||'Votre nom'}</div><div class="detail">${settings?.email||''}<br/>${settings?.siret?`SIRET : ${settings.siret}`:''}</div></div>
    <div><div class="label">Destinataire</div><div class="name">${quote.prospect_name||'—'}</div><div class="detail">${quote.prospect_email||''}<br/>${quote.prospect_company||''}</div></div>
  </div>
  <div class="info-box">
    <div class="info-item"><label>Date d'émission</label><span>${new Date().toLocaleDateString('fr-FR')}</span></div>
    <div class="info-item"><label>Validité</label><span>${quote.valid_days||30} jours</span></div>
  </div>
  <div class="validity">✓ Ce devis est valable ${quote.valid_days||30} jours à compter de la date d'émission.</div>
  <table>
    <thead><tr><th>Prestation</th><th class="right">Quantité</th><th class="right">Tarif unitaire</th><th class="right">Montant</th></tr></thead>
    <tbody>
      ${(quote.items||[]).map(item=>`<tr><td>${item.service||'Prestation'}</td><td class="right">${Number(item.qty||0).toFixed(2)}</td><td class="right">${fmt(item.rate)} €</td><td class="right">${fmt(Number(item.qty||0)*Number(item.rate||0))} €</td></tr>`).join('')}
    </tbody>
  </table>
  <div class="totals">
    <div class="totals-box">
      <div class="total-row"><span>Total HT</span><span>${fmt(htAmount)} €</span></div>
      ${tvaRate>0?`<div class="total-row"><span>TVA (${tvaRate}%)</span><span>${fmt(tvaAmount)} €</span></div>`:`<div class="total-row"><span>TVA</span><span>N/A</span></div>`}
      <div class="total-row total-grand"><span>TOTAL</span><span>${fmt(ttcAmount)} €</span></div>
    </div>
  </div>
  ${quote.note?`<div class="note"><strong>Note :</strong><br/>${quote.note}</div>`:''}
  <div class="footer">${settings?.full_name||''} ${settings?.siret?`· SIRET ${settings.siret}`:''}<br/>Merci pour votre confiance.</div>
</body></html>`
  
  const win = window.open('','_blank')
  win.document.write(html)
  win.document.close()
  setTimeout(()=>win.print(),500)
}

// ─── QUOTES ───────────────────────────────────────────────────────────────────
const Quotes = ({T}) => {
  const [quotes,setQuotes] = useState([])
  const [settings,setSettings] = useState(null)
  const [loading,setLoading] = useState(true)
  const [showForm,setShowForm] = useState(false)
  const [saving,setSaving] = useState(false)
  const [toast,setToast] = useState(null)
  const emptyForm = {prospectName:'',prospectEmail:'',prospectCompany:'',items:[{service:'',qty:1,rate:0}],note:'',validDays:30,tvaRate:''}
  const [form,setForm] = useState(emptyForm)
  
  const notify = (msg,type='ok') => {setToast({msg,type});setTimeout(()=>setToast(null),3000)}
  
  const load = useCallback(async ()=>{
    const [{data:q},{data:s}] = await Promise.all([
      supabase.from('quotes').select('').order('created_at',{ascending:false}),
      supabase.from('settings').select('').single(),
    ])
    setQuotes(q||[]);setSettings(s);setLoading(false)
  },[])
  
  useEffect(()=>{load()},[load])
  
  const addItem = () => setForm(f=>({...f,items:[...f.items,{service:'',qty:1,rate:0}]}))
  const updateItem = (i,k,v) => {const items=[...form.items];items[i]={...items[i],[k]:v};setForm(f=>({...f,items}))}
  const removeItem = (i) => setForm(f=>({...f,items:f.items.filter((_,j)=>j!==i)}))
  
  const htTotal = form.items.reduce((a,i)=>a+Number(i.qty||0)*Number(i.rate||0),0)
  const tvaRate = form.tvaRate?Number(form.tvaRate):0
  const tvaAmount = htTotal*(tvaRate/100)
  const total = htTotal+tvaAmount
  
  const save = async () => {
    if(!form.prospectName.trim()) return notify('Le nom du destinataire est requis.','error')
    if(total===0) return notify('Ajoute au moins une prestation avec un tarif.','error')
    setSaving(true)
    const {data:{user}} = await supabase.auth.getUser()
    const {count} = await supabase.from('quotes').select('*',{count:'exact',head:true}).eq('user_id',user.id)
    const ref = `DEV-${String((count||0)+1).padStart(3,'0')}`
    const {error} = await supabase.from('quotes').insert({
      user_id:user.id,
      ref,
      prospect_name:form.prospectName,
      prospect_email:form.prospectEmail,
      prospect_company:form.prospectCompany,
      items:form.items.filter(i=>i.service&&Number(i.rate)>0),
      amount:total,
      amount_ht:htTotal,
      tva_rate:tvaRate,
      note:form.note,
      status:'brouillon',
      valid_days:form.validDays,
    })
    if(error) notify(error.message,'error')
    else {notify('Devis créé !');setShowForm(false);setForm(emptyForm);load()}
    setSaving(false)
  }
  
  const sendQuote = (q) => {
    const subject = encodeURIComponent(`Devis ${q.ref} — ${settings?.full_name||''}`)
    const body = encodeURIComponent(`Bonjour ${q.prospect_name||''},\n\nVeuillez trouver ci-joint mon devis ${q.ref} d'un montant de ${Number(q.amount).toLocaleString('fr')} €.\n\nCe devis est valable ${q.valid_days||30} jours.\n\nCordialement,\n${settings?.full_name||''}`)
    window.open(`mailto:${q.prospect_email||''}?subject=${subject}&body=${body}`)
  }
  
  const changeStatus = async (id,status) => {
    await supabase.from('quotes').update({status}).eq('id',id)
    setQuotes(q=>q.map(x=>x.id===id?{...x,status}:x))
    notify('Statut mis à jour.')
  }
  
  const del = async (id) => {
    if(!confirm('Supprimer ce devis ?')) return
    await supabase.from('quotes').delete().eq('id',id)
    setQuotes(q=>q.filter(x=>x.id!==id));notify('Devis supprimé.')
  }
  
  const STATUS_COLORS = {
    'brouillon':{bg:'surfaceHigh',color:'textMuted'},
    'envoyé':{bg:'infoBg',color:'info'},
    'accepté':{bg:'successBg',color:'success'},
    'refusé':{bg:'dangerBg',color:'danger'},
  }
  
  return (
    <div className="main-content" style={{padding:'28px 32px'}}>
      <Toast msg={toast?.msg} type={toast?.type} T={T}/>
      <div className="fade-up page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
        <h1 style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px',color:T.text}}>Devis</h1>
        <p style={{color:T.textMuted,fontSize:14,marginTop:4}}>Crée un devis libre — pas besoin d'un client existant.</p>
        <Btn onClick={()=>setShowForm(!showForm)} T={T}>+ Nouveau devis</Btn>
      </div>
      <div className="fade-up s1" style={{padding:'10px 16px',background:T.infoBg,borderRadius:10,fontSize:13,color:T.info,marginBottom:20,lineHeight:1.6}}>
        ℹ️ Un devis est <strong>libre</strong> — tu n'as pas besoin que le prospect soit dans ta liste de clients.
      </div>
      {showForm&&(
        <Card accent T={T} style={{marginBottom:20}} className="fade-up">
          <div style={{fontWeight:700,marginBottom:20,fontSize:15,color:T.text}}>Nouveau devis</div>
          <div style={{marginBottom:18}}>
            <div style={{fontSize:12,color:T.textMuted,fontWeight:600,marginBottom:10,textTransform:'uppercase',letterSpacing:'.05em'}}>Destinataire</div>
            <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Input label="Nom complet *" value={form.prospectName} onChange={v=>setForm({...form,prospectName:v})} placeholder="Jean Martin" T={T}/>
              <Input label="Email" value={form.prospectEmail} onChange={v=>setForm({...form,prospectEmail:v})} placeholder="jean@email.com" T={T}/>
              <Input label="Société (optionnel)" value={form.prospectCompany} onChange={v=>setForm({...form,prospectCompany:v})} placeholder="Agence XYZ" T={T}/>
              <Input label="Validité (jours)" type="number" value={form.validDays} onChange={v=>setForm({...form,validDays:Number(v)})} placeholder="30" T={T}/>
            </div>
          </div>
          
          {/* TVA Field for Quotes */}
          <div style={{marginBottom:16,padding:'14px',background:T.surfaceHigh,borderRadius:10,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:12,color:T.textMuted,fontWeight:600,marginBottom:10,textTransform:'uppercase',letterSpacing:'.05em'}}>💰 TVA</div>
            <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <Input label="Taux TVA (%)" type="number" value={form.tvaRate} onChange={v=>setForm({...form,tvaRate:v})} placeholder="21" suffix="%" T={T}/>
              <div>
                <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Calcul automatique</label>
                <div style={{fontSize:12,color:T.text,background:T.surface,padding:'9px 13px',borderRadius:8,border:`1px solid ${T.border}`}}>
                  {tvaRate>0?(<span style={{color:T.success}}>✓ TVA {tvaRate}% appliquée</span>):(<span style={{color:T.textDim}}>N/A (Non assujetti)</span>)}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:T.textMuted,fontWeight:600,marginBottom:10,textTransform:'uppercase',letterSpacing:'.05em'}}>Prestations</div>
            <div style={{background:T.surfaceHigh,borderRadius:10,padding:'4px 0',marginBottom:10}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 100px 120px 120px 36px',gap:8,padding:'8px 14px',borderBottom:`1px solid ${T.border}`}}>
                {['Prestation','Qté / h','Tarif €','Total',''].map(h=>(<div key={h} style={{fontSize:11,color:T.textDim,fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em'}}>{h}</div>))}
              </div>
              {form.items.map((item,i)=>{
                const lineTotal = Number(item.qty||0)*Number(item.rate||0)
                return (
                  <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 100px 120px 120px 36px',gap:8,padding:'8px 14px',borderBottom:i<form.items.length-1?`1px solid ${T.border}`:'none',alignItems:'center'}}>
                    <select value={item.service} onChange={e=>updateItem(i,'service',e.target.value)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:'7px 10px',color:item.service?T.text:T.textDim,fontSize:13}}>
                      <option value="">Choisir...</option>
                      {VA_SERVICES.map(s=><option key={s}>{s}</option>)}
                      <option value="Autre">Autre / personnalisé</option>
                    </select>
                    <input type="number" placeholder="1" value={item.qty||''} onChange={e=>updateItem(i,'qty',e.target.value)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:'7px 10px',color:T.text,fontSize:13,textAlign:'center'}}/>
                    <input type="number" placeholder="0 €" value={item.rate||''} onChange={e=>updateItem(i,'rate',e.target.value)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:7,padding:'7px 10px',color:T.text,fontSize:13}}/>
                    <div className="mono" style={{fontSize:13,fontWeight:600,color:lineTotal>0?T.accent:T.textDim,paddingLeft:4}}>{lineTotal>0?`${lineTotal.toFixed(2)} €`:'—'}</div>
                    <button onClick={()=>removeItem(i)} disabled={form.items.length===1} style={{background:'none',border:'none',color:form.items.length===1?T.textDim:T.danger,cursor:form.items.length===1?'not-allowed':'pointer',fontSize:14,padding:4}}>✕</button>
                  </div>
                )
              })}
            </div>
            <Btn small variant="subtle" onClick={addItem} T={T}>+ Ajouter une ligne</Btn>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,color:T.textMuted,fontWeight:600,display:'block',marginBottom:8}}>Note / message (optionnel)</label>
            <textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Conditions particulières, délai de réalisation, etc." rows={3} style={{width:'100%',background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'10px 13px',color:T.text,fontSize:13,resize:'vertical',fontFamily:'inherit'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:`1px solid ${T.border}`,paddingTop:16}}>
            <div>
              <div className="mono" style={{fontSize:22,fontWeight:600,color:T.text}}>Total TTC : <span style={{color:T.accent}}>{total.toFixed(2)} €</span></div>
              <div style={{fontSize:12,color:T.textMuted,marginTop:3}}>HT: {htTotal.toFixed(2)} € {tvaRate>0?`· TVA (${tvaRate}%): ${tvaAmount.toFixed(2)} €`:'· TVA: N/A'}</div>
              <div style={{fontSize:12,color:T.textMuted,marginTop:3}}>{form.items.filter(i=>i.service&&Number(i.rate)>0).length} prestation(s) · valable {form.validDays} jours</div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <Btn onClick={save} loading={saving} disabled={!form.prospectName||total===0} T={T}>Créer le devis</Btn>
              <Btn variant="ghost" onClick={()=>setShowForm(false)} T={T}>Annuler</Btn>
            </div>
          </div>
        </Card>
      )}
      {loading?<div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner T={T}/></div>
      :quotes.length===0?<Empty icon="◈" text="Aucun devis" sub="Crée ton premier devis" T={T}/>
      :(
        <div style={{display:'flex',flexDirection:'column',gap:12}} className="fade-up s2">
          {quotes.map(q=>{
            const sc = STATUS_COLORS[q.status]||STATUS_COLORS['brouillon']
            return (
              <Card key={q.id} T={T}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
                  <div style={{display:'flex',gap:16,alignItems:'center'}}>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                        <span className="mono" style={{fontSize:13,fontWeight:700,color:T.accent}}>{q.ref||'DEV-?'}</span>
                        <span style={{fontSize:11,fontWeight:600,padding:'2px 10px',borderRadius:20,background:T[sc.bg]||T.surfaceHigh,color:T[sc.color]||T.textMuted}}>{q.status}</span>
                      </div>
                      <div style={{fontSize:14,fontWeight:600,color:T.text}}>{q.prospect_name||q.clients?.name||'—'}</div>
                      {q.prospect_company&&<div style={{fontSize:12,color:T.textMuted}}>{q.prospect_company}</div>}
                      <div style={{fontSize:11,color:T.textDim,marginTop:4}}>{new Date(q.created_at).toLocaleDateString('fr')} · {Array.isArray(q.items)?q.items.length:0} prestation(s)</div>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                    <span className="mono" style={{fontSize:18,fontWeight:700,color:T.accent}}>{Number(q.amount).toLocaleString('fr')} €</span>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      <Btn small variant="subtle" onClick={()=>generateQuotePDF(q,settings)} T={T}>PDF</Btn>
                      {q.prospect_email&&<Btn small variant="subtle" onClick={()=>sendQuote(q)} T={T}>✉ Email</Btn>}
                      {q.status==='brouillon'&&<Btn small variant="subtle" onClick={()=>changeStatus(q.id,'envoyé')} T={T}>Marquer envoyé</Btn>}
                      {q.status==='envoyé'&&<Btn small variant="success" onClick={()=>changeStatus(q.id,'accepté')} T={T}>✓ Accepté</Btn>}
                      {q.status==='envoyé'&&<Btn small variant="danger" onClick={()=>changeStatus(q.id,'refusé')} T={T}>✕ Refusé</Btn>}
                      <Btn small variant="danger" onClick={()=>del(q.id)} T={T}>✕</Btn>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
const Settings = ({user,T,theme,setTheme}) => {
  const [profile,setProfile] = useState({full_name:'',siret:'',tva_number:'',email:user?.email||'',bank_details:''})
  const [reminders,setReminders] = useState({reminder_before:3,reminder_after:7})
  const [loading,setLoading] = useState(true)
  const [saving,setSaving] = useState(false)
  const [toast,setToast] = useState(null)
  
  const notify = (msg,type='ok') => {setToast({msg,type});setTimeout(()=>setToast(null),3000)}
  
  useEffect(()=>{
    supabase.from('settings').select('*').eq('user_id',user.id).single().then(({data})=>{
      if(data){
        setProfile({full_name:data.full_name||'',siret:data.siret||'',tva_number:data.tva_number||'',email:user?.email||'',bank_details:data.bank_details||''})
        setReminders({reminder_before:data.reminder_before||3,reminder_after:data.reminder_after||7})
      }
      setLoading(false)
    })
  },[user.id])
  
  const save = async () => {
    setSaving(true)
    const {error} = await supabase.from('settings').upsert({
      user_id:user.id,
      full_name:profile.full_name,
      siret:profile.siret,
      tva_number:profile.tva_number,
      bank_details:profile.bank_details,
      reminder_before:reminders.reminder_before,
      reminder_after:reminders.reminder_after,
      updated_at:new Date().toISOString()
    },{onConflict:'user_id'})
    if(error) notify(error.message,'error')
    else notify('Paramètres sauvegardés !')
    setSaving(false)
  }
  
  if(loading) return <div style={{padding:40,display:'flex',justifyContent:'center'}}><Spinner T={T}/></div>
  
  return (
    <div className="main-content" style={{padding:'28px 32px'}}>
      <Toast msg={toast?.msg} type={toast?.type} T={T}/>
      <h1 className="fade-up" style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px',color:T.text,marginBottom:28}}>Paramètres</h1>
      <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <Card T={T} className="fade-up s1">
            <div style={{fontWeight:700,fontSize:15,marginBottom:18,color:T.text}}>Profil & entreprise</div>
            <div style={{display:'flex',flexDirection:'column',gap:13}}>
              <Input label="Nom complet" value={profile.full_name} onChange={v=>setProfile({...profile,full_name:v})} placeholder="Marie Dupont" T={T}/>
              <Input label="Email" value={profile.email} readOnly T={T}/>
              <Input label="SIRET" value={profile.siret} onChange={v=>setProfile({...profile,siret:v})} placeholder="123 456 789 00010" T={T}/>
              <Input label="Numéro TVA" value={profile.tva_number} onChange={v=>setProfile({...profile,tva_number:v})} placeholder="FR12345678901" T={T}/>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                <label style={{fontSize:12,color:T.textMuted,fontWeight:500}}>Coordonnées bancaires (pour PDF)</label>
                <textarea value={profile.bank_details} onChange={e=>setProfile({...profile,bank_details:e.target.value})} placeholder={`IBAN : FR76...\nBIC : BNPAFRPP`} rows={3} style={{background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 13px',color:T.text,fontSize:13,resize:'vertical',fontFamily:'inherit'}}/>
              </div>
              <Btn onClick={save} loading={saving} T={T}>Sauvegarder</Btn>
            </div>
          </Card>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <Card T={T} className="fade-up s2">
              <div style={{fontWeight:700,fontSize:15,marginBottom:16,color:T.text}}>Apparence</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {['light','dark'].map(t=>(
                  <div key={t} onClick={()=>setTheme(t)} style={{padding:'14px',borderRadius:10,border:`2px solid ${theme===t?T.accent:T.border}`,cursor:'pointer',textAlign:'center',background:theme===t?T.accentLight:T.surfaceHigh,transition:'all .15s'}}>
                    <div style={{fontSize:20,marginBottom:6}}>{t==='light'?'☀️':'🌙'}</div>
                    <div style={{fontSize:13,fontWeight:600,color:theme===t?T.accent:T.text,textTransform:'capitalize'}}>{t==='light'?'Mode clair':'Mode sombre'}</div>
                    {theme===t&&<div style={{fontSize:11,color:T.accent,marginTop:3}}>Actif</div>}
                  </div>
                ))}
              </div>
            </Card>
            <Card T={T} className="fade-up s3">
              <div style={{fontWeight:700,fontSize:15,marginBottom:16,color:T.text}}>Rappels automatiques</div>
              <div style={{display:'flex',flexDirection:'column',gap:13,marginBottom:16}}>
                <div>
                  <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Rappel avant échéance (jours)</label>
                  <input type="number" value={reminders.reminder_before} onChange={e=>setReminders({...reminders,reminder_before:Number(e.target.value)})} style={{width:'100%',background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 13px',color:T.text,fontSize:13}}/>
                </div>
                <div>
                  <label style={{fontSize:12,color:T.textMuted,fontWeight:500,display:'block',marginBottom:6}}>Relance si non payé après (jours)</label>
                  <input type="number" value={reminders.reminder_after} onChange={e=>setReminders({...reminders,reminder_after:Number(e.target.value)})} style={{width:'100%',background:T.surfaceHigh,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 13px',color:T.text,fontSize:13}}/>
                </div>
              </div>
              <Btn onClick={save} loading={saving} T={T}>Sauvegarder</Btn>
            </Card>
            <Card T={T} className="fade-up s4" style={{background:T.accentLight,borderColor:`${T.accent}30`}}>
              <div style={{fontWeight:700,fontSize:14,color:T.accent,marginBottom:8}}>Plan Pro</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div>
                  <div style={{fontSize:13,color:T.text,fontWeight:600}}>9 $/mois</div>
                  <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>Factures illimitées · Extension Chrome</div>
                </div>
                <span style={{background:T.accent,color:T.accentText,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20}}>Actif</span>
              </div>
              <Btn variant="ghost" full T={T}>Gérer l'abonnement</Btn>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser] = useState(undefined)
  const [page,setPage] = useState('dashboard')
  const [theme,setTheme] = useState('light')
  const [timerRunning,setTimerRunning] = useState(false)
  const [timerPaused,setTimerPaused] = useState(false)
  const [timerSeconds,setTimerSeconds] = useState(0)
  const [timerClientId,setTimerClientId] = useState('')
  const [timerTask,setTimerTask] = useState('')
  const [timerClients,setTimerClients] = useState([])
  const [timerSessions,setTimerSessions] = useState([])
  const timerRef = useRef(null)
  
  useEffect(()=>{
    if(!user) return
    supabase.from('clients').select('*').order('name').then(({data})=>{
      setTimerClients(data||[])
      if(data?.length&&!timerClientId) setTimerClientId(data[0].id)
    })
  },[user])
  
  useEffect(()=>{
    if(timerRunning&&!timerPaused){
      timerRef.current = setInterval(()=>setTimerSeconds(s=>s+1),1000)
    } else {
      clearInterval(timerRef.current)
    }
    return ()=>clearInterval(timerRef.current)
  },[timerRunning,timerPaused])
  
  const reloadTimerSessions = useCallback(()=>{
    supabase.from('sessions').select('*,clients(name,color)').order('date',{ascending:false}).limit(20).then(({data})=>setTimerSessions(data||[]))
  },[])
  
  const timerActions = {
    start:()=>{setTimerRunning(true);setTimerPaused(false)},
    pause:()=>setTimerPaused(true),
    resume:()=>setTimerPaused(false),
    stop:async(saveFn)=>{
      clearInterval(timerRef.current)
      const sec=timerSeconds
      const cId=timerClientId
      const tsk=timerTask
      setTimerRunning(false);setTimerPaused(false);setTimerSeconds(0);setTimerTask('')
      if(saveFn&&sec>=5){
        try{const data=await saveFn(sec,cId,tsk);return data}
        catch(e){console.error(e);return null}
      }
      return null
    },
    setClientId:setTimerClientId,
    setTask:setTimerTask,
    reloadSessions:reloadTimerSessions,
  }
  
  const timerState = {
    running:timerRunning,paused:timerPaused,seconds:timerSeconds,
    clientId:timerClientId,task:timerTask,
    clients:timerClients,sessions:timerSessions,
  }
  
  const T = THEMES[theme]
  const fmtTimer = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const timerClient = timerClients.find(c=>c.id===timerClientId)
  
  useEffect(()=>{
    supabase.auth.getUser().then(({data:{user}})=>setUser(user||null))
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>setUser(session?.user||null))
    return ()=>subscription.unsubscribe()
  },[])
  
  useEffect(()=>{
    if(typeof window!=='undefined'){
      const saved = localStorage.getItem('vabilling-theme')
      if(saved) setTheme(saved)
    }
  },[])
  
  useEffect(()=>{
    if(typeof window!=='undefined') localStorage.setItem('vabilling-theme',theme)
  },[theme])
  
  const signOut = async () => {
    clearInterval(timerRef.current)
    setTimerRunning(false);setTimerPaused(false);setTimerSeconds(0)
    await supabase.auth.signOut();setUser(null)
  }
  
  if(user===undefined) return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:16,height:16,border:`2px solid ${T.border}`,borderTopColor:T.accent,borderRadius:'50%',animation:'spin .6s linear infinite'}}/>
      
    </div>
  )
  
  if(!user) return <AuthPage onAuth={setUser}/>
  
  const pages = {
    dashboard:<Dashboard setPage={setPage} user={user} T={T}/>,
    clients:<Clients T={T} setPage={setPage}/>,
    paidwork:<PaidWork T={T}/>,
    timer:<Timer T={T} timerState={timerState} timerActions={timerActions}/>,
    invoices:<Invoices T={T}/>,
    quotes:<Quotes T={T}/>,
    settings:<Settings user={user} T={T} theme={theme} setTheme={setTheme}/>,
  }
  
  return (
    <>
      {makeCSS(T)}
      <div className="app-layout" style={{display:'flex',minHeight:'100vh',background:T.bg}}>
        <Sidebar page={page} setPage={setPage} user={user} onSignOut={signOut} T={T}/>
        <main style={{flex:1,overflowY:'auto',minHeight:'100vh',background:T.bg}}>
          {pages[page]}
          {timerRunning&&page!=='timer'&&(
            <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',zIndex:9999,display:'flex',alignItems:'center',gap:10,background:timerPaused?T.warningBg:T.sidebar,border:`1px solid ${timerPaused?T.warning+'60':T.accent+'40'}`,borderRadius:40,padding:'10px 18px 10px 14px',boxShadow:'0 8px 32px rgba(0,0,0,0.25)',backdropFilter:'blur(8px)',animation:'fadeUp .3s ease',cursor:'default'}}>
              <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,background:timerPaused?T.warning:'#FF5F57',animation:timerPaused?'none':'blink .8s ease infinite'}}/>
              <div style={{display:'flex',flexDirection:'column',gap:1}}>
                <span style={{fontSize:11,color:timerPaused?T.warning:'#7A7870',fontWeight:500,lineHeight:1}}>{timerPaused?'En pause':'En cours'}</span>
                <span style={{fontSize:13,color:timerPaused?T.warning:'#ECEAE3',fontWeight:600,lineHeight:1}}>{timerClient?.name||'—'}</span>
              </div>
              <div className="mono" style={{fontSize:18,fontWeight:400,color:timerPaused?T.warning:T.accent,letterSpacing:2,padding:'0 4px',animation:timerPaused?'none':'blink 2.5s ease infinite'}}>{fmtTimer(timerSeconds)}</div>
              <div style={{display:'flex',gap:6}}>
                {!timerPaused?(
                  <button onClick={timerActions.pause} style={{background:'#FFFFFF15',border:'1px solid #FFFFFF20',borderRadius:20,padding:'4px 12px',color:'#ECEAE3',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}} onMouseEnter={e=>e.currentTarget.style.background='#FFFFFF25'} onMouseLeave={e=>e.currentTarget.style.background='#FFFFFF15'}>⏸ Pause</button>
                ):(
                  <button onClick={timerActions.resume} style={{background:T.accent+'20',border:`1px solid ${T.accent}50`,borderRadius:20,padding:'4px 12px',color:T.accent,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}} onMouseEnter={e=>e.currentTarget.style.opacity='.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>▶ Reprendre</button>
                )}
                <button onClick={()=>setPage('timer')} style={{background:'#FFFFFF10',border:'1px solid #FFFFFF15',borderRadius:20,padding:'4px 12px',color:'#A8A5A0',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}} onMouseEnter={e=>e.currentTarget.style.color='#ECEAE3'} onMouseLeave={e=>e.currentTarget.style.color='#A8A5A0'}>Voir →</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
