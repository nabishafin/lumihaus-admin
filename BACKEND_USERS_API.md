# Backend task: Users & Admin role management API

Implement the endpoints behind the admin console's new **Users & Admins** page.
The frontend is already written and calls these exact routes — match the shapes
below rather than inventing new ones.

## Context

- Stack: Express + MongoDB (Mongoose), JWT bearer auth.
- All admin routes live under `/api/admin/*` and already sit behind an
  authenticate + role-check middleware (see the existing `/admin/orders`,
  `/admin/products`, `/admin/expenses` routes and copy that pattern).
- Users are a single collection. `role` distinguishes storefront customers from
  console staff. Existing values: `customer`, `admin`, `super_admin`.
- The storefront and the console share this collection: `/auth/register` and
  `/auth/login` serve customers, `/auth/admin-login` serves staff.

Frontend files that consume this (read them if a shape is ambiguous):
`src/redux/features/userApi.js`, `src/pages/dashboard/Users.jsx`,
`src/components/users/UserTable.jsx`.

## 1. Schema

On the User model, make sure these exist:

| Field | Type | Notes |
|---|---|---|
| `name` | String, required, trimmed | |
| `email` | String, required, unique, lowercased, trimmed | |
| `phone` | String, optional | |
| `avatar` | String, optional | may be a data URI |
| `password` | String, required, `select: false` | bcrypt hashed |
| `role` | String, enum `["customer","admin","super_admin"]`, default `"customer"` | |
| `isBlocked` | Boolean, default `false` | |
| `createdAt` / `updatedAt` | timestamps | |

**Security fix while you are here:** `/auth/register` must ignore any `role` or
`isBlocked` field in the request body and always create `role: "customer"`.
Right now a self-registering customer could otherwise POST `role: "super_admin"`
and take over the console. Whitelist the fields explicitly — do not pass
`req.body` into `User.create()`.

**Blocked users must be rejected**, not just hidden: return `403` from both login
routes and from the authenticate middleware when `isBlocked === true`, with
message `"This account has been blocked. Contact support."`

## 2. Authorisation rules

| Route | Who may call it |
|---|---|
| `GET /admin/users` | `admin`, `super_admin` |
| `GET /admin/users/:id` | `admin`, `super_admin` |
| `POST /admin/users` | `super_admin` only |
| `PATCH /admin/users/:id/role` | `super_admin` only |
| `PATCH /admin/users/:id/status` | `admin` may block customers; only `super_admin` may block staff |
| `DELETE /admin/users/:id` | `super_admin` only |

Enforce these **server-side**. The console hides the buttons, but that is a
convenience, not a control.

Additional guards — return the status shown, with a human-readable `message`:

1. **No self-modification.** Changing your own role or deleting your own account
   → `400`, `"You cannot change your own role."` / `"You cannot delete your own account."`
2. **Never strand the console.** Demoting or deleting the *last* remaining
   `super_admin` → `409`, `"At least one super admin must remain."`
   (Count `super_admin` users excluding the target before allowing it.)
3. **Password is never returned** by any of these endpoints.

## 3. Endpoints

Use the project's existing envelope: `{ success, message, data }`.

### `GET /admin/users`

Query params (all optional): `page` (default 1), `limit` (default 10, **cap at
100**), `search`, `role`, `sort`.

- `search` matches `name`, `email` or `phone`, case-insensitive, partial.
- `role` is one of `customer` / `admin` / `super_admin`. The value `All` or an
  absent param means no filter.
- `sort`: `newest` (default) or `oldest` by `createdAt`.

`ordersCount` and `totalSpent` come from the Orders collection: count of that
user's orders with `status !== "Cancelled"`, and the sum of their `total`.
Use a single `$lookup` aggregation — do not N+1 per user. For staff rows the
console displays `—` regardless, so `0` is fine there.

