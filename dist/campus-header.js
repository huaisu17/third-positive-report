import {siteURL} from './arg-engine.js?v=43';
const sites=[['forum','青禾论坛'],['canteen','智慧后勤'],['video','校园视频'],['pan','青禾网盘']];
export function campusHeaderMarkup(site){
 const prefix=site==='forum'?'':'../';
 return `<div class="campus-header-inner"><a class="campus-identity" href="${siteURL('forum',{},site)}"><img src="${prefix}assets/favicon.svg" alt="青禾校徽" width="22" height="22"><span>青禾内网服务</span></a><span class="campus-network" title="游戏内模拟网络状态"><i aria-hidden="true"></i>校园内网已连接 <small>8 ms</small></span><nav aria-label="青禾内网服务导航">${sites.map(([id,label])=>`<a href="${siteURL(id,{},site)}"${id===site?' aria-current="page"':''}>${label}</a>`).join('')}</nav></div>`;
}
export function mountCampusHeader(site,doc=document){
 if(doc.querySelector('.campus-header'))return;
 const header=doc.createElement('header');header.className='campus-header';header.innerHTML=campusHeaderMarkup(site);doc.body.prepend(header);
}
