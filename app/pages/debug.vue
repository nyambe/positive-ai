<script setup lang="ts">
const message = ref('')
const messages = ref<string[]>([])
const connectionStatus = ref('Disconnected')
const userCount = ref(0)

// 🔥 SUPER SIMPLE WEBSOCKET - NO AI YET
const { send, open, close } = useWebSocket('/ws/simple', {
  immediate: false,
  onConnected: () => {
    console.log('✅ WebSocket CONNECTED')
    connectionStatus.value = 'Connected'
  },
  onDisconnected: () => {
    console.log('❌ WebSocket DISCONNECTED')
    connectionStatus.value = 'Disconnected'
  },
  onMessage: async (ws, event) => {
    console.log('📥 RAW MESSAGE RECEIVED:', event.data)
    console.log('📥 MESSAGE TYPE:', typeof event.data)
    console.log('📥 IS BLOB?', event.data instanceof Blob)
    
    try {
      // 🔥 HANDLE BLOB DATA PROPERLY
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
      
      if (data.type === 'echo') {
        messages.value.push(`Echo: ${data.message}`)
      } else if (data.type === 'user-count') {
        userCount.value = data.count
        messages.value.push(`System: ${data.count} users online`)
      } else {
        messages.value.push(`Unknown: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('❌ Failed to parse message:', error)
      messages.value.push(`Error: ${error.message}`)
    }
  },
  onError: (error) => {
    console.error('❌ WebSocket ERROR:', error)
    connectionStatus.value = 'Error'
  }
})

const connect = () => {
  console.log('🔌 Attempting to connect...')
  messages.value.push('Connecting...')
  open()
}

const disconnect = () => {
  console.log('🔌 Disconnecting...')
  close()
}

const sendMessage = () => {
  if (!message.value.trim()) return
  
  console.log('📤 SENDING MESSAGE:', message.value)
  
  try {
    const payload = {
      type: 'echo',
      message: message.value,
      timestamp: new Date().toISOString()
    }
    
    console.log('📤 PAYLOAD:', payload)
    send(JSON.stringify(payload))
    
    messages.value.push(`You: ${message.value}`)
    message.value = ''
  } catch (error) {
    console.error('❌ Failed to send:', error)
  }
}

const clearMessages = () => {
  messages.value = []
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">WebSocket Debug Console</h1>
    
    <!-- Connection Controls -->
    <div class="mb-6 p-4 border rounded">
      <h2 class="font-semibold mb-3">Connection</h2>
      <div class="flex items-center gap-4">
        <span :class="{
          'text-green-600': connectionStatus === 'Connected',
          'text-red-600': connectionStatus === 'Disconnected',
          'text-yellow-600': connectionStatus === 'Error'
        }">
          Status: {{ connectionStatus }}
        </span>
        <span v-if="userCount > 0" class="text-gray-600">
          Users: {{ userCount }}
        </span>
      </div>
      <div class="flex gap-2 mt-3">
        <button 
          @click="connect" 
          :disabled="connectionStatus === 'Connected'"
          class="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
        >
          Connect
        </button>
        <button 
          @click="disconnect" 
          :disabled="connectionStatus === 'Disconnected'"
          class="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Disconnect
        </button>
        <button 
          @click="clearMessages"
          class="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Message Input -->
    <div class="mb-6 p-4 border rounded">
      <h2 class="font-semibold mb-3">Send Message</h2>
      <div class="flex gap-2">
        <input 
          v-model="message"
          @keyup.enter="sendMessage"
          placeholder="Type a test message..."
          class="flex-1 border rounded px-3 py-2"
          :disabled="connectionStatus !== 'Connected'"
        />
        <button 
          @click="sendMessage"
          :disabled="connectionStatus !== 'Connected' || !message.trim()"
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Send
        </button>
      </div>
    </div>

    <!-- Messages Console -->
    <div class="p-4 border rounded bg-gray-50">
      <h2 class="font-semibold mb-3">Messages Console</h2>
      <div class="h-64 overflow-y-auto bg-white border rounded p-3 font-mono text-sm">
        <div v-for="(msg, index) in messages" :key="index" class="mb-1">
          {{ msg }}
        </div>
        <div v-if="messages.length === 0" class="text-gray-500">
          No messages yet. Connect and send a message to test.
        </div>
      </div>
    </div>

    <!-- Debug Info -->
    <div class="mt-4 text-xs text-gray-500">
      <p>🔍 Debug: Check browser console for detailed logs</p>
      <p>📁 WebSocket endpoint: /ws/simple</p>
    </div>
  </div>
</template>