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
  const config = useRuntimeConfig()
  const model = config.aiModel as any
  
  // OpenAI-style message format
  const messages = [
    {
      role: 'system',
      content: `You are a positive message transformer. Transform the following message to be more positive, constructive, and respectful while preserving the original meaning and intent. 

CRITICAL REQUIREMENTS:
- ALWAYS respond in the SAME LANGUAGE as the input message
- If input is in Spanish, respond in Spanish
- If input is in English, respond in English
- If input is in any other language, respond in that same language
- NEVER translate or change the language
- If the message is already positive, return it unchanged
- Only return the transformed message, nothing else

Examples:
Input (Spanish): "Esto es terrible"
Output (Spanish): "Esto no está funcionando como esperaba"

Input (English): "This is terrible" 
Output (English): "This isn't working as I expected"`
    },
    {
      role: 'user',
      content: `Transform this message: "${body.message}"`
    }
  ]

  try {
    const result = await ai.run(model, {
      input: messages
    })
    
    // Extract transformed text from OpenAI model response structure
    const transformedText = result.response || 
                          (result.output?.[1]?.content?.[0]?.text) || 
                          body.message
    
    return {
      original: body.message,
      transformed: transformedText
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
  