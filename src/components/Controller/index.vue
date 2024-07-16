<template>
  <section class="controller">
    <el-space style="margin-right: 18px" :size="18">
      <slot name="left" />
    </el-space>
    <span class="duration">
      {{ formatTime(current) }}
    </span>
    <el-slider
      v-model="progress"
      :format-tooltip="(val) => formatTime((val / 100) * total)"
      :style="{ '--loaded-width': `${loadProgress}%` }"
      :step="0.001"
      class="progress-bar"
      @change="progressChange($event as number)"
      @input="progressInput($event as number)"
    />
    <span class="duration">
      {{ formatTime(total) }}
    </span>
    <el-space style="margin-left: 18px" :size="18">
      <el-icon size="24" class="play-btn" @click="jumpDuration('pre')">
        <DArrowLeft />
      </el-icon>
      <el-icon size="24" class="play-btn" @click="playStateChange">
        <Loading v-if="playState === 'loading'" />
        <VideoPlay v-else-if="playState === 'pause'" />
        <VideoPause v-else-if="playState === 'play'" />
        <RefreshLeft v-else-if="playState === 'end'" />
      </el-icon>
      <el-icon size="24" class="play-btn" @click="jumpDuration('next')">
        <DArrowRight />
      </el-icon>
      <el-dropdown @command="playRateChange">
        <span class="el-dropdown-link">
          {{ playRateOptions.find((item) => item.value === rate)?.label || rate
          }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-item
            v-for="item in playRateOptions"
            :key="item.value"
            :command="item.value"
            >{{ item.label }}</el-dropdown-item
          >
        </template>
      </el-dropdown>
      <slot name="right" />
    </el-space>
  </section>
</template>
<script lang="ts" setup>
import {
  ArrowDown,
  DArrowLeft,
  DArrowRight,
  Loading,
  RefreshLeft,
  VideoPause,
  VideoPlay
} from "@element-plus/icons-vue";

import { HZ } from "@/constants";
import type { PlayState } from "@/typings";
import { formatTime } from "@/utils";

const playRateOptions = [
  {
    label: "x0.25",
    value: 0.25
  },
  {
    label: "x0.5",
    value: 0.5
  },
  {
    label: "x1.0",
    value: 1
  },
  {
    label: "x1.5",
    value: 1.5
  },
  {
    label: "x2.0",
    value: 2
  }
];

const props = withDefaults(
  defineProps<{
    current?: number;
    total?: number;
    playState?: PlayState;
    playRate?: number;
    loadProgress?: number;
  }>(),
  {
    current: 0,
    total: 0,
    playState: "pause",
    playRate: 1,
    loadProgress: 0
  }
);

const emits = defineEmits<{
  (e: "playStateChange", playState: PlayState, currentDuration?: number): void;
  (e: "playRateChange", rate: number): void;
  (e: "durationChange", current: number): void;
}>();

const progress = ref(0);

const progressChanging = ref(false);

watch(
  () => [props.current, props.total],
  () => {
    if (progressChanging.value) return;
    progress.value = (props.current / props.total) * 100;
  }
);

const progressInput = (val: number) => {
  progressChanging.value = true;
  progress.value = Number.isNaN(val) ? 0 : val;
};

const progressChange = (val: number) => {
  progressChanging.value = false;
  emits("durationChange", Number.isNaN(val) ? 0 : (val / 100) * props.total);
};

const jumpDuration = (type: "pre" | "next") => {
  let currentTime = props.current;
  if (type === "pre") {
    currentTime -= 1000 / HZ;
  } else {
    currentTime += 1000 / HZ;
  }
  emits("durationChange", Math.min(currentTime, props.total));
};

const playStateChange = () => {
  switch (props.playState) {
    case "loading":
      break;
    case "play":
      emits("playStateChange", "pause");
      break;
    case "pause":
      emits("playStateChange", "play", props.current);
      break;
    case "end":
      emits("playStateChange", "play");
      break;
  }
};

const rate = ref(props.playRate);

const playRateChange = (val: number) => {
  emits("playRateChange", val);
  rate.value = val;
};

watchEffect(() => {
  rate.value = props.playRate;
});
</script>
<style lang="less" scoped>
.controller {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  color: #fff;
  padding: 12px 20px;
  border-radius: 16px;

  .duration {
    background-color: #444444;
    border-radius: 4px;
    padding: 4px;
  }

  .progress-bar {
    flex: 1;
    padding: 0 18px;

    :deep(.el-slider__runway) {
      &::before {
        content: "";
        position: absolute;
        display: block;
        width: var(--loaded-width);
        height: var(--el-slider-height);
        background-color: var(--el-slider-main-bg-color);
        opacity: 0.5;
        transition: width 0.3s ease;
      }
    }
  }

  .play-btn {
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .el-dropdown-link {
    all: unset;
    cursor: pointer;
    color: #fff;
    display: flex;
    align-items: center;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
