import createContext from '../slang/createContext'
import { Context } from '../slang/types'

export function mockContext(): Context {
  return createContext()
}
