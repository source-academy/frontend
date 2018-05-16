import * as es from 'estree'
import { CFG } from './types'

export const Types = {
  NUMBER: { name: 'number' } as CFG.Type,
  STRING: { name: 'string' } as CFG.Type,
  UNDEFINED: { name: 'undefined' } as CFG.Type,
  BOOLEAN: { name: 'boolean' } as CFG.Type,
  ANY: { name: 'any' } as CFG.Type
}
export const MAX_LIST_DISPLAY_LENGTH = 100
export const UNKNOWN_LOCATION: es.SourceLocation = {
  start: {
    line: -1,
    column: -1
  },
  end: {
    line: -1,
    column: -1
  }
}
