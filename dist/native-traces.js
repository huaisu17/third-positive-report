export const MODERATION_NOTICE='[该回复已被版主 飞星 屏蔽：请勿在公共版面散播未核实传言]';
export function moderationFloors(floor){return floor('路过的人',`<p class="arg-moderated">${MODERATION_NOTICE}</p><p class="arg-trace-date">03-26 18:32 · 暂时屏蔽；03-28 原作者撤回</p>`,6)+floor('早睡观察员',`<p class="arg-moderated">${MODERATION_NOTICE}</p><p class="arg-trace-date">03-26 18:33 · 暂时屏蔽；03-28 原作者撤回</p><p>引用留档号：<code>Q0325-07</code>。引用者说保留了当时的副本，旧主题可按编号检索。</p>`,7);}
export function paintRedactions(doc,store){for(const node of doc.querySelectorAll('[data-redaction]'))if(store.get().evidence[node.dataset.redaction]?.value===true){node.dataset.revealed='true';node.setAttribute('aria-expanded','true');node.setAttribute('aria-label',node.textContent.trim());}}
export function installRedactionInvestigation({document:doc=document,store,onMessage=()=>{}}){
 const reveal=node=>{if(!node||!node.isConnected||node.dataset.revealed==='true')return;const modal=doc.querySelector('dialog[open]');if(modal&&!modal.contains(node))return;const result=store.dispatch('collect',{id:node.dataset.redaction});if(result.ok)paintRedactions(doc,store);else onMessage(result.message);};
 const click=event=>reveal(event.target?.closest?.('[data-redaction]'));
 const key=event=>{if(!['Enter',' '].includes(event.key)||!event.target?.matches?.('[data-redaction]'))return;event.preventDefault();reveal(event.target);};
 const select=()=>{const selection=doc.getSelection();if(!selection||selection.isCollapsed||!selection.rangeCount||!selection.toString().trim())return;const range=selection.getRangeAt(0);for(const node of doc.querySelectorAll('[data-redaction]'))if(range.intersectsNode(node))reveal(node);};
 doc.addEventListener('click',click);doc.addEventListener('keydown',key);doc.addEventListener('selectionchange',select);const unsubscribe=store.subscribe(()=>paintRedactions(doc,store));return ()=>{doc.removeEventListener('click',click);doc.removeEventListener('keydown',key);doc.removeEventListener('selectionchange',select);unsubscribe();};
}
