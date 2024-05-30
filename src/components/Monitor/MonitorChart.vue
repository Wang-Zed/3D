<template>
  <section class="chart-wrapper">
    <div class="chart-title">
      <span>渲染</span>
      <span>{{ fpsNumber }}fps</span>
    </div>
    <div ref="chart" class="chart-content"></div>
  </section>
</template>
<script lang="ts" setup>
const fpsNumber = ref(0);
const chart = ref<HTMLDivElement>();
</script>
<style lang="less" scoped>
.chart-wrapper {
  width: 90px;
  height: 70px;

  display: flex;
  flex-direction: column;

  .chart-title {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }

  .chart-content {
    flex: 1;
    overflow: hidden;
  }
}
</style>
