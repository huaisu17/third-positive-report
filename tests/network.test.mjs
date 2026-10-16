import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {freshState,parseSave,checkAccountLogin,escapeHTML,addClue} from '../dist/engine.js';
import {SITES,RELAY_BV,CANTEEN_BV,CARD_ROWS,RELAY_REGISTER,MAINTENANCE,VIDEOS} from '../dist/network-content.js';
import {siteForRoute,addressForRoute,routeFromAddress,legacyNetworkRoute,canViewVideo,canUsePortal,canUseShare,authorizeCard,queryCard,openCardOrder,recordVideoFrame,unlockShare,validRange} from '../dist/network-engine.js';
import {recordTable,tableCSV} from '../dist/record-table.js';
import {videoScene} from '../dist/video-scene.js';
import {createNetwork} from '../dist/network-ui.js';
import {createSiteShell} from '../dist/site-shell.js';
import {createArchive} from '../dist/expansion-ui.js';
import {EXP_STEPS,EXP_REQUIREMENTS} from '../dist/expansion-engine.js';
import {archiveDocs} from '../dist/expansion-content.js';
import {decryptArchive} from '../dist/archive-crypto.js';
import {posts,searchIndex} from '../dist/content.js';
import {caseDocs} from '../dist/campaign.js';

const started=()=>Object.assign(freshState(),{deduced:true,finished:true});
const ended=()=>Object.assign(started(),{caseSolved:true,caseStage:8});
const reload=s=>parseSave(JSON.stringify(s));
const restore=(before)=>{for(const [key,descriptor] of before)descriptor?Object.defineProperty(globalThis,key,descriptor):delete globalThis[key];};

test('all four sites have local icons and supported addresses round-trip without external navigation',()=>{
 for(const route of ['#portal/card','#portal/timeline','#portal/ledger','#portal/workorders','#video/'+RELAY_BV,'#dynamic/radio','#pan/relay','#pan/ledger','#pan/blackboard'])assert.equal(routeFromAddress(addressForRoute(route)),route);
 assert.equal(routeFromAddress(RELAY_BV.toLowerCase()),'#video/'+RELAY_BV);assert.equal(routeFromAddress('https://qinghe.local/thread.php?id=reports'),'#post/reports');
 for(const invalid of ['https://example.org','javascript:alert(1)','https://bilibili.com.evil.test/video/'+RELAY_BV,'https://user:password@bilibili.com/video/'+RELAY_BV])assert.equal(routeFromAddress(invalid),null);
 for(const s of Object.values(SITES))assert.ok(existsSync(new URL('../dist/'+s.icon,import.meta.url)));
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.equal([...html.matchAll(/data-site-switch=/g)].length,4);assert.match(html,/id="addressForm"/);assert.match(html,/id="addressFavicon"/);
});

test('old bookmarks redirect to the migrated evidence carrier without advancing the case',()=>{
 for(const [section,id,target] of [['casefile','pickup','#portal/card'],['casefile','receipt','#portal/order'],['archive','swipe','#portal/timeline'],['archive','roster','#portal/timeline'],['archive','outage','#portal/workorders'],['vault','','#portal/ledger'],['archive','ledger','#portal/ledger']])assert.equal(legacyNetworkRoute(section,id),target);
 assert.equal(legacyNetworkRoute('casefile','deleted'),null);const s=started(),before=JSON.stringify(s);legacyNetworkRoute('vault','');assert.equal(JSON.stringify(s),before);
});

