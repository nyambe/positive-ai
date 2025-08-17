<script setup lang="ts">
interface Message {
  id: string
  username: string
  originalText: string
  transformedText: string
  timestamp: string
}

const username = ref('')
const currentMessage = ref('')
const messages = ref<Message[]>([])
const connectionStatus = ref<'connecting' | 'connected' | 'disconnected'>('disconnected')
let ws: WebSocket | null = null

// Load username from localStorage
onMounted(() => {
  if (typeof window !== 'undefined') {
    username.value = localStorage.getItem('chat-username') || ''
    connectWebSocket()
  }
})

// Save username when it changes
watch(username, (newUsername) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chat-username', newUsername)
  }
})

const connectWebSocket = () => {
  if (typeof window === 'undefined') return
  
  connectionStatus.value = 'connecting'
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/api/chat`
  
  ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    connectionStatus.value = 'connected'
    // Request message history
    ws?.send(JSON.stringify({ type: 'join' }))
  }
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    
    if (data.type === 'history') {
      messages.value = data.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp
      }))
    } else if (data.type === 'newMessage') {
      messages.value.push(data.message)
      // Auto-scroll to bottom
      nextTick(() => {
        const messagesContainer = document.querySelector('.messages-container')
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
      })
    } else if (data.type === 'error') {
      console.error('WebSocket error:', data.message)
    }
  }
  
  ws.onclose = () => {
    connectionStatus.value = 'disconnected'
    // Try to reconnect after 3 seconds
    setTimeout(connectWebSocket, 3000)
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    connectionStatus.value = 'disconnected'
  }
}

const sendMessage = async () => {
  if (!currentMessage.value.trim() || !username.value.trim() || connectionStatus.value !== 'connected' || !ws) return
  
  ws.send(JSON.stringify({
    type: 'message',
    username: username.value,
    text: currentMessage.value
  }))
  
  currentMessage.value = ''
}

onUnmounted(() => {
  ws?.close()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">
          Positive Chat
        </h1>
        <div class="ml-4 flex items-center">
          <div 
            class="w-3 h-3 rounded-full mr-2"
            :class="{
              'bg-green-500': connectionStatus === 'connected',
              'bg-yellow-500': connectionStatus === 'connecting', 
              'bg-red-500': connectionStatus === 'disconnected'
            }"
          ></div>
          <span class="text-sm text-gray-600">
            {{ connectionStatus }}
          </span>
        </div>
      </div>
      
      <!-- Username input -->
      <div v-if="!username" class="mb-6">
        <UCard>
          <div class="space-y-4">
            <h2 class="text-xl font-semibold">Join the chat</h2>
            <UInput
              v-model="username"
              placeholder="Enter your name"
              size="lg"
              @keyup.enter="() => {}"
            />
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
              class="p-3 bg-white rounded-lg border"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-blue-600">{{ message.username }}</span>
                <span class="text-xs text-gray-500">
                  {{ new Date(message.timestamp).toLocaleTimeString() }}
                </span>
              </div>
              <p class="text-gray-800">{{ message.transformedText }}</p>
              <p v-if="message.originalText !== message.transformedText" class="text-xs text-gray-500 mt-1">
                Original: {{ message.originalText }}
              </p>
            </div>
            <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          </div>
        </UCard>

        <!-- Message input -->
        <div class="flex gap-2">
          <UInput
            v-model="currentMessage"
            placeholder="Type your message..."
            class="flex-1"
            @keyup.enter="sendMessage"
          />
          <UButton 
            @click="sendMessage" 
            :disabled="!currentMessage.trim() || connectionStatus !== 'connected'"
          >
            Send
          </UButton>
        </div>

        <!-- User info -->
        <div class="text-center">
          <span class="text-sm text-gray-600">
            Chatting as <strong>{{ username }}</strong>
          </span>
          <UButton
            variant="ghost"
            size="xs"
            @click="username = ''"
            class="ml-2"
          >
            Change name
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
