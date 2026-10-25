// Campus facts are defined here; views do not invent names, dates or document IDs.
export const CAMPAIGN='qinghe-2025-v4';
export const BUILD='4.0.0-p1.1';
export const FACTS=Object.freeze({today:'2025-03-31',meal:'2025-03-13',sports:'2025-03-21',uploaded:'2025-03-24',submission:'2025-03-23',issue:16,nextIssue:17,camera:'B',bv:'BV1Qh4y1p3Ct',reportNo:'QH250315063',reportDate:'2025-03-15',alteredDate:'2025-03-14',dob:'9.6',method:'13C',unit:'DOB',reference:'<4.0',oldPhoto:'2024-10-18',terminal:'QH-HM01'});
export const PEOPLE=Object.freeze({by:{name:'by',role:'高三 / 住校生',registered:'2022-09-04',avatar:0},yida:{name:'益达',role:'高三 / 宿舍记事员',registered:'2022-09-11',avatar:1},jie:{name:'杰哥',role:'高三 / 潜水用户',registered:'2022-10-02',avatar:2},wuji:{name:'乌鸡',role:'隔壁宿舍',avatar:3},feixing:{name:'飞星',role:'版主 / 校刊编辑',registered:'2022-09-03',avatar:4},mj:{name:'mj',role:'摄影社 / 机位B',registered:'2023-03-19',avatar:5},zhugui:{name:'朱贵',role:'打印值班',registered:'2022-10-21',avatar:6},ashui:{name:'啊水',role:'高三文综课代表',registered:'2022-09-06',avatar:7},xiaofan:{name:'小范',role:'原医务室实习人员'},wangyuan:{name:'王原',role:'总务代班'},yanji:{name:'阉鸡',role:'设备搬运'},tudou:{name:'土豆',role:'走读生'},xiaochou:{name:'小丑',role:'学生'},huangchong:{name:'蝗虫',role:'学生'},wanjun:{name:'万君',role:'高三'}});
export const SITES=Object.freeze({forum:{name:'青禾论坛',path:'index.html'},canteen:{name:'一卡通服务',path:'canteen/index.html'},video:{name:'摄影社视频镜像',path:'video/index.html'},pan:{name:'青禾资料柜',path:'pan/index.html'}});
const m=(title,site,path,origin,event,recorded,extra={})=>({title,site,path,origin,event,recorded,...extra});
export const MATERIALS=Object.freeze({
 reportBy:m('by 留存的检验单','forum','index.html?thread=reports#by-report','report-by',FACTS.reportDate,FACTS.reportDate,{type:'报告',asset:'report-by.svg',person:'by'}),
 anonymous:m('被转发的第三张图','forum','index.html?thread=reports#anonymous','report-by',FACTS.alteredDate,'2025-03-23',{type:'报告',asset:'report-anonymous.svg',copy_of:'reportBy',person:'by'}),
 receipt:m('3月13日夜宵回执','canteen','canteen/index.html?view=card','card-server',FACTS.meal,FACTS.meal,{type:'流水',person:'jie'}),
 tablePhoto:m('夜宵桌面照片','forum','index.html?thread=meal#table','dorm-camera',FACTS.meal,FACTS.meal,{type:'照片',person:'jie'}),
 dormLog:m('益达的记事本节选','pan','pan/index.html?file=dormLog','yida-notes',FACTS.meal,'2025-03-30',{type:'笔记',person:'yida'}),
 deleteRequest:m('旧照片的删除请求','pan','pan/index.html?file=deleteRequest','yida-message','2025-03-19','2025-03-19',{type:'消息',person:'yida',access:'editor'}),
 photoIndex:m('退回照片袋目录','pan','pan/index.html?file=photoIndex','yida-photo-bag',FACTS.oldPhoto,'2025-03-19',{type:'目录',person:'yida'}),
 intake:m('第16期收稿清单','pan','pan/index.html?file=intake','editor-mailbox','2025-03-19','2025-03-23',{type:'清单',person:'feixing',access:'editor'}),
 stub:m('蓝皮笔记里的领稿条','forum','index.html?thread=notebook#stub','class-representative','2025-03-23','2025-03-24',{type:'便条',person:'ashui'}),
 readRules:m('校刊共享阅览说明','forum','index.html?thread=archive','editor-policy','2025-03-01','2025-03-01',{type:'规则',person:'feixing'}),
 camera:m('摄影社机位登记','video','video/index.html?view=register','photo-register',FACTS.sports,'2025-03-24',{type:'登记',person:'mj'}),
 album:m('春季运动会相册短片','video',`video/index.html?v=${FACTS.bv}`,'photo-capture',FACTS.sports,FACTS.uploaded,{type:'影像',person:'mj'}),
 handover:m('打印机交接场记','pan','pan/index.html?file=handover','equipment-signoff',FACTS.sports,FACTS.sports,{type:'交接',person:'yanji',access:'sports'}),
 leaveClaim:m('朱贵关于请假的回帖','forum','index.html?thread=printing#leave','zhugui-statement',FACTS.sports,'2025-03-25',{type:'发言',person:'zhugui'})
});
export const normalize=v=>String(v??'').normalize('NFKC').trim().toLowerCase();
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function baseURL(location=globalThis.location){return new URL(location.pathname.includes('/canteen/')||location.pathname.includes('/video/')||location.pathname.includes('/pan/')?'../':'./',location.href);}
export const localURL=(path,location)=>new URL(path,baseURL(location)).href;
export function addressTarget(input){const s=normalize(input);if(!s||s.length>220)return null;if(/^bv/i.test(s))return s===FACTS.bv.toLowerCase()?`video/index.html?v=${FACTS.bv}`:null;if(s.includes('bilibili.com/video/'))return s.split('bilibili.com/video/')[1]?.split(/[/?#]/)[0]===FACTS.bv.toLowerCase()?`video/index.html?v=${FACTS.bv}`:null;const keys=[['qinghe.local','forum'],['青禾论坛','forum'],['canteen.qinghe.edu.cn','canteen'],['一卡通','canteen'],['后勤','canteen'],['摄影社','video'],['pan.qinghe.local','pan'],['资料柜','pan']];for(const [k,v]of keys)if(s===k||s.startsWith(k+'/')||s.startsWith('https://'+k+'/')||s.startsWith('http://'+k+'/')||s=== 'https://'+k||s==='http://'+k)return SITES[v].path;const short={forum:'forum',canteen:'canteen',video:'video',pan:'pan'};return Object.hasOwn(short,s.replace(/^\/?|\/?$/g,''))?SITES[short[s.replace(/^\/?|\/?$/g,'')]].path:null;}
export const siteForPath=path=>path.includes('/canteen/')||path.startsWith('canteen/')?'canteen':path.includes('/video/')||path.startsWith('video/')?'video':path.includes('/pan/')||path.startsWith('pan/')?'pan':'forum';
