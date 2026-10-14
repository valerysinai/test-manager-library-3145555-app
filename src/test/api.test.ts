import {describe,it,expect,vi,afterEach} from 'vitest';
import {Api,ApiError,query} from '../api';
const token=()=> 'fixture-'+crypto.randomUUID();
afterEach(()=>vi.unstubAllGlobals());
describe('HTTP contract and transport',()=>{
  it('uses exact paths, Bearer and untrimmed JSON without cookies or redirects',async()=>{
    const credential=token();const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json'}}));vi.stubGlobal('fetch',fetcher);
    const api=new Api('https://api.example.test/api/v1',()=>credential,vi.fn());
    await api.call('/auth/login',{method:'POST',body:{username:' ANA ',password:credential+' '}});
    const [url,options]=fetcher.mock.calls[0];expect(String(url)).toBe('https://api.example.test/api/v1/auth/login');expect(options.headers.get('Authorization')).toBe('Bearer '+credential);expect(JSON.parse(options.body).password).toBe(credential+' ');expect(options.credentials).toBe('omit');expect(options.redirect).toBe('error');
    expect(query({q:'Título & autor',page:2,size:20,category_id:''})).toBe('?q=T%C3%ADtulo+%26+autor&page=2&size=20');
  });
  it('rejects insecure and credential-bearing origins before sending data',async()=>{
    const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);
    for(const base of ['http://localhost/api/v1','https://user:pass@example.test/api/v1']) await expect(new Api(base,()=>null,vi.fn()).call('/auth/login',{method:'POST',body:{}})).rejects.toMatchObject({code:'TRANSPORT_REQUIRED'});
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('lets the browser create multipart boundaries and handles binary and 204',async()=>{
    const fetcher=vi.fn().mockResolvedValueOnce(new Response(null,{status:204})).mockResolvedValueOnce(new Response('image',{headers:{'Content-Type':'image/png'}}));vi.stubGlobal('fetch',fetcher);const api=new Api('/api/v1',token,vi.fn());const form=new FormData();form.set('file',new File(['image'],'opaque.png'));
    expect(await api.call('/books/id/cover',{method:'PUT',body:form})).toBeUndefined();expect(fetcher.mock.calls[0][1].headers.has('Content-Type')).toBe(false);expect(fetcher.mock.calls[0][1].body).toBe(form);expect(await api.call('/books/id/cover',{binary:true})).toBeInstanceOf(Blob);
  });
  it('expires authenticated sessions on 401 and hides non-contract server output',async()=>{
    const expired=vi.fn();vi.stubGlobal('fetch',vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({code:'UNAUTHENTICATED',message:'Se requiere una autenticación válida.',details:[]}),{status:401})).mockResolvedValueOnce(new Response('<private internal trace>',{status:500})));
    const api=new Api('/api/v1',token,expired);await expect(api.call('/books')).rejects.toMatchObject({status:401,code:'UNAUTHENTICATED'});expect(expired).toHaveBeenCalledOnce();await expect(api.call('/books')).rejects.toEqual(new ApiError(500,'HTTP_ERROR','No se pudo completar la operación.'));
  });
});
