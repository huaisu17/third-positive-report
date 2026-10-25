import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {MATERIALS,FACTS} from '../dist/v4/shared/registry.js';
const root=path.resolve('dist/v4'),walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(root);let links=0;
for(const file of files){if(file.endsWith('.js')){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);}if(!/\.(?:html|js|css)$/.test(file))continue;const text=fs.readFileSync(file,'utf8');const references=file.endsWith('.html')?[...text.matchAll(/(?:href|src)="([^"${}]+)"/g)].map(m=>m[1]):file.endsWith('.css')?[...text.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map(m=>m[1]):[...text.matchAll(/(?:from\s+|import\()['"](\.\.?\/[^'"?]+)(?:\?[^'"]*)?['"]/g)].map(m=>m[1]);for(const ref of references){if(/^(?:https?:|data:|#)/.test(ref))continue;const target=path.resolve(path.dirname(file),ref.split(/[?#]/)[0]||path.basename(file));assert.ok(fs.existsSync(target),`${path.relative(root,file)} -> ${ref}`);links++;}if(file.endsWith('.html')&&!file.endsWith('playtest.html')){assert.doesNotMatch(text,/campus-header|v3\.0|v4\.0|虚构校园|下一章|系统切换/);assert.match(text,/data-site=/);}}
assert.equal(Object.keys(MATERIALS).length,14);
for(const [id,m]of Object.entries(MATERIALS)){assert.ok(fs.existsSync(path.join(root,m.path.split(/[?#]/)[0])),id);assert.ok(m.origin&&m.recorded&&m.event,id);if(m.copy_of)assert.equal(m.origin,MATERIALS[m.copy_of].origin);}
const by=fs.readFileSync(path.join(root,'assets/report-by.svg'),'utf8'),anon=fs.readFileSync(path.join(root,'assets/report-anonymous.svg'),'utf8');assert.equal(by.replaceAll(FACTS.reportDate,'DATE'),anon.replaceAll(FACTS.alteredDate,'DATE'));
for(const s of [by,anon])assert.doesNotMatch(s,/C14|DPM/);
const bundleBytes=files.filter(f=>/\.(html|js|css|svg|webp)$/.test(f)&&!f.includes('sports-sheet')).reduce((n,f)=>n+fs.statSync(f).size,0);assert.ok(bundleBytes<1500000,`All non-video delivery resources: ${bundleBytes}`);
console.log(`v4: ${files.length} files, ${links} static references, 14 provenance entries, same-master 13C/DOB reports checked; non-video resources ${bundleBytes} bytes.`);
