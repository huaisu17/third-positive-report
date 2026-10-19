import {siteForLocalLink,SITE_NAMES} from './site-address.js?v=44';
import {ARG_SAVE_KEY,freshArgState,sanitizeArgState,mergeArgStates,sameState,migrateLegacy,act} from './arg-engine.js?v=44';
import {mountPinboard} from './arg-pinboard.js?v=44';
export {ARG_SAVE_KEY};
// Every active page writes this one document. Legacy keys are read once only.
export function createStateStore({storage,events=globalThis.window,actor=globalThis.crypto?.randomUUID?.()||'tab-'+Math.random().toString(36).slice(2)}={}){
 let available=true,state=freshArgState();const subscribers=new Set();try{storage=storage||globalThis.localStorage;}catch{storage=null;available=false;}
 function read(){try{return sanitizeArgState(storage.getItem(ARG_SAVE_KEY));}catch{available=false;return state;}}
 try{const raw=storage.getItem(ARG_SAVE_KEY);state=raw?sanitizeArgState(raw):migrateLegacy(storage.getItem('qinghe.third-report.v1'));if(!raw){try{const oldNote=JSON.parse(storage.getItem('qinghe.presentation.v1'));if(typeof oldNote?.note==='string')state.notes.personal={value:oldNote.note.slice(0,4000),tick:1,actor:'legacy-migration'};}catch{}}if(!raw||raw!==JSON.stringify(state))storage.setItem(ARG_SAVE_KEY,JSON.stringify(state));}catch{available=false;}
 function emit(meta){for(const fn of subscribers)fn(state,{...meta,available});}
 function persist(){try{storage.setItem(ARG_SAVE_KEY,JSON.stringify(state));available=true;}catch{available=false;}}
 function dispatch(type,payload){const draft=mergeArgStates(state,read()),stamp={tick:draft.clock+1,actor};const result=act(draft,type,payload,stamp);if(result.ok&&!sameState(state,draft)){state=draft;persist();emit({kind:type,result});}return result;}
 function receive(event){if(event.key!==ARG_SAVE_KEY&&event.key!==null)return;if(event.newValue===null){state=freshArgState();emit({kind:'storage-reset'});return;}const merged=mergeArgStates(mergeArgStates(state,sanitizeArgState(event.newValue)),read());if(!sameState(state,merged)){state=merged;emit({kind:'storage'});}if(!sameState(state,read()))persist();}
 events?.addEventListener('storage',receive);
 return {get:()=>state,dispatch,subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn);},available:()=>available,dispose(){events?.removeEventListener('storage',receive);subscribers.clear();}};
}
export function trackSiteDiscovery(store,{site,document:doc=document,window:win=window,onArrival=()=>{}}={}){
 store.dispatch('discover',{site});
 const arrival=new URL(win.location.href);if(arrival.hash==='#site-added='+site){onArrival('已将【'+SITE_NAMES[site]+'】添加至调查书签');arrival.hash='';win.history.replaceState(win.history.state,'',arrival.href);}
 const visit=event=>{if(event.defaultPrevented||event.type==='click'&&event.button>0||event.type==='auxclick'&&event.button!==1)return;const link=event.target?.closest?.('a[href]');if(!link||link.hasAttribute('download'))return;const original=link.getAttribute('href'),target=siteForLocalLink(original,{site,currentURL:win.location.href});if(!target)return;const added=!store.get().discovered_sites.includes(target);store.dispatch('discover',{site:target});if(added){const url=new URL(original,win.location.href);url.hash='site-added='+target;link.setAttribute('href',url.href);setTimeout(()=>link.setAttribute('href',original),0);}};
 doc.addEventListener('click',visit);doc.addEventListener('auxclick',visit);return ()=>{doc.removeEventListener('click',visit);doc.removeEventListener('auxclick',visit);};
}
export function mountInvestigationDrawer(store,{site=document.body.dataset.site||'forum'}={}){const pocket=mountPinboard(store,{site});trackSiteDiscovery(store,{site,onArrival:pocket.feedback});return pocket;}
