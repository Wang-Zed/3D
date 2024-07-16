import type Renderer from "@/renderer/RenderScene";

export const useMonitor = (renderer: Renderer) => {
  const fps = ref(0);
  const memory = ref<Memory>();
  const geometries = ref(0);
  const textures = ref(0);

  onMounted(() => {
    renderer.stats.on("fps", (val) => {
      fps.value = val;
      geometries.value = renderer.renderer.info.memory.geometries;
      textures.value = renderer.renderer.info.memory.textures;
    });
    renderer.stats.on("memory", (val) => {
      memory.value = val;
    });
  });

  onBeforeUnmount(() => {
    renderer.stats.dispose();
  });

  return { fps, memory, geometries, textures };
};
