<script setup>
import {computed,onBeforeUnmount} from 'vue';
import {Expand} from 'lucide-vue-next';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';
import {site,itemsFor,sectionTarget,mediaURL,safeHref,renderMarkdown} from './content';
import ActionLink from './ActionLink.vue';
const props=defineProps({section:{type:Object,required:true},preview:Boolean,standalone:Boolean});
const items=computed(()=>props.preview ? itemsFor(props.section).slice(0,2) : itemsFor(props.section));
const photos=computed(()=>items.value.filter(i=>i.image));
let viewer;
function openPhoto(index,event) {
  viewer?.destroy();
  const button=event.currentTarget;
  viewer=new PhotoSwipe({dataSource:photos.value.map(i=>({...i.image,src:mediaURL(i.image.src)})),index,showHideAnimationType:'none',closeTitle:'关闭照片',zoomTitle:'放大或缩小',arrowPrevTitle:'上一张',arrowNextTitle:'下一张',errorMsg:'照片暂时无法加载，请关闭后重试。'});
  viewer.on('destroy',()=>button?.focus());
  viewer.init();
}
onBeforeUnmount(()=>viewer?.destroy());
</script>
<template>
  <section :id="section.id" :class="['content-section','section-'+section.type]">
    <div class="section-heading"><component :is="standalone?'h1':'h2'">{{section.title}}</component><ActionLink v-if="preview" :to="sectionTarget(section)">查看全部</ActionLink></div>
    <p v-if="section.intro" class="section-intro">{{section.intro}}</p>
    <div v-if="section.body" class="prose" v-html="renderMarkdown(section.body)"></div>
    <template v-if="section.type==='about'"><p class="about-copy">{{site.profile.bio || '个人介绍待填写。'}}</p><dl class="profile-facts"><template v-if="site.profile.school"><dt>学校</dt><dd>{{site.profile.school}}</dd></template><template v-if="site.profile.major"><dt>专业与方向</dt><dd>{{site.profile.major}}</dd></template><template v-if="site.profile.location"><dt>所在地</dt><dd>{{site.profile.location}}</dd></template></dl></template>
    <template v-else-if="section.type==='contact'"><ul v-if="site.profile.links.length" class="contact-list"><li v-for="link in site.profile.links" :key="link.href"><ActionLink v-if="safeHref(link.href)" :href="safeHref(link.href)">{{link.label}}</ActionLink></li></ul><p v-else class="empty-note">联系方式待填写。</p></template>
    <template v-else-if="section.type==='gallery'"><div v-if="photos.length" class="photo-grid"><figure v-for="(item,index) in photos" :key="item.id"><button type="button" class="photo-button" :aria-label="'放大照片：'+item.image.alt" @click="openPhoto(index,$event)"><img :src="mediaURL(item.image.src)" :alt="item.image.alt" :width="item.image.width" :height="item.image.height" loading="lazy"><span class="zoom-cue" aria-hidden="true"><Expand :size="18" /></span></button><figcaption><span>{{item.image.caption || item.title || item.image.alt}}</span><span v-if="item.image.isAI" class="sample-label">AI 示例</span></figcaption></figure></div><p v-else class="empty-note">照片待补充。</p></template>
    <div v-else-if="items.length" class="entry-list">
      <article v-for="item in items" :key="item.id" :class="['entry',{'has-image':item.image}]">
        <figure v-if="item.image" class="entry-image"><img :src="mediaURL(item.image.src)" :alt="item.image.alt" :width="item.image.width" :height="item.image.height" loading="lazy"><figcaption v-if="item.image.isAI">AI 示例图片</figcaption></figure>
        <div class="entry-copy"><component :is="standalone?'h2':'h3'">{{item.title || '名称待填写'}}</component><p v-if="item.date || item.period || item.issuer" class="entry-meta">{{[item.date || item.period,item.issuer].filter(Boolean).join(' · ')}}</p><p v-if="item.isExample" class="sample-label">示例资料</p><p v-if="item.summary">{{item.summary}}</p><ul v-if="item.tags?.length" class="tag-list"><li v-for="tag in item.tags" :key="tag">{{tag}}</li></ul><dl v-if="item.question || item.role || item.contribution || item.methods?.length || item.outcome" class="project-facts"><template v-if="item.question"><dt>研究问题</dt><dd>{{item.question}}</dd></template><template v-if="item.role"><dt>参与角色</dt><dd>{{item.role}}</dd></template><template v-if="item.contribution"><dt>我的贡献</dt><dd>{{item.contribution}}</dd></template><template v-if="item.methods?.length"><dt>方法与工具</dt><dd>{{item.methods.join('、')}}</dd></template><template v-if="item.outcome"><dt>实际成果与进展</dt><dd>{{item.outcome}}</dd></template></dl><div class="entry-links"><ActionLink v-if="item.bodyFile" :to="'/entry/'+section.id+'/'+item.id">查看详情</ActionLink><ActionLink v-if="safeHref(item.href)" :href="safeHref(item.href)">查看相关材料</ActionLink></div></div>
      </article>
    </div>
    <p v-else-if="section.type!=='about' && !section.body" class="empty-note">{{section.title}}待补充。</p>
  </section>
</template>
