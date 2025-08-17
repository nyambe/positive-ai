export default defineWebSocketHandler({
    async open(peer) {
      console.log('👋 User connected, total:', peer.peers.size)
      peer.subscribe('global-chat')
      
      // Send user count to everyone
      peer.publish('global-chat', {
        type: 'user-count',
        count: peer.peers.size
      })
    },
  
    async message(peer, rawMessage) {
      const data = JSON.parse(rawMessage)
      
      if (data.type === 'message') {
        console.log('📝 Processing message from:', data.username)
        
        // AI transformation
        const ai = hubAI()
        const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{
            role: 'system',
            content: 'Rewrite this message to be positive and constructive while preserving the original meaning. Respond with only the transformed message.'
          }, {
            role: 'user',
            content: data.message
          }]
        })
  
        // Broadcast transformed message to everyone
        peer.publish('global-chat', {
          type: 'message',
          id: Date.now().toString(),
          username: data.username,
          original: data.message,
          transformedText: response.response || data.message,
          timestamp: data.timestamp
        })
      }
    },
  
    close(peer) {
      console.log('👋 User disconnected, remaining:', peer.peers.size)
      peer.unsubscribe('global-chat')
      
      // Update user count
      setTimeout(() => {
        peer.publish('global-chat', {
          type: 'user-count',
          count: peer.peers.size
        })
      }, 100)
    }
  })