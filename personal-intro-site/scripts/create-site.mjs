import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';

const skill = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const aliases = { '关于我':'about','个人介绍':'about','简介':'about','教育':'education','教育背景':'education','教育经历':'education','能力':'skills','技能':'skills','能力与方向':'skills','科研项目':'projects','科研':'projects','项目':'projects','科研与项目':'projects','获奖情况':'awards','奖项':'awards','荣誉':'awards','荣誉与奖项':'awards','作品':'works','作品集':'works','作品展示':'works','成长经历':'experience','经历':'experience','实习':'experience','生活记录':'journal','博客':'journal','文章':'journal','照片墙':'gallery','相册':'gallery','照片':'gallery','联系我':'contact','联系方式':'contact' };
const types = ['about','education','skills','projects','awards','works','experience','journal','gallery','contact','custom'];
const titles = {about:'关于我',education:'教育背景',skills:'能力与方向',projects:'科研与项目',awards:'荣誉与奖项',works:'作品展示',experience:'成长经历',journal:'生活记录',gallery:'照片墙',contact:'联系我',custom:'其他内容'};
const validId = x => typeof x === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(x);
const html = x => String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function identifier(text,fallback) {
  const slug = String(text).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,65);
  return slug || fallback + '-' + createHash('sha256').update(String(text)).digest('hex').slice(0,8);
}
export function normalize(brief) {
  if (!brief || typeof brief.name !== 'string' || !brief.name.trim()) throw new Error('请提供 name 姓名');
  if (!Array.isArray(brief.sections) || !brief.sections.length) throw new Error('请提供 sections 栏目数组');
  const info = typeof brief.info === 'string' ? {bio:brief.info} : brief.info || {};
  if (typeof info !== 'object' || Array.isArray(info)) throw new Error('info 应为文字或资料对象');
  if (brief.theme && !['editorial','academic','studio','warm'].includes(brief.theme)) throw new Error('未知主题');
  const sections = brief.sections.map(value => {
    const source = typeof value === 'string' ? {title:value} : {...value};
    const type = source.type || aliases[source.title] || (types.includes(source.title) ? source.title : 'custom');
    if (!types.includes(type)) throw new Error('不支持的栏目类型：' + type);
    if (source.layout && !['section','page'].includes(source.layout)) throw new Error('layout 仅支持 section 或 page');
    if (source.empty && !['hide','placeholder'].includes(source.empty)) throw new Error('empty 仅支持 hide 或 placeholder');
    if (source.items !== undefined && !Array.isArray(source.items)) throw new Error('items 必须是数组');
    const id = source.id || (type !== 'custom' ? type : identifier(source.title,'section'));
    if (!validId(id)) throw new Error('无效栏目 ID：' + id);
    return {...source,id,type,title:source.title || titles[type],layout:source.layout || 'section',empty:source.empty || (brief.showPlaceholders === false ? 'hide' : 'placeholder'),enabled:source.enabled !== false,items:(source.items || []).map(item=>({...item}))};
  });
  if (new Set(sections.map(s=>s.id)).size !== sections.length) throw new Error('栏目 ID 重复；同类型多个栏目请显式填写不同 id');
  const name = brief.name.trim();
  return {schemaVersion:1,siteTitle:brief.siteTitle || name + ' · 个人网站',description:brief.description || info.bio || '',language:brief.language || 'zh-CN',theme:brief.theme || (/科研|学术|research|academic/i.test(brief.purpose || '') ? 'academic' : 'editorial'),isExample:brief.isExample === true,profile:{...info,name,title:info.title || '',bio:info.bio || '',school:info.school || '',major:info.major || '',location:info.location || '',tagline:info.tagline || '',links:info.links || []},sections};
}
function docs(site) {
  const names=site.sections.map(s=>s.title).join('、');
  const intro='# ' + site.siteTitle + '\n\n这是 ' + site.profile.name + ' 的个人网站，用来介绍自己、展示实际经历与作品。\n\n配置的栏目：' + names + '。\n\n未提供的信息保留待填写或按设置隐藏；示例图片和示例资料须明确标注。网站可以逐步整理成求职、联系老师或申请项目组时的个人展示材料。\n';
  const ai='给 AI 的网站维护说明\n\n请先阅读此文件并读取最新项目。网站主人是 ' + site.profile.name + '，栏目包括 ' + names + '。\n\n基本内容：content/site.json；长篇正文：content/entries/栏目ID/条目ID.md；照片：public/media；附件：public/attachments。\nprofile 保存姓名、简介、学校专业、主图和链接；sections 保存栏目及 items。修改时保留真实资料、稳定 id 和无关条目，不编造经历。\n\n栏目类型：about 介绍、education 教育、skills 能力、projects 项目、awards 荣誉、works 作品、experience 经历、journal 记录、gallery 照片、contact 联系、custom 自定义。\n条目支持 title、summary、period、date、issuer、question、role、contribution、methods、outcome、tags、href、image、bodyFile。image 包含 src、真实 width/height、alt、caption、isAI。\n\n安装依赖后，导入照片可执行 npm run photo:add -- --file 照片绝对路径 --section gallery --caption 配文。该工具同时复制照片、读取尺寸并更新清单。更换主图用 --target portrait；更换封面用 --target cover --section 栏目ID --entry 条目ID。AI 图片加 --ai true。\n新增带正文条目：npm run entry:add -- --section 栏目ID --input 条目JSON绝对路径 --body 正文Markdown绝对路径。\n修改已有正文时，查看该条目的 bodyFile。enabled:false 隐藏条目；empty:hide 隐藏空栏目。隐藏内容不是访问保护。\n\n检查：npm run check:content、npm test、npm run build；预览：npm run dev。验证实际链接、图片和手机排版。没有工具权限时提供明确手动步骤，不声称已提交或发布。\n\n本模板没有在线编辑后台、登录、私人存储或全局永久删除。不要用浏览器本地隐藏状态冒充服务器永久删除。\n\n尚未指定部署仓库、域名和生产分支。只有核实 GitHub 与托管平台连接后，才能告诉主人提交到哪个分支会自动发布；代码检查通过和平台发布成功需分别确认。不要索取密码、验证码或令牌。\n';
  const owner='网站使用指南\n\n' + site.profile.name + '：\n\n这里是留给你慢慢填写的个人空间。可以先从一段介绍或一张照片开始，不用一下子准备齐所有资料。\n\n现在包含 ' + names + '。以后应聘、联系老师或申请加入项目组时，可以把真实的项目、自己的贡献和作品补充完整，再把网址放进自我介绍里。没有完成的部分照实写进展就好。\n\n如果你不熟悉文件，可以把“给AI的网站维护说明.txt”发给有项目访问能力的 AI，再说：“我是第一次操作，请先读说明，一次带我完成一步。我想修改的是……”。普通聊天不一定能直接改文件；让它先说明是否有修改权限。\n\n文字主要在 content/site.json，完整文章在 content/entries，照片在 public/media。上传照片和建立引用是两件事；这个项目的照片导入工具可以一起完成。请让 AI 根据你提供的照片处理，不用猜图片尺寸。\n\n想换主图：告诉 AI“请把个人主图换成这张照片，保留页面设计”。想加项目：提供项目名称、做什么、你负责什么、方法和实际成果。想加记录：准备标题和正文，有照片也可以一起给它。\n\n每次保存前，可以先看看 AI 改了什么。保留自己原本的语气，也保留一份原始照片。暂时没有资料的栏目可以留空或隐藏。\n\n网站还没有自动获得 GitHub 或托管平台的连接。首次上线需要管理员完成配置，告诉你网址、修改位置和生产分支。配置好自动发布以后，在指定分支提交修改，再等托管平台发布成功，网站才会更新。普通代码检查成功不等于网站已经发布。\n\n本网站是公开展示用途，没有私人阅读权限。只放你愿意公开的资料。卡住时先停一下，把提示截图给 AI 或管理员看，不需要把密码或验证码发给别人。\n\n往后的内容，就按自己的节奏慢慢添进来。\n';
  return {'README.md':intro,'给AI的网站维护说明.txt':ai,'网站使用指南.txt':owner};
}
export async function create(brief,out) {
  const site=normalize(brief);
  const destination=path.resolve(out);
  try {await fs.lstat(destination);throw new Error('输出目录已存在；为保护原文件，未生成：' + destination);}
  catch(error){if(error.code !== 'ENOENT') throw error;}
  if(destination === skill || destination.startsWith(skill + path.sep)) throw new Error('请把生成网站放在 Skill 目录之外');
  const parent=path.dirname(destination);
  await fs.mkdir(parent,{recursive:true});
  const temp=await fs.mkdtemp(path.join(parent,'.personal-site-build-'));
  try {
    await fs.cp(path.join(skill,'assets/starter'),temp,{recursive:true,errorOnExist:true});
    for(const section of site.sections) for(const item of section.items) {
      if(!validId(item.id)) throw new Error('每个条目需要有效 id');
      if(item.body !== undefined) {
        if(item.bodyFile) throw new Error('同一条目不要同时指定 body 和 bodyFile');
        item.bodyFile='entries/' + section.id + '/' + item.id + '.md';
        await fs.mkdir(path.dirname(path.join(temp,'content',item.bodyFile)),{recursive:true});
        await fs.writeFile(path.join(temp,'content',item.bodyFile),String(item.body) + '\n','utf8');
        delete item.body;
      }
    }
    await fs.writeFile(path.join(temp,'content/site.json'),JSON.stringify(site,null,2) + '\n','utf8');
    for(const [name,content] of Object.entries(docs(site))) await fs.writeFile(path.join(temp,name),content,'utf8');
    const template=await fs.readFile(path.join(temp,'index.html'),'utf8');
    await fs.writeFile(path.join(temp,'index.html'),template.replace('PERSONAL_SITE_TITLE',html(site.siteTitle)).replace('PERSONAL_SITE_LANG',html(site.language)).replace('PERSONAL_SITE_DESCRIPTION',html(site.description)),'utf8');
    await fs.rename(temp,destination);
    return {directory:destination,name:site.profile.name,theme:site.theme,sections:site.sections.map(s=>({id:s.id,type:s.type,layout:s.layout}))};
  } catch(error) {
    if(path.dirname(temp) === parent && path.basename(temp).startsWith('.personal-site-build-')) await fs.rm(temp,{recursive:true,force:true});
    throw error;
  }
}
if(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {const {values}=parseArgs({options:{brief:{type:'string'},out:{type:'string'}}});if(!values.brief || !values.out) throw new Error('用法：node create-site.mjs --brief brief.json --out 新目录');const brief=JSON.parse((await fs.readFile(path.resolve(values.brief),'utf8')).replace(/^\uFEFF/,''));console.log(JSON.stringify(await create(brief,values.out),null,2));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
