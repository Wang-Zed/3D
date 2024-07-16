<template>
  <section class="panel-wrapper">
    <div v-if="memory" class="panel-row">
      <span>js内存: {{ formatBytes(memory.usedJSHeapSize) }}</span>
      <span
        >内存占比:
        {{
          ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)
        }}%</span
      >
    </div>
    <div class="panel-row">
      <span>WebGL: {{ geometries }}/{{ textures }}</span>
      <span :class="{ 'multi-online': ips.length > 1 }">
        <el-tooltip>
          <template #content>
            <div v-for="(item, index) in ips" :key="index">
              {{ item }}
            </div>
          </template>
          实时在线: {{ ips.length }}
        </el-tooltip>
      </span>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { formatBytes } from "@/utils";

defineProps<{
  memory: Window["performance"]["memory"];
  geometries: number;
  textures: number;
  ips: string[];
}>();
</script>
<style lang="less" scoped>
.panel-wrapper {
  padding: 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: 10px;
  color: #ffffff;
  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  .panel-row {
    display: flex;
    margin-top: 4px;

    &:first-child {
      margin-top: 0;
    }

    & span {
      flex: 1;
    }

    .multi-online {
      color: #f5222d;
      font-size: 10px;
    }
  }
}
</style>
