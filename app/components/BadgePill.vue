<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="variantClass"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ variant?: 'neutral' | 'success' | 'warning' | 'info' }>()

const variantClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
    case 'warning':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
    case 'info':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
  }
})
</script>

