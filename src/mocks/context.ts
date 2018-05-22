import { createContext } from '../slang'
import { Context } from '../slang/types'

export function mockContext(): Context {
  return createContext()
}
