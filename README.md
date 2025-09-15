## Live Communication Platform – Frontend

Next.js (App Router) client for the realtime communication backend (NestJS + Socket.IO + Prisma).

---

### 1. Environment Variables

Copy `.env.example` to one of:

```
cp .env.example .env.local        # local development
cp .env.example .env.production   # production build
```

Edit values as needed. Important keys:

| Variable               | Purpose                                | Example                               |
| ---------------------- | -------------------------------------- | ------------------------------------- |
| NEXT_PUBLIC_API_BASE   | Base URL of backend REST API           | https://lcp-backend-vt1p.onrender.com |
| NEXT_PUBLIC_SOCKET_URL | (Optional) Explicit websocket endpoint | wss://lcp-backend-vt1p.onrender.com   |
| NEXTAUTH_URL           | Public URL of this frontend            | https://your-frontend.example         |
| NEXTAUTH_SECRET        | Random long secret for NextAuth        | (generate)                            |

If you omit `NEXT_PUBLIC_SOCKET_URL` it is derived automatically from `NEXT_PUBLIC_API_BASE`.

Rebuild whenever a `NEXT_PUBLIC_*` value changes.

Backend must allow your frontend in CORS via its `FRONTEND_ORIGIN` env (comma separated list). Keep `http://localhost:3000` there if you still do local dev.

---

### 2. Run Locally

Backend running at http://localhost:4000

```
cp .env.example .env.local
# edit .env.local to use localhost values
npm install
npm run dev
```

Open http://localhost:3000

---

### 3. Production Build

```
npm install
npm run build
npm start
```

Default port is 3000 (override with `PORT` env if host requires).

---

### 4. Deployment (Vercel example)

Set environment variables in Vercel Project Settings:

-   NEXT_PUBLIC_API_BASE
-   NEXTAUTH_URL (should match the production domain Vercel assigns or your custom domain)
-   NEXTAUTH_SECRET (generate once; keep stable)
-   (Optional) NEXT_PUBLIC_SOCKET_URL if sockets served elsewhere

Then trigger a new production deployment. No need to commit `.env` files.

Render / Railway / Docker:

1. Supply env vars.
2. Build: `npm run build`
3. Start: `npm start`
4. Add health check hitting `/` (optional).

---

### 5. Architecture Notes

-   Credentials login hits backend endpoints `/auth/login` & `/auth/register`.
-   JWT returned is stored in NextAuth JWT token (not in cookies for API fetches yet) – extend if you add refresh tokens.
-   Socket.IO client connects using same host as API unless overridden.
-   Contacts + presence fetched via `/users/contacts` (auth required) then live‑updated by socket `presence` events.
-   Invitation / Call Signaling Events (Socket.IO):
    -   `presence:update` (client -> server) announce status: `ONLINE|BUSY|OFFLINE`.
    -   `call:invite` (A -> server -> B) payload: `{ fromUserId, fromName, toUserId, roomId }`.
    -   `call:incoming` (server -> callee) same payload as invite.
    -   `call:accept` (callee -> server -> caller) `{ roomId, fromUserId, toUserId }`.
    -   `call:accepted` (server -> caller) `{ roomId, toUserId }` triggers auto join.
    -   `call:reject` / `call:rejected` mirror accept flow for denial.
    -   `call:unavailable` emitted if callee is not in `ONLINE` state (race protection).
    -   `call:end` (either side) `{ userIds: [callerId, calleeId] }` used to revert statuses to `ONLINE`.
-   Room naming convention: `r-{callerId}-{calleeId}-{timestamp}` (immutable) – do not parse for auth logic, only convenience.
-   `useContacts` hook centralizes: fetching contacts, presence subscription, invite lifecycle, active room management, optimistic status transitions.
-   `InvitationModal` renders incoming invitation UI with accessible focus trapping (basic) and Accept / Reject actions.

---

### 6. Development Tips

-   Tailwind (v4) is set up via PostCSS config (if you add utility classes ensure purge includes new paths).
-   Run `npm run lint` before commits.
-   Add tests (React Testing Library) as project grows.

---

### 7. Roadmap Ideas

-   Refresh token rotation & automatic re-auth.
-   Presence indicators directly from socket events (currently basic).
-   Recording and storing call histories UI.
-   Group calls (multi‑party) – extend signaling to broadcast SDP candidates to multiple peers.
-   Push notifications for invites when user is offline.
-   Better busy logic (auto BUSY when in active room, resume previous state on end).
-   Persist unread chat counts per contact.
-   Network quality indicators (RTCPeerConnection stats overlay).

---

### 8. License

Add a license file if you plan to open source.
