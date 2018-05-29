import * as es from 'estree'

import { createContext } from '../slang'
import { Closure, Context, Frame } from '../slang/types'
import { TypeError } from '../slang/utils/rttc'

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
  return new Closure({} as es.FunctionExpression, {} as Frame, {} as Context)
}

export function mockTypeError(): TypeError {
  return new TypeError({ loc: 0 } as es.Node, '', '', '')
}
