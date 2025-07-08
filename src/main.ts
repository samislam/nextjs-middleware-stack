import { comparePath } from 'compare-path'
import { NextRequest, NextResponse } from 'next/server'

export type MiddlewareHandler = (
  req: NextRequest
) => NextResponse | Response | void | Promise<NextResponse | Response | void>

export function middlewareStack(routes: [string | RegExp, MiddlewareHandler][]) {
  return async (req: NextRequest) => {
    const url = req.nextUrl.pathname

    for (const [pattern, handler] of routes) {
      const isMatch =
        typeof pattern === 'string'
          ? comparePath(pattern, url)
          : pattern instanceof RegExp
          ? pattern.test(url)
          : false

      if (isMatch) {
        const result = await handler(req)
        if (result) return result // short-circuit if a handler returns a response
      }
    }
  }
}
