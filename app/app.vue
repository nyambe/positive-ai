<script setup lang="ts">
// i18n composable for reactive metadata
const { t, locale } = useI18n()

// Helper function to get locale for Open Graph
const getOgLocale = (currentLocale: string): string => {
  const localeMap: Record<string, string> = {
    'en': 'en_US',
    'es': 'es_ES', 
    'fr': 'fr_FR',
    'de': 'de_DE'
  }
  return localeMap[currentLocale] || 'en_US'
}

// Reactive SEO Configuration for Chato app
useSeoMeta({
  title: () => t('meta.title'),
  description: () => t('meta.description'),
  keywords: () => t('meta.keywords'),
  robots: 'index, follow',
  author: 'Chato Team',
  
  // Open Graph / Facebook
  ogTitle: () => t('meta.ogTitle'),
  ogDescription: () => t('meta.ogDescription'),
  ogType: 'website',
  ogUrl: 'https://chato.samuel-ebuka.workers.dev',
  ogImage: '/logo.svg',
  ogSiteName: 'Chato',
  ogLocale: () => getOgLocale(locale.value),
  
  // Twitter Card
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('meta.twitterTitle'),
  twitterDescription: () => t('meta.twitterDescription'),
  twitterImage: '/logo.svg',
  twitterSite: '@chatoapp',
  
  // Additional meta tags
  themeColor: '#3B82F6',
  colorScheme: 'light'
})

useHead({
  htmlAttrs: {
    lang: () => locale.value
  },
  link: [
    {
      rel: 'canonical',
      href: 'https://chato.samuel-ebuka.workers.dev'
    },
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/favicon.svg'
    },
    {
      rel: 'icon',
      sizes: '32x32',
      href: '/favicon.svg'
    },
    {
      rel: 'apple-touch-icon',
      href: '/logo.svg'
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: t('meta.appName'),
        description: t('meta.appDescription'),
        url: 'https://chato.samuel-ebuka.workers.dev',
        applicationCategory: 'CommunicationApplication',
        operatingSystem: 'Web',
        inLanguage: ['es-ES', 'en-US', 'fr-FR', 'de-DE'],
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        featureList: [
          'Transformación automática de mensajes negativos',
          'Basado en Comunicación No Violenta (CNV)',
          'Chat en tiempo real',
          'Análisis de sentimientos con IA',
          'Privacidad total - no se guardan mensajes'
        ],
        author: {
          '@type': 'Organization',
          name: 'Chato Team'
        }
      })
    }
  ]
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator />
  <NuxtPage />
</template>
<style>
body {
  font-family: 'Roboto Mono', monospace;
  font-weight: 100; 
}
</style>
