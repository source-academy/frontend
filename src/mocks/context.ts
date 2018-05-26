import { createContext } from '../slang'
import { Context } from '../slang/types'

export function mockContext(chapter = 1): Context {
  return createContext(chapter)
}
