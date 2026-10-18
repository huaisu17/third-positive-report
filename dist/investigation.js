// Search and hint presentation for the browser-local fictional archive.
export const HOME_POST_IDS=['notice','reports','lights','lost'];
export const HISTORY_TOPICS={
 noodles:['夜宵','宵夜','账单','夜宵账','取餐','车仔面','火鸡面','杰哥'],
 exam:['周测','作文','语文','考试','益达'],
 printing:['打印','复印','委托','朱贵','校刊','禾声'],
 sports:['旧照片','老照片','合照','合影','运动会','照片','相片','益达']
};
const norm=v=>String(v??'').normalize('NFKC').trim().toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
const corrections={'夜肖':'夜宵','夜霄':'夜宵','周侧':'周测','作义':'作文','打映':'打印','打卬':'打印','复映':'复印','旧照篇':'旧照片','运功会':'运动会'};
const terms=['夜宵账单','周测作文','打印委托','旧照片','投稿来源','广播排期'];
export function searchGuidance(query){
 const clean=String(query??'').normalize('NFKC').trim();
 let corrected=clean;for(const [typo,word] of Object.entries(corrections))corrected=corrected.replaceAll(typo,word);
 const q=norm(corrected);
 const suggestions=q?terms.filter(term=>norm(term)!==q&&(norm(term).includes(q)||[...new Set([...q])].filter(c=>term.includes(c)).length>=2)).slice(0,4):[];
 return {query:corrected,corrected:corrected!==clean,suggestions};
}
export function searchableEntry(entry,query){
 const id=entry.route?.startsWith('#post/')?entry.route.slice(6):null,topics=HISTORY_TOPICS[id];
 if(!topics)return true;
 const q=norm(query);return q.length>=2&&topics.some(t=>q.includes(norm(t))||norm(t).includes(q));
}
export function isPostDiscovered(state,id){return !Object.hasOwn(HISTORY_TOPICS,id)||state.discoveredPosts.includes(id);}
export function discoverSearchResults(state,results){let changed=false;for(const r of results){const id=r.route?.startsWith('#post/')?r.route.slice(6):null;if(Object.hasOwn(HISTORY_TOPICS,id)&&!state.discoveredPosts.includes(id)){state.discoveredPosts.push(id);changed=true;}}return changed;}
export function searchArchive(query,items,search){const guide=searchGuidance(query);return {...guide,results:search(guide.query,items.filter(item=>searchableEntry(item,guide.query)))};}
export function hintMarkup(title,levels,depth=0,context=''){
 const n=Math.max(0,Math.min(2,Number.isInteger(depth)?depth:0));
 return `<div class="reader-content progressive-hints"><small>${context} · 按需展开，不扣分</small><h2>${title}</h2>${levels.slice(0,n+1).map((text,i)=>`<details class="hint-level" ${i===n?'open':''}><summary>${['一级 · 疑点材料','二级 · 核对关系','三级 · 具体操作'][i]}</summary><p>${text}</p></details>`).join('')}${n<2?`<button class="secondary" data-next-hint>展开${n===0?'二':'三'}级提示</button>`:'<p class="small-text">已展开全部提示。</p>'}</div>`;
}
