interface ChatMessage {
  id: string
  username: string
  originalText: string
  transformedText: string
  timestamp: string
}

const messages: ChatMessage[] = []

export default defineWebSocketHandler({
  async message(peer, message) {
    try {
      const data = JSON.parse(message.text())
      
      if (data.type === 'join') {
        peer.send(JSON.stringify({
          type: 'history',
          messages: messages.slice(-50) // Send last 50 messages
        }))
        return
      }
      
      if (data.type === 'message') {
        // Transform message using AI
        const transformResponse = await $fetch('/api/text', {
          method: 'POST',
          body: { message: data.text }
        })
        
        const chatMessage: ChatMessage = {
          id: Date.now().toString(),
          username: data.username,
          originalText: data.text,
          transformedText: transformResponse.transformed,
          timestamp: new Date().toISOString()
        }
        
        // Store message
        messages.push(chatMessage)
        
        // Keep only last 100 messages in memory
        if (messages.length > 100) {
          messages.splice(0, messages.length - 100)
        }
        
        // Broadcast to all connected clients
        peer.publish('chat', JSON.stringify({
          type: 'newMessage',
          message: chatMessage
        }))
      }
    } catch (error) {
      console.error('WebSocket message error:', error)
      peer.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }))
    }
  },
  
  open(peer) {
    peer.subscribe('chat')
    console.log('Client connected')
  },
  
  close(peer) {
    console.log('Client disconnected')
  }
})