import { fileURLToPath } from "node:url";

import createVuePlugin from "@vitejs/plugin-vue";
import { execSync } from "child_process";
import fs from "fs";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

// 获取当前分支 commitId
let commitId = "";
if (fs.existsSync(".git")) {
  try {
    commitId = execSync("git rev-parse --short HEAD").toString().trim();
  } catch (error) {
    commitId = "";
  }
}

const buildTime = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai" // 使用中国时区
}).format(new Date());

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              ["three", "echarts"].some((moduleName) => id.includes(moduleName))
            ) {
              return (
                id
                  .toString()
                  .match(/\/node_modules\/(?!.pnpm)(?<moduleName>[^/]*)\//)
                  ?.groups?.moduleName ?? "vender"
              );
            }
          }
        }
      }
    }
  },
  plugins: [
    createVuePlugin(),
    AutoImport({
      imports: ["pinia", "vue", "vue-router"],
      eslintrc: {
        enabled: true
      }
    }),
    Components({
      dirs: ["src/components"],
      include: [/\.vue$/, /\.tsx?$/, /\.vue\?vue/],
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  define: {
    __COMMITID__: JSON.stringify(commitId),
    __BUILDTIME__: JSON.stringify(buildTime)
  },
  server: {
    open: true,
    strictPort: false,
    proxy: {
      "/api": {
        // target: "http://datapro.senseauto.com/api/data/aws/listAnonymous",
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
});
