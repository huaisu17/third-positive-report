import {ARG_SAVE_KEY,freshArgState,sanitizeArgState,mergeArgStates,sameState,migrateLegacy,act} from './arg-engine.js?v=42';
import {mountPinboard} from './arg-pinboard.js?v=42';
export {ARG_SAVE_KEY};
// Every active page writes this one document. Legacy keys are read once only.
export function createStateStore({storage,events=globalThis.window,actor=globalThis.crypto?.randomUUID?.()||'tab-'+Math.random().toString(36).slice(2)}={}){
 let available=true,state=freshArgState();const subscribers=new Set();try{storage=storage||globalThis.localStorage;}catch{storage=null;available=false;}
 function read(){try{return sanitizeArgState(storage.getItem(ARG_SAVE_KEY));}catch{available=false;return state;}}
 try{const raw=storage.getItem(ARG_SAVE_KEY);state=raw?sanitizeArgState(raw):migrateLegacy(storage.getItem('qinghe.third-report.v1'));if(!raw){try{const oldNote=JSON.parse(storage.getItem('qinghe.presentation.v1'));if(typeof oldNote?.note==='string')state.notes.personal={value:oldNote.note.slice(0,4000),tick:1,actor:'legacy-migration'};}catch{}}if(!raw)storage.setItem(ARG_SAVE_KEY,JSON.stringify(state));}catch{available=false;}
 function emit(meta){for(const fn of subscribers)fn(state,{...meta,available});}
 function persist(){try{storage.setItem(ARG_SAVE_KEY,JSON.stringify(state));available=true;}catch{available=false;}}
 function dispatch(type,payload){const draft=mergeArgStates(state,read()),stamp={tick:draft.clock+1,actor};const result=act(draft,type,payload,stamp);if(result.ok&&!sameState(state,draft)){state=draft;persist();emit({kind:type,result});}return result;}
 function receive(event){if(event.key!==ARG_SAVE_KEY&&event.key!==null)return;if(event.newValue===null){state=freshArgState();emit({kind:'storage-reset'});return;}const merged=mergeArgStates(mergeArgStates(state,sanitizeArgState(event.newValue)),read());if(!sameState(state,merged)){state=merged;emit({kind:'storage'});}if(!sameState(state,read()))persist();}
 events?.addEventListener('storage',receive);
 return {get:()=>state,dispatch,subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn);},available:()=>available,dispose(){events?.removeEventListener('storage',receive);subscribers.clear();}};
}
export function mountInvestigationDrawer(store,{site=document.body.dataset.site||'forum'}={}){return mountPinboard(store,{site});}
