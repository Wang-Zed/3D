<template>
  <section>Page</section>
</template>
<script lang="ts" setup>
const params = {
  path: "/L2/segment/feature/26346/2024_06/A02-946/2024_06_05/2024_06_05_21_56_43/hmi_files",
  bucketName: "sdc_adas_3"
};
const router = useRouter();
router.push({
  name: "VirtualReplay",
  query: params
});
</script>
<style lang="less" scoped></style>
