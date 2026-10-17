import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {freshArgState,sanitizeArgState,mergeArgStates,sameState,act,truth,owned,truthy,canRead,migrateLegacy,siteURL,ARG_SAVE_KEY} from '../dist/arg-engine.js';
import {EVIDENCE,REQUIRED_FIRST,AUDIT_EDGES,CLIPS,SPRING_BV,AUTUMN_BV} from '../dist/arg-content.js';
import {createStateStore} from '../dist/state-sync.js';
import {frameIndex,danmakuAt,createMockPlayer} from '../dist/video/mock-player.js';
import {decryptArchive} from '../dist/archive-crypto.js';
import {translateLegacy} from '../dist/legacy-entry.js';
import {freshState as oldFresh,parseSave as oldParse} from '../dist/engine.js';
const apply=(s,type,p)=>act(s,type,p,{tick:s.clock+1,actor:'test'});
function collect(s,...ids){for(const id of ids)assert.equal(apply(s,'collect',{id}).ok,true,id);}
function firstLayer(s){collect(s,'reportBy','reportUnknown','source','printing','printerFrame','leaveClaim');assert.equal(apply(s,'login',{account:'azhe',password:' HS032316 '}).ok,true);collect(s,'submission');assert.equal(apply(s,'share',{folder:'spring',code:'0314XSH'}).ok,true);collect(s,'printerRegister');assert.equal(apply(s,'compare',{marks:['fold','circle']}).ok,true);assert.equal(truth(s).firstReady,true);assert.equal(truth(s).first,false);assert.equal(apply(s,'confront').ok,true);}
function clinic(s){collect(s,'authorization','oldpost','radio');assert.equal(apply(s,'recover',{song:'夜空中最亮的星'}).ok,true);}
function restoreDraft(s){collect(s,'cache');assert.equal(apply(s,'restore',{fragments:['d2-head','d2-tail']}).ok,true);}
function timeline(s){collect(s,'roster','swipe','attendance','signoff');assert.equal(apply(s,'timeline',{roster:'m4',swipe:'s3',attendance:'a2',signoff:'r2',explanation:'proxy'}).ok,true);}
function medical(s){collect(s,'medical','medication','summary');assert.equal(apply(s,'medical',{patient:'R07',repeat:'0329',interpretation:'unreliable',batch:'unknown'}).ok,true);}
const envelope=JSON.parse(fs.readFileSync(new URL('../dist/assets/L-0313.enc.json',import.meta.url),'utf8'));

test('four independently bootable HTML documents load their own entry script and no pseudo desktop or chapter runtime',()=>{
 const entries=[['index.html','forum.js'],['canteen/index.html','site.js'],['video/index.html','site.js'],['pan/index.html','site.js']];
 for(const [path,script]of entries){const html=fs.readFileSync(new URL('../dist/'+path,import.meta.url),'utf8');assert.match(html,/<main id="app"/);assert.ok(html.includes(`src="${script}?v=42"`));assert.doesNotMatch(html,/data-site-switch|appWindow|window-titlebar|addressForm|src="app\.js/);const base=new URL('../dist/'+path,import.meta.url);for(const [,url]of html.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^\"]*)?"/g))if(!url.includes('://'))assert.ok(fs.existsSync(new URL(url,base)),path+' '+url);}
 const from=['forum','canteen','video','pan'];for(const origin of from)for(const target of from){const rel=siteURL(target,{view:'test'},origin),base=new URL(origin==='forum'?'https://x.test/project/index.html':`https://x.test/project/${origin}/index.html`);assert.equal(new URL(rel,base).pathname,'/project/'+(target==='forum'?'index.html':target+'/index.html'));assert.ok(!rel.startsWith('/'));}
 for(const id of Object.keys(EVIDENCE)){const d=EVIDENCE[id];assert.ok(from.includes(d.site),id);const target=siteURL(d.site,d.params,'pan');assert.ok(target.includes('index.html'),id);}
});

