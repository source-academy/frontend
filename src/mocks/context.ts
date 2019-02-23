import { parse } from 'acorn'
import { FunctionExpression } from 'estree'
import Closure from 'js-slang/dist/closure'
import createContext from 'js-slang/dist/createContext'
import { Context, Frame } from 'js-slang/dist/types'
import { TypeError } from 'js-slang/dist/utils/rttc'

export function mockContext(chapter = 1): Context {
  return createContext(chapter)
}

export function mockRuntimeContext(): Context {
  const context = createContext()
  context.runtime = {
    isRunning: true,
    frames: [],
    nodes: [
      {
        type: 'Literal',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 1 }
        },
        value: 0,
        raw: '0',
        range: [0, 1]
      }
    ]
  }
  return context
}

export function mockClosure(): Closure {
  return new Closure({} as FunctionExpression, {} as Frame, {} as Context)
}

export function mockTypeError(): TypeError {
  return new TypeError(parse(''), '', '', '')
}
