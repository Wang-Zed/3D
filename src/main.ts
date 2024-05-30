import "element-plus/dist/index.css";

import { createApp } from "vue";

import { versionShow } from "@/utils/version";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(router);

app.mount("#app");

versionShow();
