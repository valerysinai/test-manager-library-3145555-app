import {useEffect,useState} from 'react';
import {Api,query} from './api';
import type {Book,Category,Page,Role} from './types';
import {ActionForm,Failure,Field,Loading,Pager,Panel,text,useLoad} from './ui';
function Cover({api,book}:{api:Api;book:Book}){
  const [url,setUrl]=useState<string>();const [error,setError]=useState<unknown>();
  useEffect(()=>{const c=new AbortController();let objectUrl:string|undefined;setUrl(undefined);setError(undefined);
    if(book.cover_key)api.call<Blob>(`/books/${book.id}/cover`,{binary:true,signal:c.signal}).then(blob=>{if(!c.signal.aborted){objectUrl=URL.createObjectURL(blob);setUrl(objectUrl);}}).catch(e=>{if(!c.signal.aborted)setError(e);});
    return ()=>{c.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};},[api,book]);
  return <><Failure error={error}/>{url?<img className="cover" src={url} alt={`Portada de ${book.title}`}/>:<div className="cover empty-cover" aria-label="Sin portada">LIBRARY<br/><span>Sin portada</span></div>}</>;
}
function BookForm({api,book,categories,onDone}:{api:Api;book?:Book;categories:Category[];onDone:()=>void}){
  return <Panel title={book?'Editar libro':'Nuevo libro'}><ActionForm onDone={onDone} onSubmit={f=>api.call(book?`/books/${book.id}`:'/books',{method:book?'PUT':'POST',body:{title:text(f,'title'),author:text(f,'author'),category_id:text(f,'category_id'),total_copies:Number(text(f,'total_copies')),...(!book?{isbn:text(f,'isbn')}:{})}})}>
    <div className="form-grid"><Field label="Título"><input name="title" required maxLength={250} defaultValue={book?.title}/></Field><Field label="Autor"><input name="author" required maxLength={200} defaultValue={book?.author}/></Field>
    {!book&&<Field label="ISBN (13 dígitos)"><input name="isbn" required pattern="[0-9]{13}" maxLength={13} inputMode="numeric"/></Field>}
    <Field label="Categoría"><select name="category_id" required defaultValue={book?.category.id??''}><option value="" disabled>Selecciona una categoría</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
    <Field label="Total de ejemplares"><input name="total_copies" type="number" required min={1} step={1} defaultValue={book?.total_copies??1}/></Field></div>
    {book&&<p className="muted">ISBN: {book.isbn}. Los disponibles se ajustan según los préstamos abiertos.</p>}
  </ActionForm><button className="quiet" onClick={onDone}>Cancelar</button></Panel>;
}
function BookDetail({api,id,role,categories,onChange,onClose}:{api:Api;id:string;role:Role;categories:Category[];onChange:()=>void;onClose:()=>void}){
  const [revision,setRevision]=useState(0);const [edit,setEdit]=useState(false);const [deleting,setDeleting]=useState(false);
  const {data:book,error,loading}=useLoad<Book>(s=>api.call(`/books/${id}`,{signal:s}),[api,id,revision]);
  function changed(){setRevision(n=>n+1);onChange();}
  if(loading)return <Loading/>;if(!book)return <Failure error={error}/>;
  if(edit)return <BookForm api={api} book={book} categories={categories} onDone={()=>{setEdit(false);changed();}}/>;
  return <Panel title={book.title}><button className="quiet" onClick={onClose}>Cerrar detalle</button><div className="book-detail"><Cover api={api} book={book}/><div><p className="eyebrow">{book.category.name}</p><h3>{book.author}</h3><p>ISBN {book.isbn}</p><p><strong>{book.available_copies}</strong> disponibles de {book.total_copies} ejemplares</p>
    {role==='admin'&&<><button onClick={()=>setEdit(true)}>Editar libro</button><button className="danger" onClick={()=>setDeleting(v=>!v)}>Dar de baja</button>{deleting&&<ActionForm label="Confirmar baja" onDone={()=>{onChange();onClose();}} onSubmit={()=>api.call(`/books/${id}`,{method:'DELETE'})}><p>El libro saldrá del catálogo. Su historial se conservará.</p></ActionForm>}
    <ActionForm label="Guardar portada" onDone={changed} onSubmit={f=>{const form=new FormData();form.set('file',f.get('file')!);return api.call(`/books/${id}/cover`,{method:'PUT',body:form});}}><Field label="Portada JPEG o PNG · máximo 2 MB"><input name="file" type="file" accept="image/jpeg,image/png" required/></Field></ActionForm>
    {book.cover_key&&<ActionForm label="Quitar portada" onDone={changed} onSubmit={()=>api.call(`/books/${id}/cover`,{method:'DELETE'})}><span/></ActionForm>}</>}
  </div></div></Panel>;
}
export function Books({api,role}:{api:Api;role:Role}){
  const [filters,setFilters]=useState({q:'',category_id:'',page:1});const [revision,setRevision]=useState(0);const [selected,setSelected]=useState<string>();const [creating,setCreating]=useState(false);
  const categories=useLoad<{items:Category[]}>(s=>api.call('/categories',{signal:s}),[api]);
  const {data,error,loading}=useLoad<Page<Book>>(s=>api.call('/books'+query({...filters,size:12}),{signal:s}),[api,filters,revision]);
  return <><div className="section-heading"><div><p className="eyebrow">LA COLECCIÓN</p><h1>Catálogo de libros</h1><p className="muted">Encuentra una lectura y consulta sus ejemplares.</p></div>{role==='admin'&&<button className="primary" onClick={()=>setCreating(v=>!v)}>Nuevo libro</button>}</div>
    <Failure error={categories.error}/>{creating&&categories.data&&<BookForm api={api} categories={categories.data.items} onDone={()=>{setCreating(false);setRevision(n=>n+1);}}/>}
    <form className="filters" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);setFilters({q:text(f,'q'),category_id:text(f,'category_id'),page:1});}}>
      <Field label="Buscar por título o autor"><input name="q" type="search" placeholder="¿Qué libro buscas?"/></Field><Field label="Categoría"><select name="category_id"><option value="">Todas las categorías</option>{categories.data?.items.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><button type="submit">Buscar</button></form>
    <Failure error={error}/>{loading&&<Loading/>}{data&&<><div className="book-grid">{data.items.map((book,i)=><button className="book-card" key={book.id} onClick={()=>setSelected(book.id)}><div className={'book-spine tone-'+i%4}><span>{book.category.name}</span><strong>{book.title}</strong><small>{book.author}</small></div><div className="book-meta"><h2>{book.title}</h2><p>{book.author}</p><span className={book.available_copies?'badge':'badge unavailable'}>{book.available_copies?`${book.available_copies} disponibles`:'Sin ejemplares'}</span></div></button>)}</div>{data.items.length===0&&<p className="empty">No se encontraron libros. Prueba otra búsqueda.</p>}<Pager data={data} onPage={page=>setFilters({...filters,page})}/></>}
    {selected&&<BookDetail key={selected} api={api} id={selected} role={role} categories={categories.data?.items??[]} onChange={()=>setRevision(n=>n+1)} onClose={()=>setSelected(undefined)}/>}
  </>;
}
