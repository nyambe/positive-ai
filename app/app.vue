<script setup lang="ts">
// SEO Configuration for Chato app
useSeoMeta({
  title: 'Chato - Chat Positivo con IA | Positive AI-Powered Chat',
  description: 'Chat en tiempo real que transforma mensajes negativos en comunicación positiva usando IA. Basado en Comunicación No Violenta (CNV) para crear conversaciones más constructivas.',
  keywords: 'chat positivo, IA, comunicación no violenta, CNV, chat tiempo real, transformación mensajes, inteligencia artificial, conversación constructiva',
  robots: 'index, follow',
  author: 'Chato Team',
  
  // Open Graph / Facebook
  ogTitle: 'Chato - Chat Positivo con IA',
  ogDescription: 'Transforma automáticamente mensajes negativos en comunicación positiva usando Inteligencia Artificial y principios de Comunicación No Violenta.',
  ogType: 'website',
  ogUrl: 'https://chato.samuel-ebuka.workers.dev',
  ogImage: '/logo.svg',
  ogSiteName: 'Chato',
  ogLocale: 'es_ES',
  
  // Twitter Card
  twitterCard: 'summary_large_image',
  twitterTitle: 'Chato - Chat Positivo con IA',
  twitterDescription: 'Chat en tiempo real que transforma mensajes negativos en comunicación positiva usando IA y principios de CNV.',
  twitterImage: '/logo.svg',
  twitterSite: '@chatoapp',
  
  // Additional meta tags
  themeColor: '#3B82F6',
  colorScheme: 'light'
})

useHead({
  htmlAttrs: {
    lang: 'es'
  },
  link: [
    {
      rel: 'canonical',
      href: 'https://chato.samuel-ebuka.workers.dev'
    },
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    },
    {
      rel: 'apple-touch-icon',
      href: '/logo.svg'
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Chato - Chat Positivo',
        description: 'Chat en tiempo real que transforma mensajes negativos en comunicación positiva usando IA',
        url: 'https://chato.samuel-ebuka.workers.dev',
        applicationCategory: 'CommunicationApplication',
        operatingSystem: 'Web',
        inLanguage: ['es-ES', 'en-US'],
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
