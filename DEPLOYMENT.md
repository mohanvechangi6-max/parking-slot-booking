# ParkBay Deployment Checklist

## 1. MongoDB Atlas

1. Create a free MongoDB Atlas cluster.
2. Create a database user and copy the connection string.
3. In **Network Access**, add `0.0.0.0/0` so the Render service can connect.
4. Use the connection string as `MONGO_URI` on Render, replacing its database name with `parking-slot-booking` if needed.

## 2. Deploy the server to Render

Create a **Web Service** connected to this repository:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`

Set these Render environment variables:

- `PORT`: leave unset so Render can assign it dynamically
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: long random production secret
- `JWT_EXPIRES_IN`: `7d`
- `CLIENT_URL`: the deployed frontend URL, such as `https://your-app.vercel.app`

After deployment, verify:

```text
https://your-api.onrender.com/api/health
```

It should return `{ "success": true }`.

## 3. Deploy the client to Vercel or Netlify

Create a project from the same repository:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Set this frontend environment variable before building:

- `VITE_API_URL`: `https://your-api.onrender.com/api`

The client reads its API URL only from `VITE_API_URL`; no localhost URL is bundled into the production build.

## 4. Connect and verify

1. Copy the final Vercel/Netlify URL into Render's `CLIENT_URL`.
2. Redeploy the Render service after changing `CLIENT_URL`.
3. From the deployed frontend, verify registration, login, slot browsing, availability search, booking, checkout, and admin slot management.
4. Confirm the browser network requests use the Render API URL and do not report CORS errors.
5. Keep `.env` files out of source control. Commit only `.env.example` templates.
