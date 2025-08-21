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

// Store connected users (Map of peer ID to username)
const connectedUsers = new Map<string, string>()

// Helper function to broadcast user list to all connected peers
function broadcastUserList(peer: any) {
    const userList = Array.from(connectedUsers.values())
    peer.publish('chat-channel', {
        type: 'user-list',
        users: userList
    })
    console.log('👥 CHAT: Broadcasting user list:', userList)
}

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
                
                // Track the user if not already tracked
                if (!connectedUsers.has(peer.id) && data.username) {
                    connectedUsers.set(peer.id, data.username)
                    console.log(`👤 CHAT: User ${data.username} registered (peer: ${peer.id})`)
                    
                    // Broadcast updated user list
                    broadcastUserList(peer)
                }

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
                        content: `You are an NVC communication analyst and transformer. Your job is to analyze outgoing messages and transform them using Nonviolent Communication principles.

CRITICAL: You MUST return ONLY valid JSON, no other text or formatting.

STEP 1 - ANALYZE the message:
- Sentiment score: 0-10 (0=positive/neutral, 10=very aggressive)
- Primary emotion: anger, frustration, disappointment, hurt, fear, neutral
- Attack type: character (personal insults), behavior (actions), opinion (ideas), or none
- Communication style: aggressive, passive-aggressive, assertive, or passive

STEP 2 - TRANSFORM if needed:
- If sentiment_score > 3: Transform using NVC principles
- Keep same language as input (Spanish→Spanish, English→English)
- Focus on feelings and needs, not judgments
- Use "I" statements: "Me siento...", "Necesito...", "I feel...", "I need..."
- Remove character attacks and blame

STEP 3 - RETURN only this JSON structure:
{
  "analysis": {
    "sentiment_score": [0-10],
    "emotion": "[anger|frustration|disappointment|hurt|fear|neutral]",
    "attack_type": "[character|behavior|opinion|none]", 
    "communication_style": "[aggressive|passive-aggressive|assertive|passive]"
  },
  "transformation": {
    "needed": [true if score > 3],
    "original": "[exact original message]",
    "transformed": "[NVC transformation or null if not needed]",
    "explanation": "[brief reason for transformation]"
  }
}

NVC TRANSFORMATION PRINCIPLES:
✓ "Eres un idiota" → "Me siento muy frustrado/a" (character attack → feeling)
✓ "Estás equivocado" → "Veo esto de manera diferente" (judgment → observation)
✓ "No sirves" → "Necesito más apoyo" (attack → need)
✓ "You're stupid" → "I'm confused about this" (insult → feeling)
✓ "You always..." → "When this happens, I feel..." (generalization → specific)

Remember: User is SENDER, transform what they want to say TO others.` 
                    },
                    ...conversationHistory,
                    {
                        role: 'user',
                        content: `${data.username} wants to send this message to others in the chat: "${data.message}"

Transform it to be more respectful and constructive while keeping the same meaning.`
                    }
                ]

                const aiResult = await ai.run(model, {
                    input: messages
                })

                // Extract JSON response from OpenAI model response structure
                const jsonResponse = aiResult.response || 
                                   (aiResult.output?.[1]?.content?.[0]?.text) || 
                                   '{}'

                console.log('🤖 CHAT: AI JSON response:', jsonResponse)

                // Parse the JSON analysis and transformation
                let analysisData
                try {
                    analysisData = JSON.parse(jsonResponse)
                    console.log('🧠 CHAT: Analysis:', analysisData.analysis)
                    console.log('✨ CHAT: Transformation needed:', analysisData.transformation.needed)
                } catch (parseError) {
                    console.error('❌ CHAT: Failed to parse AI JSON response:', parseError)
                    // Fallback to simple transformation
                    analysisData = {
                        analysis: {
                            sentiment_score: 5,
                            emotion: 'neutral',
                            attack_type: 'none',
                            communication_style: 'neutral'
                        },
                        transformation: {
                            needed: false,
                            original: data.message,
                            transformed: data.message,
                            explanation: 'JSON parse error - using original message'
                        }
                    }
                }

                const transformedText = analysisData.transformation.transformed || data.message

                console.log('🤖 CHAT: AI transformation complete')
                console.log('Original:', data.message)
                console.log('Transformed:', transformedText)

                // Create the transformed message with analysis
                const chatMessage = {
                    type: 'message',
                    id: Date.now().toString(),
                    username: data.username,
                    originalText: data.message,
                    transformedText: transformedText,
                    analysis: analysisData.analysis,  // Include the sentiment analysis
                    transformation: analysisData.transformation,  // Include transformation details
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
        const disconnectedUser = connectedUsers.get(peer.id)
        console.log(`🔴 CHAT: User ${disconnectedUser || 'unknown'} disconnected (peer: ${peer.id})`)
        console.log('🔴 CHAT: Remaining peers:', peer.peers.size)

        // Remove user from connected users list
        if (connectedUsers.has(peer.id)) {
            connectedUsers.delete(peer.id)
            console.log(`👤 CHAT: Removed ${disconnectedUser} from user list`)
        }

        peer.unsubscribe('chat-channel')

        // Update user count and user list after a delay
        setTimeout(() => {
            peer.publish('chat-channel', {
                type: 'user-count',
                count: peer.peers.size
            })
            
            // Broadcast updated user list
            broadcastUserList(peer)
        }, 100)
    }
})