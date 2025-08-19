# AI Model Configuration

This project uses Cloudflare Workers AI for message transformation. You can easily change the AI model by setting environment variables.

**Both the REST API (`/api/text`) and WebSocket chat now use the same configurable AI model.**

## Available Models

### Meta Models
- `@cf/meta/llama-3.2-3b-instruct` (default) - Fast, efficient 3B parameter model
- `@cf/meta/llama-3.1-8b-instruct` - Balanced 8B parameter model
- `@cf/meta/llama-3.1-70b-instruct` - High-quality 70B parameter model (slower)

### Mistral Models
- `@cf/mistral/mistral-7b-instruct-v0.2`
- `@cf/mistral/mixtral-8x7b-instruct-v0.1`

### Other Providers
- `@cf/google/gemini-pro`
- `@cf/anthropic/claude-3-haiku`

## Configuration

### Option 1: Environment Variable (Recommended)
Create a `.env` file in your project root:
```bash
AI_MODEL=@cf/meta/llama-3.2-3b-instruct
```

### Option 2: System Environment Variable
Set the environment variable in your shell:
```bash
export AI_MODEL=@cf/meta/llama-3.1-70b-instruct
```

### Option 3: Direct in nuxt.config.ts
Modify the `nuxt.config.ts` file:
```typescript
runtimeConfig: {
  aiModel: '@cf/meta/llama-3.1-8b-instruct',
  // ... other config
}
```

## Current Configuration
The default model is set to `@cf/meta/llama-3.2-3b-instruct` in `nuxt.config.ts`.

## What Gets Updated
When you change the AI model, it will be used in:
- ✅ **REST API** (`/api/text`) - For individual message transformation
- ✅ **WebSocket Chat** - For real-time chat message transformation

## Notes
- No additional authentication is required for different models
- All models are accessed through your Cloudflare Workers AI service
- Model availability may vary by region and account type
- Larger models (70B) are more capable but slower
- Smaller models (3B) are faster but may have lower quality outputs

