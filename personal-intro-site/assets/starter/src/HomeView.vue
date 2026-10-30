<script setup>
import {site,sections,sectionTarget,mediaURL} from './content';
import ActionLink from './ActionLink.vue';
import SectionView from './SectionView.vue';
</script>
<template>
  <section class="hero shell" :class="{'has-photo':site.profile.image}">
    <div class="hero-copy"><h1>{{site.profile.name}}</h1><p v-if="site.profile.title" class="hero-title">{{site.profile.title}}</p><p class="hero-bio">{{site.profile.bio || '个人介绍待填写。'}}</p><p v-if="site.profile.school || site.profile.major" class="profile-meta">{{[site.profile.school,site.profile.major].filter(Boolean).join(' · ')}}</p><ActionLink v-if="sections.length" primary :to="sectionTarget(sections[0])">进一步了解我</ActionLink></div>
    <figure v-if="site.profile.image" class="hero-photo"><img :src="mediaURL(site.profile.image.src)" :alt="site.profile.image.alt" :width="site.profile.image.width" :height="site.profile.image.height" fetchpriority="high"><figcaption v-if="site.profile.image.isAI">AI 示例图片</figcaption></figure>
    <div v-else class="hero-monogram" aria-hidden="true">{{Array.from(site.profile.name)[0]}}</div>
  </section>
  <div class="shell sections"><SectionView v-for="section in sections" :key="section.id" :section="section" :preview="section.layout==='page'" /></div>
</template>
