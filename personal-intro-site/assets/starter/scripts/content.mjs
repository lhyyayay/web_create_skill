import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';
import { imageSize } from 'image-size';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const types = ['about','education','skills','projects','awards','works','experience','journal','gallery','contact','custom'];
export const validId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value);
export function validHref(value) {
  if (!value) return true;
  if (typeof value !== 'string' || /[\u0000-\u0020]/.test(value)) return false;
  if (value.startsWith('/attachments/') || value.startsWith('#/')) return true;
  try { const parsed=new URL(value);return ['http:','https:','mailto:','tel:'].includes(parsed.protocol) && !!(parsed.hostname || parsed.pathname); } catch {return false;}
}
export async function readSite(base = root) {
  return JSON.parse((await fs.readFile(path.join(base,'content/site.json'),'utf8')).replace(/^\uFEFF/,''));
}
async function containedFile(base, relative) {
  const target = path.resolve(base, relative);
  if (!target.startsWith(path.resolve(base) + path.sep)) throw new Error('文件路径越出内容目录：' + relative);
  const real = await fs.realpath(target);
  const realBase = await fs.realpath(base);
  if (!real.startsWith(realBase + path.sep)) throw new Error('不允许引用目录外的符号链接：' + relative);
  if (!(await fs.stat(real)).isFile()) throw new Error('引用不是文件：' + relative);
  return real;
}
async function imageCheck(image, base) {
  if (!image) return;
  if (typeof image.src !== 'string' || !Number.isInteger(image.width) || !Number.isInteger(image.height) || image.width < 1 || image.height < 1) throw new Error('图片需要地址和真实像素宽高');
  if (typeof image.alt !== 'string' || !image.alt.trim()) throw new Error('请填写图片说明 alt');
  if (typeof image.isAI !== 'boolean') throw new Error('图片需要明确 isAI 标记');
  if (image.src.startsWith('https://')) return;
  if (!image.src.startsWith('/media/') || image.src.includes('\\')) throw new Error('本地图片应使用 /media/ 路径');
  const file = await containedFile(path.join(base,'public'), image.src.slice(1));
  const dimensions = imageSize(await fs.readFile(file));
  if (dimensions.width !== image.width || dimensions.height !== image.height) throw new Error('图片宽高与实际文件不一致：' + image.src);
}
export async function validate(site, base = root) {
  if (!site || site.schemaVersion !== 1 || !site.profile?.name?.trim()) throw new Error('需要 schemaVersion:1 和真实提供的姓名');
  if (!['editorial','academic','studio','warm'].includes(site.theme)) throw new Error('未知主题');
  if (!Array.isArray(site.sections) || !Array.isArray(site.profile.links)) throw new Error('sections 和 profile.links 必须是数组');
  for (const key of ['name','title','bio','school','major','location','tagline']) if (site.profile[key] !== undefined && typeof site.profile[key] !== 'string') throw new Error('个人资料 '+key+' 必须是文字');
  await imageCheck(site.profile.image,base);
  for (const link of site.profile.links) {if (!link.label || !validHref(link.href) || !link.href) throw new Error('联系方式或链接格式不正确');if(link.href.startsWith('/attachments/')) await containedFile(path.join(base,'public/attachments'),decodeURIComponent(link.href.slice('/attachments/'.length)));}
  const sectionIds = new Set();
  for (const section of site.sections) {
    if (!validId(section.id) || sectionIds.has(section.id)) throw new Error('栏目 ID 无效或重复：' + section.id);
    sectionIds.add(section.id);
    if (!types.includes(section.type) || !section.title?.trim() || !['section','page'].includes(section.layout)) throw new Error('栏目类型、标题或布局不正确：' + section.id);
    if (!['hide','placeholder',undefined].includes(section.empty)) throw new Error('empty 仅支持 hide 或 placeholder');
    if (!Array.isArray(section.items)) throw new Error('栏目 items 必须是数组');
    const ids = new Set();
    for (const item of section.items) {
      if (!validId(item.id) || ids.has(item.id)) throw new Error('条目 ID 无效或重复：' + item.id);
      ids.add(item.id);
      if (!validHref(item.href)) throw new Error('不安全或不支持的链接：' + item.id);
      if(item.href?.startsWith('/attachments/')) await containedFile(path.join(base,'public/attachments'),decodeURIComponent(item.href.slice('/attachments/'.length)));
      for (const key of ['tags','methods']) if (item[key] !== undefined && (!Array.isArray(item[key]) || item[key].some(x => typeof x !== 'string'))) throw new Error(key + ' 必须是字符串数组');
      if (item.bodyFile) {
        if (typeof item.bodyFile !== 'string' || !/^entries\/.+\.md$/.test(item.bodyFile)) throw new Error('正文路径应为 entries/.../*.md');
        await containedFile(path.join(base,'content'),item.bodyFile);
      }
      await imageCheck(item.image,base);
    }
  }
  return site;
}
async function save(site,base) {
  await validate(site,base);
  const file = path.join(base,'content/site.json');
  const temp = file + '.' + process.pid + '.tmp';
  await fs.writeFile(temp,JSON.stringify(site,null,2) + '\n','utf8');
  await fs.rename(temp,file);
}
function sectionFor(site,id,type) {
  const matches = site.sections.filter(s => id ? s.id === id : s.type === type);
  if (matches.length !== 1) throw new Error('请用 --section 指定唯一的目标栏目');
  if (type && matches[0].type !== type) throw new Error('目标栏目类型不是 ' + type);
  return matches[0];
}
export async function addPhoto(options,base = root) {
  if (!options.file) throw new Error('请提供 --file 照片的绝对路径');
  const site = await readSite(base);
  const buffer = await fs.readFile(path.resolve(options.file));
  const ext = path.extname(options.file).toLowerCase();
  if (!['.jpg','.jpeg','.png','.webp'].includes(ext)) throw new Error('导入支持 JPEG、PNG 和 WebP，请先转换其他格式');
  const dimensions = imageSize(buffer);
  if (!dimensions.width || !dimensions.height || !['jpg','png','webp'].includes(dimensions.type)) throw new Error('照片格式或尺寸无法读取');
  if (options.ai !== undefined && !['true','false'].includes(String(options.ai))) throw new Error('--ai 只能为 true 或 false');
  const digest = createHash('sha256').update(buffer).digest('hex').slice(0,12);
  const stem = path.basename(options.file,ext).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,32) || 'photo';
  const filename = stem + '-' + digest + ext;
  const image = { src:'/media/' + filename, width:dimensions.width, height:dimensions.height, alt:options.alt || options.caption || '用户提供的照片', caption:options.caption || '', isAI:String(options.ai || 'false') === 'true' };
  const target = options.target || 'gallery';
  if (target === 'portrait') site.profile.image = image;
  else if (target === 'cover') {
    const section = sectionFor(site,options.section);
    const entry = section.items.find(e => e.id === options.entry);
    if (!entry) throw new Error('封面目标条目不存在，请提供 --entry');
    entry.image = image;
  } else if (target === 'gallery') {
    const section = sectionFor(site,options.section,'gallery');
    const id = options.id || ('photo-' + digest);
    if (!validId(id) || section.items.some(i => i.id === id)) throw new Error('照片 ID 已存在或无效；未修改原清单');
    section.items.push({id,title:options.caption || '',image,enabled:true});
  } else throw new Error('--target 支持 gallery、portrait、cover');
  const media = path.join(base,'public/media');
  await fs.mkdir(media,{recursive:true});
  const destination = path.join(media,filename);
  try { await fs.writeFile(destination,buffer,{flag:'wx'}); }
  catch (error) { if (error.code !== 'EEXIST' || !buffer.equals(await fs.readFile(destination))) throw error; }
  await save(site,base);
  return {image,target};
}
export async function addEntry(options,base = root) {
  if (!options.input) throw new Error('请提供 --input 条目 JSON 的绝对路径');
  const site = await readSite(base);
  const section = sectionFor(site,options.section);
  const item = JSON.parse((await fs.readFile(path.resolve(options.input),'utf8')).replace(/^\uFEFF/,''));
  if (!validId(item.id) || !item.title?.trim() || section.items.some(e => e.id === item.id)) throw new Error('需要唯一条目 ID 和标题；原内容未被覆盖');
  if (!validHref(item.href)) throw new Error('条目链接不安全或格式不正确');
  const text = options.body ? await fs.readFile(path.resolve(options.body),'utf8') : item.body;
  delete item.body;
  let created;
  if (text !== undefined) {
    item.bodyFile = 'entries/' + section.id + '/' + item.id + '.md';
    created = path.join(base,'content',item.bodyFile);
    await fs.mkdir(path.dirname(created),{recursive:true});
    await fs.writeFile(created,String(text).replace(/^\uFEFF/,'') + '\n',{encoding:'utf8',flag:'wx'});
  }
  section.items.push({...item,enabled:item.enabled !== false});
  try { await save(site,base); }
  catch(error) { if (created) await fs.unlink(created); throw error; }
  return {section:section.id,id:item.id,bodyFile:item.bodyFile};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const command = process.argv[2] || 'check';
    const {values} = parseArgs({args:process.argv.slice(3),options:Object.fromEntries(['file','section','caption','alt','target','entry','id','ai','input','body'].map(k => [k,{type:'string'}]))});
    if (command === 'check') {await validate(await readSite()); console.log('内容检查通过：资料、ID、正文路径、链接和图片尺寸有效。');}
    else if (command === 'photo') console.log(JSON.stringify(await addPhoto(values),null,2));
    else if (command === 'entry') console.log(JSON.stringify(await addEntry(values),null,2));
    else throw new Error('命令支持 check、photo、entry');
  } catch(error) {console.error(error.message);process.exitCode=1;}
}
