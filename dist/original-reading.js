// DOM adapter for the opening case only; the sequel keeps its own collection flow.
export function watchOriginalReading({collector,state,getState,hash,getHash,entered,computer,appWindow,reader,document,image,collect,status,stillAllowed=()=>true}){
 const canRead=()=>getState()===state&&getHash()===hash&&entered()&&!computer.hidden&&!appWindow.hidden&&document.visibilityState!=='hidden'&&(!document.hasFocus||document.hasFocus())&&(!status||status.isConnected)&&stillAllowed()&&
  [...document.querySelectorAll('dialog[open]')].every(dialog=>dialog===reader)&&(!reader||reader.open)&&(!image||(image.complete&&image.naturalWidth>0));
 const refresh=()=>collector.refresh();
 collector.watch({canRead,onRead(){collect();if(status?.isConnected)status.textContent='✓ 已收入调查本';},cleanup(){image?.removeEventListener('load',refresh);image?.removeEventListener('error',refresh);}});
 image?.addEventListener('load',refresh);image?.addEventListener('error',refresh);
 return canRead;
}
