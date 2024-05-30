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
    __COMMITID__: JSON.stringify(commitId)
  },
  server: {
    open: true,
    strictPort: false
  }
});
