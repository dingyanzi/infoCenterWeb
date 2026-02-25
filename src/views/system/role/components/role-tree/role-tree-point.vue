<template>
  <div class="point">
    <div class="point-label">
      <template v-for="module in props.tree" :key="module.value">
        <a-checkbox @change="emits('selectCheckbox', module)" :value="module.value">{{ module.label }} </a-checkbox>
      </template>
    </div>
  </div>
</template>
<script setup>
  const props = defineProps({
    tree: {
      type: Array,
      default: () => [],
    },
    index: {
      type: Number,
      default: 0,
    },
  });
  let emits = defineEmits(['selectCheckbox']);
</script>
<style scoped lang="less"></style>
