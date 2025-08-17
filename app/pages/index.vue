<script setup lang="ts">
interface Message {
  id: string
  username: string
  originalText: string
  transformedText: string
  timestamp: string
}

const username = ref('')
const usernameInput = ref('')
const currentMessage = ref('')
const messages = ref<Message[]>([])
const isLoading = ref(false)

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

const sendMessage = async () => {
  if (!currentMessage.value.trim() || !username.value.trim() || isLoading.value) return
  
  isLoading.value = true
  console.log('📤 Sending message:', currentMessage.value)
  
  try {
    // Call the AI transformation API
    const response = await $fetch<{ original: string; transformed: string }>('/api/text', {
      method: 'POST',
      body: { message: currentMessage.value }
    })
    
    console.log('🤖 AI response:', response)
    
    // Add message to local messages array
    const message: Message = {
      id: Date.now().toString(),
      username: username.value,
      originalText: currentMessage.value,
      transformedText: response.transformed,
      timestamp: new Date().toISOString()
    }
    
    messages.value.push(message)
    currentMessage.value = ''
    
    // Auto-scroll to bottom
    nextTick(() => {
      const messagesContainer = document.querySelector('.messages-container')
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    })
    
  } catch (error) {
    console.error('❌ Failed to send message:', error)
  } finally {
    isLoading.value = false
  }
}

const joinChat = () => {
  if (usernameInput.value.trim()) {
    username.value = usernameInput.value.trim()
    console.log('👋 User joined:', username.value)
  }
}

const changeName = () => {
  username.value = ''
  usernameInput.value = ''
  messages.value = []
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chat-username')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
        Positive Chat (Single User Demo)
      </h1>
      
      <!-- Username input -->
      <div v-if="!username" class="mb-6">
        <UCard>
          <div class="space-y-4">
            <h2 class="text-xl font-semibold">Join the chat</h2>
            <UInput
              v-model="usernameInput"
              placeholder="Enter your name and press Enter"
              size="lg"
              @keyup.enter="joinChat"
              autofocus
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
              <p v-if="message.originalText !== message.transformedText" class="text-xs text-gray-500 mt-1 italic">
                Original: "{{ message.originalText }}"
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
            :disabled="!currentMessage.trim() || isLoading"
            :loading="isLoading"
          >
            {{ isLoading ? 'Processing...' : 'Send' }}
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
            @click="changeName"
            class="ml-2"
          >
            Change name
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
