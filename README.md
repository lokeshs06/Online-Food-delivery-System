# OFDS Monorepo

This repository contains an Online Food Delivery System with a `front-end` React/Vite app and a `back-end` Express/MongoDB API.

## Repository structure

- `back-end/`: Express API server
- `front-end/`: React application built with Vite

## Local development

### Backend

```bash
cd back-end
npm install
npm run dev
```

### Frontend

```bash
cd front-end
npm install
npm run dev
```

## Demo Credentials

You can use the following credentials to test the application if you have seeded the database (`node back-end/seeds/seeder.js`):

**Admin**
- Email: `admin@gmail.com`
- Password: `password123`

**Restaurant Owner**
- Email: `owner1@gmail.com` (or `owner2@gmail.com`, `owner3@gmail.com`)
- Password: `password123`

**Customer**
- Email: `customer1@gmail.com` (up to `customer5@gmail.com`)
- Password: `password123`

## Environment variables

### Backend

Create `back-end/.env` with:

```env
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<secure-jwt-secret>
```

### Frontend

Create `front-end/.env` with:

```env
VITE_API_BASE_URL=https://<your-backend-host>/api
```

## Deployment

### GitHub

1. Initialize the repository locally:

```bash
cd c:\ofds
git init
git add .
git commit -m "Initial commit"
```

2. Create a GitHub repository and add the remote:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### Netlify (frontend)

- Connect the GitHub repository to Netlify.
- Build command: `cd front-end && npm install && npm run build`
- Publish directory: `front-end/dist`
- Set environment variable: `VITE_API_BASE_URL=https://<your-backend-host>/api`

### Render (backend)

- Connect the GitHub repository to Render.
- Set the root directory to `back-end`.
- Build command: `npm install`
- Start command: `node server.js`
- Set environment variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `PORT` (optional)

## Notes

- Do not commit `back-end/.env` or `front-end/.env`.
- Use MongoDB Atlas for production database connectivity.
- Make sure `VITE_API_BASE_URL` points to your deployed backend API URL.
