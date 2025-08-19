<script setup lang="ts">
// Types matching your WebSocket handler
interface Message {
  id: string
  username: string
  originalText: string
  transformedText: string
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
const connectionStatus = ref('Disconnected')

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
        // Add the transformed message to our messages
        const message: Message = {
          id: data.id,
          username: data.username,
          originalText: data.originalText,
          transformedText: data.transformedText,
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
    const payload: OutgoingMessage = {
      type: 'message',
      username: username.value,
      message: currentMessage.value,
      timestamp: new Date().toISOString()
    }
    
    console.log('📤 PAYLOAD:', payload)
    send(JSON.stringify(payload))
    
    currentMessage.value = ''
  } catch (error) {
    console.error('❌ Failed to send message:', error)
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
                
                <!-- Timestamp -->
                <div class="text-xs mt-1"
                     :class="message.username === username ? 'text-blue-100' : 'text-gray-500'"
                >
                  {{ new Date(message.timestamp).toLocaleTimeString() }}
                </div>
              </div>
            </div>
            <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
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
      </div>
    </div>
  </div>
</template>
