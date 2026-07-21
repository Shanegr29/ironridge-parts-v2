'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const bg='#1a1f2e',bgMid='#252b3b',bgL='#2f3750',txt='#e8eaf0',dim='#a8b2c4',amb='#f59e0b',bdr='1px solid rgba(255,255,255,0.07)'

const GC:Record<string,string>={A_tested_working:'#22c55e',B_takeout_untested:amb,C_for_parts_or_repair:'#f97316',D_core_only:'#ef4444'}
const GL:Record<string,string>={A_tested_working:'A',B_takeout_untested:'B',C_for_parts_or_repair:'C',D_core_only:'D'}
const SL:Record<string,string>={pulled_not_listed:'In Stock',listed:'Listed',sold:'Sold',shipped:'Shipped',reserved:'Reserved',returned:'Returned',scrapped:'Scrapped'}
const SC:Record<string,string>={pulled_not_listed:'#22c55e',listed:'#3b82f6',sold:dim,shipped:'#22c55e',reserved:amb,returned:'#ef4444',scrapped:dim}

const STATUS_FILTERS=[['all','All'],['pulled_not_listed','In Stock'],['listed','Listed'],['reserved','Reserved'],['sold','Sold']]
const GRADE_FILTERS=[['all','Grade'],['A_tested_working','A'],['B_takeout_untested','B'],['C_for_parts_or_repair','C'],['D_core_only','D']]

export default function PartsPage() {
  const [parts, setParts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [statusF, setStatusF] = useState('all')
  const [gradeF, setGradeF] = useState('all')

  useEffect(() => {
    const load = async () => {
      const sb = createClient()
      const { data } = await (sb.from('part_full') as any).select('*').neq('status','scrapped').order('created_at',{ascending:false})
      setParts(data||[])
      setLoading(false)
    }
    load()
  }, [])

  const available = parts.filter(p=>p.status==='pulled_not_listed').length
  const listed = parts.filter(p=>p.status==='listed').length
  const sold = parts.filter(p=>p.status==='sold'||p.status==='shipped').length

  const ql = q.trim().toLowerCase()
  const filtered = parts.filter(p=>{
    if (statusF!=='all' && p.status!==statusF) return false
    if (gradeF!=='all' && p.condition_grade!==gradeF) return false
    if (ql) {
      const hay=[p.part_type,p.part_subtype,p.oem_part_number,p.description,p.lift_make,p.lift_model,p.bin_label,...(p.compatible_models||[])].filter(Boolean).join(' ').toLowerCase()
      if (!hay.includes(ql)) return false
    }
    return true
  })

  const chip=(active:boolean)=>({padding:'8px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:600,whiteSpace:'nowrap' as any,cursor:'pointer',flexShrink:0,border:active?'1px solid rgba(245,158,11,0.3)':bdr,background:active?'rgba(245,158,11,0.12)':bgMid,color:active?amb:dim})

  return (
    <div style={{minHeight:'100dvh',background:bg,paddingBottom:'90px'}}>
      <div style={{padding:'14px 16px 12px',background:'#111520',borderBottom:bdr,position:'sticky',top:0,zIndex:30}}>
        <div style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:900,fontSize:'20px',color:amb,letterSpacing:'1px',textTransform:'uppercase'}}>⬡ IronRidge</div>
        <div style={{fontSize:'10px',color:dim,letterSpacing:'2px',textTransform:'uppercase'}}>Parts Inventory</div>
      </div>

      <div style={{padding:'16px'}}>
        <div style={{display:'flex',gap:'12px',marginBottom:'16px'}}>
          <div style={{flex:1,background:bgMid,border:bdr,borderRadius:'8px',padding:'12px',textAlign:'center'}}>
            <div style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:700,fontSize:'24px',color:'#22c55e'}}>{available}</div>
            <div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'1px',color:dim,marginTop:'2px'}}>In Stock</div>
          </div>
          <div style={{flex:1,background:bgMid,border:bdr,borderRadius:'8px',padding:'12px',textAlign:'center'}}>
            <div style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:700,fontSize:'24px',color:'#3b82f6'}}>{listed}</div>
            <div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'1px',color:dim,marginTop:'2px'}}>Listed</div>
          </div>
          <div style={{flex:1,background:bgMid,border:bdr,borderRadius:'8px',padding:'12px',textAlign:'center'}}>
            <div style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:700,fontSize:'24px',color:dim}}>{sold}</div>
            <div style={{fontSize:'10px',textTransform:'uppercase',letterSpacing:'1px',color:dim,marginTop:'2px'}}>Sold</div>
          </div>
        </div>

        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search part, OEM #, lift, model..." style={{width:'100%',height:'52px',padding:'0 16px',background:bgL,border:bdr,borderRadius:'8px',color:txt,fontSize:'16px',outline:'none',marginBottom:'12px'}}/>

        <div style={{display:'flex',gap:'8px',overflowX:'auto',marginBottom:'8px'}} className="no-scrollbar">
          {STATUS_FILTERS.map(([v,l])=><div key={v} onClick={()=>setStatusF(v)} style={chip(statusF===v)}>{l}</div>)}
        </div>
        <div style={{display:'flex',gap:'8px',overflowX:'auto',marginBottom:'16px'}} className="no-scrollbar">
          {GRADE_FILTERS.map(([v,l])=><div key={v} onClick={()=>setGradeF(v)} style={chip(gradeF===v)}>{l}</div>)}
        </div>

        <div style={{fontSize:'12px',color:dim,marginBottom:'10px'}}>{filtered.length} {filtered.length===1?'part':'parts'}</div>

        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:dim}}>Loading...</div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:'center',padding:'48px 16px',color:dim}}>
            <div style={{fontSize:'32px',marginBottom:'8px'}}>▦</div>
            <div style={{fontSize:'14px'}}>{parts.length===0?'No parts yet.':'No parts match.'}</div>
          </div>
        ) : (
          <div style={{background:bgMid,border:bdr,borderRadius:'8px',overflow:'hidden'}}>
            {filtered.map((p:any,i:number)=>{
              const gc=GC[p.condition_grade]||dim
              const gl=GL[p.condition_grade]||'?'
              const sc=SC[p.status]||dim
              const sl=SL[p.status]||p.status
              return (
                <a key={p.id} href={'/parts/'+p.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'13px 14px',borderTop:i>0?bdr:'none',textDecoration:'none'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'6px',background:gc+'25',color:gc,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Barlow Condensed,sans-serif',fontWeight:900,fontSize:'16px',flexShrink:0}}>{gl}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:'14px',color:txt,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.part_type}{p.part_subtype?' — '+p.part_subtype:''}</div>
                    <div style={{fontSize:'11px',color:dim,marginTop:'2px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.lift_make} {p.lift_model} · {p.bin_label||'No location'}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontFamily:'Barlow Condensed,sans-serif',fontWeight:700,fontSize:'16px',color:txt}}>{p.asking_price?'$'+p.asking_price:'—'}</div>
                    <div style={{fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px',color:sc,marginTop:'2px'}}>{sl}</div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
