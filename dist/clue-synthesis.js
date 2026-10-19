// Pairing proposes an inference; independent corroboration still has to exist.
export const DEDUCTIONS=[
 {id:'memory-clock',pair:['screenMemory','swipe'],requires:['clockNote','signoff'],title:'记住的是屏幕，不是准确时刻',missing:'先核对同机号的校时回帖与周转签收，不要因为差两分钟就说是谁撒谎。',text:'我差点把杰哥记得的20:43和流水20:41当成两次交接。水房帖说13号那台屏幕快两分钟，导出已经校正；再看R0313的20:42本人签收，时间就接上了。该核对的窗口是20:41—20:42，不能再从导出减两分钟，也不能凭回忆里的背影认人。'},
 {id:'absence-frame',pair:['leaveClaim','printerFrame'],requires:['printerRegister'],title:'请假的那段时间',missing:'远景还不能认人。我得先核对摄影场记和设备交接簿。',text:'我把请假记录和现场时间放在一起：14号14:26，朱贵还在器材处搬打印机，交接簿也记了他的名字。他说那天下午在医院，这两处对不上。不过，这还不能单凭一段花絮就说报告是他改的。'},
 {id:'original-submission',pair:['printing','submission'],requires:['sameImage'],title:'原图不是只有一条去路',missing:'先核对匿名附件和我的原图是否同源，别把相似版式当成同一张纸。',text:'我让朱贵打印时发的是原图。飞星收到匿名附件时，折痕和蓝圈缺口就已经在了，所以不是他发帖时点错了图。原图曾交到打印的人手里，这条去向得接着问，不能只盯着杰哥的手机。'},
 {id:'attendance-transfer',pair:['attendance','swipe'],requires:['roster','signoff','draft'],action:'timelineChecked',title:'“全程在场”是后来写上的',missing:'工作卡不能直接认人。还要对班级名册、当天本人签收和补录说明。',text:'我先按名册排掉走读生和邻班，再对了本人签收：王原20:42办过食堂交接，可点名表写他整晚在教室。那行是15号补录的，沿用了前一晚的章。这次对不上的不是学生夜宵时间，是代班记录本身。'},
 {id:'power-ledger',pair:['ledger','outage'],requires:[],vault:true,title:'停电时还在“连续运行”',missing:'要先打开原加密表，截图里的几个字还不能当完整台账。',text:'我对的是同一天、同一条消毒间专用回路：20:18到21:06没有电，也没有备用电源，台账却写20:30到21:00一直通电高温运行。这一段运行记录不可能成立。它说明验收要重查，不能拿来认定谁把幽门传给了谁。'}
];
export function matchDeduction(pair){if(!Array.isArray(pair)||pair.length!==2||pair[0]===pair[1])return null;return DEDUCTIONS.find(d=>d.pair.every(id=>pair.includes(id)))||null;}
export function deductionReady(state,d){return [...d.pair,...d.requires].every(id=>state.evidence[id]?.value===true)&&(!d.action||state.actions[d.action]?.value===true)&&(!d.vault||!!state.vault);}
export function toggleClueSelection(selected,id,checked){if(!checked)return {selected:selected.filter(v=>v!==id)};if(selected.includes(id))return {selected};if(selected.length>=2)return {selected,message:'先取消一条，再选另一条。'};return {selected:[...selected,id]};}
