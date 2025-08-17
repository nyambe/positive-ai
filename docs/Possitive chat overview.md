## **Project Summary: Positive Chat App**

You're building a **real-time chat application** where AI automatically transforms potentially negative or confrontational messages into positive, constructive ones before other users see them.

### **How It Works:**
1. **Users join** with just a chosen name (no signup required)
2. **Everyone chats** in one shared room
3. **AI intercepts** each message and rewrites it to be positive while preserving the original meaning
4. **Other users see** only the AI-improved version, creating a conflict-free environment

### **Example:**
- **User types:** "You're wrong about this!"
- **AI transforms:** "I see this differently. Here's my perspective..."
- **Others receive:** The positive version only

### **Tech Stack:**
- **Nuxt Hub** for real-time WebSockets and built-in AI
- **Cloudflare Workers AI** for message transformation
- **localStorage** for simple name persistence
- **Single chat room** to keep it simple

### **Goal:**
Create an online space where people can express disagreement and strong opinions, but the AI ensures all communication feels constructive and respectful, reducing toxicity while maintaining authentic human interaction.

**Essentially: A chat app with an AI peacekeeping layer.**

https://hub.nuxt.com/docs/features/ai
https://hub.nuxt.com/docs/features/realtime
https://ui.nuxt.com/getting-started/migration

