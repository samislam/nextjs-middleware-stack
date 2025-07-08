import { comparePath } from 'compare-path'

export type MiddlewareHandler<T = Request, R = Response> = (req: T) => R | void | Promise<R | void>

export function middlewareStack<T = Request, R = Response>(
  routes: [string | RegExp, MiddlewareHandler<T, R>][]
) {
  return async (req: T): Promise<R | void> => {
    type MaybeNextRequest = Request & { nextUrl?: { pathname: string } }
    const url = (req as MaybeNextRequest).nextUrl?.pathname ?? (req as Request).url

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
