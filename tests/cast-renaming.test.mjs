import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {people,posts} from '../dist/content.js';
import {casePeople} from '../dist/campaign.js';
import {EVIDENCE,CLIPS,SPRING_BV} from '../dist/arg-content.js';
import {freshArgState,sanitizeArgState,truthy} from '../dist/arg-engine.js';
import {decryptArchive,workbookBlob} from '../dist/archive-crypto.js';
import {recoverStaffAccount,loginStaffAccount} from '../dist/expansion-engine.js';
import {freshState} from '../dist/engine.js';

test('the four original roommates/friends stay intact and new names agree across identity, dialogue and records',()=>{
 assert.deepEqual(['by','yida','jie','wuji'].map(id=>people[id].name),['by','益达','杰哥','乌鸡']);
 assert.equal(people.chen.name,'朱贵');assert.equal(people.azhe.name,'飞星');assert.equal(casePeople.lin.name,'啊水');
 assert.match(EVIDENCE.printing.body,/朱贵/);assert.match(EVIDENCE.authorization.body,/小范/);assert.match(EVIDENCE.authorization.body,/xiaofan/);assert.match(EVIDENCE.draft.body,/王原老师/);
 const names=EVIDENCE.roster.rows.map(row=>row[1]);for(const name of ['土豆','小丑','蝗虫','王原'])assert.ok(names.includes(name));assert.ok(posts.some(post=>post.comments?.some(reply=>reply.name==='万君')));
 const frame=EVIDENCE.printerRegister.text;assert.match(frame,/朱贵、阉鸡/);assert.match(CLIPS[SPRING_BV].danmaku.find(d=>d.at===84).text,/朱贵/);assert.match(fs.readFileSync(new URL('../dist/pan/site.js',import.meta.url),'utf8'),/摄影场记：mj/);
});
test('a v3.0.1 saved decrypted workbook upgrades its author and downloadable OOXML without losing progress',async()=>{
 const legacy=await decryptArchive(JSON.parse(fs.readFileSync(new URL('./fixtures/v3.0.1-archive.json',import.meta.url))),'20240912');assert.match(JSON.stringify(legacy.rows),/贺诚/);
 const s=freshArgState();s.accounts.shenzhi={value:true,tick:2,actor:'old'};s.actions.endingB={value:true,tick:3,actor:'old'};s.vault={value:legacy,tick:4,actor:'old'};
 const next=sanitizeArgState(s);assert.equal(truthy(next,'accounts','shenzhi'),true);assert.equal(truthy(next,'actions','endingB'),true);assert.match(JSON.stringify(next.vault.value.rows),/王原/);assert.doesNotMatch(JSON.stringify(next.vault.value.rows),/贺诚/);
 const binary=new Uint8Array(await workbookBlob(next.vault.value).arrayBuffer()),view=new DataView(binary.buffer);let offset=0,files=0;
 function crc32(data){let crc=0xffffffff;for(const v of data){crc^=v;for(let n=0;n<8;n++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
 const checksums=new Map();let sheet='';while(view.getUint32(offset,true)===0x04034b50){const size=view.getUint32(offset+18,true),start=offset+30+view.getUint16(offset+26,true)+view.getUint16(offset+28,true),data=binary.slice(start,start+size);assert.equal(view.getUint32(offset+14,true),crc32(data));checksums.set(offset,crc32(data));sheet+=new TextDecoder().decode(data);offset=start+size;files++;}
 while(view.getUint32(offset,true)===0x02014b50){assert.equal(view.getUint32(offset+16,true),checksums.get(view.getUint32(offset+42,true)));offset+=46+view.getUint16(offset+28,true)+view.getUint16(offset+30,true)+view.getUint16(offset+32,true);}
 assert.equal(view.getUint32(offset,true),0x06054b50);assert.equal(files,6);assert.match(sheet,/王原/);assert.doesNotMatch(sheet,/贺诚/);assert.match(sheet,/结算附页/);assert.match(sheet,/JS0319-01/);assert.deepEqual(sanitizeArgState(next),next);assert.match(JSON.stringify(legacy.rows),/贺诚/,'the original input is not mutated');
});
test('the rebuilt encrypted archive uses the new name and both old and renamed staff usernames still work',async()=>{
 const payload=await decryptArchive(JSON.parse(fs.readFileSync(new URL('../dist/assets/L-0313.enc.json',import.meta.url))),'20240912');assert.match(JSON.stringify(payload.rows),/王原/);assert.doesNotMatch(JSON.stringify(payload.rows),/贺诚/);
 for(const user of ['xiaofan','shenzhi']){const s=freshState();s.caseSolved=true;s.caseStage=8;s.expansion.stage=0;for(const id of ['authorization','oldpost','radio'])s.expansion.evidence.push(id);assert.equal(recoverStaffAccount(s,'夜空中最亮的星').ok,true);assert.equal(loginStaffAccount(s,user,'sz-read-0331').ok,true);}
});
