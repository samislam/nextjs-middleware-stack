import { comparePath } from 'compare-path'

/** A middleware handler that can short-circuit by returning a Response. */
export type MiddlewareHandler<T = Request> = (req: T) => Response | void | Promise<Response | void>
/** A pattern function can be sync or async, and is generic over the request type. */
export type PatternFn<T = Request> = (req: T) => boolean | Promise<boolean>
/** A pattern can be a string, RegExp, or a predicate function over T. */
export type Pattern<T = Request> = PatternFn<T> | string | RegExp

/**
 * Opaque/Branded "Pipe" type. Enforces that consumers MUST use pipe() (raw tuples won't
 * type-check).
 */
const PIPE_BRAND: unique symbol = Symbol('PIPE_BRAND')

export type Pipe<T extends Request = Request> = Readonly<{
  [PIPE_BRAND]: true
  pattern: Pattern<T>
  handler: MiddlewareHandler<T>
}>

/** Create a middleware pipe (pattern + handler). */
export function pipe<T extends Request = Request>(
  pattern: Pattern<T>,
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
          ? comparePath(pattern, pathname)[0]
          : pattern instanceof RegExp
          ? pattern.test(pathname)
          : typeof pattern === 'function'
          ? await pattern(req)
          : false

      if (isMatch) {
        const result = await handler(req)
        if (result !== undefined) return result
      }
    }
  }
}
