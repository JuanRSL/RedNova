# RedNova

RedNova es una API REST construida con Node.js, Express y MongoDB para manejar usuarios, publicaciones, comentarios, foros, subforos y reportes. Incluye autenticación JWT, roles de usuario (user, moderator, admin) y una interfaz de prueba simple.

## 💡 Características

- Registro e inicio de sesión de usuarios con JWT
- Perfil del usuario y edición de datos
- Seguir usuarios, foros y subforos
- Crear, listar y eliminar posts
- Votar publicaciones
- Crear, listar y eliminar comentarios
- Crear foros y subforos (roles moderador/admin)
- Sistema de reportes para moderadores
- CORS habilitado y archivo de prueba `redNovaTest.html`

## 🚀 Tecnologías

- Node.js
- Express
- MongoDB / Mongoose
- JWT (`jsonwebtoken`)
- Bcrypt (`bcrypt`, `bcryptjs`)
- dotenv
- nodemon (desarrollo)

## 🧱 Requisitos previos

- Node.js 18+ instalado
- MongoDB accesible (local o Atlas)

## ⚙️ Instalación

```bash
npm install
```

## 📁 Configuración de variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las variables necesarias:

```env
PORT=3000
MONGO_URI=<tu_mongodb_uri>
JWT_SECRET=<tu_secreto_jwt>
JWT_EXPIRES_IN=7d
```

El proyecto acepta también `URI` en lugar de `MONGO_URI`.

## ▶️ Ejecutar la aplicación

Modo producción:

```bash
npm start
```

Modo desarrollo:

```bash
npm run dev
```

Semilla de datos de ejemplo:

```bash
npm run seed
```

## 🌐 Rutas principales

La API expone su funcionalidad bajo el prefijo `/api`.

### Autenticación y usuarios

- `POST /api/usuarios/register`
  - Registra un usuario nuevo
  - Body: `{ username, email, password }`
- `POST /api/usuarios/login`
  - Inicia sesión y devuelve token JWT
  - Body: `{ email, password }`
- `GET /api/usuarios/me`
  - Obtiene perfil del usuario autenticado
- `PUT /api/usuarios/me`
  - Actualiza email/contraseña del usuario autenticado
- `POST /api/usuarios/users/:id/follow`
  - Seguir/dejar de seguir un usuario
- `POST /api/usuarios/subforums/:id/follow`
  - Seguir/dejar de seguir un subforo
- `POST /api/usuarios/forums/:id/follow`
  - Seguir/dejar de seguir un foro

### Posts

- `GET /api/posts`
  - Listar posts
  - Query opcional: `forumId`, `subforumId`, `search`
- `POST /api/posts`
  - Crear post (autenticado)
  - Body: `{ title, content, subforum, forum? }`
- `POST /api/posts/vote`
  - Votar un post (autenticado)
  - Body: `{ postId, voteType: 'up'|'down' }`
- `DELETE /api/posts/delete/:id`
  - Eliminar post propio o si tienes rol `moderator`/`admin`

### Comentarios

- `POST /api/comentarios`
  - Crear comentario (autenticado)
  - Body: `{ content, postId, parentComment? }`
- `GET /api/comentarios/post/:postId`
  - Obtener comentarios de un post
  - Query opcional: `page`, `limit`
- `DELETE /api/comentarios/:commentId`
  - Eliminar comentario propio o si tienes rol `moderator`/`admin`

### Foros

- `GET /api/forums`
  - Listar todos los foros
- `GET /api/forums/:id`
  - Obtener foro por ID
- `POST /api/forums`
  - Crear foro (requiere rol `admin`)
- `DELETE /api/forums/:id`
  - Eliminar foro y sus subforos (requiere rol `admin`)

### Subforos

- `GET /api/subforums`
  - Listar subforos
  - Query opcional: `forumId`
- `GET /api/subforums/:id`
  - Obtener subforo por ID
- `POST /api/subforums`
  - Crear subforo (autenticado)
  - Body: `{ name, slug, description, forum, isPrivate? }`
- `PUT /api/subforums/:id`
  - Actualizar subforo (rol `moderator` o `admin`)
- `DELETE /api/subforums/:id`
  - Eliminar subforo (rol `admin`)

### Reportes

- `POST /api/reports`
  - Crear reporte (autenticado)
  - Body: `{ contentId, contentType: 'Post'|'Comment', reason }`
- `GET /api/reports`
  - Listar reportes (rol `moderator` o `admin`)
  - Query opcional: `resolved=true|false`
- `PUT /api/reports/:id/resolve`
  - Marcar reporte como resuelto (rol `moderator` o `admin`)
- `DELETE /api/reports/:id`
  - Eliminar reporte (rol `moderator` o `admin`)

## 🔐 Autorización

Para las rutas protegidas envía el token en el header:

```http
Authorization: Bearer <token>
```

## 🧪 Probador local

Abre `http://localhost:3000/test` después de iniciar el servidor para visualizar el archivo `redNovaTest.html` y probar la API desde el mismo origen.

## 📌 Scripts disponibles

- `npm start` → inicia el servidor
- `npm run dev` → inicia con `nodemon`
- `npm run seed` → ejecuta `scripts/seedDemoData.js`

## 👥 Equipo

- JuanRSL: Juan Esteban Rodríguez
- damoelrrr: Daniel Felipe Rodríguez
- Lindaval23: Linda Valentina Quintero
