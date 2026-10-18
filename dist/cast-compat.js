// Old saves can contain an already decrypted workbook. Keep the investigation
// intact and update the same author's display name in its rows and stored OOXML.
const cache=new Map();
const rename=text=>text.replaceAll('贺诚','王原');
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function renameStoredWorkbook(encoded){
 if(cache.has(encoded))return cache.get(encoded);
 let result=encoded;
 try{
  const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),view=new DataView(bytes.buffer),checksums=new Map();let offset=0,changed=false;
  while(offset+30<=bytes.length&&view.getUint32(offset,true)===0x04034b50){
   if(view.getUint16(offset+8,true)!==0||(view.getUint16(offset+6,true)&8))return encoded;
   const size=view.getUint32(offset+18,true),start=offset+30+view.getUint16(offset+26,true)+view.getUint16(offset+28,true),end=start+size;
   if(end>bytes.length)return encoded;
   const old=new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(start,end)),next=rename(old);
   if(next!==old){const data=new TextEncoder().encode(next);if(data.length!==size)return encoded;bytes.set(data,start);const crc=crc32(data);view.setUint32(offset+14,crc,true);checksums.set(offset,crc);changed=true;}
   offset=end;
  }
  if(changed){
   let entries=0;
   while(offset+46<=bytes.length&&view.getUint32(offset,true)===0x02014b50){const local=view.getUint32(offset+42,true);if(checksums.has(local))view.setUint32(offset+16,checksums.get(local),true);offset+=46+view.getUint16(offset+28,true)+view.getUint16(offset+30,true)+view.getUint16(offset+32,true);entries++;}
   if(!entries||offset+22>bytes.length||view.getUint32(offset,true)!==0x06054b50)return encoded;
   result=btoa(String.fromCharCode(...bytes));
  }
 }catch{return encoded;}
 if(cache.size>=4)cache.clear();cache.set(encoded,result);return result;
}
export function normalizeSavedWorkbook(payload){
 if(!payload?.rows?.some(row=>row.some(value=>typeof value==='string'&&value.includes('贺诚'))))return payload;
 return {...payload,rows:payload.rows.map(row=>row.map(value=>typeof value==='string'?rename(value):value)),xlsx:renameStoredWorkbook(payload.xlsx)};
}
