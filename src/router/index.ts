import { createRouter, createWebHistory } from "vue-router";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/pages/home/index.vue")
    },
    {
      path: "/replay",
      name: "replay",
      component: () => import("@/pages/replay/index.vue")
    }
  ]
});
