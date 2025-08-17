export default defineWebSocketHandler({
  message(peer, message) {
    console.log('🧪 Test WebSocket received:', message.text())
    peer.send(`Echo: ${message.text()}`)
  },
  
  open(peer) {
    console.log('🧪 Test WebSocket client connected')
    peer.send('Connected to test WebSocket!')
  },
  
  close(peer) {
    console.log('🧪 Test WebSocket client disconnected')
  }
})