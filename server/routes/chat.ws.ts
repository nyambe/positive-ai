interface ChatMessage {
  id: string
  username: string
  originalText: string
  transformedText: string
  timestamp: string
}

const messages: ChatMessage[] = []
let connectedUsers = 0

export default defineWebSocketHandler({
  message(peer, message) {
    console.log('📨 Chat WebSocket received:', message.text())
    
    try {
      const data = JSON.parse(message.text())
      console.log('📨 Parsed data:', data)
      
      if (data.type === 'join') {
        console.log('👋 User joining, sending history of', messages.length, 'messages')
        peer.send(JSON.stringify({
          type: 'history',
          messages: messages.slice(-50),
          connectedUsers
        }))
        return
      }
      
      if (data.type === 'message') {
        console.log('💬 Processing message from', data.username, ':', data.text)
        
        // For now, just echo the message without AI transformation to test
        const chatMessage: ChatMessage = {
          id: Date.now().toString(),
          username: data.username,
          originalText: data.text,
          transformedText: `[TEST] ${data.text}`, // Simple test transformation
          timestamp: new Date().toISOString()
        }
        
        messages.push(chatMessage)
        console.log('💾 Stored message, total messages:', messages.length)
        
        const broadcastData = JSON.stringify({
          type: 'newMessage',
          message: chatMessage,
          connectedUsers
        })
        
        console.log('📡 Broadcasting:', broadcastData)
        peer.publish('chat', broadcastData)
      }
    } catch (error) {
      console.error('❌ WebSocket error:', error)
      peer.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }))
    }
  },
  
  open(peer) {
    connectedUsers++
    peer.subscribe('chat')
    console.log('🔗 Chat client connected. Total users:', connectedUsers)
    
    peer.publish('chat', JSON.stringify({
      type: 'userCount',
      connectedUsers
    }))
  },
  
  close(peer) {
    connectedUsers--
    console.log('🔌 Chat client disconnected. Total users:', connectedUsers)
    
    peer.publish('chat', JSON.stringify({
      type: 'userCount',
      connectedUsers
    }))
  }
})