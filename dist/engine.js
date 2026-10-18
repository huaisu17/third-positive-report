import {freshNetwork,parseNetwork} from './network-engine.js?v=43';
import {NETWORK_CLUES} from './network-content.js?v=43';
import {freshExpansion,parseExpansion} from './expansion-engine.js?v=43';
export const SAVE_KEY='qinghe.third-report.v1';
export const CLUES={
 post:{id:'post',title:'原帖里的三份材料',code:'E03',text:'前两张是我和乌鸡的。最后一张是小号发来的，飞星也不认识他。',route:'#post/reports'},
 source:{id:'source',title:'飞星的投稿来源说明',code:'E04',text:'问过飞星了。那人只说自己也查出来了，没说班级，追问也没回。',route:'#chat/azhe'},
 diary:{id:'diary',title:'益达之前也有过腹泻',code:'E05',text:'益达3月11日就拉过肚子。他说后来查了，没有查出幽门，报告在家。',route:'#doc/notebook'},
 printing:{id:'printing',title:'一次普通的打印委托',code:'E13',text:'我请朱贵帮忙打印过报告。他说原图先留着，需要再印就找他。',route:'#chat/chen'},
 comment:{id:'comment',title:'说法逐渐发生了变化',code:'R01',text:'有人已经在传“一顿夜宵吃出三个”，但飞星没这么写。',route:'#post/reports'}
};
export const OPENING_DOC_CLUES=Object.freeze({by:'reportBy',wuji:'reportWuji',unknown:'reportUnknown',notebook:'diary'});
Object.assign(CLUES,{
 reportBy:{id:'reportBy',code:'A',title:'报告A · by的检查结果',text:'3月15日的呼气检查结果为阳性。纸张左下有折痕，结果旁有蓝笔圈画。',route:'#doc/by'},
 reportWuji:{id:'reportWuji',code:'B',title:'报告B · 乌鸡的检查结果',text:'3月18日的呼气检查结果为阳性。纸面平整，没有手写圈画。',route:'#doc/wuji'},
 reportUnknown:{id:'reportUnknown',code:'C',title:'报告C · 第三张附件',text:'图中日期写着3月14日，结果为阳性，纸面有折痕和蓝笔圈画；持有人身份未核实。',route:'#doc/unknown'}
});
Object.assign(CLUES,NETWORK_CLUES);
export function freshState(){return {version:1,introDone:false,read:[],discoveredPosts:[],clues:[],deduced:false,finished:false,hint:0,opened:['by','wuji'],easter:[],caseStage:0,caseSolved:false,activeAccount:'by',savedDocs:[],folders:[],caseHint:0,endingChoice:null,expansion:freshExpansion(),network:freshNetwork()};}
export function parseSave(raw){try{const x=JSON.parse(raw);if(!x||x.version!==1)return freshState();const s=freshState();for(const k of ['introDone','deduced','finished'])s[k]=x[k]===true;for(const k of ['read','opened','easter'])s[k]=Array.isArray(x[k])?[...new Set(x[k].filter(v=>typeof v==='string'&&v.length<100))].slice(0,300):s[k];s.discoveredPosts=[...new Set([...(Array.isArray(x.discoveredPosts)?x.discoveredPosts:[]),...s.read.filter(v=>v.startsWith('post:')).map(v=>v.slice(5))].filter(id=>['noodles','exam','printing','sports'].includes(id)))];s.clues=Array.isArray(x.clues)?[...new Set(x.clues.filter(v=>Object.hasOwn(CLUES,v)))]:[];s.hint=Number.isInteger(x.hint)?Math.min(3,Math.max(0,x.hint)):0;if(!s.deduced)s.finished=false;s.caseStage=s.finished&&Number.isInteger(x.caseStage)?Math.max(0,Math.min(8,x.caseStage)):0;s.caseSolved=s.finished&&s.caseStage===8&&x.caseSolved===true;if(s.caseStage===8&&!s.caseSolved)s.caseStage=7;s.activeAccount=['by','jie','yida','azhe'].includes(x.activeAccount)?x.activeAccount:'by';s.savedDocs=Array.isArray(x.savedDocs)?[...new Set(x.savedDocs.filter(v=>typeof v==='string'&&v.length<50))].slice(0,100):[];s.folders=s.finished&&s.caseStage>=5&&Array.isArray(x.folders)&&x.folders.includes('makeup')?['makeup']:[];s.caseHint=Number.isInteger(x.caseHint)?Math.min(2,Math.max(0,x.caseHint)):0;s.endingChoice=s.caseSolved&&['apology','later'].includes(x.endingChoice)?x.endingChoice:null;if(!s.finished){s.activeAccount='by';s.savedDocs=[];}s.expansion=parseExpansion(x.expansion,s.caseSolved);s.network=parseNetwork(x.network,s);return s;}catch{return freshState();}}
export function addClue(state,id){if(!Object.hasOwn(CLUES,id)||state.clues.includes(id))return false;state.clues.push(id);return true;}
export function recordOpeningDocument(state,id){if(!Object.hasOwn(OPENING_DOC_CLUES,id)||!canReadDoc(state,id))return false;let changed=addClue(state,OPENING_DOC_CLUES[id]);if(!state.read.includes('doc:'+id)){state.read.push('doc:'+id);changed=true;}if(!state.opened.includes(id)){state.opened.push(id);changed=true;}return changed;}
export function normalize(s){return String(s??'').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');}
export function searchItems(query,items){const q=normalize(query);if(!q)return [];return items.map((x,i)=>{const name=normalize(x.title);const words=normalize([x.title,...(x.keywords??[]),x.summary??''].join(' '));return {x,i,rank:name===q?0:name.includes(q)?1:words.includes(q)?2:99};}).filter(v=>v.rank<99).sort((a,b)=>a.rank-b.rank||a.i-b.i).map(v=>v.x);}
export function judgeDeduction(evidence,conclusion){const selected=new Set(evidence);if(selected.size<2)return {ok:false,message:'先选出至少两条能够支持判断的材料。你可以回到原帖，或者问问飞星。'};if(conclusion!=='unverified')return {ok:false,message:'先等等，这样就认定是益达，超出了现在知道的事。再看看飞星到底认不认识第三个人。'};if(!selected.has('post')||!selected.has('source'))return {ok:false,message:'想法没问题。把原帖和问飞星那段一起选上，才记得清楚这件事。'};return {ok:true,message:'判断成立。飞星也不认识第三个人，现在还认不出来。至于益达，先去问问他。'};}
export function progress(state){return [state.clues.includes('post'),state.clues.includes('source'),state.finished];}
export function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

// Private keepsakes appear only after the report deduction and the investigation of Yida.
export function canReadDoc(state,id){return id!=='letter'||(state.deduced===true&&state.read.includes('chat:yida')&&state.read.includes('doc:notebook')&&state.read.includes('memory:yida-letter'))||(state.finished&&state.caseStage>=1&&state.read.includes('casefile:deleted'));}

export const CASE_REQUIREMENTS=[
 ['receipt','mealPhoto'],['deletion','yidaResult'],['scope','quote'],['submission'],
 ['printing','flow','denial'],['examNotice','lin'],['quote','withdrawal','pressure'],
 ['sameImage','submission','printing','flow','scope','denial','lin','examNotice','withdrawal']
];
Object.assign(CLUES,{
 receipt:{id:'receipt',code:'E07a',title:'食堂取餐条',text:'3月13日，火鸡面、饭团和紫菜汤分开计价。取餐号0367。',route:'#casefile/receipt'},
 mealPhoto:{id:'mealPhoto',code:'E07b',title:'那晚桌上的两只碗',text:'左边是杰哥的火鸡面，右边的汤碗挨着益达的饭团。不是摆了两只碗，就吃了同一份面。',route:'#casefile/mealphoto'},
 deletion:{id:'deletion',code:'E08',title:'删掉的是信件照片',text:'益达与杰哥的私信说的是运动会后拍的三张信件照片。那天他让杰哥别再拍，原信由益达保留。',route:'#casefile/deleted'},
 yidaResult:{id:'yidaResult',code:'E09',title:'益达主动拿来的结果',text:'3月12日的检查未检出幽门，和益达先前说的一致。不能再把他那次拉肚子直接算成感染。',route:'#casefile/yida-result'},
 scope:{id:'scope',code:'E10a',title:'语文卷最后面的两页',text:'我在3月25日午休只向朱贵说过，复印件夹在语文卷最后。随后匿名回复提到了这个放置位置。还要追问有没有转述。',route:'#casefile/lunch'},
 quote:{id:'quote',code:'E10b',title:'Q0325-07 · 引用留存',text:'飞星当晚保留的7楼引用写着“语文卷最后面”。花洒旧事全宿舍知道，这个新位置不一样。',route:'#casefile/quote'},
 sameImage:{id:'sameImage',code:'E11',title:'同一道折痕和圈画缺口',text:'A与C的左下折痕走向、蓝笔圈画的缺口位置完全相同，日期却不同。C用了我的照片，不能独立算作第三个病例。',route:'#compare'},
 submission:{id:'submission',code:'E12',title:'飞星收到的原始投稿',text:'飞星收到时第三张就已经是这幅图；排除他发帖时误选了我的附件。投稿没有提供班级和真实姓名。',route:'#casefile/submission'},
 flow:{id:'flow',code:'E13b',title:'原图的两个去向',text:'原图既经过杰哥手机，也发给朱贵用于打印。手机不是唯一的来源。',route:'#casefile/transfers'},
 denial:{id:'denial',code:'E13c',title:'朱贵说自己没收过原图',text:'他说只拿纸复印过，但3月17日的完整对话写着“原图我先留着”。这两种说法对不上。',route:'#casefile/denial'},
 examNotice:{id:'examNotice',code:'E14a',title:'3月14日缺考与3月28日补测',text:'补测名单上有朱贵。他缺席的正是开场那次周测，并非后来才涉及这件事。',route:'#casefile/makeup'},
 lin:{id:'lin',code:'E14b',title:'啊水转来的那段话',text:'朱贵3月21日曾对啊水说自己3月14日就查出幽门。这是他的自述，不是医院确认。',route:'#casefile/lin'},
 withdrawal:{id:'withdrawal',code:'E15a',title:'两种不同的撤改',text:'飞星把未经核实的“三人”说法改成待核实；匿名作者自己撤回了6、7楼。不是同一个动作。',route:'#casefile/withdrawal'},
 pressure:{id:'pressure',code:'E15b',title:'先别查了',text:'朱贵知道我开始查图以后，提起杰哥的手机，劝我把事情停下来。杰哥后来仍愿意交出相关副本。',route:'#casefile/pressure'}
});
export const GAME_ACCOUNTS={
 jie:{username:'jiege',password:'1264',stage:0,name:'杰哥'},
 yida:{username:'yida',password:'b1018',stage:1,name:'益达'},
 azhe:{username:'heshe',password:'hs032316',stage:3,name:'飞星'}
};
export function canUseAccount(state,id){return Object.hasOwn(GAME_ACCOUNTS,id)&&state.finished&&state.caseStage>=GAME_ACCOUNTS[id].stage;}
export function checkAccountLogin(state,username,password){
 const name=String(username??'').normalize('NFKC').trim().toLowerCase();
 const found=Object.entries(GAME_ACCOUNTS).find(([,a])=>a.username===name);
 if(!found||!canUseAccount(state,found[0]))return {ok:false,message:'账号没有对上，或者你还没拿到这个账号的线索。'};
 const pass=String(password??'').normalize('NFKC').trim().toLowerCase();
 if(found[0]==='azhe'&&pass==='0323')return {ok:false,message:'需补充校刊英文缩写，缩写放在前面；随后还要核对阅览规则的其余部分。'};
 if(pass!==found[1].password)return {ok:false,message:'口令不对。回看账号说明和另一份材料，别把取餐号、排班天数或下一期编号直接当答案。'};
 return {ok:true,account:found[0],message:'登录成功。'};
}
export function unlockCaseFolder(state,password){if(!state.finished||state.caseStage<5)return {ok:false,message:'现在还没有这份资料夹。'};if(String(password??'').normalize('NFKC').replace(/\D/g,'').slice(-8).padStart(8,'0')!=='03281430')return {ok:false,message:'没有对上。口令是补测的月日，再接24小时制的开考时间。'};if(!state.folders.includes('makeup'))state.folders.push('makeup');return {ok:true,message:'资料夹已打开。'};}
const sameMembers=(a,b)=>Array.isArray(a)&&a.length===b.length&&new Set(a).size===b.length&&b.every(x=>a.includes(x));
export function judgeCaseStep(state,step,payload={}){
 if(!state.finished||!Number.isInteger(step)||step<0||step>7||step>state.caseStage)return {ok:false,message:'先把前面的事问清楚，再来这里。'};
 const missing=CASE_REQUIREMENTS[step].filter(id=>!state.clues.includes(id));
 if(missing.length)return {ok:false,message:'还有材料没记下来：'+missing.map(id=>CLUES[id].title).join('、')+'。'};
 let good=false,message='还有地方没对上，回到旁边的材料再看一眼。';
 if(step===0){good=Array.isArray(payload.order)&&payload.order.join(',')==='pickup,shower,mix,taste'&&payload.bowl==='own';message='小票记录了买来的东西，照片拍在后来。先分清这两个时点，再核对每只碗对应的商品。';}
 if(step===1){good=payload.deleted==='letter'&&payload.result==='negative';message='删照片的对话说了文件拍的是什么；检查结果则要看益达拿来的那一张，不能拿早先拉肚子代替。';}
 if(step===2){good=payload.bathroom==='dorm'&&payload.letter==='dorm'&&payload.folder==='chen';message='知情范围要以匿名发言前为界。有人知道旧事，不等于也听过这次午休的新消息。';}
 if(step===3){good=sameMembers(payload.marks,['fold','circle']);message=payload.marks?.includes('stamp')?'印章的角度不唯一：同一批盖章可能保持近似方向，扫描底版也可能重复印章。它不能区分两张独立报告。':payload.marks?.includes('noise')?'打印灰点可能来自同一台设备、扫描底版或复印过程。出现同样噪点只能提示设备或模板相同，不能锁定同一张纸。':'模板、项目和阳性结论都会重复。请找与纸张使用过程有关、能具体对齐的痕迹，并核对收稿原件。';}
 if(step===4){good=sameMembers(payload.paths,['by-jie','by-chen','anonymous-azhe']);message='原图不只经过一部手机。重看你与朱贵的打印对话，以及飞星收稿时的附件。';}
 if(step===5){const date=v=>String(v??'').replace(/\D/g,'').slice(-4);good=date(payload.absence)==='0314'&&date(payload.check)==='0315'&&date(payload.print)==='0317';message='三个日期分别来自考试记录、报告和打印对话。别把聊天中回忆的日期当成聊天发生的日期。';}
 if(step===6){good=payload.edit==='azhe'&&payload.remove==='author';message='正文更改和楼层撤回属于两条操作记录。按各自记录里的行为人判断，不能因为楼主改过正文就认定他也撤过楼层。';}
 if(step===7){good=payload.person==='chen'&&payload.image==='sameImage'&&payload.access==='printing'&&payload.information==='scope'&&payload.motive==='examNotice'&&payload.source==='unknown';message='把四层依据分别放好：同源图、原图接触、私下消息、缺考动机。指认假材料的制作人与认定感染源，是两个问题。';}
 return good?{ok:true,message:'这几件事对上了。',reward:step===3?'sameImage':null}:{ok:false,message};
}
export function completeCaseStep(state,step,payload){const result=judgeCaseStep(state,step,payload);if(!result.ok)return result;if(result.reward)addClue(state,result.reward);if(step===state.caseStage){state.caseStage++;state.caseHint=0;if(step===7)state.caseSolved=true;}return result;}
export function chooseCaseEnding(state,choice){if(!state.caseSolved||!['apology','later'].includes(choice))return false;state.endingChoice=choice;return true;}
