import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {create,normalize} from './create-site.mjs';

const {values}=parseArgs({options:{project:{type:'string'},workdir:{type:'string'}}});
if(!values.project || !values.workdir) throw new Error('需要 --project 已安装依赖的验证网站目录 和 --workdir 独立测试目录');
const workdir=path.resolve(values.workdir);await fs.mkdir(workdir,{recursive:true});
const tools=await import(pathToFileURL(path.join(path.resolve(values.project),'scripts/content.mjs')));
async function fixture(t,brief={name:'测试资料',sections:['关于我','科研项目','照片墙']}) {
  const temp=await fs.mkdtemp(path.join(workdir,'fixture-'));
  t.after(async()=>{if(path.dirname(temp)===workdir && path.basename(temp).startsWith('fixture-')) await fs.rm(temp,{recursive:true,force:true});});
  const out=path.join(temp,'site');await create(brief,out);return {temp,out};
}
test('最小资料不会产生学校、奖项或联系方式，自定义栏目 ID 稳定',async t=>{
  const brief={name:'测试者',sections:['关于我','自己的栏目']};
  const {out}=await fixture(t,brief);const site=await tools.readSite(out);
  assert.equal(site.profile.name,'测试者');assert.equal(site.profile.school,'');assert.deepEqual(site.profile.links,[]);
  assert.ok(site.sections.every(s=>s.items.length===0));
  assert.equal(normalize(brief).sections[1].id,site.sections[1].id);
  await tools.validate(site,out);
});
test('已有目录和无效栏目不会覆盖用户文件',async t=>{
  const {temp,out}=await fixture(t);const sentinel=path.join(out,'keep.txt');await fs.writeFile(sentinel,'preserve');
  await assert.rejects(create({name:'其他',sections:['关于我']},out),/已存在/);
  assert.equal(await fs.readFile(sentinel,'utf8'),'preserve');
  const bad=path.join(temp,'bad');
  await assert.rejects(create({name:'其他',sections:[{id:'../escape',type:'custom',title:'测试'}]},bad),/ID/);
  await assert.rejects(fs.access(bad));
});
test('照片导入读取真实尺寸、同时更新清单并保留原照片',async t=>{
  const {temp,out}=await fixture(t);
  const image=path.join(temp,'input.png');
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jVh0AAAAASUVORK5CYII=','base64');
  await fs.writeFile(image,png);
  const result=await tools.addPhoto({file:image,section:'gallery',caption:'测试图片',ai:'false'},out);
  assert.equal(result.image.width,1);assert.equal(result.image.height,1);assert.equal(result.image.isAI,false);
  const site=await tools.readSite(out);assert.equal(site.sections.find(s=>s.id==='gallery').items.length,1);
  assert.deepEqual(await fs.readFile(image),png);
  assert.deepEqual(await fs.readFile(path.join(out,'public',result.image.src)),png);
  await tools.validate(site,out);
  const before=await fs.readFile(path.join(out,'content/site.json'),'utf8');
  await assert.rejects(tools.addPhoto({file:image,section:'gallery'},out),/ID/);
  assert.equal(await fs.readFile(path.join(out,'content/site.json'),'utf8'),before);
  const mismatch=structuredClone(site);mismatch.sections.find(s=>s.id==='gallery').items[0].image.width=99;
  await assert.rejects(tools.validate(mismatch,out),/宽高/);
});
test('新增正文关联正确，并拒绝覆盖已有条目',async t=>{
  const {temp,out}=await fixture(t);const input=path.join(temp,'entry.json');
  await fs.writeFile(input,JSON.stringify({id:'real-entry',title:'用户提供的标题',body:'## 正文\n用户提供的文字'}));
  const result=await tools.addEntry({section:'projects',input},out);
  assert.equal(result.bodyFile,'entries/projects/real-entry.md');
  assert.match(await fs.readFile(path.join(out,'content',result.bodyFile),'utf8'),/用户提供的文字/);
  const before=await fs.readFile(path.join(out,'content/site.json'),'utf8');
  await assert.rejects(tools.addEntry({section:'projects',input},out),/唯一/);
  assert.equal(await fs.readFile(path.join(out,'content/site.json'),'utf8'),before);
});
test('正文路径越界和脚本链接被拒绝',async t=>{
  const {out}=await fixture(t);const site=await tools.readSite(out);
  site.sections.find(s=>s.id==='projects').items=[{id:'escape',title:'测试',bodyFile:'entries/../../outside.md'}];
  await assert.rejects(tools.validate(site,out),/目录|ENOENT/);
  delete site.sections.find(s=>s.id==='projects').items[0].bodyFile;
  site.sections.find(s=>s.id==='projects').items[0].href='javascript:alert(1)';
  await assert.rejects(tools.validate(site,out),/链接/);
});
