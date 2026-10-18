// The archive is a fictional, browser-local investigation. No real accounts are contacted.
export const EXP_STEPS=['account','timeline','medical','cache','vault','board'];
export const EXP_RELATIONS={contradicts:'互相矛盾',amends:'被改写为',settles:'被用于结算'};
export const EXP_EDGES=[
 {from:'attendance',to:'swipe',relation:'contradicts',label:'“全程在教室”与本人在食堂签收不符'},
 {from:'summary',to:'medical',relation:'contradicts',label:'结案汇总漏掉了已经送达的复查结果'},
 {from:'ledger',to:'outage',relation:'contradicts',label:'断电期间，台账却记录连续高温运行'},
 {from:'lab-original',to:'lab-edited',relation:'amends',label:'未完成的抽检被改成全部合格'},
 {from:'contract',to:'settlement',relation:'settles',label:'纸面合格单触发了消杀服务费结算'}
];
export const EXP_DOC_GATES={authorization:0,oldpost:0,radio:0,draft:1,roster:1,swipe:1,attendance:1,signoff:1,medical:2,medication:2,summary:2,cache:3,blackboard:4,ledger:5,outage:5,'lab-original':5,'lab-edited':5,contract:5,settlement:5};
export const EXP_PUBLIC=new Set(['authorization','oldpost','radio','roster','attendance','signoff','summary','blackboard','outage','contract']);
export const EXP_REQUIREMENTS=[['authorization','oldpost','radio'],['roster','swipe','attendance','signoff'],['medical','medication','summary'],['cache'],['blackboard'],[...new Set(EXP_EDGES.flatMap(e=>[e.from,e.to]))]];
export function freshExpansion(){return {puzzleRevision:2,stage:0,solved:[],recovered:false,loggedIn:false,restored:false,vault:false,workbook:null,evidence:[],links:[],ending:null,visitedEndings:[],hint:0,sound:false,noticed:[]};}
const norm=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
export function edgeKey(e){return e.relation==='contradicts'?[e.from,e.to].sort().join('|')+'|'+e.relation:[e.from,e.to,e.relation].join('|');}
export function parseExpansion(raw,caseSolved){const s=freshExpansion();if(!caseSolved||!raw||typeof raw!=='object')return s;
 s.recovered=raw.recovered===true;s.loggedIn=s.recovered&&raw.loggedIn===true;s.restored=raw.restored===true;s.vault=raw.vault===true;
 s.evidence=Array.isArray(raw.evidence)?[...new Set(raw.evidence.filter(id=>Object.hasOwn(EXP_DOC_GATES,id)))]:[];
 // Preserve legitimately completed timelines from the pre-roster revision.
 if(raw.puzzleRevision!==2&&Array.isArray(raw.solved)&&raw.solved.includes('timeline')&&['swipe','attendance','signoff'].every(id=>s.evidence.includes(id)))s.evidence.push('roster');
 s.links=Array.isArray(raw.links)?[...new Set(raw.links.filter(k=>EXP_EDGES.some(e=>edgeKey(e)===k)))]:[];
 for(let i=0;i<EXP_STEPS.length;i++){if(!Array.isArray(raw.solved)||!raw.solved.includes(EXP_STEPS[i])||EXP_REQUIREMENTS[i].some(id=>!s.evidence.includes(id)))break;if(i===0&&!s.recovered||i===3&&!s.restored||i===4&&!s.vault||i===5&&!EXP_EDGES.every(e=>s.links.includes(edgeKey(e))))break;s.solved.push(EXP_STEPS[i]);}
 s.stage=s.solved.length;if(s.stage<4)s.restored=false;if(s.stage<5)s.vault=false;
 if(s.vault&&raw.workbook&&Array.isArray(raw.workbook.columns)&&raw.workbook.columns.length===5&&Array.isArray(raw.workbook.rows)&&raw.workbook.rows.length<=20&&raw.workbook.rows.every(r=>Array.isArray(r)&&r.length===5&&r.every(v=>typeof v==='string'&&v.length<200))&&typeof raw.workbook.xlsx==='string'&&raw.workbook.xlsx.length<30000&&/^[A-Za-z0-9+/=]+$/.test(raw.workbook.xlsx))s.workbook={columns:raw.workbook.columns.map(v=>String(v).slice(0,100)),rows:raw.workbook.rows,xlsx:raw.workbook.xlsx};
 s.evidence=s.evidence.filter(id=>EXP_DOC_GATES[id]<=s.stage);s.links=s.links.filter(k=>EXP_EDGES.some(e=>edgeKey(e)===k&&s.evidence.includes(e.from)&&s.evidence.includes(e.to)));
 s.visitedEndings=Array.isArray(raw.visitedEndings)?[...new Set(raw.visitedEndings.filter(v=>v==='A'||v==='B'&&s.stage===6))]:[];
 s.ending=raw.ending==='B'&&s.stage===6?'B':raw.ending==='A'&&s.stage>=1?'A':null;
 s.hint=Number.isInteger(raw.hint)?Math.max(0,Math.min(2,raw.hint)):0;s.sound=raw.sound===true;
 s.noticed=Array.isArray(raw.noticed)?raw.noticed.filter(v=>EXP_STEPS.includes(v)):[];return s;
}
export function canAccessExpansionDoc(state,id){const s=state.expansion;return !!s&&state.caseSolved&&Object.hasOwn(EXP_DOC_GATES,id)&&s.stage>=EXP_DOC_GATES[id]&&(EXP_PUBLIC.has(id)||s.loggedIn||s.evidence.includes(id));}
export function collectExpansionDoc(state,id){if(!canAccessExpansionDoc(state,id))return false;if(!state.expansion.evidence.includes(id))state.expansion.evidence.push(id);return true;}
function checkStep(state,step){const s=state.expansion;if(!state.caseSolved||!s||step>s.stage)return '先完成当前调查，再打开这一段。';const missing=EXP_REQUIREMENTS[step].filter(id=>!s.evidence.includes(id));return missing.length?'先把本章相关资料保存到笔记，再来核对。':null;}
function advance(state,step){const s=state.expansion;if(step===s.stage){s.solved.push(EXP_STEPS[step]);s.stage++;s.hint=0;}return {ok:true,message:'这一步核对好了。副本已经留在笔记里。'};}
export function recoverStaffAccount(state,answer){const error=checkStep(state,0);if(error)return {ok:false,message:error};if(norm(answer)!==norm('夜空中最亮的星'))return {ok:false,message:'没有对上。先对旧帖的第一次值班日期，再对节目单的末曲。同是周五，并不代表是同一天。'};state.expansion.recovered=true;return {ok:true,message:'临时阅览口令：sz-read-0331。授权只包括小范选出的去标识副本。'};}
export function loginStaffAccount(state,user,password){if(!state.caseSolved||!state.expansion?.recovered)return {ok:false,message:'先按授权说明完成账号找回。'};if(!['xiaofan','shenzhi'].includes(norm(user))||String(password??'').normalize('NFKC').trim()!=='sz-read-0331')return {ok:false,message:'账号或阅览口令没对上。找回页会保留临时口令。'};const error=checkStep(state,0);if(error)return {ok:false,message:error};state.expansion.loggedIn=true;return advance(state,0);}
export function solveExpansion(state,step,answer={}){if(!Number.isInteger(step)||step<1||step>5)return {ok:false,message:'这不是当前的核对项。'};const error=checkStep(state,step);if(error)return {ok:false,message:error};let ok=false,message='还有地方没对上。';
 if(step===1){ok=answer.roster==='m4'&&answer.swipe==='s3'&&answer.attendance==='a2'&&answer.signoff==='r2'&&answer.explanation==='proxy';message='先通过名册区分卡片类别、班级和住校情况；再核对事件日、交易状态、关联单号与签认人。获准的夜宵时段不构成点名矛盾，刷卡也不能单独证明本人到场。';}
 if(step===2){ok=answer.patient==='R07'&&norm(answer.repeat)==='0329'&&answer.interpretation==='unreliable'&&answer.batch==='unknown';message='对照每次检测前的用药准备与医生复查说明，再查报告送达是否早于汇总。DOB数值不能用来给感染排先后。';}
 if(step===3){ok=Array.isArray(answer.fragments)&&answer.fragments.join(',')==='d2-head,d2-tail';message='先按草稿编号和修订号分组，再核对首尾段的时间及内容。同一封信的旧尾段不能直接接到新开头。';if(ok)state.expansion.restored=true;}
 if(step===4){ok=answer.decrypted===true;message='需要实际解开附件，不能只记一个猜到的口令。';if(ok)state.expansion.vault=true;}
 if(step===5){ok=EXP_EDGES.every(e=>state.expansion.links.includes(edgeKey(e)));message='还缺能相互印证的连线。请分别核对到场记录、医疗汇总、消杀运行、抽检改版与合同付款。';}
 return ok?advance(state,step):{ok:false,message};
}
export function linkEvidence(state,from,to,relation){const s=state.expansion;if(!state.caseSolved||!s||s.stage<5)return {ok:false,message:'先打开附件，把这一组材料带回证据板。'};if(from===to||![from,to].every(id=>s.evidence.includes(id)))return {ok:false,message:'请选择两份不同且已保存的证据。'};
 const key=edgeKey({from,to,relation}),edge=EXP_EDGES.find(e=>edgeKey(e)===key);if(!edge)return {ok:false,message:relation==='amends'?'改写有方向：原单在前，改版单在后。再看编号和修订说明。':'这两份材料还不能支持这种关系。记录中的人、时间和用途要对得上。'};
 if(!s.links.includes(key))s.links.push(key);return {ok:true,message:edge.label};
}
export function chooseExpansionEnding(state,ending){const s=state.expansion;if(!state.caseSolved||!s||!['A','B'].includes(ending)||s.stage<1||ending==='B'&&(s.stage!==6||!EXP_EDGES.every(e=>s.links.includes(edgeKey(e)))))return {ok:false,message:'公开结局需要完整证据链和复核材料。现有进度会保留，可以继续补齐。'};s.ending=ending;if(!s.visitedEndings.includes(ending))s.visitedEndings.push(ending);return {ok:true,message:'已记录这个选择。仍可返回调查。'};}