test('card transactions require authorized credentials, valid dates, and opening the matching query row',()=>{
 let s=freshState();assert.equal(authorizeCard(s,'20220327','1264',checkAccountLogin).ok,false);s=started();
 for(const [user,pass] of [['20220326','1264'],['20220327','0367'],['20220327','1580']])assert.equal(authorizeCard(s,user,pass,checkAccountLogin).ok,false);
 assert.equal(queryCard(s,'2025-03-12','2025-03-14').ok,false);assert.equal(openCardOrder(s,'C0313-2147'),false);assert.equal(authorizeCard(s,'２０２２０３２７',' １２６４ ',checkAccountLogin).ok,true);
 assert.equal(queryCard(s,'2025-03-14','2025-03-12').ok,false);assert.equal(queryCard(s,'2025-03-14','2025-03-14').rows.length,1);assert.equal(openCardOrder(s,'C0313-2147'),false);
 assert.equal(queryCard(s,'2025-03-12','2025-03-14').rows.length,3);assert.equal(openCardOrder(s,'C0313-2147'),true);s=reload(s);assert.equal(s.network.orderOpen,true);assert.equal(s.caseStage,0);assert.equal(s.activeAccount,'by');assert.equal(s.network.cardAuthorized,true);assert.equal(s.clues.includes('receipt'),false);
 const row=CARD_ROWS.find(r=>r[0]==='C0313-2147');assert.match(row[1],/2025-03-13 21:47:12/);assert.match(row[2],/QH-C02/);assert.equal(Number(row[4]),12+4+2);
 for(const [from,to] of [['2025-02-30','2025-03-01'],['2025-04-31','2025-05-01'],['2025-00-01','2025-03-14'],['','2025-03-14']])assert.equal(validRange(from,to),false);
});