test('active UI import names resolve and no active page writes another storage key or contains next-chapter routing',()=>{
 const active=['forum.js','canteen/site.js','video/site.js','pan/site.js','state-sync.js','arg-pinboard.js','arg-ui.js','arg-engine.js','arg-content.js','video/mock-player.js'];
 const ui=fs.readFileSync(new URL('../dist/arg-ui.js',import.meta.url),'utf8'),exports=new Set([...ui.matchAll(/export (?:const|function) (\w+)/g)].map(m=>m[1]));for(const list of ui.matchAll(/export \{([^}]+)\}/g))for(const item of list[1].split(','))exports.add(item.trim().split(/\s+as\s+/).at(-1));
 for(const name of active){const s=fs.readFileSync(new URL('../dist/'+name,import.meta.url),'utf8');assert.doesNotMatch(s,/#chapter\/|#annex\/|caseStage\+\+|下一章|下一题/);for(const [,names]of s.matchAll(/import \{([^}]+)\} from ['"](?:\.\.\/)?(?:\.\/)?arg-ui\.js[^'"]*['"]/g))for(const spec of names.split(','))assert.ok(exports.has(spec.trim().split(/\s+as\s+/)[0]),name+' imports '+spec);if(name!=='state-sync.js')assert.doesNotMatch(s,/localStorage\.(?:setItem|removeItem)/);}
 assert.equal(ARG_SAVE_KEY,'qinghe_arg_save');
});

test('first truth needs independent identity, original submission, printing contact and unique image features',()=>{
 const s=freshArgState();assert.equal(apply(s,'confront').ok,false);collect(s,'printerFrame','leaveClaim');assert.equal(apply(s,'confront').ok,false);assert.equal(truth(s).first,false);firstLayer(s);assert.equal(truth(s).first,true);assert.equal(canRead(s,'authorization'),true);
 const before=freshArgState();assert.equal(canRead(before,'medical'),false);assert.equal(canRead(before,'submission'),false);assert.equal(canRead(before,'printerRegister'),false);assert.equal(canRead(before,'auditReview'),false);
 const broken=sanitizeArgState(s);delete broken.evidence.printerRegister;delete broken.actions.confronted;assert.equal(truth(broken).firstReady,false);
});

test('new spring video aligns with March absence; autumn photo puzzle keeps its original year',()=>{
 assert.equal(CLIPS[SPRING_BV].danmaku.length,9);assert.equal(CLIPS[AUTUMN_BV].danmaku.length,8);assert.match(CLIPS[SPRING_BV].danmaku.find(d=>d.at===84).text,/陈叙.*打印机/);
 for(const clip of Object.values(CLIPS))for(let i=1;i<=4;i++){const src=fs.readFileSync(new URL(`../dist/video/frames/${clip.prefix}-0${i}.svg`,import.meta.url),'utf8');assert.match(src,clip.id===SPRING_BV?/2025.03.14/:/2024.10.18/);assert.ok(Buffer.byteLength(src)<18000);if(i===3&&clip.id===SPRING_BV)assert.match(src,/QH-P02 打印机|学生会器材处 XSH/);}
 assert.equal(frameIndex(0,[0,26,78,108]),0);assert.equal(frameIndex(84,[0,26,78,108]),2);assert.equal(frameIndex(132,[0,26,78,108]),3);assert.equal(danmakuAt(CLIPS[SPRING_BV].danmaku,84).some(d=>d.at===84),true);assert.equal(danmakuAt(CLIPS[SPRING_BV].danmaku,92).some(d=>d.at===84),false);
});

test('medical, attendance and audit branches can be explored in either order without a chapter counter',async()=>{
 for(const order of [['vault','medical','timeline'],['timeline','medical','vault']]){let s=freshArgState();firstLayer(s);clinic(s);restoreDraft(s);for(const branch of order){if(branch==='vault'){collect(s,'blackboard');const payload=await decryptArchive(envelope,'20240912');assert.ok(Buffer.from(payload.xlsx,'base64').includes(Buffer.from('结算附页')));assert.ok(Buffer.from(payload.xlsx,'base64').includes(Buffer.from('JS0319-01')));assert.equal(apply(s,'vault',{payload}).ok,true);collect(s,'outage','lab-original','lab-edited','contract','settlement');}else if(branch==='medical')medical(s);else timeline(s);s=sanitizeArgState(JSON.stringify(s));}
  assert.equal(truth(s).second,true);for(const edge of [...AUDIT_EDGES].reverse())assert.equal(apply(s,'link',edge).ok,true,edge.key);assert.equal(truth(s).links,5);assert.equal(apply(s,'ending',{choice:'B'}).ok,false,'review required');collect(s,'auditReview');assert.equal(truth(s).auditReady,true);assert.equal(apply(s,'ending',{choice:'B'}).ok,true);assert.equal(truthy(sanitizeArgState(JSON.stringify(s)),'actions','endingB'),true);
 }
});

test('compromise never clears material; wrong credentials, cache versions, medicine guesses and crypto do not advance',async()=>{
 const s=freshArgState();assert.equal(apply(s,'login',{account:'yida',password:'1018'}).ok,false);assert.equal(apply(s,'share',{folder:'spring',code:'0316XSH'}).ok,false);assert.equal(apply(s,'vault',{payload:{rows:[],columns:[],xlsx:'fake'}}).ok,false);firstLayer(s);collect(s,'summary');assert.equal(apply(s,'ending',{choice:'A'}).ok,true);const held=Object.keys(s.evidence);clinic(s);collect(s,'cache','medical','medication');assert.equal(apply(s,'restore',{fragments:['d2-head','d1-tail']}).ok,false);assert.equal(apply(s,'medical',{patient:'R07',repeat:'0329',interpretation:'unreliable',batch:'order'}).ok,false);assert.equal(truth(s).second,false);await assert.rejects(decryptArchive(envelope,'20240902'));assert.equal(s.vault,null);assert.ok(held.every(id=>owned(s,id)));assert.equal(truthy(s,'actions','endingA'),true);
});

test('evidence links reject bare card identity, unverified medical assertions, wrong direction and missing cryptographic payload',()=>{
 const s=freshArgState();firstLayer(s);clinic(s);collect(s,'attendance','swipe','summary','medical');for(const edge of AUDIT_EDGES.slice(0,2))assert.equal(apply(s,'link',edge).ok,false);restoreDraft(s);collect(s,'lab-original','lab-edited');assert.equal(apply(s,'link',{from:'lab-edited',to:'lab-original',relation:'amends'}).ok,false);assert.equal(apply(s,'link',AUDIT_EDGES[3]).ok,true);const key=AUDIT_EDGES[3].key;assert.equal(apply(s,'unlink',{key}).ok,true);assert.equal(truthy(s,'links',key),false);assert.equal(owned(s,'lab-original'),true);
});

test('merge is commutative, associative and idempotent, retaining independent discoveries and latest tombstones',()=>{
 const a=freshArgState(),b=freshArgState(),c=freshArgState();act(a,'collect',{id:'reportBy'},{tick:1,actor:'a'});act(b,'collect',{id:'reportUnknown'},{tick:1,actor:'b'});act(c,'note',{text:'different source'},{tick:2,actor:'c'});
 assert.equal(sameState(mergeArgStates(a,b),mergeArgStates(b,a)),true);assert.equal(sameState(mergeArgStates(mergeArgStates(a,b),c),mergeArgStates(a,mergeArgStates(b,c))),true);assert.equal(sameState(mergeArgStates(a,a),a),true);
 const one=mergeArgStates(a,b);assert.equal(owned(one,'reportBy'),true);assert.equal(owned(one,'reportUnknown'),true);const key=AUDIT_EDGES[0].key;one.links[key]={value:true,tick:3,actor:'a'};const removed=sanitizeArgState(one);removed.links[key]={value:false,tick:4,actor:'b'};assert.equal(truthy(mergeArgStates(one,removed),'links',key),false);
});

test('real storage listeners repair a racing stale write and synchronize notes and accounts across independent pages',()=>{
 let data=null;const queues=[],listeners=new Map(),writes=[];function tab(id){const events={addEventListener(_k,fn){listeners.set(id,fn);},removeEventListener(){listeners.delete(id);}},storage={getItem:key=>key===ARG_SAVE_KEY?data:null,setItem(key,value){assert.equal(key,ARG_SAVE_KEY);data=value;writes.push({id,value});for(const [other,fn]of listeners)if(other!==id)queues.push(()=>fn({key,newValue:value}));}};return createStateStore({storage,events,actor:id});}
 const a=tab('forum'),b=tab('canteen');a.dispatch('collect',{id:'reportBy'});const staleB=JSON.stringify({...freshArgState(),clock:1,evidence:{reportUnknown:{value:true,tick:1,actor:'canteen'}}});data=staleB;listeners.get('forum')({key:ARG_SAVE_KEY,newValue:staleB});let loops=0;while(queues.length){assert.ok(++loops<80,'storage events must converge');queues.shift()();}
 assert.equal(owned(a.get(),'reportBy'),true);assert.equal(owned(b.get(),'reportBy'),true);assert.equal(owned(b.get(),'reportUnknown'),true);b.dispatch('note',{text:'一卡通时段待核'});b.dispatch('login',{account:'jie',password:'1264'});while(queues.length)queues.shift()();assert.equal(a.get().notes.personal.value,'一卡通时段待核');assert.equal(truthy(a.get(),'accounts','jie'),true);assert.equal(sameState(a.get(),b.get()),true);a.dispose();b.dispose();assert.equal(listeners.size,0);
});

test('legacy progress migrates read-only into the canonical key and a blocked store degrades without crashing',()=>{
 const old=oldFresh();Object.assign(old,{deduced:true,finished:true,caseSolved:true,caseStage:8,savedDocs:['receipt'],activeAccount:'jie'});const migrated=migrateLegacy(JSON.stringify(old));assert.equal(truth(migrated).first,true);assert.equal(owned(migrated,'receipt'),true);assert.equal(truthy(migrated,'accounts','jie'),true);assert.equal(truth(migrated).auditReady,false);assert.equal(truth(migrateLegacy('{')).first,false);const invalid={version:1,caseSolved:true,caseStage:8,deduced:false};assert.equal(truth(migrateLegacy(invalid)).first,false);
 const values=new Map([['qinghe.third-report.v1',JSON.stringify(old)],['qinghe.presentation.v1',JSON.stringify({version:1,note:'旧的手记'})]]),written=[];const store=createStateStore({storage:{getItem:k=>values.get(k)||null,setItem(k,v){written.push(k);values.set(k,v);}},events:null,actor:'migrate'});assert.equal(truth(store.get()).first,true);assert.equal(store.get().notes.personal.value,'旧的手记');assert.deepEqual([...new Set(written)],[ARG_SAVE_KEY]);store.dispose();
 const bad=createStateStore({storage:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}},events:null});assert.equal(bad.dispatch('collect',{id:'source'}).ok,true);assert.equal(owned(bad.get(),'source'),true);assert.equal(bad.available(),false);
});

