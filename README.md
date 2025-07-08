# 🚣️ `middlewareStack` – A Lightweight Middleware Router for Next.js

A composable middleware stack for Next.js, supporting both `string`-based route patterns (with dynamic parameters and wildcards) and raw `RegExp` objects.

Perfect for building layered request logic like authentication, logging, redirects, or feature flags in Next.js Edge or Node middlewares.

---

## ✨ Features

- ✅ Simple pattern matching with support for:
  - `:param` dynamic segments
  - `**` wildcards (greedy)
- ✅ `RegExp` support
- ✅ Middleware short-circuiting (first matching response stops the stack)
- ✅ Fully compatible with `next/server` and middleware in `apps/<name>/src/middleware.ts`

---

## 📦 Installation

```bash
npm install compare-path
```

---

## 🧠 API

### `middlewareStack(routes: [string | RegExp, MiddlewareHandler][])`

Creates a Next.js-compatible middleware handler from an ordered list of route matchers and handler functions.

#### Parameters:

- `routes`: An array of tuples where:
  - The first item is a string pattern (e.g., `/users/:id`) or a RegExp.
  - The second item is a handler function `(req: NextRequest) => Response | void | Promise<Response | void>`.

#### Returns:

- A function `(req: NextRequest) => Promise<Response | void>` – ready to be exported as default from `middleware.ts`.

---

## 📊 Supported Path Shapes

You can use either `string`-based shape patterns (powered by `compare-path`) or `RegExp`.

| Shape           | Matches Path Example        |
| --------------- | --------------------------- |
| `/user/:id`     | `/user/42`                  |
| `/users/[id]`   | `/users/42` (same as above) |
| `/docs/**/edit` | `/docs/api/v1/intro/edit`   |
| `/a/:x/**/b/:y` | `/a/1/foo/bar/b/2`          |

> Use RegExp when you need full regex control.

---

## 🧪 Example Usage (Auth Middleware)

```ts
// File: apps/example-app/src/middleware.ts
import { NextResponse } from 'next/server'
import { middlewareStack } from './utils/middleware-stack'
import { validateAuthToken } from './utils/validate-jwt'

export default middlewareStack([
  [
    /^\/dashboard\/.*/,
    async (req) => {
      const token = req.cookies.get('AUTH_TOKEN')?.value
      const isValid = token && (await validateAuthToken(token))
      if (!isValid) return NextResponse.redirect(new URL('/login', req.url))
    },
  ],
  [
    '/public/:page',
    async (req) => {
      console.log('Logging public page hit')
    },
  ],
])
```

---

## 🧪 Example with String Matching

```ts
// File: apps/example-app/src/middleware.ts
import { middlewareStack } from './utils/middleware-stack'

export default middlewareStack([
  [
    '/users/:id',
    async (req) => {
      // Handle specific user route
    },
  ],
  [
    'cars/:id',
    async (req) => {
      // Same as above with different route
    },
  ],
  [
    'hello/**',
    async (req) => {
      // Match anything starting with /hello/
    },
  ],
])
```

---

## 🧹 Integration in Next.js

You must also export the `config` to ensure the middleware applies to your desired routes:

```ts
export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)', // Skip static assets
    '/(api|trpc)(.*)', // Always include API routes
  ],
  runtime: 'nodejs',
}
```

---

## 🧠 How It Works

Internally, `middlewareStack` will iterate through your routes and:

1. Compare the current path to each route (using `compare-path` or RegExp).
2. If matched, execute the handler.
3. If a `Response` is returned from the handler, it stops further execution and returns immediately.

---

## 💡 Tips

- Middleware order matters! First match wins.
- Use RegExp for more complex or legacy patterns.
- Use string shapes for clean, readable routes with parameters.

---

Islam Yamor.