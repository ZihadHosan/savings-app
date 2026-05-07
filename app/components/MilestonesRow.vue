<template>
  <div class="flex flex-wrap gap-2">
    <BadgePill v-for="m in milestones" :key="m.pct" :variant="m.hit ? 'success' : 'neutral'">
      {{ m.pct }}% {{ m.hit ? t('common.unlocked') : t('common.locked') }}
    </BadgePill>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{ percent: number }>()
const { t } = useI18n()

const milestones = computed(() => {
  const p = props.percent
  return [25, 50, 75, 100].map((pct) => ({ pct, hit: p >= pct }))
})
</script>

