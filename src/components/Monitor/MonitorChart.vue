<template>
  <section class="chart-wrapper">
    <div class="chart-title" :style="{ color: colorlist[chartStatus] }">
      <span>渲染</span>
      <span>{{ fpsNumber }}fps</span>
    </div>
    <div ref="chart" class="chart-content"></div>
  </section>
</template>
<script lang="ts" setup>
import { LineChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

import { HZ } from "@/constants";

echarts.use([GridComponent, LineChart, CanvasRenderer]);

const props = defineProps<{
  fps: number;
}>();

const colorlist = ["#52c41a", "#fa8c16", "#f5222d"];

const chart = ref<HTMLDivElement>();

const myChart = shallowRef<echarts.ECharts>();

const chartData: number[] = [];

const fpsNumber = ref(0);
const chartStatus = ref(0);

const fpsChange = (fps: number) => {
  if (fps < 0) return;
  fpsNumber.value = fps;
  if (chartData.length >= 20) chartData.shift();
  chartData.push(fps);

  let status = 0;
  if (fps < HZ * 0.6) status = 2;
  else if (fps < HZ * 0.8) status = 1;

  if (status !== chartStatus.value) {
    chartStatus.value = status;
  }

  myChart.value?.setOption({
    series: [
      {
        data: chartData,
        areaStyle: {
          color: colorlist[status]
        },
        itemStyle: {
          color: colorlist[status]
        }
      }
    ]
  });
};

watch(
  () => props.fps,
  () => {
    fpsChange(props.fps);
    resetTimer();
  }
);

let timer = 0;

const startTimer = () => {
  timer = setInterval(() => {
    fpsChange(props.fps);
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timer);
};

const resetTimer = () => {
  stopTimer();
  startTimer();
};

onMounted(() => {
  myChart.value = echarts.init(chart.value);
  myChart.value.setOption({
    grid: {
      left: 0,
      top: 5,
      right: 0,
      bottom: 0
    },
    xAxis: {
      show: false,
      type: "category",
      boundaryGap: false
    },
    yAxis: {
      show: false,
      type: "value",
      splitLine: {
        show: false
      },
      boundaryGap: false
    },
    series: [
      {
        data: chartData,
        type: "line",
        smooth: false,
        silent: true,
        showSymbol: false,
        animation: false,
        areaStyle: {}
      }
    ]
  });
});

onBeforeUnmount(() => {
  stopTimer();
  myChart.value?.dispose();
});
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
