<div align="center">
  <img src="public/favicon.ico" alt="Logo" width="80" height="80">
  <br>
  <h1>🎬 Cine al Parque</h1>
  <p><strong>Plataforma integral de cine al aire libre construida con Nuxt & Vue</strong></p>
  
  [![Nuxt](https://img.shields.io/badge/Nuxt_4-002E3B?style=for-the-badge&logo=nuxt.js&logoColor=00DC82)](https://nuxt.com/)
  [![Vue](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

  <p>Cartelera dinámica, selección interactiva de asientos, reservas en tiempo real y panel administrativo.</p>
  
  <br>
  <img src="public/preview.png" alt="Cine al Parque Preview" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
  <br>
</div>

<hr>

## ✨ Características Principales

- **🎥 Cartelera Dinámica:** Exploración de películas en cartelera con información detallada, trailers y funciones disponibles.
- **🪑 Selección de Asientos en Tiempo Real:** Interfaz interactiva para elegir asientos y mesas, con auto-refresh y control de concurrencia.
- **🎟️ Sistema de Reservas:** Flujo completo desde la selección del asiento hasta la confirmación de la reserva y escaneo de códigos QR.
- **🛠️ Panel Administrativo (Boss):** Interfaz segura para la gestión (CRUD) de películas, horarios, recetas, inventario, KPIs de ventas y menús.
- **🛡️ Autenticación y Seguridad:** Integración con Google OAuth2, JWT, y control estricto de roles y permisos (Cliente / Admin).
- **🌗 Interfaz Fluida (Nuxt UI v4):** Diseño elegante impulsado por Tailwind CSS con soporte nativo para Modo Oscuro/Claro y animaciones con Anime.js.

## 📦 Stack Tecnológico

El proyecto utiliza un stack moderno y fuertemente tipado:

- **Frontend:** Nuxt 4, Vue 3 (Composition API), Pinia (State Management).
- **UI & Estilos:** Nuxt UI v4, Tailwind CSS, Anime.js (Micro-interacciones).
- **Backend:** Nuxt Nitro / H3 (API RESTful integrada).
- **Base de Datos:** MongoDB + Mongoose (Modelado y validación de esquemas).
- **Herramientas:** TypeScript estricto, ESLint, Playwright (Testing).
- **Runtime & Gestor de Paquetes:** **Bun** (Exclusivo).

## 🚀 Guía de Inicio Rápido

> [!WARNING]
> Este proyecto utiliza **exclusivamente `bun`** como runtime y gestor de paquetes. El uso de `npm` o `yarn` está estrictamente prohibido en este repositorio.

### Prerrequisitos
- [Bun](https://bun.sh/) (v1.1+)
- Node.js (v20+)
- Instancia de MongoDB (Local o Atlas)

### Instalación

1. Clona el repositorio e instala las dependencias usando `bun`:
   ```bash
   git clone https://github.com/juankio/cine-al-parque.git
   cd cine-al-parque
   bun install
   ```

2. Configura las variables de entorno. Crea un archivo `.env` en la raíz:
   ```env
   MONGODB_URI=mongodb://localhost:27017/cine-al-parque
   AUTH_SECRET=tu_secreto_seguro_aqui
   NUXT_ADMIN_EMAILS=admin@cine.com
   GOOGLE_CLIENT_ID=tu_cliente_google_aqui
   ```

3. Levanta el entorno de desarrollo:
   ```bash
   bun run dev
   ```

El servidor estará disponible en `http://localhost:3000`.

## 🧪 Pruebas y Cuentas de Demostración

Si configuras el proyecto localmente, por defecto cualquier cuenta cuyo correo coincida con los declarados en `NUXT_ADMIN_EMAILS` dentro de tu archivo `.env` será tratada como administrador.

- Puedes registrarte con cualquier cuenta (ej. `admin@cine.com`) y, si coincide con el `.env`, el sistema le asignará permisos administrativos automáticamente.
- El panel administrativo se encuentra en la ruta `/admin`.

## 📁 Estructura del Proyecto

```text
cine-al-parque/
├── components/       # Componentes Vue atómicos y fragmentados (UI, Boss, Public)
├── composables/      # Lógica de negocio reutilizable (useAuth, useShowtimes, etc)
├── layouts/          # Marcos de página (Default y Admin)
├── middleware/       # Guardias de rutas (Autenticación y Roles)
├── pages/            # Vistas y enrutamiento automático de Nuxt
├── server/
│   ├── api/          # Endpoints backend (Nitro)
│   ├── models/       # Esquemas de Mongoose (Movie, Reservation, Showtime)
│   └── plugins/      # Conexiones a DB e índices
├── public/           # Assets estáticos y logos
└── nuxt.config.ts    # Configuración maestra del framework
```

## 📜 Comandos Disponibles (Scripts)

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Inicia el servidor de desarrollo en `localhost:3000`. |
| `bun run build` | Compila la aplicación para producción. |
| `bun run preview` | Previsualiza el build de producción localmente. |
| `bun run lint` | Ejecuta ESLint para analizar y reportar problemas de código. |
| `bunx nuxi typecheck` | Ejecuta la verificación de tipos de TypeScript. |

## 👨‍💻 Autor

**Juan Miguel Ruiz** (@juankio)
- 📍 Villavicencio, Meta — Colombia
- 📧 juanmiguelruizsupe@gmail.com
- 🐙 [GitHub: juankio](https://github.com/juankio)

<hr>

<p align="center">
  <i>"Un parque, una pantalla, una experiencia compartida. 🎬✨"</i>
</p>