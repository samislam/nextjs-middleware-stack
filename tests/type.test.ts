import { middlewareStack } from '../src'

// @ts-expect-error - raw tuples not allowed
middlewareStack([[/^\/test/, async () => {}]])
