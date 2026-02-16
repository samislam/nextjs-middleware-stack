import { comparePath } from 'compare-path'

/** A middleware handler that can short-circuit by returning a Response. */
export type MiddlewareHandler<T = Request> = (req: T) => Response | void | Promise<Response | void>

/** A pattern function can be sync or async. */
export type PatternFn = (req: Request) => boolean | Promise<boolean>
export type Pattern = PatternFn | string | RegExp

/**
 * Opaque/Branded "Pipe" type. Enforces that consumers MUST use pipe() (raw tuples won't
 * type-check).
 */
declare const PIPE_BRAND: unique symbol

export type Pipe<T extends Request = Request> = Readonly<{
  /** Brand */
  [PIPE_BRAND]: true
  pattern: Pattern
  handler: MiddlewareHandler<T>
}>

/** Create a middleware pipe (pattern + handler). */
export function pipe<T extends Request = Request>(
  pattern: Pattern,
  handler: MiddlewareHandler<T>
): Pipe<T> {
  return { pattern, handler, [PIPE_BRAND]: true } as Pipe<T>
}

/**
 * Create a middleware stack that executes pipes in order.
 *
 * - For each pipe: if pattern matches, run handler.
 * - If handler returns a Response, short-circuit and return it.
 * - Otherwise continue to the next pipe.
 *
 * NOTE: This version enforces "pipe() only" (no raw [pattern, handler] tuples).
 */
export function middlewareStack<T extends Request = Request>(pipes: ReadonlyArray<Pipe<T>>) {
  return async (req: T): Promise<Response | void> => {
    type MaybeNextRequest = Request & { nextUrl?: { pathname: string } }

    for (const { pattern, handler } of pipes) {
      // Recompute each iteration: a previous handler may mutate req.nextUrl.pathname
      const pathname =
        (req as MaybeNextRequest).nextUrl?.pathname ?? new URL((req as Request).url).pathname

      const isMatch =
        typeof pattern === 'string'
          ? comparePath(pattern, pathname)
          : pattern instanceof RegExp
          ? pattern.test(pathname)
          : typeof pattern === 'function'
          ? await pattern(req as unknown as Request)
          : false

      if (isMatch) {
        const result = await handler(req)
        if (result !== undefined) return result
      }
    }
  }
}
