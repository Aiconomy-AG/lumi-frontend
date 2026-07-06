# Lush.ch — Frontend (React + Vite + Tailwind)

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Opens at http://localhost:5173. With `VITE_USE_MOCK=true` (the default),
the app runs entirely on fake data in `src/api/mockData.ts` — no backend needed.

## Docker

```bash
docker compose up
```

Same result, containerized, with hot reload via a bind mount.

## How the mock → real API switch works

Every screen calls functions from `src/api/client.ts`
(`getUsers`, `getUser`, `createUser`, ...) — never `fetch()` directly.

Each function has two branches:

```ts
export async function getUsers(): Promise<User[]> {
  if (USE_MOCK) return delay(mockUsers)
  return request<User[]>('/users')
}
```

When the Laravel endpoint is ready:

1. Set `VITE_USE_MOCK=false` in `.env`.
2. Set `VITE_API_URL` to point at the real API.
3. Update the `User` type in `src/types/user.ts` if the real response
   shape differs — TypeScript will flag every place that needs adjusting.
4. Double check the endpoint path/method inside the relevant `client.ts`
   function still matches what the backend actually exposes.

No component code needs to change — they only ever import from `client.ts`.

## Adding a new endpoint

1. Add/extend a type in `src/types/`.
2. Add mock fixture data in `src/api/mockData.ts`.
3. Add a function in `src/api/client.ts` with a mock branch and a real branch.
4. Use it from a component with `useEffect` + `useState`, same pattern as `App.tsx`.

## CI

`.github/workflows/ci.yml` runs lint → test → build on every push/PR.
It's intentionally minimal right now — the goal is a green pipeline from day one,
add real test coverage as features land.

## Monorepo note

If the team decides on a monorepo (Laravel API + this frontend + KMP mobile
in one repo), move this folder to something like `apps/web/` and lift the
`docker-compose.yml` to the repo root so it can also define the `api` service.
