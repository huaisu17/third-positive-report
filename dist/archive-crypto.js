const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export async function decryptArchive(envelope,password){
 if(!globalThis.crypto?.subtle)throw new Error('当前浏览器无法解密，请使用现代浏览器通过HTTPS打开。');
 if(envelope?.format!=='QH-ARCHIVE-1'||envelope.iterations!==110000)throw new Error('附件格式不受支持。');
 const keyMaterial=await crypto.subtle.importKey('raw',new TextEncoder().encode(String(password).normalize('NFKC').trim()),'PBKDF2',false,['deriveKey']);
 const key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:bytes(envelope.salt),iterations:envelope.iterations},keyMaterial,{name:'AES-GCM',length:256},false,['decrypt']);
 const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(envelope.iv)},key,bytes(envelope.ciphertext));
 const result=JSON.parse(new TextDecoder().decode(plain));
 if(!Array.isArray(result.rows)||!Array.isArray(result.columns)||typeof result.xlsx!=='string')throw new Error('附件内容不完整。');
 return result;
}
export function workbookBlob(payload){return new Blob([bytes(payload.xlsx)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});}
