import { defineStore } from 'pinia'
import type { Difficulty, TipItem } from '~/types/challenge'

const tipsByDifficulty: Record<Difficulty, TipItem[]> = {
  easy: [
    {
      id: 'easy-1',
      title: 'Automate the small win',
      body: 'Set an automatic transfer for this week’s amount. Consistency beats intensity.',
      tags: ['automation', 'habit']
    }
  ],
  moderate: [
    {
      id: 'mod-1',
      title: 'Cut one recurring expense',
      body: 'Pause one subscription for 30 days and redirect that amount into savings.',
      tags: ['budget', 'subscriptions']
    }
  ],
  challenging: [
    {
      id: 'hard-1',
      title: 'Plan a “no-spend” window',
      body: 'Pick two days this week for a no-spend rule. Move the avoided spend into savings.',
      tags: ['no-spend', 'planning']
    }
  ],
  very_hard: [
    {
      id: 'vhard-1',
      title: 'Use the double-up guide',
      body: 'If you missed a week, consider paying 2× this week and adjusting one discretionary category to compensate.',
      tags: ['missed-week', 'double-up']
    }
  ]
}

const quotes = [
  'Small steps, big change.',
  'Consistency is a superpower.',
  'Your future self is watching.'
]

export const useTipsStore = defineStore('tips', {
  state: () => ({
    quoteIndex: 0
  }),

  getters: {
    currentQuote: (s) => quotes[s.quoteIndex % quotes.length]
  },

  actions: {
    rotateQuote() {
      this.quoteIndex = (this.quoteIndex + 1) % quotes.length
    },
    getTipsForDifficulty(d: Difficulty): TipItem[] {
      return tipsByDifficulty[d] || []
    }
  }
})

