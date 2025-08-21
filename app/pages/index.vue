<script setup lang="ts">
// Types matching your WebSocket handler
interface Analysis {
  sentiment_score: number
  emotion: string
  attack_type: string
  communication_style: string
  intensity: string
}

interface Transformation {
  needed: boolean
  original: string
  transformed: string
  explanation: string
}

interface Message {
  id: string
  username: string
  originalText: string
  transformedText: string
  analysis?: Analysis
  transformation?: Transformation
  timestamp: string
}

interface OutgoingMessage {
  type: 'message'
  username: string
  message: string
  timestamp?: string
}

const username = ref('')
const usernameInput = ref('')
const currentMessage = ref('')
const messages = ref<Message[]>([])
const connectedUsers = ref(0)
const connectedUsersList = ref<string[]>([])
const connectionStatus = ref('Disconnected')
const isAiThinking = ref(false)
const showLegend = ref(true)

// Load username from localStorage
onMounted(() => {
  if (typeof window !== 'undefined') {
    username.value = localStorage.getItem('chat-username') || ''
    usernameInput.value = username.value
  }
})

// Save username when it changes (only when actually set, not during typing)
watch(username, (newUsername) => {
  if (typeof window !== 'undefined' && newUsername) {
    localStorage.setItem('chat-username', newUsername)
  }
})

// WebSocket connection using your working pattern
const { send, open, close } = useWebSocket('/ws/chat', {
  immediate: false,
  onConnected: () => {
    console.log('✅ WebSocket CONNECTED to chat')
    connectionStatus.value = 'Connected'
  },
  onDisconnected: () => {
    console.log('❌ WebSocket DISCONNECTED from chat')
    connectionStatus.value = 'Disconnected'
  },
  onMessage: async (ws, event) => {
    console.log('📥 RAW MESSAGE RECEIVED:', event.data)
    console.log('📥 MESSAGE TYPE:', typeof event.data)
    console.log('📥 IS BLOB?', event.data instanceof Blob)
    
    try {
      // Handle Blob data properly like your debug page
      let messageText: string
      
      if (event.data instanceof Blob) {
        console.log('📥 Converting Blob to text...')
        messageText = await event.data.text()
        console.log('📥 Blob converted to:', messageText)
      } else if (typeof event.data === 'string') {
        messageText = event.data
      } else {
        throw new Error(`Unexpected data type: ${typeof event.data}`)
      }
      
      const data = JSON.parse(messageText)
      console.log('📥 PARSED MESSAGE:', data)
      
      if (data.type === 'message') {
        // Hide AI thinking indicator
        isAiThinking.value = false
        
        // Add the transformed message to our messages
        const message: Message = {
          id: data.id,
          username: data.username,
          originalText: data.originalText,
          transformedText: data.transformedText,
          analysis: data.analysis,
          transformation: data.transformation,
          timestamp: data.timestamp
        }
        
        messages.value.push(message)
        
        // Auto-scroll to bottom
        nextTick(() => {
          const messagesContainer = document.querySelector('.messages-container')
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight
          }
        })
      } else if (data.type === 'user-count') {
        connectedUsers.value = data.count
        console.log('👥 User count updated:', data.count)
      } else if (data.type === 'user-list') {
        connectedUsersList.value = data.users || []
        console.log('👥 Connected users:', data.users)
      } else if (data.type === 'ai-thinking') {
        isAiThinking.value = data.thinking
        console.log('🤖 AI thinking:', data.thinking)
      } else if (data.type === 'system') {
        console.log('📢 System message:', data.message)
      }
    } catch (error) {
      console.error('❌ Failed to parse message:', error)
    }
  },
  onError: (error) => {
    console.error('❌ WebSocket ERROR:', error)
    connectionStatus.value = 'Error'
  }
})

// Connect when user joins chat
watch(username, (newUsername) => {
  if (newUsername && connectionStatus.value === 'Disconnected') {
    console.log('🔌 Connecting to WebSocket...')
    open()
  }
})

const sendMessage = () => {
  if (!currentMessage.value.trim() || !username.value.trim() || connectionStatus.value !== 'Connected') return
  
  console.log('📤 SENDING MESSAGE via WebSocket:', currentMessage.value)
  
  try {
    // Show AI thinking indicator
    isAiThinking.value = true
    
    // Auto-scroll to show thinking indicator
    nextTick(() => {
      const messagesContainer = document.querySelector('.messages-container')
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    })
    
    const payload: OutgoingMessage = {
      type: 'message',
      username: username.value,
      message: currentMessage.value,
      timestamp: new Date().toISOString()
    }
    
    console.log('📤 PAYLOAD:', payload)
    send(JSON.stringify(payload))
    
    currentMessage.value = ''
    
    // Hide AI thinking after 10 seconds (fallback)
    setTimeout(() => {
      isAiThinking.value = false
    }, 10000)
  } catch (error) {
    console.error('❌ Failed to send message:', error)
    isAiThinking.value = false
  }
}

