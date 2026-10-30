<script setup>
import {ref,watch} from 'vue';
import {useRoute} from 'vue-router';
import {Menu,X} from 'lucide-vue-next';
import {site,sections,sectionTarget} from './content';
const opened=ref(false),route=useRoute();
watch(()=>route.fullPath,()=>{opened.value=false;});
function skip(){document.getElementById('main')?.focus();}
</script>
<template>
  <div class="site" :data-theme="site.theme">
    <a class="skip-link" href="#main" @click.prevent="skip">跳到正文</a>
    <header class="site-header" @keydown.esc="opened=false">
      <RouterLink class="brand" to="/" :aria-label="site.profile.name+'，首页'">{{site.profile.name}}</RouterLink>
      <button class="menu-toggle" type="button" :aria-label="opened?'关闭导航':'打开导航'" :aria-expanded="opened" aria-controls="site-nav" @click="opened=!opened"><X v-if="opened" /><Menu v-else /></button>
      <nav id="site-nav" :class="{opened}" aria-label="主要导航"><RouterLink to="/" :aria-current="route.path==='/' && !route.hash?'page':undefined">首页</RouterLink><RouterLink v-for="s in sections" :key="s.id" :to="sectionTarget(s)" :aria-current="(route.params.sectionId===s.id || route.hash==='#'+s.id)?'location':undefined">{{s.title}}</RouterLink></nav>
    </header>
    <main id="main" tabindex="-1"><RouterView /></main>
    <footer class="site-footer"><RouterLink to="/">{{site.profile.name}}</RouterLink><span>{{site.profile.tagline || '个人介绍与作品记录'}}</span><small v-if="site.isExample">演示资料，不代表真实人物经历</small><small>© {{new Date().getFullYear()}} {{site.profile.name}}</small></footer>
  </div>
</template>
