// The final form summarizes already verified facts; it never grants evidence.
export const CASE_FIELDS=[
 {name:'window',label:'关键时间窗口',options:[['outage-2018-2106','3月13日20:18—21:06'],['plus-two','3月13日20:20—21:08'],['minus-two','3月13日20:16—21:04']]},
 {name:'object',label:'核心物证 / 场所',options:[['phone','杰哥手机里的一张照片'],['disinfection-circuit','消毒间专用回路与电加热消毒柜'],['noodle-window','夜宵面食窗口的取餐号']]},
 {name:'concealed',label:'被隐瞒的关键行为',options:[['no-meal','益达其实也吃了那碗面'],['upload-error','飞星上传时选错了附件'],['unchecked-paid','把未检项目改成合格并用于验收结算']]},
 {name:'report',label:'第三份报告的真正关联人',options:[['yida-positive','益达：另有一份阳性报告'],['zhugui-original','朱贵：使用by原图改日期并匿名投稿'],['azhe-mixup','飞星：整理时误把两份原件混在一起']]}
];
const solution=['outage-2018-2106','disinfection-circuit','unchecked-paid','zhugui-original'];
export function correctReconstruction(values){return CASE_FIELDS.every((field,index)=>values?.[field.name]===solution[index]);}
export function caseActivation(s){return !!s.vault&&(s.actions.confronted?.value===true||s.actions.legacyCaseResolved?.value===true);}
export function caseFileOpen(s){return s.actions.caseReconstructed?.value===true||s.actions.endingB?.value===true;}
export function reconstructionMarkup(s,esc,{draft=null}={}){
 if(!caseActivation(s)&&!caseFileOpen(s))return '';
 const remembered=draft||s.marks['case-reconstruction']?.value||[],done=caseFileOpen(s);
 return `<section class="arg-reconstruction" aria-labelledby="argReconstructionTitle"><h3 id="argReconstructionTitle">🧩 还原真相链</h3><p>我把校时后的20:41—20:42交接与设备工单对齐，再回到那张匿名报告。要交出去的说明，不能把两件不同的事混为一谈。</p><form data-case-reconstruction><p class="arg-case-statement">工单确认的断电窗口是${select(0)}，校时后的交接落在其中；对应的设备是${select(1)}。原始附件与付款依据对应后，我确认需要追问的是${select(2)}；“无新增”也漏列了已经签收的复查材料。最初第三份匿名报告则关联${select(3)}，不能独立算作新增患者。</p><p class="arg-case-requirements">提交前仍须完成五组审计质疑、原件复核，并把记忆中的屏显时间与后勤流水核对。</p><button>${done?'重新核对复盘':'确认这条真相链'}</button><p data-case-result role="status" aria-live="polite"></p></form>${done?caseFile():''}</section>`;
 function select(index){const field=CASE_FIELDS[index];return `<label class="arg-case-blank"><span>${field.label}</span><select name="${field.name}" required><option value="">选择这一环</option>${field.options.map(([value,label])=>`<option value="${value}" ${remembered[index]===value?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`;}
}
function caseFile(){return `<details class="arg-complete-case" open><summary>完整真相档案 &amp; 当事人后续</summary><article><h4>同源的图，不能多算一个人</h4><p>朱贵承认用by交给他打印的原图改过日期，并以匿名投稿维持自己因就诊缺考的说法。飞星收到时就是这张改图，后来在原帖保留了更正。益达的腹泻、照片删除和原信是几件不同的私事，不能拼成他感染并传给室友的证据。</p><h4>被写成“没事”的那些记录</h4><p>后门屏显快两分钟。杰哥记住的20:43，对应已校正导出中的20:41；20:42的本人签收补足了身份，事后补录的“全程在场”不能充当不在场证明。交接发生在消毒间断电时段，连续通电高温台账无法成立。出具单位原单写着未检，校内盖章版却改成合格，继而进入结算。</p><p>医务室在“无新增”汇总前已签收后续复查材料。用药影响初检可靠性，DOB不能用来排序谁先感染。查清的是漏列、改图与失实验收，传播来源仍然没有足够证据确定。</p><h4>事情没有随着最后一张表结束</h4><p>朱贵补完考试，另向老师说明假材料和匿名发言；飞星把更正放回原帖最上面。小范补交交接说明，王原对代班和签收作书面解释。完整清单提交后，学校须依据原件复核更正公开说明、暂停相关验收，退还无法证明完成的对应服务分摊费用。不能把这些责任含糊地写成学生卫生习惯。</p><p>回宿舍那晚，益达翻开本子，问这回还记不记。by说先把误会那页也留着。杰哥端着自己那碗面站在门口：“结案了就别顺手吃我的。”乌鸡把筷子往回收了一点，说自己本来就没打算吃。</p></article></details>`;}
