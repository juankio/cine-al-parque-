# API Routes & Flow

This file lists the backend routes under `/api` and the main user flows.

## Endpoints

### Public
- GET `/api/health`
- GET `/api/movies`
- GET `/api/movies/:id`
- GET `/api/movies/:id/showtimes`
- GET `/api/showtimes/:id/availability`

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET  `/api/auth/me`
- POST `/api/auth/logout`

### Account
- GET `/api/me/history`
- GET `/api/me/stats`

### Reservations & Payments
- POST `/api/reservations`
- POST `/api/payments/confirm`

### Admin
- Menu items
  - GET  `/api/admin/menu-items`
  - POST `/api/admin/menu-items`
  - GET  `/api/admin/menu-items/:id`
  - PATCH `/api/admin/menu-items/:id`
  - DELETE `/api/admin/menu-items/:id`
- Ingredients
  - GET  `/api/admin/ingredients`
  - POST `/api/admin/ingredients`
  - PATCH `/api/admin/ingredients/:id`
  - DELETE `/api/admin/ingredients/:id`
- Movies
  - GET  `/api/admin/movies`
  - POST `/api/admin/movies`
  - PATCH `/api/admin/movies/:id`
  - DELETE `/api/admin/movies/:id`
- Recipes
  - GET  `/api/admin/recipes`
  - POST `/api/admin/recipes`
  - PATCH `/api/admin/recipes/:id`
  - DELETE `/api/admin/recipes/:id`
- Showtimes
  - GET  `/api/admin/showtimes`
  - POST `/api/admin/showtimes`
  - PATCH `/api/admin/showtimes/:id`
  - DELETE `/api/admin/showtimes/:id`
  - POST `/api/admin/showtimes/:id/layout/generate`
- KPI
  - GET `/api/admin/kpi/overview`
  - GET `/api/admin/kpi/top-movies`
  - GET `/api/admin/kpi/top-menu`

## Key flows

### Reservation flow
1. List movies: GET `/api/movies`
2. List showtimes by movie: GET `/api/movies/:id/showtimes`
3. Check seat availability: GET `/api/showtimes/:id/availability`
4. Create reservation: POST `/api/reservations`
5. Confirm payment: POST `/api/payments/confirm`
6. Optional history lookup: GET `/api/me/history`

### Auth flow
1. Register: POST `/api/auth/register`
2. Login: POST `/api/auth/login`
3. Check session: GET `/api/auth/me`
4. Logout: POST `/api/auth/logout`

### Admin CRUD flow
1. List resources: GET `/api/admin/<resource>`
2. Create resource: POST `/api/admin/<resource>`
3. Update resource: PATCH `/api/admin/<resource>/:id`
4. Delete resource: DELETE `/api/admin/<resource>/:id`

## Notes
- Routes map directly to files under `server/api/**`. Update this doc whenever you add or rename handlers.
- For request schemas, response shapes, or auth rules, check the implementation in `server/api`.
