// server/api/ai-test.get.ts

export default defineEventHandler(async () => {
  const ai = hubAI()
  
  // 🔥 CHALLENGING TEST CASES
  const testCases = [
    {
      name: "Spanish negative opinion",
      input: "Odio el mar, es horrible y aburrido"
    },
    {
      name: "Spanish insult", 
      input: "Eres muy feo y estúpido"
    },
    {
      name: "English aggressive",
      input: "That's the dumbest idea I've ever heard in my life"
    },
    {
      name: "Mixed opinion",
      input: "I hate pizza but love pasta"
    },
    {
      name: "Already positive",
      input: "I think we could improve this approach"
    }
  ]

  const systemPrompt = `You are a communication assistant that helps people express themselves more constructively without changing their actual opinions.

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

  const results = []

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`)
      
      // 🔥 TEST CURRENT LLAMA MODEL
      const llamaResult = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt: `${systemPrompt}\n\nTransform this message: "${testCase.input}"`
      })

      // 🔥 TEST OPENAI-STYLE MODEL  
      const openaiResult = await ai.run('@cf/openai/gpt-oss-20b', {
        input: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Transform this message: "${testCase.input}"`
          }
        ]
      })

      results.push({
        testCase: testCase.name,
        original: testCase.input,
        llama_result: llamaResult.response || 'No response',
        openai_result: openaiResult.response || openaiResult || 'No response'
      })

    } catch (error) {
      console.error(`Error testing ${testCase.name}:`, error)
      results.push({
        testCase: testCase.name,
        original: testCase.input,
        llama_result: `Error: ${error.message}`,
        openai_result: `Error: ${error.message}`
      })
    }
  }

  // 🔥 RETURN COMPARISON TABLE
  return {
    success: true,
    timestamp: new Date().toISOString(),
    model_comparison: results,
    summary: {
      total_tests: testCases.length,
      llama_model: '@cf/meta/llama-3.1-8b-instruct',
      openai_model: '@cf/openai/gpt-oss-120b'
    }
  }
})