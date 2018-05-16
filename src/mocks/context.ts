import { Context } from '../slang/types'
import createContext from '../slang/createContext'

export function mockContext(): Context {
  return createContext()
}