const joinChat = () => {
  if (usernameInput.value.trim()) {
    username.value = usernameInput.value.trim()
    console.log('👋 User joined:', username.value)
  }
}

const changeName = () => {
  if (connectionStatus.value === 'Connected') {
    close()
  }
  username.value = ''
  usernameInput.value = ''
  messages.value = []
  connectedUsers.value = 0
  connectionStatus.value = 'Disconnected'
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chat-username')
  }
}

// Helper function for emotion emojis and Spanish labels
const getEmotionEmoji = (emotion: string): string => {
  const emotionMap: Record<string, string> = {
    playful: '😄',
    confused: '🤔',
    annoyed: '😒',
    frustrated: '😤',
    disappointed: '😞',
    angry: '😠',
    hurt: '💔',
    fear: '😨',
    surprised: '😲',
    neutral: '😐'
  }
  return emotionMap[emotion] || '🤔'
}

// Helper function for emotion icons (Nuxt UI)
const getEmotionIcon = (emotion: string): string => {
  const emotionIconMap: Record<string, string> = {
    playful: 'i-heroicons-face-smile-20-solid',
    confused: 'i-heroicons-question-mark-circle-20-solid',
    annoyed: 'i-heroicons-face-frown-20-solid',
    frustrated: 'i-heroicons-fire-20-solid',
    disappointed: 'i-heroicons-arrow-trending-down-20-solid',
    angry: 'i-heroicons-bolt-20-solid',
    hurt: 'i-heroicons-heart-20-solid',
    fear: 'i-heroicons-shield-exclamation-20-solid',
    surprised: 'i-heroicons-exclamation-circle-20-solid',
    neutral: 'i-heroicons-minus-circle-20-solid'
  }
  return emotionIconMap[emotion] || 'i-heroicons-question-mark-circle-20-solid'
}

// Spanish translations for emotions
const getEmotionLabel = (emotion: string): string => {
  const emotionLabels: Record<string, string> = {
    playful: 'juguetón',
    confused: 'confundido',
    annoyed: 'molesto',
    frustrated: 'frustrado',
    disappointed: 'decepcionado',
    angry: 'enojado',
    hurt: 'herido',
    fear: 'temeroso',
    surprised: 'sorprendido',
    neutral: 'neutral'
  }
  return emotionLabels[emotion] || emotion
}

// Spanish translations for attack types
const getAttackTypeLabel = (attackType: string): string => {
  const attackLabels: Record<string, string> = {
    character: 'personal',
    behavior: 'comportamiento',
    opinion: 'opinión',
    'playful-teasing': 'broma',
    none: 'ninguno'
  }
  return attackLabels[attackType] || attackType
}

// Spanish translations for intensity levels
const getIntensityLabel = (intensity: string): string => {
  const intensityLabels: Record<string, string> = {
    'positivo': 'positivo',
    'leve': 'leve',
    'moderado': 'moderado',
    'alto': 'alto',
    'muy-alto': 'muy alto'
  }
  return intensityLabels[intensity] || intensity
}

