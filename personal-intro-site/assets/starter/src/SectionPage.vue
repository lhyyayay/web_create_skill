<script setup>
import {computed} from 'vue';
import {useRoute} from 'vue-router';
import {sections} from './content';
import SectionView from './SectionView.vue';
import ActionLink from './ActionLink.vue';
import NotFound from './NotFound.vue';
const route=useRoute();
const section=computed(()=>sections.find(s=>s.id===route.params.sectionId));
</script>
<template><div v-if="section" class="shell section-page"><ActionLink to="/" back>返回首页</ActionLink><SectionView :section="section" standalone /></div><NotFound v-else /></template>