test('forum leaves a plain BV clue; video and source share are upstream of Yida login',()=>{
 const s=started();assert.equal(canViewVideo(s,RELAY_BV),false);assert.equal(unlockShare(s,'relay','1018B').ok,false);s.caseStage=1;assert.equal(canViewVideo(s,RELAY_BV),true);assert.equal(canUseShare(s,'relay'),true);
 const post=posts.find(p=>p.id==='sports');assert.ok(post.body.includes(RELAY_BV));assert.doesNotMatch(post.body,/#video\/|href="[^\"]*BV1Qh4y1q7Hs|18日正式比赛换B机/);assert.match(caseDocs['sports-slip'].body,/2024年10月18日/);assert.equal(VIDEOS[RELAY_BV].date,'2024-10-20');
 for(const pass of ['1020B','B1018','1017A'])assert.equal(unlockShare(s,'relay',pass).ok,false);assert.equal(unlockShare(s,'relay',' １０１８ｂ ').ok,true);assert.equal(reload(s).network.panUnlocked.includes('relay'),true);
 const row=RELAY_REGISTER.rows.find(r=>r[2]==='正式比赛');assert.equal(checkAccountLogin(s,'yida',row[3]+row[1].slice(5).replace('-','')).account,'yida');assert.equal(s.caseStage,1);
});

test('only readable scene intervals can be recorded; comments never establish identity or infection source',()=>{
 const s=started();s.caseStage=1;for(const time of [undefined,NaN,0,27,81,89,132])assert.equal(recordVideoFrame(s,RELAY_BV,time).ok,false);assert.deepEqual(s.network.observed,[]);assert.equal(recordVideoFrame(s,RELAY_BV,84).clue,'videoFrame');assert.equal(recordVideoFrame(s,RELAY_BV,85).ok,true);assert.deepEqual(s.network.observed,['relayFrame']);assert.equal(s.caseStage,1);
 const frame=videoScene('relay',84);assert.match(frame,/B机/);assert.match(frame,/2024.10.18/);assert.match(videoScene('relay',0),/data-scene-detail hidden/);assert.doesNotMatch(frame,/data-scene-detail hidden/);assert.match(VIDEOS[RELAY_BV].description,/拍摄月日.*机位字母/);assert.equal(VIDEOS[RELAY_BV].danmaku.find(d=>d.at===84).text.includes('器材室'),true);
 assert.equal(canViewVideo(s,CANTEEN_BV),false);assert.equal(canUsePortal(s,'ledger'),false);
});

test('network saves retain tab positions and table marks while rejecting inconsistent privileges and corrupt fields',()=>{
 const s=started();s.caseStage=1;s.network.lastRoutes={forum:'#post/sports',portal:'#portal/card',video:'#video/'+RELAY_BV,pan:'#pan/relay'};s.network.videoTimes[RELAY_BV]=84;s.network.tableMarks={swipe:['s3'],ledger:['ledger-0','ledger-2']};s.network.panUnlocked=['relay'];s.network.complaintDraft='晚自习下课没有面了';
 const loaded=reload(s);assert.deepEqual(loaded.network,s.network);assert.equal(loaded.caseStage,1);assert.equal(loaded.network.lastRoutes.video,'#video/'+RELAY_BV);
 s.network.lastRoutes.portal='#video/'+RELAY_BV;s.network.videoTimes[CANTEEN_BV]=84;s.network.videoTimes[RELAY_BV]=Infinity;s.network.tableMarks.bad=['<script>'];const safe=reload(s);assert.equal(safe.network.lastRoutes.portal,'#portal/home');assert.equal(safe.network.videoTimes[CANTEEN_BV],undefined);assert.equal(safe.network.videoTimes[RELAY_BV],undefined);assert.deepEqual(safe.network.tableMarks.bad,[]);
 const old=ended();delete old.network;old.savedDocs=['receipt'];assert.equal(reload(old).caseSolved,true);assert.ok(reload(old).savedDocs.includes('receipt'));
});

test('shared official tables preserve row identifiers, unique mark targets and CSV field boundaries',()=>{
 const d={title:'正式记录',columns:['日期','说明'],rows:[['03-13','逗号,换行\n及"引号"'],['03-13','=1+1']]};
 const html=recordTable(d,{key:'ledger',interactive:true,selected:['ledger-1']});assert.match(html,/data-record-row="ledger-0"/);assert.match(html,/data-record-row="ledger-1" class="record-selected"/);assert.match(html,/aria-pressed="true"[^>]*>已标记/);const csv=tableCSV(d);assert.ok(csv.startsWith('\uFEFF'));assert.match(csv,/"逗号,换行\n及""引号"""/);assert.match(csv,/"'=1\+1"/);
 const select=recordTable(archiveDocs.swipe,{choice:'swipe',selected:['s3']});assert.equal([...select.matchAll(/name="swipe"/g)].length,22);assert.match(select,/value="s3"[^>]*checked/);assert.ok(tableCSV(archiveDocs.swipe).includes('R0313'));
});

function rendererHarness(state){const before=new Map(['document','window','location','requestAnimationFrame'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));const events={};
 const view={innerHTML:'',insertAdjacentHTML(_p,s){this.innerHTML+=s;},querySelector(){return null;},contains(){return false;}};
 globalThis.document={visibilityState:'visible',addEventListener(k,fn){(events[k]??=[]).push(fn);},querySelector(){return null;}};globalThis.window={addEventListener(){}};globalThis.location={hash:'#portal/home'};globalThis.requestAnimationFrame=()=>{};
 const props={getState:()=>state,save(){},view,heading:(_k,t,sub='')=>`<h1>${t}</h1><p>${sub}</p>`,esc:escapeHTML,toast(){},showReader(){},render(){}};const archive=createArchive(props),ui=createNetwork({...props,collect:id=>addClue(state,id),archive,entered:()=>true});
 return {ui,archive,view,events,close(){ui.suspend();restore(before);}};
}

test('real page renderers gate future records, hand chapters off to their sites, and embed functioning forms',()=>{
 const state=started(),h=rendererHarness(state);try{
  for(const page of ['home','card','menu','complaints']){h.ui.handleRoute('portal',page);assert.match(h.view.innerHTML,/智慧后勤服务大厅/);assert.doesNotMatch(h.view.innerHTML,/undefined|NaN/);}
  h.ui.handleRoute('portal','timeline');assert.doesNotMatch(h.view.innerHTML,/H017|name="swipe"/);h.ui.handleRoute('video',RELAY_BV);assert.doesNotMatch(h.view.innerHTML,/id="videoSeek"/);
  state.caseStage=1;h.ui.handleRoute('video','');assert.doesNotMatch(h.view.innerHTML,/href="#video\/BV1Qh4y1q7Hs"/);h.ui.handleRoute('video',RELAY_BV);assert.match(h.view.innerHTML,/id="videoSeek"/);assert.match(h.view.innerHTML,/#pan\/relay/);h.ui.suspend();
  h.ui.handleRoute('pan','relay');assert.match(h.view.innerHTML,/id="panExtract"/);assert.doesNotMatch(h.view.innerHTML,/R1018-B/);unlockShare(state,'relay','1018B');h.ui.handleRoute('pan','relay');assert.match(h.view.innerHTML,/R1018-B/);assert.match(h.view.innerHTML,/data-record-download="relay"/);
  Object.assign(state,{caseSolved:true,caseStage:8});Object.assign(state.expansion,{stage:1,recovered:true,loggedIn:true,solved:['account'],evidence:[...EXP_REQUIREMENTS[0]]});
  h.archive.handleRoute('annex','14');assert.match(h.view.innerHTML,/#portal\/timeline/);assert.doesNotMatch(h.view.innerHTML,/data-archive-step="1"/);
  h.ui.handleRoute('portal','timeline');assert.match(h.view.innerHTML,/data-archive-step="1"/);for(const key of ['roster','swipe','attendance','signoff']){assert.match(h.view.innerHTML,new RegExp(`name="${key}"`));assert.match(h.view.innerHTML,new RegExp(`data-record-download="${key}"`));}
  state.expansion.loggedIn=false;h.ui.handleRoute('portal','timeline');assert.match(h.view.innerHTML,/在校名册/);assert.doesNotMatch(h.view.innerHTML,/周转重试 R0313/);
  state.expansion.stage=4;state.expansion.loggedIn=true;h.ui.handleRoute('pan','blackboard');assert.match(h.view.innerHTML,/data-archive-collect="blackboard"/);assert.match(h.view.innerHTML,/blackboard-archive.svg/);h.ui.handleRoute('portal','ledger');assert.match(h.view.innerHTML,/id="archiveVault"/);assert.doesNotMatch(h.view.innerHTML,/95.0℃/);
 }finally{h.close();}
});

test('archived maintenance and real decrypted ledger use formal tables; old saved receipts remain readable',async()=>{
 const state=ended(),h=rendererHarness(state);try{state.expansion.stage=5;state.expansion.loggedIn=true;
  h.ui.handleRoute('portal','workorders');assert.doesNotMatch(h.view.innerHTML,/2025-03-13 20:18/);state.network.maintenanceSearch={query:'消毒',archived:false};h.ui.handleRoute('portal','workorders');assert.doesNotMatch(h.view.innerHTML,/2025-03-13 20:18/);
  state.network.maintenanceSearch.archived=true;h.ui.handleRoute('portal','workorders');assert.match(h.view.innerHTML,/2025-03-13 20:18/);assert.match(h.view.innerHTML,/21:06/);assert.match(h.view.innerHTML,/data-archive-collect="outage"/);assert.ok(h.view.innerHTML.includes(CANTEEN_BV));
  const envelope=JSON.parse(readFileSync(new URL('../dist/assets/L-0313.enc.json',import.meta.url)));state.expansion.workbook=await decryptArchive(envelope,'20240912');state.expansion.vault=true;h.ui.handleRoute('portal','ledger');assert.match(h.view.innerHTML,/95.0℃/);assert.match(h.view.innerHTML,/data-archive-download/);assert.match(h.view.innerHTML,/data-record-download="ledger"/);assert.match(h.view.innerHTML,/data-record-row="ledger-2"/);
  state.network.orderOpen=false;h.ui.handleRoute('portal','order');assert.doesNotMatch(h.view.innerHTML,/交易成功/);state.savedDocs.push('receipt');h.ui.handleRoute('portal','order');assert.match(h.view.innerHTML,/交易成功/);
 }finally{h.close();}
});

test('browser tabs restore each site route, update favicon/address and reject unsupported destinations',()=>{
 const before=new Map(['document','location'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)])),events={},nodes=new Map(),tabs=Object.keys(SITES).map(id=>({dataset:{siteSwitch:id},attrs:{},tabIndex:0,setAttribute(k,v){this.attrs[k]=v;},focus(){}}));
 const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',dataset:{},src:'',setAttribute(k,v){this[k]=v;},addEventListener(k,fn){events[id+':'+k]=fn;}});return nodes.get(id);};
 globalThis.document={title:'',querySelector:s=>node(s),querySelectorAll:()=>tabs};globalThis.location={hash:'#forum'};const state=started();let target=null,message='';
 try{const shell=createSiteShell({getState:()=>state,save(){},navigate:r=>target=r,toast:m=>message=m});for(const route of ['#portal/card','#video/'+RELAY_BV,'#pan/relay']){shell.sync(route);assert.equal(node('#virtualAddress').value,addressForRoute(route));assert.equal(node('#addressFavicon').src,SITES[siteForRoute(route)].icon);assert.equal(tabs.find(t=>t.dataset.siteSwitch===siteForRoute(route)).attrs['aria-selected'],'true');}
  events['#siteTabs:click']({target:{closest:()=>tabs[1]}});assert.equal(target,'#portal/card');node('#virtualAddress').value=RELAY_BV;events['#addressForm:submit']({preventDefault(){}});assert.equal(target,'#video/'+RELAY_BV);node('#virtualAddress').value='https://example.net';events['#addressForm:submit']({preventDefault(){}});assert.match(message,/不在校园存档/);
 }finally{restore(before);}
});

test('video controller persists seeking, pauses in hidden windows, and releases playback timers on tab switch',()=>{
 const before=new Map(['document','window','location','setInterval','clearInterval','performance'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));let now=0,next=0;const timers=new Map(),events={},nodes=new Map();const state=started();state.caseStage=1;
 const n=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:'',dataset:{},style:{},classList:{toggle(){}},setAttribute(){},removeAttribute(){},querySelector:s=>s==='svg'?{outerHTML:''}:s==='[data-scene-detail]'?n('detail'):null});return nodes.get(id);};
 globalThis.document={visibilityState:'visible',addEventListener(k,fn){(events[k]??=[]).push(fn);},querySelector:s=>s==='dialog[open]'?null:s==='#appWindow'?{hidden:false}:null};globalThis.window={addEventListener(){}};globalThis.location={hash:'#video/'+RELAY_BV};globalThis.setInterval=fn=>{timers.set(++next,fn);return next;};globalThis.clearInterval=id=>timers.delete(id);Object.defineProperty(globalThis,'performance',{value:{now:()=>now},configurable:true});
 const view={innerHTML:'',querySelector:n,contains:()=>false};const ui=createNetwork({getState:()=>state,save(){},view,collect:id=>addClue(state,id),archive:{},toast(){},render(){},entered:()=>true});
 const click=attr=>{const button={dataset:{},hasAttribute:a=>a===attr};for(const listener of events.click)listener({target:{closest:s=>s==='button,a'?button:null}});};
 try{ui.handleRoute('video',RELAY_BV);for(const listener of events.input)listener({target:{id:'videoSeek',value:84}});assert.equal(state.network.videoTimes[RELAY_BV],84);click('data-video-capture');assert.ok(state.clues.includes('videoFrame'));
  click('data-video-play');assert.equal(timers.size,1);now=1500;[...timers.values()][0]();assert.match(n('#videoClock').textContent,/01:25/);document.visibilityState='hidden';for(const listener of events.visibilitychange)listener();assert.equal(timers.size,0);assert.equal(state.network.videoTimes[RELAY_BV],85.5);
  document.visibilityState='visible';click('data-video-play');assert.equal(timers.size,1);const stale=[...timers.values()][0];ui.suspend();assert.equal(timers.size,0);assert.equal(state.network.videoTimes[RELAY_BV],85.5);ui.handleRoute('video','BV1Qh4y1d1Ly');for(const listener of events.input)listener({target:{id:'videoSeek',value:20}});now=5000;stale();assert.equal(state.network.videoTimes.BV1Qh4y1d1Ly,20);assert.match(n('#videoClock').textContent,/00:20/);
 }finally{ui.suspend();restore(before);}
});
