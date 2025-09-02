<script setup>
const { locales, setLocale, locale } = useI18n()

// Set page metadata
useHead({
  title: 'Internationalization Test - Chato'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('welcome') }}
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Internationalization Test
        </p>
      </div>

      <!-- Language Selector -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white text-center">
          Choose Language
        </h2>
        
        <div class="grid grid-cols-1 gap-3">
          <UButton
            v-for="loc in locales"
            :key="loc.code"
            :variant="locale === loc.code ? 'solid' : 'outline'"
            :color="locale === loc.code ? 'primary' : 'gray'"
            size="lg"
            class="justify-center"
            @click="setLocale(loc.code)"
          >
            <div class="flex items-center space-x-3">
              <!-- Flag emojis for visual appeal -->
              <span class="text-xl">
                {{ loc.code === 'en' ? '🇺🇸' : loc.code === 'es' ? '🇪🇸' : '🇫🇷' }}
              </span>
              <span class="font-medium">{{ loc.name }}</span>
            </div>
          </UButton>
        </div>
      </div>

      <!-- Current Language Display -->
      <div class="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Current Language
          </p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ locales.find(l => l.code === locale)?.name }} ({{ locale.toUpperCase() }})
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
