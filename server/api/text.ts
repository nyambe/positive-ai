export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  const body = await readBody(event)
  
  if (!body?.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message is required'
    })
  }

  const ai = hubAI()
  
  const prompt = `You are a positive message transformer. Transform the following message to be more positive, constructive, and respectful while preserving the original meaning and intent. If the message is already positive, return it unchanged. Only return the transformed message, nothing else.

Original message: "${body.message}"`
const config = useRuntimeConfig()
const model = config.aiModel as any

  try {
    const result = await ai.run(model, {
      prompt
    })
    
    return {
      original: body.message,
      transformed: result.response || body.message
    }
  } catch (error) {
    console.error('AI transformation error:', error)
    // Fallback: return original message if AI fails
    return {
      original: body.message,
      transformed: body.message
    }
  }
})
  