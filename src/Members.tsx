import {useState} from 'react';
import {Api,query} from './api';
import type {Member,Page} from './types';
import {ActionForm,Failure,Field,Loading,Pager,Panel,text,useLoad} from './ui';
function MemberDetail({api,id}:{api:Api;id:string}){const {data,error,loading}=useLoad<Member>(s=>api.call(`/members/${id}`,{signal:s}),[api,id]);return <Panel title="Detalle del socio"><Failure error={error}/>{loading&&<Loading/>}{data&&<><h3>{data.full_name}</h3><p>Documento: {data.document_number}</p><p>Libros sin devolver: <strong>{data.active_loans}</strong></p></>}</Panel>;}
export function Members({api}:{api:Api}){
  const [filters,setFilters]=useState({q:'',page:1});const [revision,setRevision]=useState(0);const [creating,setCreating]=useState(false);const [selected,setSelected]=useState<string>();
  const {data,error,loading}=useLoad<Page<Member>>(s=>api.call('/members'+query({...filters,size:20}),{signal:s}),[api,filters,revision]);
  return <><div className="section-heading"><div><p className="eyebrow">LA COMUNIDAD</p><h1>Socios</h1><p className="muted">Consulta los socios de la biblioteca.</p></div><button className="primary" onClick={()=>setCreating(v=>!v)}>Nuevo socio</button></div>
    {creating&&<Panel title="Registrar socio"><ActionForm onDone={()=>{setCreating(false);setRevision(n=>n+1);}} onSubmit={f=>api.call('/members',{method:'POST',body:{full_name:text(f,'full_name'),document_number:text(f,'document_number')}})}><div className="form-grid"><Field label="Nombre completo"><input name="full_name" required maxLength={200}/></Field><Field label="Documento"><input name="document_number" required maxLength={30}/></Field></div></ActionForm></Panel>}
    <form className="filters" onSubmit={e=>{e.preventDefault();setFilters({q:text(new FormData(e.currentTarget),'q'),page:1});}}><Field label="Buscar por nombre o documento"><input type="search" name="q"/></Field><button>Buscar</button></form>
    <Failure error={error}/>{loading&&<Loading/>}{data&&<><div className="table-wrap"><table><thead><tr><th>Socio</th><th>Documento</th><th>Consulta</th></tr></thead><tbody>{data.items.map(m=><tr key={m.id}><td>{m.full_name}</td><td>{m.document_number}</td><td><button onClick={()=>setSelected(m.id)}>Ver detalle</button></td></tr>)}</tbody></table></div>{data.items.length===0&&<p className="empty">No hay socios para esta búsqueda.</p>}<Pager data={data} onPage={page=>setFilters({...filters,page})}/></>}{selected&&<MemberDetail api={api} id={selected}/>}</>;
}
