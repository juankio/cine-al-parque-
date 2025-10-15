# Cine al Parque — API (User)

Guía para **rutas de usuario** y públicas bajo `/api`.

> **Stack**: Nuxt 4 (Nitro), Node, MongoDB
>
> **Auth**: Cookie httpOnly con JWT (`session`) firmada con `AUTH_SECRET`.
>
> **TZ**: Timestamps en **UTC** (el front formatea a `America/Bogota`).

---

## Base

* **Base URL**: `/api`
* **Content-Type**: `application/json`
* **Roles**:

  * **Público**: sin cookie
  * **User**: cookie `session` válida (JWT `{ sub, email, isAdmin }`)

## Middlewares/guards

* `requireUser(event)` → valida cookie, setea `event.context.user`.
* `rateLimit(key, limit, windowMs)` (opcional) → login / pagos.

**Handler type (Nuxt/Nitro)**

```ts
// server/api/me/stats.get.ts
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return { ok: true, /* ... */ }
})
```

---

# 1) Public APIs

### `GET /api/health`

Ping de salud.

* **200** → `{ ok: true, time }`

### `GET /api/movies`

Cartelera activa.

* **Query**: `page`, `pageSize`, `q?`
* **200** → `{ items: Movie[], page, pageSize, total }`

### `GET /api/movies/:id`

Detalle de película.

* **404** si no existe.

### `GET /api/movies/:id/showtimes`

Funciones por película (fecha/hora, sala, precio).

### `GET /api/showtimes/:id/layout`

Layout y disponibilidad (reservado/ocupado).

* **200** → `{ showtime, layout: SeatBlock[], updatedAt }`

### `GET /api/menu-items`

Menú público (`activo: true`).

---

# 2) Auth APIs

### `POST /api/auth/register`

* **Body**: `{ name, email, password }`
* **201** → `{ ok: true, user: { id, email } }`

### `POST /api/auth/login`

* **Body**: `{ email, password }`
* **200** → set cookie `session`, `{ ok:true, user:{ id, email, isAdmin } }`

### `GET /api/auth/me`

* **200** → `{ authenticated:true, user:{ id, email, isAdmin, name } }`

### `POST /api/auth/logout`

* Limpia cookie. **200** → `{ ok:true }`

> **JWT payload**: `{ sub:<userId>, email, isAdmin, iat, exp }`

---

# 3) User APIs (requiere login)

## Perfil / Stats

### `GET /api/me/history`

Historial de reservas del usuario.

* **Query**: `page`, `pageSize`, `status` (`pending|paid|expired|canceled`), `from`, `to`, `upcoming` (`true|false`).
* **200** → `{ items: ReservationSnapshot[], page, pageSize, total }`

### `GET /api/me/stats`

Métricas (conteos por estado, gasto total, próximas funciones, última compra).

## Reservas & Pagos

### `POST /api/reservations`

Crea reserva `pending` (hold con TTL) o `paid` si `?mode=paid` (solo pruebas).

* **Body**: `{ showtimeId, seats: string[], items?: [{ menuItemId, qty }] }`
* **200** → `{ ok, reservation:{ id, total }, breakdown:{ seatsTotal, foodTotal }, expiresAt? }`
* **409** si algún asiento está tomado.
* **Notas**: TTL por `HOLDS_TTL_MIN`.

### `POST /api/payments/confirm`

Confirma pago (simulado), descuenta inventario, marca asientos `paid`.

* **Body**: `{ reservationId }`
* **200** → `{ ok:true, reservation:{ id, status:'paid' } }`
* **Idempotente** → `{ alreadyPaid:true }` si ya estaba pagada.

---

# 4) Contratos de respuesta

## Paginación

```json
{ "items": [], "page": 1, "pageSize": 20, "total": 0 }
```

## Reserva snapshot (`/me/history`)

```json
{
  "id": "res_abc123",
  "status": "pending",
  "seats": ["M1-A", "M1-B"],
  "showtime": { "id": "st_1", "fechaHora": "2025-10-21T00:30:00Z", "price": 12000, "sala": "Parque Central" },
  "movie": { "id": "m_1", "titulo": "Duna 2", "poster": "/img/duna2.jpg" },
  "cart": [{ "menuItemId": "pep", "nombre": "Pizza Pepperoni", "qty": 1, "precio": 20000 }],
  "total": 44000,
  "expiresAt": "2025-10-15T17:12:00Z"
}
```

## Layout de sillas

```json
{
  "showtime": { "id": "st_1" },
  "layout": [
    { "mesa": "M1", "cap": 4, "seats": [
      { "id": "M1-A", "state": "free" },
      { "id": "M1-B", "state": "pending" },
      { "id": "M1-C", "state": "paid" },
      { "id": "M1-D", "state": "free" }
    ]}
  ],
  "updatedAt": "2025-10-15T16:55:10Z"
}
```

---

# 5) Errores

* **400** Bad request
* **401** Unauthorized
* **404** Not found
* **409** Conflict (asiento/stock)
* **422** Unprocessable entity (validación)
* **429** Too many requests
* **500** Server error

**Formato**

```json
{ "ok": false, "code": "CONFLICT", "message": "Seat M1-B already taken" }
```

---

# 6) Flujos

## Reservation flow

```
GET  /movies
GET  /movies/:id/showtimes
GET  /showtimes/:id/layout
POST /reservations
POST /payments/confirm
GET  /me/history
```

## Auth flow

```
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/logout
```

---

# 7) Map de archivos (User/Public)

```
server/api/
  health.get.ts
  movies/index.get.ts
  movies/[id].get.ts
  movies/[id]/showtimes.get.ts
  showtimes/[id]/layout.get.ts
  menu-items/index.get.ts

  auth/register.post.ts
  auth/login.post.ts
  auth/me.get.ts
  auth/logout.post.ts

  me/history.get.ts
  me/stats.get.ts

  reservations/index.post.ts
  payments/confirm.post.ts
```

---

# 8) Env & Config

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
    HOLDS_TTL_MIN: process.env.HOLDS_TTL_MIN || 10
  }
})
```

---

# 9) Ejemplos (curl)

**Login**

```bash
curl -i -X POST /api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@mail.com","password":"123456"}'
```

**Crear reserva**

```bash
curl -X POST /api/reservations \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: abc-123' \
  -d '{"showtimeId":"st_1","seats":["M1-A","M1-B"],"items":[{"menuItemId":"pep","qty":1}]}'
```

**Confirmar pago**

```bash
curl -X POST /api/payments/confirm \
  -H 'Content-Type: application/json' \
  -d '{"reservationId":"res_abc123"}'
```