`roleCounts` is over the **whole collection**, ignoring `search`/`role`/paging —
it feeds the tab badges, which must not change as you filter.

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "665f1c...",
        "name": "Nusrat Jahan",
        "email": "nusrat@example.com",
        "phone": "01712884921",
        "avatar": "",
        "role": "customer",
        "isBlocked": false,
        "ordersCount": 18,
        "totalSpent": 42800,
        "createdAt": "2026-03-14T09:12:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 42, "pages": 5 },
    "roleCounts": { "total": 42, "customer": 39, "admin": 2, "super_admin": 1 }
  }
}
```

### `GET /admin/users/:id`

Same user object as above, plus the user's 10 most recent orders:

```json
{
  "success": true,
  "data": {
    "user": { "...": "as above" },
    "recentOrders": [
      { "_id": "...", "orderNumber": "LH-1043", "total": 2480,
        "status": "Delivered", "paymentStatus": "Verified",
        "createdAt": "2026-09-02T11:20:00.000Z" }
    ]
  }
}
```

`404` with `"User not found."` if the id does not exist or is not a valid
ObjectId.

### `POST /admin/users` — create an admin

```json
{ "name": "Shafin Ahmed", "email": "shafin@lumihaus.com",
  "phone": "01712345678", "password": "…", "role": "admin" }
```

- `role` must be `admin` or `super_admin`. Reject `customer` with `400` — use
  the storefront registration for those.
- `password`: minimum 8 characters (the console enforces this too). Hash with
  bcrypt, same cost factor as the rest of the app.
- Duplicate email → `409`, `"An account with this email already exists."`
- Success → `201`, `data` is the created user without `password`.

The new admin signs in immediately at `/auth/admin-login`. There is no email
invitation flow — the super admin hands over the password out of band.

### `PATCH /admin/users/:id/role`

```json
{ "role": "admin" }
```

Validate against the enum. Apply guards 1 and 2 above. Respond with the updated
user in `data`.

Note in your implementation that a demoted admin keeps a valid JWT until it
expires. Either check `role` from the database on each request (preferred —
the middleware likely already loads the user) or keep a token version field and
bump it here. Do not rely on the role baked into the token.

### `PATCH /admin/users/:id/status`

```json
{ "isBlocked": true }
```

Blocking keeps the account and its order history; it only stops sign-in and new
orders. An `admin` may block a `customer`; blocking an `admin` or `super_admin`
requires `super_admin` → otherwise `403`. Guard 1 applies (no self-blocking).

### `DELETE /admin/users/:id`

Hard delete of the user document. Guards 1 and 2 apply.

**Do not cascade-delete their orders.** Orders carry their own customer name,
phone and delivery address snapshot, and the accounting pages aggregate over
them — deleting orders would silently change past revenue and profit figures.
Leave the orders in place with a dangling user reference.

Respond `{ "success": true, "message": "User deleted." }`.

## 4. Error contract

The console surfaces `error.data.message` verbatim, so write messages for a
store owner, not a developer. It handles these statuses specially:

- `401` → "Your admin session has expired. Please sign in again."
- `403` → shows your `message`, falling back to "Access denied. This action requires a Super Admin."

Everything else shows your `message` as-is.

## 5. Seeding

Provide a one-off script or documented step to create the first `super_admin`,
since `POST /admin/users` itself requires one. Do not hardcode credentials in
source — read them from env vars.

Related: the console's login screen currently ships with
`admin@lumihaus.com` / `lumihaus2026` pre-filled in the form state
(`src/pages/auth/Login.jsx`). Make sure whatever you seed in production is not
that pair.

## 6. Out of scope, but worth flagging

The admin password-reset flow (`/forgot-password` → `/verify-otp` →
`/reset-password`) is currently **frontend-only simulation**: it accepts any
6-digit code and writes a fake token that renders the console shell. The
`forgotPassword` / `verifyOtp` / `resetPassword` mutations already exist in
`src/redux/features/authApi.js` but are never called. If you are implementing
those endpoints too, tell the frontend team so the pages get wired to them.
