// Four local stills, one clock. No media stream, canvas decoder, or MP4.
export function frameIndex(seconds,starts){let index=0;for(let i=0;i<starts.length;i++)if(seconds>=starts[i])index=i;return index;}
export function danmakuAt(items,time){return items.filter(item=>time>=item.at&&time<item.at+7);}
export const displayTime=value=>`${String(Math.floor(value/60)).padStart(2,'0')}:${String(Math.floor(value%60)).padStart(2,'0')}`;
export function createMockPlayer({duration,starts,onTime,onPause,now=()=>performance.now(),schedule=setInterval,cancel=clearInterval,canPlay=()=>document.visibilityState==='visible'&&!document.querySelector('dialog[open]')}){
 let seconds=0,playing=false,timer=null,stamp=0,generation=0;
 function pause(){generation++;if(timer!==null)cancel(timer);timer=null;playing=false;onPause?.(seconds);onTime(seconds,false,frameIndex(seconds,starts));}
 function seek(value){seconds=Math.max(0,Math.min(duration,Number(value)||0));stamp=now();onTime(seconds,playing,frameIndex(seconds,starts));}
 function play(){if(playing){pause();return;}if(seconds>=duration)seconds=0;playing=true;stamp=now();const token=++generation;onTime(seconds,true,frameIndex(seconds,starts));timer=schedule(()=>{if(token!==generation)return;if(!canPlay()){pause();return;}const t=now();seconds=Math.min(duration,seconds+(t-stamp)/1000);stamp=t;onTime(seconds,true,frameIndex(seconds,starts));if(seconds>=duration)pause();},100);}
 return {play,pause,seek,dispose:pause,getTime:()=>seconds,isPlaying:()=>playing};
}

// Keyboard and small arrow buttons share exactly the same three-second step.
export function stepPlayer(player,direction){player.seek(player.getTime()+direction*3);}
export function handlePlayerKey(event,player,{blocked=false}={}){
 if(!player||blocked||event.defaultPrevented||event.isComposing||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return false;
 if(event.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="slider"]'))return false;
 if(event.code==='Space'||event.key===' '){if(event.target?.closest?.('button,a')||event.repeat)return false;event.preventDefault();player.play();return true;}
 if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();stepPlayer(player,event.key==='ArrowLeft'?-1:1);return true;}
 return false;
}
