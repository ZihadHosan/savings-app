<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold">{{ t('tips.title') }}</h2>
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ quote }}</p>
      </div>
      <button
        type="button"
        class="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-800 dark:hover:bg-slate-900"
        @click="rotate"
      >
        {{ t('tips.newQuote') }}
      </button>
    </div>

    <div class="mt-4">
      <div class="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{{ t('tips.monthDifficulty') }}</div>
      <BadgePill :variant="pillVariant">{{ difficultyLabel }}</BadgePill>
    </div>

    <ul class="mt-4 space-y-3">
      <li v-for="t in tips" :key="t.id" class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
        <div class="text-sm font-semibold">{{ t.title }}</div>
        <div class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ t.body }}</div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Difficulty } from '~/types/challenge'
import { useTipsStore } from '~/stores/tips'
import { useI18n } from '~/composables/useI18n'

const props = defineProps<{ difficulty: Difficulty }>()
const tipsStore = useTipsStore()
const { t } = useI18n()

const quote = computed(() => tipsStore.currentQuote)
const tips = computed(() => tipsStore.getTipsForDifficulty(props.difficulty))

const difficultyLabel = computed(() => {
  switch (props.difficulty) {
    case 'easy':
      return t('difficulty.easy')
    case 'moderate':
      return t('difficulty.moderate')
    case 'challenging':
      return t('difficulty.challenging')
    case 'very_hard':
      return t('difficulty.veryHard')
  }
})

const pillVariant = computed(() => {
  switch (props.difficulty) {
    case 'easy':
      return 'success'
    case 'moderate':
      return 'info'
    case 'challenging':
      return 'warning'
    case 'very_hard':
      return 'warning'
  }
})

function rotate() {
  tipsStore.rotateQuote()
}
</script>

