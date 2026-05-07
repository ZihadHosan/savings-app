<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <h2 class="text-base font-semibold">{{ t('chart.projection') }}</h2>
    <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
      {{ t('chart.placeholder') }}
    </p>

    <div class="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <div class="grid grid-cols-12 gap-1 p-3">
        <div
          v-for="i in bars"
          :key="i.idx"
          class="h-16 rounded bg-slate-100 dark:bg-slate-900"
          :style="{ gridColumn: 'span 1 / span 1' }"
        >
          <div class="h-full rounded bg-sky-500/60" :style="{ height: i.h + '%' }" aria-hidden="true" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{ points: number[] }>()
const { t } = useI18n()

const bars = computed(() => {
  const pts = props.points.length ? props.points : [0]
  const max = Math.max(...pts, 1)
  const sample = pts.length > 12 ? pts.filter((_, i) => i % Math.ceil(pts.length / 12) === 0).slice(0, 12) : pts
  while (sample.length < 12) sample.push(sample[sample.length - 1] || 0)
  return sample.slice(0, 12).map((v, idx) => ({ idx, h: Math.round((v / max) * 100) }))
})
</script>

