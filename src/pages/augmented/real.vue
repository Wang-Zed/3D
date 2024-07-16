<template>
  <section class="page-wrapper">
    <div :id="CANVAS_ID" class="canvas-wrapper"></div>
    <div class="monitor-wrapper">
      <Monitor
        :ips="renderer.ips"
        v-bind="{ fps, memory, geometries, textures }"
      />
    </div>
  </section>
</template>
<script lang="ts" setup>
import { CANVAS_ID } from "@/constants";
import { useMonitor } from "@/hooks/useMonitor";
import AugmentedRender from "@/renderer/augmented";

const renderer = new AugmentedRender();

const { fps, memory, geometries, textures } = useMonitor(renderer);

onMounted(() => {
  renderer.initialize(CANVAS_ID);
});

onBeforeUnmount(() => {
  renderer.dispose();
});
</script>
<style lang="less" scoped>
.page-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .canvas-wrapper {
    width: 100%;
    height: 100%;
  }

  .monitor-wrapper {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
</style>
