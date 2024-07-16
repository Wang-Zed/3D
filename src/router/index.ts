import { createRouter, createWebHashHistory } from "vue-router";

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/virtual"
    },
    {
      path: "/virtual",
      redirect: "/virtual/replay",
      children: [
        {
          path: "real",
          name: "VirtualReal",
          component: () => import("@/pages/virtual/real.vue")
        },
        {
          path: "replay",
          name: "VirtualReplay",
          component: () => import("@/pages/virtual/replay.vue")
        }
      ]
    },
    {
      path: "/augmented",
      redirect: "/augmented/replay",
      children: [
        {
          path: "real",
          name: "AugmentedReal",
          component: () => import("@/pages/augmented/real.vue")
        },
        {
          path: "replay",
          name: "AugmentedReplay",
          component: () => import("@/pages/augmented/replay.vue")
        }
      ]
    },
    {
      path: "/test",
      name: "Test",
      component: () => import("@/pages/test.vue")
    }
  ]
});
