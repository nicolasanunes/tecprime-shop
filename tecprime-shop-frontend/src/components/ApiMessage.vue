<script setup lang="ts">
const props = defineProps<{
  errorMessage?: string;
  loadingMessage?: string;
  successMessage?: string;
}>();
</script>

<template>
  <div
    v-if="props.errorMessage"
    class="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-xl z-50"
  >
    {{ props.errorMessage }}
  </div>

  <div
    v-if="props.loadingMessage"
    class="fixed bottom-4 right-4 bg-gray-500 text-center text-white px-4 py-2 rounded-xl z-50"
  >
    {{ props.loadingMessage }}
  </div>

  <div
    v-if="props.successMessage"
    class="fixed bottom-4 right-4 bg-green-500 text-center text-white px-4 py-2 rounded-xl z-50"
  >
    {{ props.successMessage }}
  </div>
</template>

<style></style>
