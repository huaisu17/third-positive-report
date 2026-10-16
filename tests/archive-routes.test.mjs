// Server-side rendering checks; this is not a browser or a visual acceptance test.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createArchive} from '../dist/expansion-ui.js';
import {freshState,escapeHTML} from '../dist/engine.js';
import {EXP_DOC_GATES,EXP_STEPS,EXP_EDGES,edgeKey} from '../dist/expansion-engine.js';
import {archiveDocs} from '../dist/expansion-content.js';

test('all chapter and document renderers expose working routes without leaking future material',()=>{
 const original={document:globalThis.document,window:globalThis.window,requestAnimationFrame:globalThis.requestAnimationFrame};
 globalThis.document={addEventListener(){},querySelector(){return null;}};globalThis.window={addEventListener(){}};globalThis.requestAnimationFrame=()=>{};
 let state=freshState();const view={innerHTML:'',insertAdjacentHTML(_position,html){this.innerHTML+=html;}};
 const archive=createArchive({getState:()=>state,save(){},view,heading:(_k,title,sub='')=>`<h1>${title}</h1><p>${sub}</p>`,esc:escapeHTML,toast(){},showReader(){},render(){}});
 const routes=new Set(['annex','archive','recover','staff-login','mailbox','vault','board','outcome','notes','resolution','portal','pan']);
 try{
  assert.equal(archive.handleRoute('annex','13'),true);assert.match(view.innerHTML,/先查清第三张/);assert.equal(archive.searchEntries().length,0);
  state.deduced=true;state.finished=true;state.caseSolved=true;state.caseStage=8;
  for(let stage=0;stage<=6;stage++){
   Object.assign(state.expansion,{stage,loggedIn:stage>0,recovered:stage>0,solved:EXP_STEPS.slice(0,stage),evidence:Object.keys(EXP_DOC_GATES).filter(id=>EXP_DOC_GATES[id]<=stage),links:stage>=6?EXP_EDGES.map(edgeKey):[]});
   archive.handleRoute('annex',String(13+stage));assert.match(view.innerHTML,new RegExp(`第 ${13+stage} / 19 章`));assert.doesNotMatch(view.innerHTML,/undefined|\[object Object\]/);
   for(const match of view.innerHTML.matchAll(/href="(#[^"]+)"/g)){const [type,id]=match[1].slice(1).split('/');assert.ok(routes.has(type),match[1]);if(type==='archive')assert.ok(archiveDocs[id],match[1]);if(type==='portal')assert.ok(['timeline','ledger','workorders'].includes(id));if(type==='annex')assert.ok(Number(id)>=13&&Number(id)<=19,match[1]);}
   for(const id of state.expansion.evidence){archive.handleRoute('archive',id);assert.ok(view.innerHTML.includes(archiveDocs[id].title),id);assert.ok(view.innerHTML.includes(`data-archive-collect="${id}"`),id);}
   assert.ok(archive.searchEntries().every(e=>e.route.startsWith('#pan/')?stage>=4:e.route.startsWith('#portal/')?({timeline:1,ledger:5,workorders:5}[e.route.split('/')[1]]<=stage):EXP_DOC_GATES[e.route.split('/')[1]]<=stage));
  }
  archive.handleRoute('mailbox','');assert.match(view.innerHTML,/D0329 \/ 修订02/);archive.handleRoute('vault','');assert.match(view.innerHTML,/id="archiveVault"/);archive.handleRoute('board','');assert.match(view.innerHTML,/已核实 5 \/ 5/);
  archive.handleRoute('outcome','B');assert.doesNotMatch(view.innerHTML,/<h1>B · 公开<\/h1>/);state.expansion.visitedEndings=['A','B'];archive.handleRoute('outcome','B');assert.match(view.innerHTML,/<h1>B · 公开<\/h1>/);
  archive.handleRoute('archive','does-not-exist');assert.match(view.innerHTML,/没有找到/);
 }finally{for(const [key,value] of Object.entries(original)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
