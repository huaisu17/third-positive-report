import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bookmarkLinks} from '../dist/arg-bookmarks.js';
import fs from 'node:fs';
import {bindNotebookFeedback,bindExtractionFeedback} from '../dist/ui-interactions.js';
import {createMockPlayer,handlePlayerKey,stepPlayer} from '../dist/video/mock-player.js';

class Element {
 constructor(){this.events={};this.attributes=new Map();this.classes=new Set();this.classList={add:(...v)=>v.forEach(x=>this.classes.add(x)),remove:(...v)=>v.forEach(x=>this.classes.delete(x)),contains:v=>this.classes.has(v)};this.textContent='';this.offsetWidth=120;}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
 fire(name,event={}){for(const fn of this.events[name]||[])fn({target:this,...event});}
 setAttribute(k,v){this.attributes.set(k,v);}
 removeAttribute(k){this.attributes.delete(k);}
 focus(){this.focused=true;}
}
function notebook(){const dialog=new Element(),toggle=new Element();let closes=0;dialog.open=true;dialog.getBoundingClientRect=()=>({left:740,right:1200,top:0,bottom:800});const feedback=bindNotebookFeedback({dialog,toggle,close(){closes++;dialog.open=false;}});return {dialog,toggle,feedback,closes:()=>closes};}
function player(){let now=0,next=0;const jobs=new Map();const p=createMockPlayer({duration:132,starts:[0,28,84,112],onTime(){},now:()=>now,schedule:fn=>{jobs.set(++next,fn);return next;},cancel:id=>jobs.delete(id),canPlay:()=>true});return {p,tick(){now+=1000;[...jobs.values()].forEach(fn=>fn());},jobs};}
function key(key,options={}){return {key,target:{closest:()=>null},preventDefault(){this.prevented=true;},...options};}

