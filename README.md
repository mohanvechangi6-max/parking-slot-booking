# ParkBay

ParkBay is a MERN stack parking slot booking application that allows users to register, log in, search available parking slots by date and time, book a slot, and manage their bookings. Admin users can manage parking slots and review booking statistics.

## Project Purpose

- Register a new user
- Login and receive JWT token
- Get logged in user profile
- Create a new parking slot
- List all slots (with pagination)
- Get a single parking slot
- Update a parking slot
- Delete a parking slot
- Create a new booking
- List all bookings (with pagination)
- Get a single booking
- Update a booking
- Delete a booking
- Free slots for a time range
- Check out and calculate fee
- My bookings
- Occupancy statistics

## Features

- User registration and login with JWT-based authentication
- Protected routes for authenticated users
- Admin-only slot creation, update, and deletion
- Search available slots by time range
- Booking creation with overlap prevention
- Booking update and deletion by owner/admin
- Checkout flow with fee calculation
- User booking history
- Parking slot occupancy statistics
- Responsive React frontend with Vite

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcryptjs

## Default Admin Account

- Email: admin@parkbay.com
- Password: admin123

## Project Structure

- client/ - React frontend
- server/ - Express API server
- postman/ - Postman collection and environment files

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login and receive JWT token |
| GET | /api/auth/me | Get logged-in user profile |
| POST | /api/slots | Create a new parking slot |
| GET | /api/slots | List all slots (with pagination) |
| GET | /api/slots/:id | Get a single parking slot |
| PUT | /api/slots/:id | Update a parking slot |
| DELETE | /api/slots/:id | Delete a parking slot |
| POST | /api/bookings | Create a new booking |
| GET | /api/bookings | List all bookings (admin only) |
| GET | /api/bookings/:id | Get a single booking |
| PUT | /api/bookings/:id | Update a booking |
| DELETE | /api/bookings/:id | Delete a booking |
| GET | /api/slots/available?from=&to= | Free slots for a time range |
| PATCH | /api/bookings/:id/checkout | Check out and calculate fee |
| GET | /api/bookings/mine | Get logged-in user's bookings |
| GET | /api/slots/stats | Get occupancy statistics |

## Core Business Rules

- JWT token is required for protected routes.
- Admin users can create, update, and delete parking slots.
- Booking overlap is rejected with a 400 error.
- A booking cannot be made for an inactive slot.
- Time range validation ensures end time is always after start time.
- Booking totals are calculated based on duration and slot price.
- `GET /api/slots/available` only returns active slots that are not already booked during the selected window.

## Local Development

### Start backend

```bash
cd server
npm install
npm run dev
```

### Start frontend

```bash
cd client
npm install
npm run dev -- --host 127.0.0.1
```

### Health check

- Backend: http://localhost:5000/api/health
- Frontend: http://127.0.0.1:5173

## Notes

- The backend connects to MongoDB using the `MONGO_URI` value in `server/.env`.
- The frontend uses `VITE_API_URL` in `client/.env` to reach the backend.
- A local MongoDB Compass or MongoDB server is required for full app functionality.
