import { comparePath } from 'compare-path'

export type MiddlewareHandler<T = Request, R = Response> = (req: T) => R | void | Promise<R | void>
export type PatternFn = (req: Request) => boolean | Promise<boolean>
export type Pattern = PatternFn | string | RegExp

export function middlewareStack<T = Request, R = Response>(
  routes: [Pattern, MiddlewareHandler<T, R>][]
) {
  return async (req: T): Promise<R | void> => {
    type MaybeNextRequest = Request & { nextUrl?: { pathname: string } }
    // const url = (req as MaybeNextRequest).nextUrl?.pathname ?? (req as Request).url
    const currentUrl =
      (req as MaybeNextRequest).nextUrl?.pathname ?? new URL((req as Request).url).pathname

    for (const [pattern, handler] of routes) {
      const isMatch =
        typeof pattern === 'string'
          ? comparePath(pattern, currentUrl)
          : pattern instanceof RegExp
          ? pattern.test(currentUrl)
          : typeof pattern === 'function'
          ? await pattern(req as Request)
          : false

      if (isMatch) {
        const result = await handler(req)
        if (result) return result // short-circuit if a handler returns a response
      }
    }
  }
}
