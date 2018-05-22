import * as list from './stdlib/list'
import * as misc from './stdlib/misc'
import { Context, Value } from './types'

const GLOBAL = typeof window === 'undefined' ? global : window

const createEmptyCFG = () => ({
  nodes: {},
  edges: {},
  scopes: []
})

const createEmptyRuntime = () => ({
  isRunning: false,
  frames: [],
  value: undefined,
  nodes: []
})

export const createEmptyContext = (week: number): Context => ({
  week,
  errors: [],
  cfg: createEmptyCFG(),
  runtime: createEmptyRuntime()
})

export const ensureGlobalEnvironmentExist = (context: Context) => {
  if (!context.runtime) {
    context.runtime = createEmptyRuntime()
  }
  if (!context.runtime.frames) {
    context.runtime.frames = []
  }
  if (context.runtime.frames.length === 0) {
    context.runtime.frames.push({
      parent: null,
      name: 'global',
      environment: {}
    })
  }
}

const defineSymbol = (context: Context, name: string, value: Value) => {
  const globalFrame = context.runtime.frames[0]
  globalFrame.environment[name] = value
}

export const importExternals = (context: Context, externals: string[]) => {
  ensureGlobalEnvironmentExist(context)

  externals.forEach(symbol => {
    defineSymbol(context, symbol, GLOBAL[symbol])
  })
}

export const importBuiltins = (context: Context) => {
  ensureGlobalEnvironmentExist(context)

  if (context.week >= 3) {
    defineSymbol(context, 'runtime', misc.runtime)
    defineSymbol(context, 'display', misc.display)
    defineSymbol(context, 'error', misc.error_message)
    defineSymbol(context, 'prompt', prompt)
    defineSymbol(context, 'parse_int', misc.parse_int)
    defineSymbol(context, 'undefined', undefined)
    defineSymbol(context, 'NaN', NaN)
    defineSymbol(context, 'Infinity', Infinity)
    // Define all Math libraries
    const objs = Object.getOwnPropertyNames(Math)
    for (const i in objs) {
      if (objs.hasOwnProperty(i)) {
        const val = objs[i]
        if (typeof Math[val] === 'function') {
          defineSymbol(context, 'math_' + val, Math[val].bind())
        } else {
          defineSymbol(context, 'math_' + val, Math[val])
        }
      }
    }
  }

  if (context.week >= 4) {
    defineSymbol(context, 'math_log', Math.log)
    defineSymbol(context, 'math_exp', Math.exp)
    defineSymbol(context, 'alert', alert)
    defineSymbol(context, 'math_floor', Math.floor)
    defineSymbol(context, 'timed', misc.timed)
  }

  if (context.week >= 5) {
    defineSymbol(context, 'list', list.list)
    defineSymbol(context, 'pair', list.pair)
    defineSymbol(context, 'is_pair', list.is_pair)
    defineSymbol(context, 'is_list', list.is_list)
    defineSymbol(context, 'is_empty_list', list.is_empty_list)
    defineSymbol(context, 'head', list.head)
    defineSymbol(context, 'tail', list.tail)
    defineSymbol(context, 'length', list.length)
    defineSymbol(context, 'map', list.map)
    defineSymbol(context, 'build_list', list.build_list)
    defineSymbol(context, 'for_each', list.for_each)
    defineSymbol(context, 'list_to_string', list.list_to_string)
    defineSymbol(context, 'reverse', list.reverse)
    defineSymbol(context, 'append', list.append)
    defineSymbol(context, 'member', list.member)
    defineSymbol(context, 'remove', list.remove)
    defineSymbol(context, 'remove_all', list.remove_all)
    defineSymbol(context, 'equal', list.equal)
    defineSymbol(context, 'assoc', list.assoc)
    defineSymbol(context, 'filter', list.filter)
    defineSymbol(context, 'enum_list', list.enum_list)
    defineSymbol(context, 'list_ref', list.list_ref)
    defineSymbol(context, 'accumulate', list.accumulate)
    if (window.hasOwnProperty('ListVisualizer')) {
      defineSymbol(context, 'draw', (window as any).ListVisualizer.draw)
    } else {
      defineSymbol(context, 'draw', () => {
        throw new Error('List visualizer is not enabled')
      })
    }
  }
  if (context.week >= 6) {
    defineSymbol(context, 'is_number', misc.is_number)
  }
  if (context.week >= 8) {
    defineSymbol(context, 'undefined', undefined)
    defineSymbol(context, 'set_head', list.set_head)
    defineSymbol(context, 'set_tail', list.set_tail)
  }
  if (context.week >= 9) {
    defineSymbol(context, 'array_length', misc.array_length)
  }
}

const createContext = (week = 3, externals = []) => {
  const context = createEmptyContext(week)

  importBuiltins(context)
  importExternals(context, externals)

  return context
}

export default createContext
