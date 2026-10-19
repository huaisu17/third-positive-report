import {CLIPS} from './arg-content.js?v=46';
export const SITE_IDS=['forum','canteen','video','pan'];
export const SITE_NAMES={forum:'青禾论坛',canteen:'智慧后勤与一卡通',video:'青禾校园视频镜像',pan:'青禾网盘'};
export const normalizeSites=value=>SITE_IDS.filter(id=>id==='forum'||Array.isArray(value)&&value.includes(id));
const canonicalBV=value=>Object.keys(CLIPS).find(id=>id.toLowerCase()===value.toLowerCase())||'BV'+value.slice(2);
const fields={forum:['thread','view','id','q'],canteen:['view'],video:['bv','t','q'],pan:['folder','file']};
function destination(site,url){const params={};for(const key of fields[site])if(url.searchParams.has(key))params[key]=url.searchParams.get(key).slice(0,160);if(params.bv&&/^BV[0-9a-z]{10}$/i.test(params.bv))params.bv=canonicalBV(params.bv);return {site,params};}
export function siteForLocalLink(href,{site='forum',currentURL}={}){
 try{const base=new URL(currentURL),root=new URL(site==='forum'?'./':'../',base),target=new URL(href,base);if(target.origin!==root.origin||!['http:','https:'].includes(target.protocol)||target.username||target.password)return null;
  return SITE_IDS.find(id=>{const path=new URL(id==='forum'?'index.html':id+'/index.html',root).pathname;return target.pathname===path||target.pathname===path.replace(/index\.html$/,'');})||null;
 }catch{return null;}
}
export function resolveSiteAddress(raw,context={}){
 const value=String(raw??'').normalize('NFKC').trim();if(!value||value.length>500)return null;
 if(/^BV[0-9a-z]{10}$/i.test(value))return {site:'video',params:{bv:canonicalBV(value)}};
 const key=value.toLowerCase(),keywords={论坛:['forum',{}],青禾论坛:['forum',{}],后勤:['canteen',{}],智慧后勤:['canteen',{}],食堂:['canteen',{}],一卡通:['canteen',{view:'card'}],视频:['video',{}],校园视频:['video',{}],b站:['video',{}],哔哩哔哩:['video',{}],bilibili:['video',{}],网盘:['pan',{}],青禾网盘:['pan',{}],资料柜:['pan',{}]};
 if(Object.hasOwn(keywords,key)){const [site,params]=keywords[key];return {site,params:{...params}};}
 if(context.currentURL){const site=siteForLocalLink(value,context);if(site)return destination(site,new URL(value,context.currentURL));}
 let input=value;
 if(/^\/?(?:canteen|video|pan)(?:\/|\?|$)/i.test(input)){const match=input.match(/^\/?(canteen|video|pan)(.*)$/i),hosts={canteen:'canteen.qinghe.edu.cn',video:'bilibili.com',pan:'pan.qinghe.local'};let path=match[2]||'/';if(match[1].toLowerCase()==='video'&&/^\/BV/i.test(path))path='/video'+path;input=hosts[match[1].toLowerCase()]+path;}
 if(/^\/?(?:forum\.php|index\.html|thread\.php)(?:\?|$)/i.test(input))input='qinghe.local/'+input.replace(/^\//,'');
 let url;try{url=new URL(/^[a-z][a-z0-9+.-]*:/i.test(input)?input:'https://'+input);}catch{return null;}
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return null;
 const parts=url.pathname.split('/').filter(Boolean),host=url.hostname.toLowerCase();
 if(host==='qinghe.local'){const d=destination('forum',url);if(parts[0]==='thread.php'&&url.searchParams.has('id')){d.params.thread=url.searchParams.get('id').slice(0,80);delete d.params.id;}return d;}
 if(host==='canteen.qinghe.edu.cn'){const d=destination('canteen',url),page=(parts[0]||'').replace(/\.(?:aspx|html)$/i,'');if(page&&!['index','home'].includes(page))d.params.view=page==='workorders'?'outage':page==='order'?'card':page;return d;}
 if(['bilibili.com','www.bilibili.com'].includes(host)){const d=destination('video',url),bv=parts.find(p=>/^BV[0-9a-z]{10}$/i.test(p));if(bv)d.params.bv=canonicalBV(bv);return d;}
 if(host==='pan.qinghe.local'){const d=destination('pan',url);if(parts[0]==='s'&&parts[1])d.params.folder=parts[1].slice(0,80);return d;}
 return null;
}
