import site from '../content/site.json';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
const bodies = import.meta.glob('../content/entries/**/*.md',{query:'?raw',import:'default',eager:true});
export { site };
export function mediaURL(value) {
  if (!value) return '';
  if (value.startsWith('https://')) return value;
  return import.meta.env.BASE_URL + value.replace(/^\/+/,'');
}
export function safeHref(value) {
  if (!value || typeof value !== 'string' || /[\u0000-\u0020]/.test(value)) return '';
  if (/^(https?:\/\/|mailto:|tel:|#\/)/i.test(value)) return value;
  if (value.startsWith('/attachments/')) return mediaURL(value);
  return '';
}
export function itemsFor(section) {return (section?.items || []).filter(i=>i.enabled !== false);}
export function hasContent(section) {
  if (section.body?.trim() || itemsFor(section).length) return true;
  if (section.type === 'about') return !!(site.profile.bio || site.profile.school || site.profile.major || site.profile.location);
  if (section.type === 'contact') return site.profile.links.some(l=>safeHref(l.href));
  return false;
}
export const sections = site.sections.filter(s=>s.enabled !== false && (s.empty !== 'hide' || hasContent(s)));
export function sectionTarget(section) {return section.layout === 'page' ? '/section/' + section.id : {path:'/',hash:'#' + section.id};}
export function bodyFor(item) {return item?.bodyFile ? bodies['../content/' + item.bodyFile] || '' : '';}
const markdown = new MarkdownIt({html:false,linkify:true,breaks:false});
const imageRule=markdown.renderer.rules.image;
markdown.renderer.rules.image=(tokens,index,options,env,self)=>{const src=tokens[index].attrGet('src') || '';if(src.startsWith('/media/')) tokens[index].attrSet('src',mediaURL(src));return imageRule(tokens,index,options,env,self);};
const linkRule=markdown.renderer.rules.link_open || ((tokens,index,options,env,self)=>self.renderToken(tokens,index,options));
markdown.renderer.rules.link_open=(tokens,index,options,env,self)=>{const href=tokens[index].attrGet('href') || '';if(href.startsWith('/attachments/')) tokens[index].attrSet('href',mediaURL(href));return linkRule(tokens,index,options,env,self);};
export function renderMarkdown(text) {return DOMPurify.sanitize(markdown.render(String(text || '')));}
