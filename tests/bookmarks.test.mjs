import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {freshArgState,sanitizeArgState,mergeArgStates,sameState,act,truthy} from '../dist/arg-engine.js';
import {createStateStore,trackSiteDiscovery,ARG_SAVE_KEY} from '../dist/state-sync.js';
import {resolveSiteAddress,siteForLocalLink} from '../dist/site-address.js';
import {mountBookmarks,bookmarkLinks} from '../dist/arg-bookmarks.js';
const apply=(s,site,actor='test')=>act(s,'discover',{site},{tick:s.clock+1,actor});
function memory(){const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};}
const context={site:'forum',currentURL:'https://example.test/project/index.html'};

test('new investigations know only the forum; discovering a site is idempotent and grants no evidence or account access',()=>{
 const s=freshArgState();assert.deepEqual(s.discovered_sites,['forum']);assert.equal(apply(s,'video').ok,true);const clock=s.clock;assert.equal(apply(s,'video').message,'已在调查书签中。');assert.equal(s.clock,clock);assert.equal(apply(s,'external').ok,false);assert.deepEqual(s.discovered_sites,['forum','video']);assert.deepEqual(s.accounts,{});assert.deepEqual(s.evidence,{});assert.equal(s.vault,null);
});
test('discovered sites form a deterministic union across racing tabs, survive stale writes, and use the canonical save key',()=>{
 const a=freshArgState(),b=freshArgState(),c=freshArgState();apply(a,'video','a');apply(b,'canteen','b');apply(c,'pan','c');assert.equal(sameState(mergeArgStates(a,b),mergeArgStates(b,a)),true);assert.equal(sameState(mergeArgStates(mergeArgStates(a,b),c),mergeArgStates(a,mergeArgStates(b,c))),true);assert.deepEqual(mergeArgStates(mergeArgStates(a,b),c).discovered_sites,['forum','canteen','video','pan']);
 const storage=memory(),events={addEventListener(k,fn){this[k]=fn;},removeEventListener(){}},store=createStateStore({storage,events,actor:'forum'});store.dispatch('discover',{site:'video'});storage.setItem(ARG_SAVE_KEY,JSON.stringify(b));events.storage({key:ARG_SAVE_KEY,newValue:JSON.stringify(b)});assert.deepEqual(store.get().discovered_sites,['forum','canteen','video']);assert.deepEqual(JSON.parse(storage.getItem(ARG_SAVE_KEY)).discovered_sites,store.get().discovered_sites);store.dispose();
});
test('v3.0.2 saves restore only already-used sites, preserve authorizations and notes, and ignore malformed discoveries',()=>{
 const old=freshArgState();delete old.discovered_sites;old.accounts.card={value:true,tick:2,actor:'old'};old.accounts.shenzhi={value:true,tick:3,actor:'old'};old.notes.personal={value:'尚未核对完',tick:4,actor:'old'};const next=sanitizeArgState(old);assert.deepEqual(next.discovered_sites,['forum','canteen','pan']);assert.equal(truthy(next,'accounts','shenzhi'),true);assert.equal(next.notes.personal.value,'尚未核对完');assert.deepEqual(sanitizeArgState({...old,discovered_sites:['video','video','__proto__','outside']}).discovered_sites,['forum','video']);assert.deepEqual(sanitizeArgState(freshArgState()).discovered_sites,['forum']);
});
test('direct input resolves BV numbers, simulated domains, short routes and keywords into local game destinations',()=>{
 const samples=[[' bv1qh4y1p3ct ',{site:'video',params:{bv:'BV1Qh4y1p3Ct'}}],['https://bilibili.com/video/BV1Qh4y1p3Ct?t=84',{site:'video',params:{bv:'BV1Qh4y1p3Ct',t:'84'}}],['canteen.qinghe.edu.cn/card.aspx',{site:'canteen',params:{view:'card'}}],['https://pan.qinghe.local/s/spring',{site:'pan',params:{folder:'spring'}}],['qinghe.local/thread.php?id=printing',{site:'forum',params:{thread:'printing'}}],['video/index.html?bv=BV1Qh4y1p3Ct',{site:'video',params:{bv:'BV1Qh4y1p3Ct'}}],['pan/s/relay',{site:'pan',params:{folder:'relay'}}],['一卡通',{site:'canteen',params:{view:'card'}}],['B站',{site:'video',params:{}}],['https://example.test/project/pan/index.html?folder=clinic',{site:'pan',params:{folder:'clinic'}}]];
 for(const [input,expected]of samples)assert.deepEqual(resolveSiteAddress(input,context),expected,input);
 for(const input of ['javascript:alert(1)','data:text/html,x','https://evil.test/pan/index.html','https://qinghe.local.evil.test','https://user:pass@pan.qinghe.local','BV123','nothing','constructor'])assert.equal(resolveSiteAddress(input,context),null,input);
});
test('click discovery recognizes only four exact local entry paths under the Pages project prefix',()=>{
 for(const site of ['forum','canteen','video','pan']){const ctx={site,currentURL:site==='forum'?context.currentURL:`https://example.test/project/${site}/index.html`};for(const target of ['forum','canteen','video','pan']){const href=(site==='forum'?'':'../')+(target==='forum'?'index.html':target+'/index.html');assert.equal(siteForLocalLink(href,ctx),target);}for(const href of ['https://evil.test/project/pan/index.html','/pan/index.html','../assets/report-by-v3.svg','/project/pan/not-a-page.html'])assert.equal(siteForLocalLink(href,ctx),null,href);}
});
function eventDocument(){return {handlers:{},addEventListener(k,fn){this.handlers[k]=fn;},removeEventListener(k){delete this.handlers[k];}};}
function windowAt(href){return {location:{href},history:{state:null,replaceState(_state,_title,url){this.updated=url;}}};}
test('first visits and narrative link clicks discover destinations; arrival notice survives real page navigation exactly once',()=>{
 const storage=memory(),store=createStateStore({storage,events:null}),doc=eventDocument(),win=windowAt(context.currentURL),stop=trackSiteDiscovery(store,{site:'forum',document:doc,window:win});let href='video/index.html?bv=BV1Qh4y1p3Ct';const link={hasAttribute:()=>false,getAttribute:()=>href,setAttribute(_k,v){href=v;}};doc.handlers.click({type:'click',button:0,target:{closest:()=>link}});assert.deepEqual(store.get().discovered_sites,['forum','video']);assert.match(href,/#site-added=video$/);
 const destination=windowAt(href),arrival=[],next=createStateStore({storage,events:null}),stopNext=trackSiteDiscovery(next,{site:'video',document:eventDocument(),window:destination,onArrival:m=>arrival.push(m)});assert.equal(arrival.length,1);assert.match(arrival[0],/已将【青禾校园视频镜像】/);assert.doesNotMatch(destination.history.updated,/#/);stop();stopNext();store.dispose();next.dispose();assert.deepEqual(doc.handlers,{});
 const direct=createStateStore({storage:memory(),events:null});trackSiteDiscovery(direct,{site:'pan',document:eventDocument(),window:windowAt('https://example.test/project/pan/index.html')});assert.deepEqual(direct.get().discovered_sites,['forum','pan']);direct.dispose();
});
class Node {
 constructor(){this.events={};this.value='';this.textContent='';this.innerHTML='';this.attrs={};}
 addEventListener(k,fn){this.events[k]=fn;}
 setAttribute(k,v){this.attrs[k]=v;}
 removeAttribute(k){delete this.attrs[k];}
}
test('bookmark panel rejects invalid input without discovery, navigates valid BV input locally and retains typing on cross-tab updates',()=>{
 const store=createStateStore({storage:memory(),events:null}),nodes={form:new Node(),input:new Node(),'[data-address-result]':new Node(),nav:new Node(),'[data-bookmark-count]':new Node()},container={querySelector:s=>nodes[s]},destinations=[],panel=mountBookmarks(store,{container,site:'forum',currentURL:context.currentURL,navigate:href=>destinations.push(href)}),submit=()=>nodes.form.events.submit({preventDefault(){},stopPropagation(){}});
 nodes.input.value='javascript:alert(1)';submit();assert.equal(destinations.length,0);assert.deepEqual(store.get().discovered_sites,['forum']);assert.equal(nodes.input.attrs['aria-invalid'],'true');nodes.input.value='BV1Qh4y1p3Ct';store.dispatch('discover',{site:'canteen'});assert.equal(nodes.input.value,'BV1Qh4y1p3Ct');submit();assert.equal(destinations[0],'video/index.html?bv=BV1Qh4y1p3Ct#site-added=video');assert.match(nodes.nav.innerHTML,/视频镜像/);assert.doesNotMatch(nodes.nav.innerHTML,/青禾网盘/);assert.deepEqual(store.get().accounts,{});panel.dispose();store.dispose();
});
test('floating control is translucent at rest, opaque on focus or pulse, with no residual shared header CSS',()=>{
 const css=fs.readFileSync(new URL('../dist/arg.css',import.meta.url),'utf8');assert.match(css,/opacity:\.65/);assert.match(css,/backdrop-filter:blur\(10px\)/);assert.match(css,/\.arg-pocket-toggle:hover[^}]+opacity:1/);assert.doesNotMatch(css,/campus-header|campus-network/);assert.doesNotMatch(bookmarkLinks(freshArgState(),'forum'),/canteen|video|pan/);
});
