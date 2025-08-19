# Chat Positivo 🌟

Una aplicación de chat en tiempo real que transforma automáticamente los mensajes negativos en comunicación más positiva y constructiva usando Inteligencia Artificial.

## 🚀 Demo en Vivo

**👉 [Prueba Chat Positivo ahora](https://chato.samuel-ebuka.workers.dev/)**

¡Experimenta la transformación de mensajes en tiempo real! Abre el enlace, elige un nombre de usuario y comienza a chatear. Prueba escribir mensajes negativos y observa cómo la IA los transforma automáticamente en comunicación más positiva.

## 🎯 ¿Qué es Chat Positivo?

Chat Positivo es una plataforma de chat web que utiliza IA para mejorar la comunicación en línea. Cuando alguien escribe un mensaje con tono negativo o agresivo, la aplicación automáticamente lo transforma en una versión más constructiva y respetuosa, manteniendo el significado original pero mejorando la forma de expresarlo.

## ✨ Características

### 🤖 **Transformación con IA**
- Transforma mensajes negativos en positivos automáticamente
- Mantiene el idioma original (español, inglés, etc.)
- Preserva el significado e intención del mensaje
- Muestra tanto el mensaje original como el transformado

### 💬 **Chat en Tiempo Real**
- WebSocket para comunicación instantánea
- Lista de usuarios conectados en tiempo real
- Indicador visual cuando la IA está procesando
- Burbujas de chat diferenciadas (propias vs otros usuarios)

### 🔧 **Tecnología Moderna**
- **Frontend**: Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS
- **Backend**: Cloudflare Workers + WebSockets
- **IA**: Cloudflare Workers AI (modelos configurables)
- **Despliegue**: Edge computing en 275+ ubicaciones

### 🌍 **Configuración Flexible**
- Modelos de IA intercambiables (Llama, GPT, etc.)
- Configuración vía variables de entorno
- Sin base de datos (privacidad total)
- Mensajes no se guardan

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- pnpm (recomendado)
- Cuenta de Cloudflare (para IA)

### 1. Clonar e Instalar
```bash
git clone <tu-repo>
cd chato
pnpm install
```

### 2. Configuración de IA
Crea un archivo `.env` en la raíz del proyecto:

```bash
# Modelo de IA (opcional, por defecto: llama-3.2-3b-instruct)
AI_MODEL=@cf/meta/llama-3.2-3b-instruct

# Otros modelos disponibles:
# AI_MODEL=@cf/meta/llama-3.1-8b-instruct
# AI_MODEL=@cf/meta/llama-3.1-70b-instruct
# AI_MODEL=@cf/mistral/mistral-7b-instruct-v0.2
```

Ver `AI_CONFIG.md` para más opciones de configuración.

### 3. Desarrollo
```bash
# Iniciar servidor de desarrollo
pnpm dev

# Abrir http://localhost:3000
```

### 4. Construcción
```bash
# Construir para producción
pnpm build

# Vista previa local
pnpm preview
```

## 🌐 Despliegue

### Cloudflare Pages (Recomendado)
```bash
# Desplegar en Cloudflare
npx nuxthub deploy

# Ver logs y analytics en NuxtHub Admin
```

### Otras Plataformas
La aplicación es compatible con cualquier plataforma que soporte Nuxt 3:
- Vercel
- Netlify  
- DigitalOcean
- AWS

## 🤝 ¿Por qué Chat Positivo?

### **Problema que Resuelve**
- **Toxicidad online**: Los chats pueden volverse negativos rápidamente
- **Malentendidos**: El texto puede sonar más agresivo de lo que se pretende
- **Barreras de comunicación**: No todos sabemos expresarnos de forma constructiva

### **Nuestra Solución**
- **Transformación automática**: Convierte frustración en comunicación constructiva
- **Educación implícita**: Los usuarios aprenden mejores formas de expresarse
- **Ambiente positivo**: Fomenta conversaciones más respetuosas
- **Privacidad total**: No se guardan mensajes ni datos personales

### **Casos de Uso**
- **Equipos de trabajo**: Mejorar comunicación en Slack/Teams
- **Comunidades online**: Foros más constructivos
- **Educación**: Enseñar comunicación respetuosa
- **Soporte al cliente**: Transformar quejas en feedback constructivo

## 🛠️ Cómo Contribuir

¡Nos encanta recibir contribuciones! Aquí te explicamos cómo:

### **Tipos de Contribuciones Buscadas**

#### 🐛 **Reportar Bugs**
- Usa el [sistema de issues](../../issues)
- Incluye pasos para reproducir
- Especifica navegador y sistema operativo
- Adjunta capturas de pantalla si es relevante

#### 💡 **Nuevas Funcionalidades**
- **Mejoras de IA**: Prompts más efectivos, nuevos modelos
- **UI/UX**: Mejores interfaces, animaciones, accesibilidad
- **Idiomas**: Soporte para más idiomas
- **Moderación**: Filtros de contenido, reportes
- **Integraciones**: Slack, Discord, Telegram bots

#### 📝 **Documentación**
- Traducir documentación
- Tutoriales y guías
- Ejemplos de uso
- Videos explicativos

### **Proceso de Contribución**

1. **Fork** el repositorio
2. **Crea una rama** para tu funcionalidad:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
3. **Desarrolla y prueba** tus cambios
4. **Commit** con mensajes descriptivos:
   ```bash
   git commit -m "feat: agregar soporte para emojis en transformaciones"
   ```
5. **Push** a tu fork:
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```
6. **Crea un Pull Request** con descripción detallada

### **Estándares de Código**

- **TypeScript**: Código tipado y limpio
- **ESLint**: Seguir las reglas configuradas
- **Commits**: Usar [Conventional Commits](https://conventionalcommits.org/)
- **Testing**: Incluir pruebas para nuevas funcionalidades
- **Documentación**: Actualizar docs relevantes

### **Ideas para Contribuir**

#### 🚀 **Funcionalidades Prioritarias**
- [ ] Salas/canales múltiples
- [ ] Reacciones a mensajes
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Historial de chat (opcional)

#### 🤖 **Mejoras de IA**
- [ ] Detección de contexto emocional
- [ ] Sugerencias de respuesta
- [ ] Análisis de sentimientos
- [ ] Personalización de transformaciones

#### 🌍 **Internacionalización**
- [ ] Interfaz en múltiples idiomas
- [ ] Transformaciones específicas por cultura
- [ ] Detección automática de idioma

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 💬 Comunidad y Soporte

- **Issues**: [GitHub Issues](../../issues)
- **Discusiones**: [GitHub Discussions](../../discussions)
- **Email**: [tu-email@ejemplo.com]

## 🙏 Reconocimientos

- **Nuxt 3**: Framework web increíble
- **Cloudflare**: IA y infraestructura edge
- **Comunidad open source**: Por inspiración y feedback

---

### 🌟 ¡Ayúdanos a hacer internet un lugar más positivo!

Si te gusta el proyecto, no olvides darle una ⭐ en GitHub y compartirlo con otros desarrolladores.

