import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {root,readSite,validate,validHref,addEntry} from '../scripts/content.mjs';

test('实际网站资料和所有本地引用可用于构建',async()=>{await validate(await readSite());});
test('编辑入口拒绝覆盖已有条目，并保护原索引',async()=>{
  const parent=path.join(root,'.cache/tests');await fs.mkdir(parent,{recursive:true});
  const base=await fs.mkdtemp(path.join(parent,'personal-site-contract-'));
  try {
    await fs.mkdir(path.join(base,'content'),{recursive:true});
    const site={schemaVersion:1,theme:'editorial',profile:{name:'测试资料',links:[]},sections:[{id:'projects',type:'projects',title:'项目',layout:'section',items:[{id:'existing',title:'原条目'}]}]};
    const file=path.join(base,'content/site.json');await fs.writeFile(file,JSON.stringify(site));
    const before=await fs.readFile(file,'utf8');
    const input=path.join(base,'entry.json');await fs.writeFile(input,JSON.stringify({id:'existing',title:'替换内容'}));
    await assert.rejects(addEntry({section:'projects',input},base),/唯一/);
    assert.equal(await fs.readFile(file,'utf8'),before);
  } finally {if(path.basename(base).startsWith('personal-site-contract-') && path.dirname(base)===parent) await fs.rm(base,{recursive:true,force:true});}
});
test('内容链接不接受脚本协议，正文引用不能越出内容目录',async()=>{
  assert.equal(validHref('javascript:alert(1)'),false);
  assert.equal(validHref('https://example.com/作品'),true);
  const site=await readSite();
  const clone=structuredClone(site);
  clone.sections=[{id:'bad',type:'projects',title:'测试',layout:'section',items:[{id:'escape',title:'测试',bodyFile:'entries/../../package.json.md'}]}];
  await assert.rejects(validate(clone));
});
