export default defineWebSocketHandler({
    open(peer) {
      console.log('🟢 SERVER: User connected')
      console.log('🟢 SERVER: Total peers:', peer.peers.size)
      
      peer.subscribe('simple-chat')
      
      // Send user count to everyone
      peer.publish('simple-chat', {
        type: 'user-count',
        count: peer.peers.size
      })
      
      console.log('🟢 SERVER: User subscribed and count published')
    },
  
    message(peer, rawMessage) {
      console.log('📥 SERVER: Raw message received:', rawMessage)
      
      try {
        const data = JSON.parse(rawMessage)
        console.log('📥 SERVER: Parsed message:', data)
        
        if (data.type === 'echo') {
          console.log('📤 SERVER: Publishing echo back to all users')
          
          // Just echo the message back to everyone
          peer.publish('simple-chat', {
            type: 'echo',
            message: `Server received: ${data.message}`,
            timestamp: data.timestamp
          })
          
          console.log('📤 SERVER: Echo published successfully')
        }
      } catch (error) {
        console.error('❌ SERVER: Failed to parse message:', error)
      }
    },
  
    close(peer) {
      console.log('🔴 SERVER: User disconnected')
      console.log('🔴 SERVER: Remaining peers:', peer.peers.size)
      
      peer.unsubscribe('simple-chat')
      
      // Update user count after a delay
      setTimeout(() => {
        peer.publish('simple-chat', {
          type: 'user-count',
          count: peer.peers.size
        })
      }, 100)
    }
  })