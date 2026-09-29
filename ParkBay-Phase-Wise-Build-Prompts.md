# ParkBay — Phase-Wise Build Prompts (MERN Stack)

**Project:** Parking Slot Booking (Project #50, Intermediate, 17 APIs)
**Stack:** MongoDB + Express + React (Vite) + Node.js, JWT auth
**How to use this document:** Copy one phase's prompt at a time into your AI coding tool (Claude Code, Cursor, etc.). Do not skip ahead — each phase builds on the previous one's files. Verify the "Done when" checklist before moving to the next phase.

---

## Phase 0 — Project Scaffold

**Goal:** Create the repo skeleton and install dependencies. No logic yet.

**Prompt to give the AI:**
> Create a MERN project called `parking-slot-booking` with two folders: `server/` and `client/`.
>
> In `server/`, set up a Node.js + Express project with this folder layout: `models/`, `controllers/`, `routes/`, `middleware/`, `config/`. Install express, mongoose, bcryptjs, jsonwebtoken, dotenv, cors, and nodemon (dev). Add a `.env.example` with `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`. Create a minimal `server.js` that connects to MongoDB, applies `cors` and `express.json()`, and exposes `GET /api/health` returning `{ success: true }`.
>
> In `client/`, scaffold a React app with Vite, install react-router-dom, axios, and Tailwind CSS. Set up folders: `pages/`, `components/`, `services/`, `context/`. Confirm the dev server runs with a blank homepage.
>
> Do not add any models, routes, or auth logic yet — this phase is scaffolding only.

**Done when:**
- [ ] `npm run dev` in `server/` starts without errors and `GET /api/health` responds
- [ ] `npm run dev` in `client/` opens a blank Vite + React + Tailwind page
- [ ] Folder structure matches the layout above

---

## Phase 1 — Mongoose Models

**Goal:** Define the three data models with validation.

**Prompt to give the AI:**
> In `server/models/`, create three Mongoose models:
>
> 1. **User** — `name` (required), `email` (required, unique, lowercase), `password` (required, min 6 chars, `select: false`), `role` (enum `user`/`admin`, default `user`), timestamps. Add a `pre('save')` hook that hashes the password with bcrypt if modified, and a `comparePassword` instance method.
> 2. **ParkingSlot** — `slotNumber` (required, unique), `location` (required), `pricePerHour` (required, min 0), `isActive` (boolean, default true), `createdBy` (ref to User), timestamps.
> 3. **Booking** — `user` (ref User, required), `slot` (ref ParkingSlot, required), `startTime` (Date, required), `endTime` (Date, required), `status` (enum `pending`/`confirmed`/`completed`/`cancelled`, default `pending`), `totalFee` (number, default 0), timestamps. Add a `pre('validate')` hook that rejects the document if `endTime <= startTime`.
>
> Use clear validation error messages on every required field.

**Done when:**
- [ ] All three models import without errors
- [ ] Saving a User with a plaintext password results in a bcrypt hash in the DB
- [ ] Saving a Booking with `endTime` before `startTime` throws a validation error

---

## Phase 2 — Auth: Register, Login, JWT Middleware

**Goal:** Working register/login endpoints and reusable auth middleware.

**Prompt to give the AI:**
> Build the authentication system in `server/`:
>
> 1. `controllers/authController.js` with `register`, `login`, and `getMe`. `register` validates required fields, checks for a duplicate email, creates the user, and returns `{ token, user }` (no password field). `login` looks up the user by email with `.select('+password')`, compares the password with bcrypt, and returns `{ token, user }` on success or `401` on failure. `getMe` returns the logged-in user's own profile only.
> 2. `middleware/auth.js` exporting `protect` (verifies the `Authorization: Bearer <token>` header, decodes the JWT, loads `req.user`, returns `401` if missing/invalid) and `adminOnly` (returns `403` if `req.user.role !== 'admin'`).
> 3. `routes/authRoutes.js`: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (protected).
> 4. Mount the router at `/api/auth` in `server.js`.
>
> Use proper status codes throughout: `201` on register, `200` on login/me, `400` on bad input, `401` on auth failure.

**Done when:**
- [ ] `POST /api/auth/register` returns `201` with a token
- [ ] `POST /api/auth/login` with wrong password returns `401`
- [ ] `GET /api/auth/me` without a token returns `401`; with a valid token returns the user's own profile

---
https://cdn.dribbble.com/userupload/38155130/file/original-bfe9bee4f1d3c1b32210ccc7539aa5ad.png?resize=752x564&vertical=center
## Phase 3 — Parking Slot API (CRUD + Pagination)

**Goal:** Full CRUD for parking slots, admin-restricted writes, paginated reads.

**Prompt to give the AI:**
> Build the parking slot resource in `server/`:
>
> 1. `controllers/slotController.js` with `createSlot` (admin only), `getSlots` (public, paginated via `?page=&limit=`, optional `location` and `isActive` filters), `getSlotById` (public), `updateSlot` (admin only), `deleteSlot` (admin only).
> 2. `routes/slotRoutes.js`: `POST /api/slots` (protect + adminOnly), `GET /api/slots`, `GET /api/slots/:id`, `PUT /api/slots/:id` (protect + adminOnly), `DELETE /api/slots/:id` (protect + adminOnly). Mount at `/api/slots`.
>
> Pagination responses should include `{ success, count, total, page, pages, slots }`. Return `404` if a slot ID doesn't exist, `400` on missing required fields.

**Done when:**
- [ ] Creating a slot without an admin token returns `403`
- [ ] `GET /api/slots?page=1&limit=2` returns exactly 2 slots and correct `pages` count
- [ ] `PUT`/`DELETE` on a non-existent ID returns `404`

---

## Phase 4 — Booking API (Overlap Logic + Checkout + Stats)

**Goal:** The core feature of the app — time-based availability, booking CRUD, checkout, and occupancy stats.

**Prompt to give the AI:**
> Build the booking resource in `server/`. This is the most important phase — the overlap check must be correct.
>
> 1. In `controllers/bookingController.js`, add a helper `hasOverlap(slotId, startTime, endTime, excludeBookingId)` that returns true if any `pending`/`confirmed` booking on that slot satisfies `existing.startTime < requestedEnd AND existing.endTime > requestedStart` (excluding the booking being updated, if given).
> 2. `createBooking` — validates the slot exists and is active, checks `hasOverlap`, rejects with `400` on conflict, otherwise computes `totalFee = hours * slot.pricePerHour` and creates the booking with status `confirmed`.
> 3. `getBookings` (admin only, paginated, all users), `getMyBookings` (paginated, scoped to `req.user._id` only), `getBookingById` (owner or admin only — return `403` otherwise), `updateBooking` (owner or admin; if times change, re-run the overlap check excluding itself and recompute `totalFee`), `deleteBooking` (owner or admin).
> 4. `checkoutBooking` — `PATCH /api/bookings/:id/checkout`: recomputes the final fee based on actual elapsed time and sets `status: 'completed'`.
> 5. Add `getSlotStats` in the slot controller (or here) for `GET /api/slots/stats`: total slots, active slots, currently-occupied count, occupancy rate %, and top 5 most-booked slots (aggregation).
> 6. Add `getAvailableSlots` for `GET /api/slots/available?from=&to=`: returns all active slots with no overlapping booking in that window.
>
> Route order matters: register `/mine`, `/available`, and `/stats` **before** the `/:id` routes so they aren't swallowed by the dynamic param.

**Done when:**
- [ ] Booking a slot, then booking the same slot for an overlapping window, returns `400` on the second attempt
- [ ] A non-overlapping time on the same slot succeeds
- [ ] `GET /api/bookings/mine` never returns another user's bookings
- [ ] `GET /api/slots/available?from=...&to=...` excludes a slot with a conflicting booking
- [ ] `PATCH /api/bookings/:id/checkout` sets status to `completed` and a final `totalFee`

---

## Phase 5 — Postman Verification (before touching the UI)

**Goal:** Prove the backend is correct end to end before any frontend work starts.

**Prompt to give the AI:**
> Generate a Postman collection (JSON, importable) covering all 17 endpoints below, with example request bodies and a `{{baseUrl}}` variable set to `http://localhost:5000/api`. Chain the register/login response so the returned token is auto-saved to a `{{token}}` collection variable and used as `Authorization: Bearer {{token}}` on every other request. Include one request that intentionally creates an overlapping booking, to confirm it returns `400`.

**Manual checklist to run yourself:**
| Method | Endpoint | Expect |
|---|---|---|
| POST | /auth/register | 201 |
| POST | /auth/login | 200 |
| GET | /auth/me | 200 (with token) / 401 (without) |
| POST | /slots | 201 (admin) / 403 (non-admin) |
| GET | /slots | 200, paginated |
| GET | /slots/:id | 200 / 404 |
| PUT | /slots/:id | 200 (admin) |
| DELETE | /slots/:id | 200 (admin) |
| POST | /bookings | 201 / 400 on overlap |
| GET | /bookings | 200 (admin) |
| GET | /bookings/:id | 200 (owner/admin) / 403 (other user) |
| PUT | /bookings/:id | 200 |
| DELETE | /bookings/:id | 200 |
| GET | /slots/available?from=&to= | 200, excludes conflicting slots |
| PATCH | /bookings/:id/checkout | 200, status → completed |
| GET | /bookings/mine | 200, own bookings only |
| GET | /slots/stats | 200 |

**Done when:** every row above passes before you write a single line of frontend code.

---

## Phase 6 — Frontend Scaffold: Routing, Axios, Auth Context

**Goal:** App shell with routing and a working login/register flow, no styled pages yet.

**Prompt to give the AI:**
> In `client/src/`, build the app shell:
>
> 1. `services/api.js` — an Axios instance with `baseURL` from `VITE_API_URL`, a request interceptor that attaches `Authorization: Bearer <token>` from `localStorage`, and a response interceptor that clears the stored token on `401`.
> 2. `services/authService.js`, `services/slotService.js`, `services/bookingService.js` — thin wrapper functions for every backend endpoint from Phases 2–4.
> 3. `context/AuthContext.jsx` — a Context API provider exposing `user`, `loading`, `login()`, `register()`, `logout()`. On mount, if a token exists, call `GET /auth/me` to restore the session.
> 4. `components/PrivateRoute.jsx` — redirects to `/login` if not authenticated, and supports an `adminOnly` prop that redirects non-admins away.
> 5. `App.jsx` with `react-router-dom` routes for `/login`, `/register`, `/slots`, `/slots/:id`, `/my-bookings` (private), `/admin/slots` (private + admin).
>
> Keep pages as placeholder components for now — this phase is wiring only.

**Done when:**
- [ ] Navigating between routes works without a page reload
- [ ] Logging in stores a token and `AuthContext`'s `user` updates
- [ ] Refreshing the page keeps the user logged in (session restored from token)
- [ ] `/admin/slots` redirects away for a non-admin user

---

## Phase 7 — Auth Pages (Login & Register)

**Goal:** Real, validated login and register forms.
-in sta
**Prompt to give the AI:**
> Build `pages/Login.jsx` and `pages/Register.jsx`. Controlled form inputs, client-side required-field validation, a loading state on submit, and an inline error banner that shows the backend's error message on failure (e.g. wrong password, duplicate email). On success, redirect to `/slots`. Style with Tailwind — clean, minimal, consistent spacing. Link between the two pages ("No account? Sign up" / "Already registered? Log in").

**Done when:**
- [ ] Submitting invalid credentials shows the backend's error message without a page reload
- [ ] Successful login/register redirects to `/slots` and the navbar reflects the loggedte

---

## Phase 8 — Slot Browsing, Availability Search & Booking Flow

**Goal:** The core driver-facing experience.

**Prompt to give the AI:**
> Build `pages/Slots.jsx`: a paginated grid of parking slots (slot number, location, price/hour, active status). Add a "from / to" datetime picker that calls the `/slots/available` endpoint and swaps the grid to show only free slots for that window, with a "clear filter" option to go back to the full paginated list.
>
> Build `pages/SlotDetail.jsx`: shows the slot's details, a start/end time picker, a live-computed estimated fee (`hours * pricePerHour`), and a "Confirm booking" button that calls `POST /bookings`. If the user isn't logged in, the button redirects to `/login` instead. On success, show a confirmation with the booking's final fee and a link to "My bookings".

**Done when:**
- [ ] The availability filter correctly hides slots that are already booked for the chosen window
- [ ] Booking a slot that has just become unavailable (race condition) shows the backend's `400` error instead of crashing
- [ ] The estimated fee updates live as the user changes the time range

---

## Phase 9 — My Bookings & Admin Slot Management

**Goal:** Self-service booking management and an admin console.

**Prompt to give the AI:**
> Build `pages/MyBookings.jsx`: lists the logged-in user's bookings (via `/bookings/mine`) with status badges (pending/confirmed/completed/cancelled), a "Check out" button (calls the checkout endpoint) and a "Cancel" button (updates status to `cancelled`) — both only shown while the booking is still pending/confirmed.
>
> Build `pages/AdminSlots.jsx` (admin-only route): a stats summary (total slots, active slots, currently occupied, occupancy %) from `/slots/stats`, a form to create/edit a slot, and a table of all slots with edit/delete actions.

**Done when:**
- [ ] Cancelling a booking updates its status without a page reload
- [ ] Checking out a booking finalizes the fee and moves it to `completed`
- [ ] A non-admin cannot reach `/admin/slots` even by typing the URL directly

---

## Phase 10 — Deployment

**Goal:** Live, publicly reachable app on free-tier infrastructure.

**Prompt to give the AI:**
> Prepare this project for deployment:
>
> 1. Confirm `server/` reads `PORT` from `process.env` (Render assigns it dynamically) and that `cors` is configured to allow the deployed frontend's origin via `CLIENT_URL`.
> 2. Confirm `client/` reads the API base URL from `VITE_API_URL` with no hardcoded `localhost`.
> 3. Write a short deployment checklist: create a MongoDB Atlas free cluster and whitelist `0.0.0.0/0`; deploy `server/` to Render as a Web Service (`npm install` build command, `npm start` start command, env vars from `.env`); deploy `client/` to Vercel or Netlify with `VITE_API_URL` pointing at the live Render URL; update `CLIENT_URL` on Render to the live frontend URL once it's known.

**Done when:**
- [ ] The deployed frontend can register, log in, browse slots, and book successfully against the live API
- [ ] No `localhost` URLs remain in either deployed build

---

## Quick reference — all 17 endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login and receive JWT token |
| GET | /api/auth/me | Get logged in user profile |
| POST | /api/slots | Create a new parking slot |
| GET | /api/slots | List all slots (with pagination) |
| GET | /api/slots/:id | Get a single parking slot |
| PUT | /api/slots/:id | Update a parking slot |
| DELETE | /api/slots/:id | Delete a parking slot |
| POST | /api/bookings | Create a new booking |
| GET | /api/bookings | List all bookings (with pagination) |
| GET | /api/bookings/:id | Get a single booking |
| PUT | /api/bookings/:id | Update a booking |
| DELETE | /api/bookings/:id | Delete a booking |
| GET | /api/slots/available?from=&to= | Free slots for a time range |
| PATCH | /api/bookings/:id/checkout | Check out and calculate fee |
| GET | /api/bookings/mine | My bookings |
| GET | /api/slots/stats | Occupancy statistics |
