# ██████╗  ███╗   ██╗ ███████╗     🎬  CINE AL PARQUE
# ██╔══██╗ ████╗  ██║ ██╔════╝     Plataforma Nuxt 3 para cine al aire libre
# ██████╔╝ ██╔██╗ ██║ █████╗       Cartelera, funciones, reservas y asientos
# ██╔══██╗ ██║╚██╗██║ ██╔══╝
# ██║  ██║ ██║ ╚████║ ███████╗     by @juankio
# ╚═╝  ╚═╝ ╚═╝  ╚═══╝ ╚══════╝

[![Nuxt 3](https://img.shields.io/badge/Nuxt%203-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Nuxt UI](https://img.shields.io/badge/Nuxt%20UI-18181B?logo=nuxt.js&logoColor=white)](https://ui.nuxt.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

──────────────────────────────────────────────────────────────────────────────
🔎 DESCRIPCIÓN
Cine al Parque es una plataforma web hecha con Nuxt 3 para gestionar funciones
de cine al aire libre: cartelera, horarios, selección de asientos en tiempo
real, reservas y panel administrativo.

🧠 Autor: Juan Miguel Ruiz  (@juankio)
💻 Stack: Nuxt 3, Nuxt UI, TailwindCSS, Pinia (JS), Node.js, MongoDB, fetch, localStorage
──────────────────────────────────────────────────────────────────────────────

🚀 CARACTERÍSTICAS CLAVE
• 🎥 Cartelera dinámica: películas activas con info y horarios
• 🪑 Asientos en tiempo real: selección interactiva y auto-refresh
• 🎫 Reservas por función: el usuario elige y guarda su asiento
• 🧾 Panel admin: CRUD de películas, funciones, (ingredientes/recetas si aplica)
• 🌙 Modo oscuro/claro con @nuxt/ui + @nuxt/color-mode
• ☁️ Integración Google Drive API (archivos y carpetas)
• 🔔 Notificaciones con toast.add()
• 📱 PWA lista para instalar

──────────────────────────────────────────────────────────────────────────────
📁 ESTRUCTURA DEL PROYECTO

cine-al-parque/
├── 📁 components/        # UI y componentes admin reutilizables
├── 🧩 composables/       # Lógica reactiva/estados compartidos
├── 📄 pages/             # Rutas y vistas
├── ⚙️ server/api/        # Endpoints (Node.js + MongoDB)
├── 🎨 assets/            # Estilos globales / fuentes
├── 🧾 docs/              # Documentación (API, flujos, etc.)
├── 🌍 public/            # Íconos / favicons / imágenes estáticas
└── 🧠 nuxt.config.ts     # Configuración principal Nuxt

──────────────────────────────────────────────────────────────────────────────
⚙️ INSTALACIÓN

# Gestor recomendado
pnpm install

# Alternativa (si alguien necesita)
# npm install

──────────────────────────────────────────────────────────────────────────────
💡 DESARROLLO

# Inicia el servidor en http://localhost:3000
pnpm dev

──────────────────────────────────────────────────────────────────────────────
🏗️ PRODUCCIÓN

# Compila el proyecto
pnpm build

# Previsualiza el build de producción
pnpm preview

──────────────────────────────────────────────────────────────────────────────
🌐 DESPLIEGUE

# Guía oficial de Nuxt para deploy (Vercel/Netlify/Node/Static/etc.)
# https://nuxt.com/docs/getting-started/deployment

──────────────────────────────────────────────────────────────────────────────
🧭 COMANDOS ÚTILES (CHEATSHEET)

# Linter/format (si está configurado en el repo)
# pnpm lint
# pnpm format

# Análisis de dependencias (opcional)
# pnpm dlx depcheck

──────────────────────────────────────────────────────────────────────────────
🧩 ROADMAP (PRÓXIMOS PASOS)

[ ] 📅 Vista calendario de funciones (estilo Google Calendar)
[ ] 👥 Login con Google OAuth2 (roles y permisos)
[ ] 💬 Comentarios por archivo (solo el autor puede eliminar)
[ ] 🎨 Personalización de carpetas (color/desc por defecto: #FFD700)
[ ] 🧪 Tests básicos de componentes y páginas

──────────────────────────────────────────────────────────────────────────────
👤 DESARROLLADOR

Nombre: Juan Miguel Ruiz 
Email : juanmiguelruizsupe@gmail.com
Ciudad: Villavicencio, Meta — Colombia
GitHub: https://github.com/juankio

──────────────────────────────────────────────────────────────────────────────
🖤 CRÉDITOS

Framework : Nuxt 3
UI       : Nuxt UI + TailwindCSS
DB       : MongoDB
Runtime  : Node.js
Store    : Pinia (JS)
HTTP     : fetch (sin Axios)
Storage  : localStorage
Licencia : MIT

──────────────────────────────────────────────────────────────────────────────
💬 LEMA

"Un parque, una pantalla, una experiencia compartida. 🎬✨"
