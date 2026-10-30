<script setup>
import {computed} from 'vue';
import {useRoute} from 'vue-router';
import {sections,itemsFor,sectionTarget,bodyFor,renderMarkdown,mediaURL,safeHref} from './content';
import ActionLink from './ActionLink.vue';
import NotFound from './NotFound.vue';
const route=useRoute();
const section=computed(()=>sections.find(s=>s.id===route.params.sectionId));
const entry=computed(()=>itemsFor(section.value).find(i=>i.id===route.params.entryId));
</script>
<template><article v-if="section && entry" class="shell detail-page"><ActionLink :to="sectionTarget(section)" back>返回{{section.title}}</ActionLink><header class="article-heading"><h1>{{entry.title}}</h1><p v-if="entry.date || entry.period" class="entry-meta">{{entry.date || entry.period}}</p><p v-if="entry.isExample" class="sample-label">示例资料</p><p v-if="entry.summary">{{entry.summary}}</p></header><figure v-if="entry.image" class="detail-image"><img :src="mediaURL(entry.image.src)" :alt="entry.image.alt" :width="entry.image.width" :height="entry.image.height"><figcaption v-if="entry.image.isAI">AI 示例图片</figcaption></figure><dl v-if="entry.question || entry.role || entry.contribution || entry.methods?.length || entry.outcome" class="project-facts"><template v-if="entry.question"><dt>研究问题</dt><dd>{{entry.question}}</dd></template><template v-if="entry.role"><dt>参与角色</dt><dd>{{entry.role}}</dd></template><template v-if="entry.contribution"><dt>我的贡献</dt><dd>{{entry.contribution}}</dd></template><template v-if="entry.methods?.length"><dt>方法与工具</dt><dd>{{entry.methods.join('、')}}</dd></template><template v-if="entry.outcome"><dt>实际成果与进展</dt><dd>{{entry.outcome}}</dd></template></dl><div class="prose" v-html="renderMarkdown(bodyFor(entry))"></div><ActionLink v-if="safeHref(entry.href)" :href="safeHref(entry.href)">查看相关材料</ActionLink></article><NotFound v-else /></template>
