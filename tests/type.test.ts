import { middlewareStack } from '../src'

// @ts-expect-error - raw tuples not allowed
middlewareStack([[/^\/test/, async () => {}]])

test('type assertions are compile-time only', () => {
  expect(true).toBe(true)
})
