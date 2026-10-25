import {MATERIALS,normalize} from './registry.js';

// No solutions in site scripts. This module is imported only by the notebook's reasoning pane.
export const QUESTIONS=[
 {id:'meal',text:'同桌吃过夜宵，足以确认感染来自这顿饭。',expected:'unsupported',alternatives:[['receipt','tablePhoto'],['receipt','dormLog']],reason:'能核对购买和食用情况；这些材料没有传播方向、感染时间或病原检测依据。'},
 {id:'deleted',text:'益达说“删掉那三张”，指的是检验报告。',expected:'refuted',alternatives:[['deleteRequest','photoIndex','intake'],['dormLog','photoIndex','intake']],reason:'F1018照片袋与R0315报告属于不同文件组，接收清单把两件事分别登记。'},
 {id:'source',text:'第三张图足以独立计作第三位就诊者。',expected:'refuted',alternatives:[['reportBy','anonymous','intake']],observations:2,reason:'同一份用后纸面痕迹被复制，收稿原件也指向同一报告；这不说明谁编辑了图片。'},
 {id:'return',text:'朱贵说3月21日从早到晚都不在学校。',expected:'refuted',alternatives:[['leaveClaim','album','handover']],reason:'相册只拍到背影，交接场记才补足姓名。它们支持下午返校，不否定上午就医，也不证明改图。'},
 {id:'editor',text:'搬运打印机的人就是改图提交人。',expected:'unsupported',alternatives:[['album','handover']],reason:'设备接触与编辑、提交是不同动作；目前没有相关源文件和投稿凭据。'}
];
export const STANCES={supported:'有材料支持',refuted:'有反证',unsupported:'证据不足',pending:'暂不判断'};
export function verifyClaim(state,claim){const q=QUESTIONS.find(q=>q.id===claim?.question);if(!q)return {ok:false,code:'question',message:'请选择要核对的说法。'};const ids=[...new Set(claim.sources||[])].filter(id=>state.evidence[id]);if(!claim.note?.trim())return {ok:false,code:'explanation',message:'先写一句你的理由，不必使用标准答案措辞。'};if(claim.stance!==q.expected)return {ok:false,code:'stance',message:'这个判断仍跨过了一步。想一想原件证明的是哪一个具体动作。'};if(!q.alternatives.some(set=>set.every(id=>ids.includes(id))))return {ok:false,code:'materials',message:'引用还不能覆盖这个判断。可以换一组独立来源，不需要把所有材料都收齐。'};if(new Set(ids.map(id=>MATERIALS[id].origin)).size<2)return {ok:false,code:'copies',message:'这些是同源副本，不能重复计作独立证据。'};if(q.observations&&['fold','pen','number'].filter(id=>state.marks.report?.value?.includes(id)).length<q.observations)return {ok:false,code:'observations',message:'还需要留下图像观察记录。调查本的原件对照可以标记你实际看见的纸面痕迹。'};return {ok:true,code:'verified',message:q.reason};}
export function phaseReady(state){return ['meal','deleted','source','return'].every(id=>Object.values(state.hypotheses).some(h=>h.value?.question===id&&verifyClaim(state,h.value).ok));}
export {testCredential} from './credentials.js';
export function checkMarks(marks){if(marks.some(id=>['template','seal','noise'].includes(id)))return {ok:false,message:'模板格线、印章和打印底噪会在不同报告上重复出现，不能单独识别这一张用过的纸。'};return ['fold','pen','number'].filter(id=>marks.includes(id)).length>=2?{ok:true,message:'已记录两处辨认特征。它们支持同源判断，编辑者仍需另证。'}:{ok:false,message:'目前观察还不足以区分同模板与同一张纸。可继续缩放对齐。'};}
