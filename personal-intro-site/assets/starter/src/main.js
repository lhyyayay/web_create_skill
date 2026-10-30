import { createApp } from 'vue';
import { createRouter,createWebHashHistory } from 'vue-router';
import App from './App.vue';
import HomeView from './HomeView.vue';
import SectionPage from './SectionPage.vue';
import DetailView from './DetailView.vue';
import NotFound from './NotFound.vue';
import { site } from './content';
import './styles.css';
const router=createRouter({history:createWebHashHistory(),routes:[
  {path:'/',component:HomeView},
  {path:'/section/:sectionId',component:SectionPage},
  {path:'/entry/:sectionId/:entryId',component:DetailView},
  {path:'/:pathMatch(.*)*',component:NotFound}
],scrollBehavior(to){return to.hash ? {el:to.hash,top:28,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'} : {top:0};}});
router.afterEach(to=>{document.title=(to.params.sectionId ? site.sections.find(s=>s.id===to.params.sectionId)?.title || site.siteTitle : site.siteTitle) + (to.path==='/' ? '' : ' · ' + site.profile.name);});
createApp(App).use(router).mount('#app');
