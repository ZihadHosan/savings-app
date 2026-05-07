<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-7xl flex-col">
    <header class="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
      <div class="flex items-center justify-between gap-3 px-4 py-3">
        <NuxtLink to="/" class="flex items-center gap-2 font-semibold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white">S</span>
          <span>{{ t('app.name') }}</span>
        </NuxtLink>

        <nav class="flex items-center gap-2">
          <ClientOnly>
            <NuxtLink
              v-if="!auth.isAuthenticated"
              to="/login"
              class="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {{ t('auth.login') }}
            </NuxtLink>
            <div v-else class="relative" @keydown.esc="menuOpen = false">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-200 dark:hover:bg-slate-900"
                @click="menuOpen = !menuOpen"
              >
                <span class="max-w-[14rem] truncate">{{ displayName }}</span>
                <span class="text-xs opacity-70">▾</span>
              </button>

              <div
                v-if="menuOpen"
                class="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950"
              >
                <button
                  type="button"
                  class="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                  @click.stop="goProfile"
                >
                  {{ t('nav.profile') }}
                </button>
                <button
                  type="button"
                  class="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                  @click="handleLogout"
                >
                  {{ t('auth.logout') }}
                </button>
              </div>
            </div>
            <template #fallback>
              <!-- Prevent SSR/client auth mismatch flicker -->
              <span class="inline-flex h-9 w-16 rounded bg-slate-100 dark:bg-slate-900" aria-hidden="true" />
            </template>
          </ClientOnly>
          <NuxtLink
            to="/settings"
            class="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            {{ t('nav.settings') }}
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1 px-4 py-4">
      <slot />
    </main>

    <footer class="border-t border-slate-200/70 px-4 py-4 text-xs text-slate-500 dark:border-slate-800/70 dark:text-slate-400">
      {{ t('footer.offline') }}
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useAuthStore } from '~/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()

const menuOpen = ref(false)
const displayName = computed(() => auth.profile?.name || auth.user?.email || 'Account')

function goProfile() {
  menuOpen.value = false
  navigateTo('/profile-setup')
}

function handleLogout() {
  menuOpen.value = false
  // signOut clears local state synchronously; remote sign-out runs in the
  // background so the UI updates instantly without a refresh.
  auth.signOut()
  navigateTo('/login')
}
</script>

