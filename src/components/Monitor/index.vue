<template>
  <section class="monitor-wrapper">
    <MonitorChart :fps="fps" />
    <el-divider direction="vertical" style="height: 100%"></el-divider>
    <MonitorPanel v-bind="{ memory, geometries, textures, ips }" />
  </section>
</template>
<script lang="ts" setup>
defineProps<{
  memory: Window["performance"]["memory"];
  geometries: number;
  textures: number;
  ips: string[];
  fps: number;
}>();
</script>
<style lang="less" scoped>
.monitor-wrapper {
  width: 300px;
  height: 70px;
  display: flex;
  background-color: rgba(52, 52, 52, 0.6);
  backdrop-filter: blur(4px);

  .el-divider {
    border-color: rgba(0, 0, 0, 0.2);
  }
}
</style>
