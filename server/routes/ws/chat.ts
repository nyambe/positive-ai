// Message history for context
interface ChatMessage {
    username: string
    originalText: string
    transformedText: string
    timestamp: string
}

// Store recent messages for context (sliding window of 10 messages)
const messageHistory: ChatMessage[] = []
const MAX_HISTORY_SIZE = 10

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

                // Build conversation context from message history
                const conversationHistory: Array<{ role: string; content: string }> = []
                if (messageHistory.length > 0) {
                    // Get last 5 messages for context
                    const recentMessages = messageHistory.slice(-5)
                    recentMessages.forEach(msg => {
                        conversationHistory.push({
                            role: 'assistant',
                            content: `${msg.username}: "${msg.transformedText}"`
                        })
                    })
                }

                // Call AI to transform the message with OpenAI-style format
                const ai = hubAI()
                const config = useRuntimeConfig()
                const model = config.aiModel as any
                
                // Build messages array with system prompt, context, and user message
                const messages = [
                    {
                        role: 'system',
                        content: `You are a communication assistant that helps people express themselves more constructively without changing their actual opinions.

RULES:
- NEVER change the person's opinion or sentiment
- ONLY improve HOW they express it  
- Remove harsh or aggressive language
- Use respectful, constructive phrasing
- Keep the same emotional intent and language
- If already respectful, return unchanged

EXAMPLES:
"I hate the beach" → "The beach isn't really my thing"
"That's stupid" → "I don't think that approach would work"
"You're wrong" → "I see this differently"

Only return the transformed message, nothing else.`
                    },
                    ...conversationHistory,
                    {
                        role: 'user',
                        content: `Transform this message from ${data.username}: "${data.message}"`
                    }
                ]

                const aiResult = await ai.run(model, {
                    input: messages
                })

                // Extract transformed text from OpenAI model response structure
                const transformedText = aiResult.response || 
                                      (aiResult.output?.[1]?.content?.[0]?.text) || 
                                      data.message

                console.log('🤖 CHAT: AI transformation complete')
                console.log('Original:', data.message)
                console.log('Transformed:', transformedText)

                // Create the transformed message
                const chatMessage = {
                    type: 'message',
                    id: Date.now().toString(),
                    username: data.username,
                    originalText: data.message,
                    transformedText: transformedText,
                    timestamp: new Date().toISOString()
                }

                // Add to message history (maintaining sliding window)
                messageHistory.push({
                    username: chatMessage.username,
                    originalText: chatMessage.originalText,
                    transformedText: chatMessage.transformedText,
                    timestamp: chatMessage.timestamp
                })

                // Keep only the last MAX_HISTORY_SIZE messages
                if (messageHistory.length > MAX_HISTORY_SIZE) {
                    messageHistory.shift()
                }

                console.log(`📚 CHAT: Message history size: ${messageHistory.length}`)

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