<template>
  <div class="flex items-center gap-4">
    <div class="relative grid place-items-center" :style="{ width: sizePx + 'px', height: sizePx + 'px' }">
      <svg :width="sizePx" :height="sizePx" class="-rotate-90">
        <circle
          :cx="sizePx / 2"
          :cy="sizePx / 2"
          :r="radius"
          class="text-slate-200 dark:text-slate-800"
          stroke="currentColor"
          :stroke-width="stroke"
          fill="transparent"
        />
        <circle
          :cx="sizePx / 2"
          :cy="sizePx / 2"
          :r="radius"
          class="text-sky-500"
          stroke="currentColor"
          :stroke-width="stroke"
          fill="transparent"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <div class="absolute text-center">
        <div class="text-xl font-semibold tabular-nums">{{ Math.round(percent) }}%</div>
        <div class="text-xs text-slate-500 dark:text-slate-400">{{ t('common.complete') }}</div>
      </div>
    </div>

    <div class="min-w-0">
      <div class="text-sm font-medium text-slate-600 dark:text-slate-300">{{ label }}</div>
      <div class="text-lg font-semibold leading-tight">{{ value }}</div>
      <div v-if="subvalue" class="text-sm text-slate-500 dark:text-slate-400">{{ subvalue }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{
  percent: number
  label: string
  value: string
  subvalue?: string
  sizePx?: number
  stroke?: number
}>()

const { t } = useI18n()

const sizePx = computed(() => props.sizePx ?? 120)
const stroke = computed(() => props.stroke ?? 10)
const radius = computed(() => (sizePx.value - stroke.value) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => {
  const pct = Math.max(0, Math.min(100, props.percent))
  return circumference.value * (1 - pct / 100)
})
</script>

