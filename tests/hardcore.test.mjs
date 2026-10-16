import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HOME_POST_IDS,HISTORY_TOPICS,searchArchive,searchGuidance,isPostDiscovered,discoverSearchResults,hintMarkup} from '../dist/investigation.js';
import {freshState,parseSave,searchItems,checkAccountLogin,judgeCaseStep,CASE_REQUIREMENTS,escapeHTML} from '../dist/engine.js';
import {posts,searchIndex} from '../dist/content.js';
import {caseDocs,caseHints} from '../dist/campaign.js';
import {archiveDocs,archiveHints} from '../dist/expansion-content.js';
import {EXP_REQUIREMENTS,recoverStaffAccount,solveExpansion} from '../dist/expansion-engine.js';
import {createArchive} from '../dist/expansion-ui.js';

const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const getFunction=name=>source.split('\n').find(l=>l.startsWith('function '+name+'('));
const index=searchIndex.map(x=>({...x,keywords:[...(x.keywords||[]),...(HISTORY_TOPICS[x.id]||[]),...({noodles:['夜宵账单'],exam:['周测作文'],printing:['打印委托'],sports:['旧照片']}[x.id]||[])]}));
const ended=()=>Object.assign(freshState(),{deduced:true,finished:true,caseSolved:true,caseStage:8});

