import {CLUES} from './engine.js?v=43';
import {archiveDocs,cacheFragments} from './expansion-content.js?v=43';
import {caseDocs} from './campaign.js?v=43';
import {docs,chats,posts} from './content.js?v=43';
import {EXP_EDGES,edgeKey} from './expansion-engine.js?v=43';
export const SPRING_BV='BV1Qh4y1p3Ct';
export const AUTUMN_BV='BV1Qh4y1q7Hs';
export const AUDIT_EDGES=EXP_EDGES.map(e=>({...e,key:edgeKey(e)}));
export const REQUIRED_FIRST=['reportBy','reportUnknown','source','printing','submission','printerFrame','leaveClaim'];
export const REQUIRED_SECOND=['roster','swipe','attendance','signoff','medical','medication','summary','cache'];
export const EVIDENCE={};
for(const [id,c]of Object.entries(CLUES))EVIDENCE[id]={...c,site:'forum',params:{view:'doc',id},access:'public'};
const original={reportBy:'by',reportWuji:'wuji',reportUnknown:'unknown',diary:'notebook'};
for(const [id,key]of Object.entries(original))Object.assign(EVIDENCE[id],{image:docs[key].image,body:docs[key].description||docs[key].subtitle||'',access:'public'});
for(const d of Object.values(caseDocs))if(d.clue)Object.assign(EVIDENCE[d.clue],{...EVIDENCE[d.clue],body:d.body,image:d.image,access:d.owner==='by'?'public':d.owner,sourceDoc:d.id});
for(const [id,d]of Object.entries(archiveDocs))EVIDENCE[id]={id,code:'H-'+id,title:d.title,text:d.summary,body:d.body,image:d.image,columns:d.columns,rows:d.rows,site:['roster','swipe','attendance','signoff','outage','contract','summary'].includes(id)?'canteen':'pan',params:{view:id},access:['authorization','oldpost','radio'].includes(id)?'first':['roster','attendance','signoff','outage','contract','summary','blackboard'].includes(id)?'first':'clinic'};
Object.assign(EVIDENCE,{
 post:{...EVIDENCE.post,params:{thread:'reports'}},
 source:{...EVIDENCE.source,body:'<p>飞星：前两张我知道是谁的。第三张是一个小号发来的，追问班级没回。这不是三名学生身份都已经核实。</p>',params:{thread:'source'}},
 printing:{...EVIDENCE.printing,body:chats.chen.messages.map(([who,text])=>`<p><b>${who==='chen'?'朱贵':'by'}：</b>${text}</p>`).join(''),params:{thread:'printing'}},
 leaveClaim:{id:'leaveClaim',code:'P03',title:'3月14日请假与补测记录',text:'朱贵称当天下午在医院；语文周测14:00—15:00缺席。',body:'<p>啊水：14号那场语文周测是下午两点到三点。朱贵没来，后来对我说那天下午在医院查幽门。我没有替他核过报告。</p><p>缺考登记没有写诊断，只能证明他没来考试。他说的就诊地点和时间，需要另找材料核对。</p>',site:'forum',params:{thread:'leave'},access:'public'},
 printerFrame:{id:'printerFrame',code:'V03',title:'春季花絮01:24：打印机搬运',text:'2025-03-14 14:26，朱贵在学生会器材处搬运打印机；身份另有场记确认。',site:'video',params:{bv:SPRING_BV,t:'84'},access:'public'},
 printerRegister:{id:'printerRegister',code:'V04',title:'学生会设备交接与场记',text:'器材处交接登记：3月14日14:20—14:35，朱贵、阉鸡搬运打印机QH-P02；摄影社场记确认。',site:'pan',params:{folder:'spring'},access:'springShare'},
 sameImage:{...EVIDENCE.sameImage,access:'compared'},
 receipt:{...EVIDENCE.receipt,site:'canteen',params:{view:'card'},access:'card'},
 submission:{...EVIDENCE.submission,site:'pan',params:{folder:'heshe',file:'submission'},access:'azhe'},
 diary:{...EVIDENCE.diary,body:docs.notebook?.description||'<p>益达3月11日拉过肚子，后来查过，说没有查出幽门。by没带纸那件事是by自己中午讲的，不能当成只有益达才知道的秘密。</p>'},
 auditReview:{id:'auditReview',code:'A05',title:'出具单位、设备与财务复核回函',text:'原单存根、停电工单和付款凭证完成复核。结论针对失实验收与漏列，不认定传播来源。',site:'pan',params:{folder:'review'},access:'auditReview'}
});
Object.assign(EVIDENCE,{
 forumSnapshot:{id:'forumSnapshot',code:'Q0325-07',title:'Q0325-07：7楼引用留存',text:'飞星保存的引用副本，留存于3月25日18:42，早于版主屏蔽和作者撤回。',site:'pan',params:{folder:'snapshots'},access:'public',body:'<p>文件：Q0325-07_引用留存.html · 留存人：飞星</p><p>原楼层：03-25 12:36，早睡观察员。</p><blockquote>不是说两页复印件都夹在语文卷最后面了吗，拿出来看日期就知道了。老绕着吃面说干什么。</blockquote><p>03-25 18:42：引用副本保存。03-26 18:33：版主暂时屏蔽。03-28 12:15：原作者撤回。三项操作并不是一回事。</p><p>这份副本只能核对当时说过什么，不包含账号实名，也不能凭一个昵称认人。原发言提到的打印资料，还要和委托记录对照。</p>'},
 routingMemo:{id:'routingMemo',code:'JK-0330-07-R',title:'医务室收文转交页（复印）',text:'JK-0330-07的转交时间为3月30日16:20；遮盖层下保留着原文字。需与签收和汇总原件核对。',site:'pan',params:{folder:'clinic',file:'routingMemo'},access:'clinic',manualRead:true,body:'<p>小范留存 / 仅限本次核查 / 转交页JK-0330-07-R</p><p>收文号：JK-0330-07。去标识副本转交至健康资料汇总岗。</p><p>转交时间：<span class="arg-redacted" role="button" tabindex="0" aria-expanded="false" aria-label="涂黑的转交时间" data-redaction="routingMemo">03月30日 16:20</span></p><p>扫描备注：副本用文字底色遮盖了部分栏目，未重新生成图像；签收内容以原件为准。</p><p>同批签收记录仍在复查回执中，4月1日的汇总底稿另存于后勤资料。转交页不包含患者姓名，也不用于确定感染来源。</p>'}
});
Object.assign(EVIDENCE,{
 clockNote:{id:'clockNote',code:'BBS-L21',title:'水房回帖：后门机的两分钟',text:'13日后门终端QH-HM01屏显快两分钟；那批导出已按设备登记校正，不能再减一次。',site:'forum',params:{thread:'lights'},access:'public',body:'<p>不用给我留饭：灯亮了总算能看见拖把桶了。顺便问一句，13号后门那台刷卡机的时间还修不修？我看它比铃声快两分钟。</p><p>路过的人：师傅登记的是QH-HM01。他说那天屏幕快两分钟，那批导出会校回服务器时间，别拿屏幕照片直接比，也别看导出时又减一遍。我上回就是这么多扣了一次，白跟人争半天。</p>'},
 screenMemory:{id:'screenMemory',code:'BBS-R05',title:'杰哥记得的后门屏显',text:'杰哥记得13日晚后门屏显20:43、有一次周转交接；他说没看清办理人，时间是看屏幕记的。',site:'forum',params:{thread:'reports'},access:'public',body:'<p>杰哥：你们一直问时间，我想起13号晚自习中间去接水，看见后门有人办周转，那台屏幕是20:43。单子上R0313几个字倒挺大。我记时间应该不会差。</p><p>by：谁在那里？</p><p>杰哥：背影我哪认得。时间是抬头看屏幕记的，不是看表。你别替我补个人进去。</p>'}
});
EVIDENCE.swipe.body+='<p>后门终端机号QH-HM01。导出“日期时间”采用服务器基准，已应用当日设备偏差登记；现场屏显与本表不是同一时间基准。校时情况曾在水房维修回帖中说明。</p>';
EVIDENCE.medical.body+='<p>另两份去标识送达记录：R09于3月30日经医生确认复查阳性、3月31日送达；R12仍待复查，不列为已确认阳性。它们和R07一起出现在医务室交接册，不能继续写“无新增待核”。</p>';
export const MATERIALS={caseDocs,archiveDocs,cacheFragments,posts};
export const CLIPS={
 [SPRING_BV]:{id:SPRING_BV,title:'春季接力展示｜相机后面比跑道还忙',up:'青禾摄影社',date:'2025-03-16',duration:132,prefix:'spring',frames:[0,28,84,112],capture:'printerFrame',description:'3月14日下午的社团展示。置顶有四张关键帧，别把视频上传时间当成拍摄时间。源素材提取顺序：拍摄月日四位，接器材交接地点缩写。',share:'spring',danmaku:[{at:4,text:'青禾的跑道永远有一条线是歪的'},{at:16,text:'后排好像在搬什么东西'},{at:29,text:'最后一棒别回头啊'},{at:44,text:'这是周五下午，语文周测我还没写完'},{at:61,text:'镜头往右一点谢谢'},{at:84,text:'朱贵不是说请假去医院了吗，怎么在学生会搬打印机'},{at:91,text:'别只靠弹幕认人，场记应该有设备交接'},{at:108,text:'打印机比人还难抬'},{at:121,text:'时间看DV角落，上传晚了两天'}]},
 [AUTUMN_BV]:{id:AUTUMN_BV,title:'秋季运动会原片｜照片袋里到底是哪台机',up:'青禾摄影社',date:'2024-10-20',duration:132,prefix:'autumn',frames:[0,28,84,112],capture:'videoFrame',share:'relay',description:'2024年10月18日正式比赛。源素材提取规则：片头拍摄月日，接场记机位字母。试拍和补拍另存。',danmaku:[{at:6,text:'找照片的同学看简介'},{at:20,text:'别用上传日找底片'},{at:36,text:'接力最后一棒拍糊了'},{at:51,text:'旁边撞了一下相机'},{at:69,text:'这边看台还没坐满'},{at:84,text:'后面的B机牌比人还清楚'},{at:93,text:'试拍跟正式比赛不是同一天'},{at:115,text:'原始登记在网盘'}]}
};