// Clean up on unmount
onUnmounted(() => {
  if (connectionStatus.value === 'Connected') {
    close()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">
          Chat Positivo
        </h1>
        <div class="ml-4 flex items-center space-x-4">
          <div class="flex items-center">
            <div 
              class="w-3 h-3 rounded-full mr-2"
              :class="{
                'bg-green-500': connectionStatus === 'Connected',
                'bg-yellow-500': connectionStatus === 'Connecting', 
                'bg-red-500': connectionStatus === 'Disconnected',
                'bg-orange-500': connectionStatus === 'Error'
              }"
            ></div>
            <span class="text-sm text-gray-600">
              {{ connectionStatus === 'Connected' ? 'Conectado' : connectionStatus === 'Disconnected' ? 'Desconectado' : connectionStatus === 'Connecting' ? 'Conectando' : 'Error' }}
            </span>
          </div>
          <div v-if="connectedUsers > 0" class="flex items-center">
            <span class="text-sm text-gray-600">
              👥 {{ connectedUsers }} usuario{{ connectedUsers !== 1 ? 's' : '' }} conectado{{ connectedUsers !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Username input -->
      <div v-if="!username" class="mb-6">
        <UCard>
          <div class="space-y-4">
            <h2 class="text-xl font-semibold">Únete al chat</h2>
            <div class="flex gap-2">
              <UInput
                v-model="usernameInput"
                placeholder="Introduce tu nombre"
                size="lg"
                class="flex-1"
                @keyup.enter="joinChat"
                autofocus
              />
              <UButton
                @click="joinChat"
                :disabled="!usernameInput.trim()"
                size="lg"
              >
                Unirse
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Chat interface -->
      <div v-else class="space-y-4">
        <!-- Connected Users List -->
        <UCard v-if="connectedUsersList.length > 0">
          <div class="flex items-center space-x-2">
            <h3 class="text-sm font-medium text-gray-700">Usuarios conectados:</h3>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="user in connectedUsersList" 
                :key="user"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="user === username ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'"
              >
                {{ user }}
                <span v-if="user === username" class="ml-1">(tú)</span>
              </span>
            </div>
          </div>
        </UCard>

        <!-- Messages -->
        <UCard class="h-96 overflow-y-auto messages-container">
          <div class="space-y-3">
            <div
              v-for="message in messages"
              :key="message.id"
              class="flex"
              :class="message.username === username ? 'justify-end' : 'justify-start'"
            >
              <div 
                class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl"
                :class="message.username === username 
                  ? 'bg-blue-500 text-white rounded-br-sm' 
                  : 'bg-gray-200 text-gray-800 rounded-bl-sm'"
              >
                <!-- Show username only for other people's messages -->
                <div v-if="message.username !== username" class="text-xs opacity-75 mb-1">
                  {{ message.username }}
                </div>
                
                <p class="text-sm">{{ message.transformedText }}</p>
                
                <!-- Show original text if transformed -->
                <p v-if="message.originalText !== message.transformedText" 
                   class="text-xs mt-1 italic"
                   :class="message.username === username ? 'text-blue-100' : 'text-gray-500'"
                >
                  Original: "{{ message.originalText }}"
                </p>

                <!-- Analysis badges (only shown to sender) -->
                <div v-if="message.username === username && message.analysis" 
                     class="flex flex-wrap gap-1 mt-2">
                  <!-- Intensity & Sentiment Score -->
                  <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        :class="{
                          'bg-green-100 text-green-800': message.analysis.sentiment_score <= 3,
                          'bg-yellow-100 text-yellow-800': message.analysis.sentiment_score > 3 && message.analysis.sentiment_score <= 6,
                          'bg-orange-100 text-orange-800': message.analysis.sentiment_score > 6 && message.analysis.sentiment_score <= 8,
                          'bg-red-100 text-red-800': message.analysis.sentiment_score > 8
                        }">
                    <UIcon name="i-heroicons-chart-bar-20-solid" class="w-3 h-3" />
                    {{ message.analysis.sentiment_score }}/10 ({{ getIntensityLabel(message.analysis.intensity) }})
                  </span>

                  <!-- Emotion -->
                  <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <UIcon :name="getEmotionIcon(message.analysis.emotion)" class="w-3 h-3" />
                    {{ getEmotionLabel(message.analysis.emotion) }}
                  </span>

                  <!-- Attack Type Warning -->
                  <span v-if="message.analysis.attack_type !== 'none'" 
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="w-3 h-3" />
                    {{ getAttackTypeLabel(message.analysis.attack_type) }}
                  </span>

                  <!-- Transformation Indicator -->
                  <span v-if="message.transformation?.needed" 
                        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <UIcon name="i-heroicons-sparkles-20-solid" class="w-3 h-3" />
                    transformado
                  </span>
                </div>
                
                <!-- Timestamp -->
                <div class="text-xs mt-1"
                     :class="message.username === username ? 'text-blue-100' : 'text-gray-500'"
                >
                  {{ new Date(message.timestamp).toLocaleTimeString() }}
                </div>
              </div>
            </div>
            
            <!-- AI Thinking Indicator -->
            <div v-if="isAiThinking" class="flex justify-start">
              <div class="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs">
                <div class="flex items-center space-x-2">
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                  </div>
                  <span class="text-sm text-gray-600">IA pensando...</span>
                </div>
              </div>
            </div>
            
            <div v-if="messages.length === 0 && !isAiThinking" class="text-center text-gray-500 py-8">
              ¡Empieza la conversación! no se guardan los mensajes!! privacidad total. Si escribes algo negativo, el chat lo transforma en algo positivo.
            </div>
          </div>
        </UCard>

        <!-- Message input -->
        <div class="flex gap-2">
          <UInput
            v-model="currentMessage"
            placeholder="Escribe tu mensaje..."
            class="flex-1"
            @keyup.enter="sendMessage"
          />
          <UButton 
            @click="sendMessage" 
            :disabled="!currentMessage.trim() || connectionStatus !== 'Connected'"
          >
            Enviar
          </UButton>
        </div>

        <!-- User info -->
        <div class="text-center">
          <span class="text-sm text-gray-600">
            Chateando como <strong>{{ username }}</strong>
          </span>
          <UButton
            variant="ghost"
            size="xs"
            @click="changeName"
            class="ml-2"
          >
            Cambiar nombre
          </UButton>
        </div>

        <!-- Analysis Legend Toggle -->
        <div class="text-center mt-4">
          <UButton
            @click="showLegend = !showLegend"
            variant="ghost"
            size="sm"
            class="text-gray-600"
          >
            <UIcon 
              name="i-heroicons-information-circle-20-solid" 
              class="w-4 h-4 mr-1" 
            />
            {{ showLegend ? 'Ocultar' : 'Ver' }} Leyenda / {{ showLegend ? 'Hide' : 'Show' }} Legend
          </UButton>
        </div>

        <!-- Analysis Legend Accordion -->
        <UAccordion 
          v-if="showLegend"
          class="mt-4"
          :items="[
            {
              label: 'Niveles de Intensidad / Intensity Levels',
              slot: 'intensity-levels',
              icon: 'i-heroicons-chart-bar-20-solid'
            },
            {
              label: 'Emociones / Emotions', 
              slot: 'emotions',
              icon: 'i-heroicons-face-smile-20-solid'
            },
            {
              label: 'Tipos de Ataque / Attack Types',
              slot: 'attack-types',
              icon: 'i-heroicons-exclamation-triangle-20-solid'
            },
            {
              label: 'Transformación / Transformation',
              slot: 'transformation',
              icon: 'i-heroicons-sparkles-20-solid'
            }
          ]"
        >
          <template #intensity-levels>
            <div class="space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                  <UIcon name="i-heroicons-chart-bar-20-solid" class="w-3 h-3" />
                  0-2 Positivo/Positive
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                  <UIcon name="i-heroicons-chart-bar-20-solid" class="w-3 h-3" />
                  3-4 Leve/Light
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs">
                  <UIcon name="i-heroicons-chart-bar-20-solid" class="w-3 h-3" />
                  5-6 Moderado/Moderate
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                  <UIcon name="i-heroicons-chart-bar-20-solid" class="w-3 h-3" />
                  7-10 Alto/High
                </span>
              </div>
            </div>
          </template>

          <template #emotions>
            <div class="grid grid-cols-2 gap-1">
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                <UIcon name="i-heroicons-face-smile-20-solid" class="w-3 h-3" />
                Juguetón/Playful
              </span>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                <UIcon name="i-heroicons-fire-20-solid" class="w-3 h-3" />
                Frustrado/Frustrated
              </span>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                <UIcon name="i-heroicons-bolt-20-solid" class="w-3 h-3" />
                Enojado/Angry
              </span>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                <UIcon name="i-heroicons-face-frown-20-solid" class="w-3 h-3" />
                Molesto/Annoyed
              </span>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                <UIcon name="i-heroicons-question-mark-circle-20-solid" class="w-3 h-3" />
                Confundido/Confused
              </span>
            </div>
          </template>

          <template #attack-types>
            <div class="grid grid-cols-2 gap-1">
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="w-3 h-3" />
                Personal/Character
              </span>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="w-3 h-3" />
                Comportamiento/Behavior
              </span>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
                <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="w-3 h-3" />
                Opinión/Opinion
              </span>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs">
                <UIcon name="i-heroicons-exclamation-triangle-20-solid" class="w-3 h-3" />
                Broma/Playful Teasing
              </span>
            </div>
          </template>

          <template #transformation>
            <div class="space-y-2">
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                <UIcon name="i-heroicons-sparkles-20-solid" class="w-3 h-3" />
                Mensaje mejorado con CNV / Message improved with NVC
              </span>
              <p class="text-xs text-gray-500 italic">
                * Solo el remitente ve este análisis / Only the sender sees this analysis
              </p>
            </div>
          </template>
        </UAccordion>
      </div>
    </div>
  </div>
</template>
