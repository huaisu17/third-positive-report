import {SITES} from './network-content.js?v=33';
import {siteForRoute,addressForRoute,routeFromAddress} from './network-engine.js?v=33';
export function createSiteShell({getState,save,navigate,toast}){
 function sync(route){const id=siteForRoute(route),site=SITES[id],state=getState();document.querySelector('#appWindow').dataset.site=id;document.querySelectorAll('[data-site-switch]').forEach(b=>{const active=b.dataset.siteSwitch===id;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
  const field=document.querySelector('#virtualAddress'),address=addressForRoute(route);if(address)field.value=address;else if(!field.value.startsWith('qinghe.local/'))field.value='qinghe.local/forum.php';
  document.querySelector('#addressFavicon').src=site.icon;document.querySelector('link[rel="icon"]')?.setAttribute('href',site.icon);
  if(id!=='forum'){document.querySelector('#windowTitle').textContent=site.name;document.querySelector('#taskTitle').textContent=site.name;document.title=site.name+' — 第三份阳性报告';}
  if(state.network.lastRoutes[id]!==route){state.network.lastRoutes[id]=route;save();}
 }
 document.querySelector('#siteTabs').addEventListener('click',e=>{const b=e.target.closest('[data-site-switch]');if(b)navigate(getState().network.lastRoutes[b.dataset.siteSwitch]||SITES[b.dataset.siteSwitch].home);});
 document.querySelector('#siteTabs').addEventListener('keydown',e=>{const tabs=[...document.querySelectorAll('[data-site-switch]')],i=tabs.indexOf(e.target);if(i<0||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length;tabs[next].focus();navigate(getState().network.lastRoutes[tabs[next].dataset.siteSwitch]);});
 document.querySelector('#addressForm').addEventListener('submit',e=>{e.preventDefault();const route=routeFromAddress(document.querySelector('#virtualAddress').value);if(!route){toast('这个地址不在校园存档中。可输入存档网址或BV号。');return;}navigate(route);});
 return {sync,home:()=>SITES[siteForRoute(location.hash)].home};
}