test('malformed saves cannot invent unknown clues, oversized workbooks or unsupported access flags',()=>{
 const s=sanitizeArgState({version:3,clock:4,evidence:{invented:{value:true,tick:4,actor:'x'}},accounts:{admin:{value:true,tick:4,actor:'x'}},vault:{value:{columns:['x'],rows:[],xlsx:'<script>'},tick:4,actor:'x'}});assert.deepEqual(s.evidence,{});assert.deepEqual(s.accounts,{});assert.equal(s.vault,null);assert.equal(truth(s).auditReady,false);
});

test('mock playback holds exactly four stills, seeks by timestamp and cancels stale callbacks after pause',()=>{
 let t=0,next=0,can=true;const jobs=new Map(),times=[];const player=createMockPlayer({duration:132,starts:[0,26,78,108],onTime:(...args)=>times.push(args),now:()=>t,schedule:fn=>{jobs.set(++next,fn);return next;},cancel:id=>jobs.delete(id),canPlay:()=>can});player.seek(84);assert.equal(times.at(-1)[2],2);player.play();const stale=[...jobs.values()][0];t=1000;stale();assert.equal(player.getTime(),85);can=false;t=2000;stale();assert.equal(player.isPlaying(),false);assert.equal(jobs.size,0);player.seek(28);stale();assert.equal(player.getTime(),28);assert.equal(frameIndex(player.getTime(),[0,26,78,108]),1);player.dispose();
});

test('old single-page bookmarks map onto real document URLs without preserving chapter mechanics',()=>{
 for(const [hash,site]of [['#portal/card','canteen'],['#video/'+SPRING_BV,'video'],['#pan/relay','pan'],['#vault','pan'],['#archive/medical','pan'],['#doc/by','forum']])assert.equal(translateLegacy(hash).site,site);assert.equal(translateLegacy('#casefile/receipt').params.view,'card');assert.equal(translateLegacy('#chapter/12').params.thread,'chen');assert.equal(translateLegacy('#doc/letter').site,'pan');assert.equal(translateLegacy('#doc/letter').params.folder,'yida');assert.equal(translateLegacy('#doc/score').params.folder,'jie');
});
