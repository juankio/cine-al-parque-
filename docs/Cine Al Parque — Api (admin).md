# Cine al Parque — API (Admin)

Rutas **administrativas** bajo `/api/admin` + KPIs. Requieren `isAdmin: true` en el JWT de la cookie `session`.

> **Stack**: Nuxt 4 (Nitro), Node, MongoDB
>
> **Auth**: Cookie httpOnly `session` → JWT `{ sub, email, isAdmin }` firmado con `AUTH_SECRET`.
>
> **TZ**: Timestamps en **UTC**.

---

## Base

* **Base URL**: `/api/admin`
* **Content-Type**: `application/json`
* **Guard**: `requireAdmin(event)` (valida cookie y `user.isAdmin === true`).
* **Paginación estándar**: `page` (1..N), `pageSize` (1..100)
* **Respuesta paginada**: `{ items, page, pageSize, total }`
* **Headers recomendados**: `Idempotency-Key`, `X-Request-Id`

## Códigos de error

* **401** No autenticado
* **403** No autorizado (no admin)
* **404** No encontrado
* **409** Conflicto (p.ej., nombre duplicado, seat collision indirecta)
* **422** Validación
* **500** Error servidor

---

# 1) Menu Items

* `GET    /api/admin/menu-items`
* `POST   /api/admin/menu-items`

  * **Body**: `{ nombre, precio, activo, recetaId? }`
* `GET    /api/admin/menu-items/:id`
* `PATCH  /api/admin/menu-items/:id`
* `DELETE /api/admin/menu-items/:id`

**Notas**

* Si `recetaId` está presente, el revenue de comida puede calcular COGS.
* Auditar `createdBy`, `updatedBy` con `event.context.user.sub`.

---

# 2) Ingredients

* `GET    /api/admin/ingredients`
* `POST   /api/admin/ingredients`

  * **Body**: `{ nombre, unidad, stock, minStock }`
* `PATCH  /api/admin/ingredients/:id`
* `DELETE /api/admin/ingredients/:id`

**Notas**

* Índices recomendados: `{ nombre: 1 }` único.
* Posible alerta por `stock <= minStock` en dashboard (fuera de API).

---

# 3) Recipes

* `GET    /api/admin/recipes`
* `POST   /api/admin/recipes`

  * **Body**: `{ nombre, items:[{ ingredientId, qty }] }`
* `PATCH  /api/admin/recipes/:id`
* `DELETE /api/admin/recipes/:id`

**Notas**

* Validar que `ingredientId` exista y que `qty > 0`.

---

# 4) Movies

* `GET    /api/admin/movies`
* `POST   /api/admin/movies`
* `PATCH  /api/admin/movies/:id`
* `DELETE /api/admin/movies/:id`

**Notas**

* Campos sugeridos: `{ titulo, sinopsis, duracionMin, poster, activa }`.

---

# 5) Showtimes

* `GET    /api/admin/showtimes`
* `POST   /api/admin/showtimes`
* `PATCH  /api/admin/showtimes/:id`
* `DELETE /api/admin/showtimes/:id`
* `POST   /api/admin/showtimes/:id/layout/generate` → Genera o regenera layout.

  * **Query**: `replace=true|false` (default `false`)
  * **Body opcional**: `{ preset: 'tables-2-4'|'custom', capRow?, capTable? }`

**Notas**

* Lock por `showtimeId` al generar/regen.
* Layout respeta sillas existentes salvo `replace=true`.

---

# 6) KPI & Analytics

* `GET /api/admin/kpi/overview`

  * **200** → `{ revenue:{ tickets, food, total }, cogs, margin, avgTicket, visits }`
* `GET /api/admin/kpi/top-movies`

  * **200** → `{ byTickets:[{ movieId, titulo, qty }], byRevenue:[{ movieId, titulo, revenue }] }`
* `GET /api/admin/kpi/top-menu`

  * **200** → `{ byQty:[{ menuItemId, nombre, qty }], byRevenue:[{ menuItemId, nombre, revenue }] }`

**Notas**

* Los KPIs consideran `reservations.status === 'paid'` dentro de rango de fechas.
* Parametriza `from`, `to` (ISO) si necesitas cortes de periodo.

---

# 7) Map de archivos (Admin)

```
server/api/admin/
  menu-items/index.get.ts
  menu-items/index.post.ts
  menu-items/[id].get.ts
  menu-items/[id].patch.ts
  menu-items/[id].delete.ts

  ingredients/index.get.ts
  ingredients/index.post.ts
  ingredients/[id].patch.ts
  ingredients/[id].delete.ts

  recipes/index.get.ts
  recipes/index.post.ts
  recipes/[id].patch.ts
  recipes/[id].delete.ts

  movies/index.get.ts
  movies/index.post.ts
  movies/[id].patch.ts
  movies/[id].delete.ts

  showtimes/index.get.ts
  showtimes/index.post.ts
  showtimes/[id].patch.ts
  showtimes/[id].delete.ts
  showtimes/[id]/layout/generate.post.ts

  kpi/overview.get.ts
  kpi/top-movies.get.ts
  kpi/top-menu.get.ts
```

---

# 8) Esquemas & validación (tip hints)

* Usa Zod/Yup para bodies y query params.
* Respuestas siempre `{ ok: true, ... }` o `{ ok: false, code, message }`.
* Versiona cambios de contrato vía encabezado `X-Api-Version` o subpath (`/v1`).

---

# 9) Observabilidad & seguridad

* `X-Request-Id` en logs + duración.
* Rate limit para `POST` sensibles (layout generate, creación masiva).
* Audit fields: `createdBy`, `updatedBy`.
* Indices Mongo relevantes:

  * `reservations: { showtimeId:1, status:1 }`
  * `seats: { showtimeId:1, id:1 } (unique)`
  * `menuItems: { activo:1 }`
  * `ingredients: { nombre:1 }` (unique)

---

# 10) Ejemplos (curl)

**Crear menu item**

```bash
curl -X POST /api/admin/menu-items \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Pizza Pepperoni","precio":20000,"activo":true}'
```

**Generar layout**

```bash
curl -X POST \
  "/api/admin/showtimes/st_1/layout/generate?replace=true" \
  -H 'Idempotency-Key: gen-001'
```