EVIDENCE.ledger.access='vault';for(const id of ['lab-original','lab-edited','settlement'])EVIDENCE[id].access='audit';EVIDENCE.examNotice.access='makeup';

for(const id of ['oldpost','radio'])Object.assign(EVIDENCE[id],{site:'forum',params:{thread:id}});
for(const id of ['draft','medical','medication'])EVIDENCE[id].params={folder:'clinic',file:id};EVIDENCE.authorization.params={folder:'clinic'};EVIDENCE.cache.params={folder:'cache'};EVIDENCE.blackboard.params={folder:'blackboard'};EVIDENCE.ledger.params={folder:'audit'};
for(const id of ['lab-original','lab-edited','settlement'])EVIDENCE[id].params={folder:'archive',file:id};
for(const [id,folder]of [['mealPhoto','jie'],['flow','jie'],['deletion','yida'],['yidaResult','yida'],['withdrawal','heshe'],['examNotice','makeup'],['lin','makeup']])if(EVIDENCE[id])Object.assign(EVIDENCE[id],{site:'pan',params:{folder}});
Object.assign(EVIDENCE.relayRegister,{site:'pan',params:{folder:'relay'},access:'relay'});Object.assign(EVIDENCE.videoFrame,{site:'video',params:{bv:AUTUMN_BV,t:'84'}});

EVIDENCE.medical.rows=[...EVIDENCE.medical.rows,['R09复查','03-30','8.6‰','医生确认阳性；03-31送达JK-0331-09'],['R12随访','03-31','待复查','不作为已确认阳性计数']];

EVIDENCE.authorization.body=EVIDENCE.authorization.body.replace('找回以后会显示临时口令。','核对密保后即可打开我授权的只读副本。');
