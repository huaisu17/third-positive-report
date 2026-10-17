// Shared feedback only; investigation progress remains in state-sync.js.
export function bindNotebookFeedback({dialog,toggle,close}){
 let startedOutside=null;
 const outside=e=>{const r=dialog.getBoundingClientRect();return e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom);};
 dialog.addEventListener('pointerdown',e=>{startedOutside=outside(e);});
 dialog.addEventListener('pointercancel',()=>{startedOutside=null;});
 dialog.addEventListener('click',e=>{const allowed=startedOutside!==false;startedOutside=null;if(dialog.open&&allowed&&outside(e))close();});
 toggle.addEventListener('animationend',e=>{if(e.target===toggle&&e.animationName==='notebookPulse')toggle.classList.remove('is-pulsing');});
 return {
  notify(){if(dialog.open)return;toggle.classList.add('has-unread');toggle.setAttribute('aria-label','随身调查本，有新收录的线索');toggle.classList.remove('is-pulsing');void toggle.offsetWidth;toggle.classList.add('is-pulsing');},
  acknowledge(){startedOutside=null;toggle.classList.remove('has-unread','is-pulsing');toggle.removeAttribute('aria-label');}
 };
}
export function bindExtractionFeedback(form){
 const input=form.querySelector('[name="code"]'),message=form.querySelector('[data-response]');
 if(!input||!message)return ()=>{};
 const clear=()=>{input.classList.remove('is-shaking');input.removeAttribute('aria-invalid');message.classList.remove('is-error');message.textContent='';};
 input.addEventListener('input',clear);
 input.addEventListener('animationend',e=>{if(e.animationName==='codeShake')input.classList.remove('is-shaking');});
 return result=>{clear();message.textContent=result.message||'';if(result.ok)return;input.setAttribute('aria-invalid','true');message.classList.add('is-error');input.classList.remove('is-shaking');void input.offsetWidth;input.classList.add('is-shaking');input.focus({preventScroll:true});};
}
