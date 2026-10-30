<script setup>
import { RouterLink } from 'vue-router';
import { ArrowUpRight,ArrowLeft,ArrowDown } from 'lucide-vue-next';
defineProps({to:[String,Object],href:String,primary:Boolean,back:Boolean,down:Boolean});
</script>
<template>
  <component :is="to ? RouterLink : 'a'" v-bind="to ? {to} : {href}" :class="['action-link',{primary,back}]">
    <ArrowLeft v-if="back" :size="17" aria-hidden="true" />
    <span><slot /></span>
    <ArrowDown v-if="down" :size="17" aria-hidden="true" /><ArrowUpRight v-else-if="!back" :size="17" aria-hidden="true" />
  </component>
</template>
