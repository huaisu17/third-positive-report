import {createCampaignStore,mountInvestigationDrawer,trackDiscovery} from './state-sync.js';
import {MATERIALS,esc,localURL} from './registry.js';
export {esc,localURL};
export async function start(site){
 let store;try{store=await createCampaignStore();}catch(error){const warning=document.createElement('p');warning.setAttribute('role','alert');warning.textContent='本机存储初始化失败，请允许本地存储后重试。';document.body.append(warning);throw error;}
 const notebook=await mountInvestigationDrawer(store,{site});await trackDiscovery(store,{site});
 const timers=new Map(),seen=new Set();let observer;
 const stop=target=>{clearTimeout(timers.get(target));timers.delete(target);};
 const snapshot=target=>({text:(target.dataset.snapshot||target.innerText||target.getAttribute('aria-label')||MATERIALS[target.dataset.read]?.title||'').slice(0,16000),url:location.pathname+location.search+location.hash});
 function arm(target){const id=target.dataset.read;if(!MATERIALS[id]||store.get().evidence[id]||timers.has(target)||document.visibilityState!=='visible'||!document.hasFocus())return;timers.set(target,setTimeout(async()=>{timers.delete(target);const r=target.getBoundingClientRect();if(target.isConnected&&document.visibilityState==='visible'&&document.hasFocus()&&r.bottom>0&&r.top<innerHeight){await store.collect(id,snapshot(target));}},1500));}
 observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting&&e.intersectionRatio>=.5){seen.add(e.target);arm(e.target);}else{seen.delete(e.target);stop(e.target);}}},{threshold:[0,.5,1]});
 function bindReading(root=document){for(const node of root.querySelectorAll('[data-read]'))observer.observe(node);}
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')for(const t of timers.keys())stop(t);else for(const target of seen)arm(target);});
 window.addEventListener('blur',()=>{for(const t of timers.keys())stop(t);});window.addEventListener('focus',()=>{for(const target of seen)arm(target);});
 document.addEventListener('click',async e=>{const target=e.target.closest('[data-collect]');if(target)await store.collect(target.dataset.collect,{text:target.closest('[data-snapshot]')?.dataset.snapshot||target.closest('tr')?.innerText||target.innerText,url:location.pathname+location.search});const image=e.target.closest('[data-preview]');if(image)preview(image.dataset.preview);});
 function preview(id){const m=MATERIALS[id];if(!m?.asset)return;const d=document.createElement('dialog');d.className='document-preview';d.innerHTML=`<div class="preview-controls"><strong>${esc(m.title)}</strong><button type="button" aria-label="关闭原件">关闭 ×</button></div><div class="preview-image" data-read="${id}" data-snapshot="${esc(m.title+'；原件编号：'+(id==='reportBy'?'QH250315063':'匿名收稿')+'；检测13C，DOB 9.6，阳性。')}"><img src="${localURL('assets/'+m.asset)}" alt="${esc(m.title)}"></div>`;document.body.append(d);d.showModal();bindReading(d);d.querySelector('button').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close();});d.addEventListener('close',()=>{for(const target of d.querySelectorAll('[data-read]')){observer.unobserve(target);seen.delete(target);stop(target);}d.remove();});}
 bindReading();return {store,notebook,bindReading};
}
