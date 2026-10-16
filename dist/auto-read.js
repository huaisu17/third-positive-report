// One visible reading session at a time. Timers never advance the story themselves.
export function createDwellCollector({delay=1500,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let session=null,timer=null,generation=0;
 function stopTimer(){generation++;if(timer!==null)clearTimer(timer);timer=null;}
 function refresh(){if(!session)return;if(!session.canRead()){stopTimer();return;}if(timer!==null)return;const current=session,token=++generation;timer=setTimer(()=>{if(token!==generation||session!==current)return;timer=null;if(!current.canRead())return;session=null;generation++;current.cleanup?.();current.onRead();},delay);}
 function cancel(){stopTimer();session?.cleanup?.();session=null;}
 function watch(next){cancel();session=next;refresh();}
 return {watch,refresh,cancel};
}