test('actual home renderer exposes exactly four topics across filters, never the archived puzzle posts',()=>{
 for(const filter of ['all','life','study','notice']){
  const view={innerHTML:''};const render=Function('view','getVisiblePosts','HOME_POST_IDS','currentFilter','searchForm','avatar','threadCard','state',getFunction('renderBaseForum')+';return renderBaseForum;')(view,()=>posts,HOME_POST_IDS,filter,()=>'',()=>'',p=>`<article data-topic="${p.id}"></article>`,freshState());render();
  const ids=[...view.innerHTML.matchAll(/data-topic="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(ids,HOME_POST_IDS.filter(id=>filter==='all'||posts.find(p=>p.id===id).category===filter));
  for(const id of Object.keys(HISTORY_TOPICS))assert.ok(!ids.includes(id));
 }
});

test('history cannot be opened via profiles or old URLs before a meaningful search; discovery survives reload',()=>{
 let state=freshState();for(const id of Object.keys(HISTORY_TOPICS))assert.equal(isPostDiscovered(state,id),false);
 const view={innerHTML:''};let read=false;
 const render=Function('view','getVisiblePosts','isPostDiscovered','state','heading','searchForm','missing','markRead',getFunction('renderPost')+';return renderPost;')(view,()=>posts,isPostDiscovered,state,(_k,t)=>t,()=>'<form data-search></form>',()=>assert.fail('known post'),()=>{read=true;});
 render('noodles');assert.match(view.innerHTML,/历史主题已归档/);assert.equal(read,false);assert.doesNotMatch(view.innerHTML,/316|0367|五天/);
 const result=searchArchive('宵夜',index,searchItems);assert.ok(result.results.some(x=>x.route==='#post/noodles'));discoverSearchResults(state,result.results);state=parseSave(JSON.stringify(state));assert.equal(isPostDiscovered(state,'noodles'),true);assert.equal(isPostDiscovered(state,'sports'),false);
 const legacy=JSON.stringify({version:1,read:['post:printing']});assert.equal(isPostDiscovered(parseSave(legacy),'printing'),true);
});

test('four required archive searches tolerate common typos and broad queries do not dump history',()=>{
 for(const [query,id] of [['夜宵账单','noodles'],['周测作文','exam'],['打印委托','printing'],['旧照片','sports'],['夜肖账单','noodles'],['周侧作文','exam'],['打映委托','printing'],['运功会','sports'],['合影','sports']]){
  const results=searchArchive(query,index,searchItems).results;assert.ok(results.some(x=>x.route==='#post/'+id),query);
 }
 for(const query of ['','全部','所有','校园','study','life'])assert.ok(!searchArchive(query,index,searchItems).results.some(r=>Object.hasOwn(HISTORY_TOPICS,r.id)),query);
 assert.ok(searchGuidance('打').suggestions.includes('打印委托'));assert.equal(searchGuidance('夜肖').query,'夜宵');assert.deepEqual(searchArchive('<script>',index,searchItems).results,[]);
});

test('all compound password props are reachable before login and no single prop prints the full solution',()=>{
 const fixtures=[['jie','jiege','1264','pickup','夜宵账单','noodles',0],['yida','yida','B1018','sports-slip','旧照片','sports',1],['azhe','heshe','HS032316','editor-note','打印委托','printing',3]];
 const s=freshState();s.deduced=true;s.finished=true;
 for(const [id,user,pass,doc,query,post,stage] of fixtures){s.caseStage=stage;assert.equal(caseDocs[doc].owner,'by');assert.ok(caseDocs[doc].stage<=stage);assert.ok(searchArchive(query,index,searchItems).results.some(x=>x.route==='#post/'+post));assert.doesNotMatch(caseDocs[doc].body,new RegExp(pass,'i'));assert.doesNotMatch(posts.find(x=>x.id===post).body,new RegExp(pass,'i'));assert.equal(checkAccountLogin(s,user,pass).account,id);}
 assert.match(caseDocs.pickup.body,/实际值日天数乘寝室门牌/);assert.match(posts.find(p=>p.id==='noodles').body,/四天.*316/);
 assert.match(caseDocs['sports-slip'].body,/2024年10月18日/);assert.match(posts.find(p=>p.id==='sports').body,/BV1Qh4y1q7Hs/);assert.doesNotMatch(posts.find(p=>p.id==='sports').body,/正式比赛换B机/);
 for(const [user,wrong] of [['jiege','0367'],['jiege','1580'],['yida','1018'],['yida','A1018'],['yida','C1018'],['heshe','hs0323'],['heshe','hs032317']])assert.equal(checkAccountLogin(s,user,wrong).ok,false,wrong);
 assert.equal(checkAccountLogin(s,'heshe',' ＨＳ０３２３１６ ').account,'azhe');assert.match(checkAccountLogin(s,'heshe','0323').message,/需补充校刊英文缩写/);
});

test('nonunique image features yield logical rejection without naming the correct pair or advancing',()=>{
 const s=ended();s.caseSolved=false;s.caseStage=3;s.clues=[...CASE_REQUIREMENTS[3]];
 for(const decoy of ['stamp','noise']){const result=judgeCaseStep(s,3,{marks:['fold',decoy]});assert.equal(result.ok,false);assert.match(result.message,decoy==='stamp'?/角度不唯一/:/设备|底版/);assert.doesNotMatch(result.message,/折痕|蓝圈|缺口/);assert.equal(s.caseStage,3);}
 assert.equal(judgeCaseStep(s,3,{marks:['fold','circle']}).ok,true);
 const html=Function(getFunction('comparisonMarkup')+';return comparisonMarkup(true);')();for(const key of ['stamp','noise','circle','fold'])assert.match(html,new RegExp(`data-mark="${key}"`));assert.match(html,/报告B作为参照/);
});

test('larger timeline data contains plausible decoys, requires a roster decision and rejects each false link',()=>{
 assert.ok(archiveDocs.swipe.rows.length>=20);assert.ok(archiveDocs.attendance.rows.length>=15);assert.ok(archiveDocs.roster.rows.length>=12);
 const s=ended();s.expansion.stage=1;s.expansion.loggedIn=true;s.expansion.evidence=[...EXP_REQUIREMENTS[1]];
 const answer={roster:'m4',swipe:'s3',attendance:'a2',signoff:'r2',explanation:'proxy'};
 for(const wrong of [{roster:''},{roster:'m2'},{roster:'m9'},{swipe:'s16'},{swipe:'s4'},{swipe:'s2'},{attendance:'a1'},{signoff:'r7'},{explanation:'infection'}])assert.equal(solveExpansion(s,1,{...answer,...wrong}).ok,false,JSON.stringify(wrong));
 s.expansion.evidence=s.expansion.evidence.filter(id=>id!=='roster');assert.equal(solveExpansion(s,1,answer).ok,false);s.expansion.evidence.push('roster');assert.equal(solveExpansion(s,1,answer).ok,true);
 const swipe=archiveDocs.swipe.rows.find(r=>r[0]===answer.swipe),roster=archiveDocs.roster.rows.find(r=>r[0]===answer.roster),signoff=archiveDocs.signoff.rows.find(r=>r[0]===answer.signoff);assert.ok(swipe[2].startsWith(roster[4]+' /'));assert.ok(swipe[3].includes(signoff[1]));assert.ok(signoff[3].includes(roster[1]+'本人'));
});

test('legitimate earlier timeline completion migrates once, while fresh or malformed progress cannot gain a pass',()=>{
 const s=ended();s.expansion={...s.expansion,stage:2,recovered:true,loggedIn:true,solved:['account','timeline'],evidence:['authorization','oldpost','radio','swipe','attendance','signoff']};delete s.expansion.puzzleRevision;
 const loaded=parseSave(JSON.stringify(s));assert.equal(loaded.expansion.stage,2);assert.ok(loaded.expansion.evidence.includes('roster'));assert.deepEqual(parseSave(JSON.stringify(loaded)),loaded);
 s.expansion.puzzleRevision=2;assert.equal(parseSave(JSON.stringify(s)).expansion.stage,1);
 delete s.expansion.puzzleRevision;s.expansion.evidence=s.expansion.evidence.filter(id=>id!=='signoff');assert.equal(parseSave(JSON.stringify(s)).expansion.stage,1);
});

test('hint levels progressively reveal only requested detail, with exact inputs confined to level three',()=>{
 const levels=['material-only','compare-time-and-id','secret-input'];const first=hintMarkup('test',levels,0);assert.match(first,/material-only/);assert.doesNotMatch(first,/compare-time-and-id|secret-input/);assert.match(first,/展开二级提示/);
 const second=hintMarkup('test',levels,1);assert.match(second,/compare-time-and-id/);assert.doesNotMatch(second,/secret-input/);assert.match(second,/展开三级提示/);assert.match(hintMarkup('test',levels,2),/secret-input/);
 for(const group of [...caseHints,...archiveHints]){assert.equal(group.length,3);assert.doesNotMatch(group.slice(0,2).join(' '),/1264|B1018|HS032316|选s3|选m4|填.*03281430|输入20240912/);}
});

test('recovery presents two timeline-wrong songs; repeated hint opening does not escalate',()=>{
 const before={document:globalThis.document,window:globalThis.window};const state=ended(),view={innerHTML:''};let shown='';
 globalThis.document={addEventListener(){},querySelector(){return null;}};globalThis.window={addEventListener(){}};
 try{const ui=createArchive({getState:()=>state,save(){},view,heading:(_k,t)=>t,esc:escapeHTML,toast(){},showReader:(_title,html)=>shown=html,render(){}});ui.handleRoute('recover','');const songs=[...view.innerHTML.matchAll(/name="song" value="([^"]+)"/g)].map(m=>m[1]);assert.equal(songs.length,3);state.expansion.evidence=[...EXP_REQUIREMENTS[0]];
 for(const wrong of songs.filter(s=>s!=='夜空中最亮的星')){assert.ok(archiveDocs.radio.rows.some(r=>r[0]!=='2024-09-13'&&r.at(-1)===wrong));assert.equal(recoverStaffAccount(state,wrong).ok,false);}assert.equal(recoverStaffAccount(state,'夜空中最亮的星').ok,true);
 ui.hints();assert.equal(state.expansion.hint,0);ui.hints();assert.equal(state.expansion.hint,0);assert.doesNotMatch(shown,/密保填/);ui.hints(true);assert.equal(state.expansion.hint,1);assert.doesNotMatch(shown,/密保填/);ui.hints(true);assert.equal(state.expansion.hint,2);assert.match(shown,/密保填/);
 }finally{for(const [key,value] of Object.entries(before)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
