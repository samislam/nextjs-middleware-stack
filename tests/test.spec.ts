import { middlewareStack, pipe } from '../src'

describe('middlewareStack', () => {
  const makeRequest = (url: string): Request => new Request(`http://localhost${url}`)

  it('executes matching string pattern', async () => {
    const handler = jest.fn()

    const stack = middlewareStack([
      pipe('/users/:id', async (req) => {
        handler(req)
      }),
    ])

    await stack(makeRequest('/users/42') as any)

    expect(handler).toHaveBeenCalled()
  })

  it('executes matching RegExp pattern', async () => {
    const handler = jest.fn()

    const stack = middlewareStack([
      pipe(/^\/admin\/.*/, async () => {
        handler()
      }),
    ])

    await stack(makeRequest('/admin/dashboard') as any)

    expect(handler).toHaveBeenCalled()
  })

  it('executes matching predicate function (sync)', async () => {
    const handler = jest.fn()

    const stack = middlewareStack([
      pipe(
        (req) => req.url.includes('secure'),
        async () => {
          handler()
        }
      ),
    ])

    await stack(makeRequest('/secure') as any)

    expect(handler).toHaveBeenCalled()
  })

  it('executes matching predicate function (async)', async () => {
    const handler = jest.fn()

    const stack = middlewareStack([
      pipe(
        async () => true,
        async () => {
          handler()
        }
      ),
    ])

    await stack(makeRequest('/anything') as any)

    expect(handler).toHaveBeenCalled()
  })

  it('short-circuits when handler returns a response', async () => {
    const first = jest.fn()
    const second = jest.fn()

    const stack = middlewareStack([
      pipe(/^\/test/, async () => {
        first()
        return new Response('stop')
      }),
      pipe(
        () => true,
        async () => {
          second()
        }
      ),
    ])

    const res = await stack(makeRequest('/test') as any)

    expect(first).toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
    expect(res).toBeInstanceOf(Response)
  })

  it('continues when handler returns void', async () => {
    const first = jest.fn()
    const second = jest.fn()

    const stack = middlewareStack([
      pipe(/^\/test/, async () => {
        first()
      }),
      pipe(
        () => true,
        async () => {
          second()
        }
      ),
    ])

    await stack(makeRequest('/test') as any)

    expect(first).toHaveBeenCalled()
    expect(second).toHaveBeenCalled()
  })

  it('supports always-run middleware via () => true', async () => {
    const always = jest.fn()

    const stack = middlewareStack([
      pipe(
        () => true,
        async () => {
          always()
        }
      ),
    ])

    await stack(makeRequest('/anything') as any)

    expect(always).toHaveBeenCalled()
  })

  it('does not execute non-matching patterns', async () => {
    const handler = jest.fn()

    const stack = middlewareStack([
      pipe('/admin', async () => {
        handler()
      }),
    ])

    await stack(makeRequest('/user') as any)

    expect(handler).not.toHaveBeenCalled()
  })
})
