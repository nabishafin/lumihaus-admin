# Lumihaus Admin

Admin console for the Lumihaus store. React Router (SPA mode, `ssr: false`),
Redux Toolkit Query, Tailwind CSS 4. Deployed on Vercel.

## Setup

```bash
npm install
```

Create `.env` with the API origin:

```
BASE_URL=https://your-api.example.com
```

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build into `build/client`

## Structure

```
src/
  root.jsx, routes.js     app shell and route table
  layouts/                dashboard layout (sidebar + outlet)
  pages/auth/             login, forgot/reset password, OTP
  pages/dashboard/        one file per dashboard route
  components/<feature>/   pieces used by a single page
  components/shared/      pieces used across pages
  context/                AdminUIContext
  redux/api/              baseApi + one RTK Query slice per resource
  redux/slices/           authSlice
  utils/                  formatting, export, toast helpers
```
