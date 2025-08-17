// Copy of your working simple.ts pattern, modified for chat
export default defineWebSocketHandler({
  open(peer) {
    console.log('🟢 CHAT: User connected')
    console.log('🟢 CHAT: Total peers:', peer.peers.size)
    
    peer.subscribe('chat-channel')
    
    // Send user count to everyone
    peer.publish('chat-channel', {
      type: 'user-count',
      count: peer.peers.size
    })
    
    console.log('🟢 CHAT: User subscribed and count published')
  },

  async message(peer, rawMessage) {
    console.log('📥 CHAT: Raw message received:', rawMessage)
    
    try {
      const data = JSON.parse(rawMessage.toString())
      console.log('📥 CHAT: Parsed message:', data)
      
      if (data.type === 'message') {
        console.log('🤖 CHAT: Transforming message with AI...')
        
        // Call AI to transform the message
        const ai = hubAI()
        const prompt = `You are a positive message transformer. Transform the following message to be more positive, constructive, and respectful while preserving the original meaning and intent. If the message is already positive, return it unchanged. Only return the transformed message, nothing else.

Original message: "${data.message}"`
        
        const aiResult = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt
        })
        
        console.log('🤖 CHAT: AI transformation complete')
        console.log('Original:', data.message)
        console.log('Transformed:', aiResult.response)
        
        // Create the transformed message
        const chatMessage = {
          type: 'message',
          id: Date.now().toString(),
          username: data.username,
          originalText: data.message,
          transformedText: aiResult.response || data.message,
          timestamp: new Date().toISOString()
        }
        
        // Broadcast transformed message to all users
        peer.publish('chat-channel', chatMessage)
        
        // Also send to the sender so they see their own message
        peer.send(JSON.stringify(chatMessage))
        
        console.log('📤 CHAT: Transformed message published successfully')
      }
    } catch (error) {
      console.error('❌ CHAT: Failed to parse message:', error)
    }
  },

  close(peer) {
    console.log('🔴 CHAT: User disconnected')
    console.log('🔴 CHAT: Remaining peers:', peer.peers.size)
    
    peer.unsubscribe('chat-channel')
    
    // Update user count after a delay
    setTimeout(() => {
      peer.publish('chat-channel', {
        type: 'user-count',
        count: peer.peers.size
      })
    }, 100)
  }
})