test('notebook bookmarks expose only discovered sites and retain project-relative links for all four documents',()=>{
 for(const site of ['forum','canteen','video','pan']){const initial=bookmarkLinks({discovered_sites:['forum']},site);assert.equal((initial.match(/<a /g)||[]).length,1);assert.doesNotMatch(initial,/智慧后勤|视频镜像|网盘/);const base=new URL(site==='forum'?'https://x.test/game/index.html':`https://x.test/game/${site}/index.html`),html=bookmarkLinks({discovered_sites:['forum','canteen','video','pan']},site);assert.equal((html.match(/aria-current="page"/g)||[]).length,1);assert.deepEqual([...html.matchAll(/href="([^"]+)"/g)].map(m=>new URL(m[1],base).pathname),['/game/index.html','/game/canteen/index.html','/game/video/index.html','/game/pan/index.html']);}
});
test('all site entries keep native mastheads without mounting the removed campus header',()=>{
 for(const path of ['index.html','canteen/index.html','video/index.html','pan/index.html','arg-ui.js','arg.css'])assert.doesNotMatch(fs.readFileSync(new URL('../dist/'+path,import.meta.url),'utf8'),/campus-header|mountCampusHeader|campus-network/);
 assert.match(fs.readFileSync(new URL('../dist/arg-pinboard.js',import.meta.url),'utf8'),/mountBookmarks/);
});
test('outside notebook click closes, inside click and drag from inside do not dismiss',()=>{
 const n=notebook();n.dialog.fire('click',{clientX:900,clientY:300});assert.equal(n.closes(),0);n.dialog.fire('pointerdown',{clientX:900,clientY:300});n.dialog.fire('click',{clientX:400,clientY:300});assert.equal(n.closes(),0);n.dialog.fire('pointerdown',{clientX:400,clientY:300});n.dialog.fire('click',{clientX:400,clientY:300});assert.equal(n.closes(),1);n.dialog.fire('click',{clientX:400,clientY:300});assert.equal(n.closes(),1);
});
test('new clue notification stays unread after its pulse and acknowledges on opening, without notifying an open notebook',()=>{
 const n=notebook();n.feedback.notify();assert.equal(n.toggle.classList.contains('has-unread'),false);n.dialog.open=false;n.feedback.notify();assert.equal(n.toggle.classList.contains('has-unread'),true);assert.match(n.toggle.attributes.get('aria-label'),/新收录/);n.toggle.fire('animationend',{animationName:'notebookPulse'});assert.equal(n.toggle.classList.contains('is-pulsing'),false);assert.equal(n.toggle.classList.contains('has-unread'),true);n.feedback.notify();assert.equal(n.toggle.classList.contains('is-pulsing'),true);n.feedback.acknowledge();assert.equal(n.toggle.classes.size,0);assert.equal(n.toggle.attributes.has('aria-label'),false);
});
test('Space toggles playback once and both arrow controls move exactly three seconds with clamping',()=>{
 const {p,tick,jobs}=player();const space=key(' ',{code:'Space'});assert.equal(handlePlayerKey(space,p),true);assert.equal(space.prevented,true);tick();assert.equal(p.getTime(),1);assert.equal(handlePlayerKey(key(' ',{repeat:true}),p),false);assert.equal(p.isPlaying(),true);handlePlayerKey(key(' '),p);assert.equal(p.isPlaying(),false);assert.equal(jobs.size,0);p.seek(84);handlePlayerKey(key('ArrowLeft'),p);assert.equal(p.getTime(),81);handlePlayerKey(key('ArrowRight'),p);assert.equal(p.getTime(),84);stepPlayer(p,1);assert.equal(p.getTime(),87);p.seek(131);stepPlayer(p,1);assert.equal(p.getTime(),132);p.seek(1);handlePlayerKey(key('ArrowLeft'),p);assert.equal(p.getTime(),0);p.dispose();
});
test('video shortcuts preserve typing, native input controls, modal interaction, composition and browser shortcuts',()=>{
 const {p}=player();p.seek(84);for(const option of [{blocked:true},{editable:true},{ctrlKey:true},{metaKey:true},{altKey:true},{shiftKey:true},{isComposing:true},{defaultPrevented:true}]){const e=key('ArrowLeft',{...option,target:{closest:()=>option.editable?{}:null}});assert.equal(handlePlayerKey(e,p,{blocked:option.blocked}),false);assert.equal(e.prevented,undefined);assert.equal(p.getTime(),84);}const nativeButton={closest:selector=>selector==='button,a'?{}:null};assert.equal(handlePlayerKey(key(' ',{target:nativeButton}),p),false);assert.equal(handlePlayerKey(key('ArrowLeft',{target:nativeButton}),p),true);assert.equal(p.getTime(),81);const e=key(' ');assert.equal(handlePlayerKey(e,null),false);assert.equal(e.prevented,undefined);p.dispose();
});
test('extraction errors mark and shake the retained input, repeat on retry, then clear when editing or successful',()=>{
 const input=new Element(),message=new Element();input.value='wrong';const form={querySelector:s=>s==='[name="code"]'?input:message},result=bindExtractionFeedback(form);result({ok:false,message:'提取码没有匹配'});assert.equal(input.attributes.get('aria-invalid'),'true');assert.equal(input.classList.contains('is-shaking'),true);assert.equal(message.classList.contains('is-error'),true);assert.equal(message.textContent,'提取码没有匹配');assert.equal(input.value,'wrong');assert.equal(input.focused,true);input.fire('animationend',{animationName:'codeShake'});assert.equal(input.classList.contains('is-shaking'),false);result({ok:false,message:'请再核对'});assert.equal(input.classList.contains('is-shaking'),true);input.fire('input');assert.equal(input.attributes.has('aria-invalid'),false);assert.equal(message.textContent,'');result({ok:true,message:'已打开'});assert.equal(message.classList.contains('is-error'),false);assert.equal(input.classes.size,0);assert.equal(message.textContent,'已打开');
});
