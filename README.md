# 🚣 `middlewareStack` – A Composable Middleware Router for Next.js

A lightweight, composable middleware stack for Next.js that supports:

- `string` route patterns (with dynamic parameters & wildcards)
- Raw `RegExp`
- Sync/async predicate functions
- Strict `pipe()` composition API

Perfect for authentication gates, logging, redirects, feature flags, i18n integration, and layered request logic in Next.js Edge or Node runtimes.

---

## ✨ Features

- ✅ Clean `pipe()` API (no tuple arrays)
- ✅ String pattern matching via `compare-path`

  - `:param` dynamic segments
  - `**` greedy wildcards

- ✅ Native `RegExp` support
- ✅ Sync or async predicate matching
- ✅ Middleware short-circuiting
- ✅ Edge & Node compatible
- ✅ Type-safe enforcement of `pipe()` usage

---

## 📦 Installation

```bash
npm install nextjs-middleware-stack
```

---

## 🧠 API

### `pipe(pattern, handler)`

Creates a middleware pipe.

```ts
export type PatternFn = (req: Request) => boolean | Promise<boolean>
export type Pattern = PatternFn | string | RegExp
```

#### Parameters

- `pattern`

  - string route shape (`/users/:id`)
  - `RegExp`
  - predicate function `(req) => boolean | Promise<boolean>`

- `handler`

  - `(req: Request) => Response | void | Promise<Response | void>`

> `pipe()` must be used. Raw `[pattern, handler]` tuples are not supported.

---

### `middlewareStack(pipes)`

```ts
middlewareStack(pipes: Pipe[])
```

Creates a Next.js-compatible middleware handler from an ordered list of `pipe()` calls.

Returns:

```ts
;(req: Request) => Promise<Response | void>
```

Ready to export as default from `middleware.ts`.

---

## 🚀 Example (Authentication Middleware)

```ts
// apps/example-app/src/middleware.ts
import { NextResponse } from 'next/server'
import { middlewareStack, pipe } from 'nextjs-middleware-stack'
import { validateAuthToken } from './utils/validate-jwt'

export default middlewareStack([
  pipe(/^\/dashboard\/.*/, async (req) => {
    const token = req.cookies.get('AUTH_TOKEN')?.value
    const isValid = token && (await validateAuthToken(token))

    if (!isValid) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }),

  pipe('/public/:page', async () => {
    console.log('Public page hit')
  }),

  // Always run last
  pipe(
    () => true,
    async () => {
      console.log('Final middleware')
    }
  ),
])
```

---

## 📊 Supported Path Shapes

String patterns are powered by `compare-path`.

| Pattern         | Matches                   |
| --------------- | ------------------------- |
| `/user/:id`     | `/user/42`                |
| `/users/[id]`   | `/users/42`               |
| `/docs/**/edit` | `/docs/api/v1/intro/edit` |
| `/a/:x/**/b/:y` | `/a/1/foo/bar/b/2`        |

Use `RegExp` for advanced matching.

Use a predicate function when matching depends on:

- Cookies
- Headers
- Geo
- Runtime conditions
- Feature flags

---

## 🧪 Example: String Matching

```ts
import { middlewareStack, pipe } from 'nextjs-middleware-stack'

export default middlewareStack([
  pipe('/users/:id', async (req) => {
    // Handle specific user route
  }),

  pipe('cars/:id', async () => {
    // Match /cars/123
  }),

  pipe('hello/**', async () => {
    // Match anything under /hello/
  }),
])
```

---

## 🧪 Example: Predicate Function

```ts
import { middlewareStack, pipe } from 'nextjs-middleware-stack'

export default middlewareStack([
  pipe(
    async (req) => {
      return req.url.includes('/api/') && !!req.headers.get('authorization')
    },
    async () => {
      console.log('Authenticated API request')
    }
  ),
])
```

---

## 🧹 Next.js Integration

You must also export `config` to control where middleware runs:

```ts
export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)', // Skip static assets
    '/(api|trpc)(.*)', // Always include API routes
  ],
}
```

---

## 🧠 How It Works

For each request:

1. Iterate through pipes in order.
2. Evaluate the `pattern`.
3. If matched → execute the `handler`.
4. If the handler returns a `Response`, execution stops.
5. Otherwise → continue to the next pipe.

Middleware order matters.

---

## 💡 Tips

- Place authentication gates before public routes.
- Put always-run middleware last:

```ts
pipe(() => true, someMiddleware)
```

- Prefer string shapes for readability.
- Use predicate functions for request-aware logic.
- Use `RegExp` only when necessary.

---

## ⚠️ Breaking Change (v2+)

`middlewareStack` now accepts **only `pipe()` entries**.

Old style:

```ts
middlewareStack([[/regex/, handler]])
```

is no longer supported.

Migration:

```ts
middlewareStack([pipe(/regex/, handler)])
```

---

Islam Yamor.
