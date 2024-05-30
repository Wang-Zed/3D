<template>
  <section class="page-wrapper">
    <div :id="CANVAS_ID" class="canvas-wrapper"></div>
    <div class="monitor-wrapper">
      <Monitor />
    </div>
  </section>
</template>
<script lang="ts" setup>
import RENDERER from "@/store/renderer";

const CANVAS_ID = "canvas_id";

onMounted(() => {
  RENDERER.initialize(CANVAS_ID);
});

onBeforeUnmount(() => {
  RENDERER.dispose();
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
