import { Context, Scheduler, SourceError, Result } from './types'
import createContext from './createContext'
import { evaluate } from './interpreter'
import { InterruptedError } from './interpreter-errors'
import { parse } from './parser'
import { AsyncScheduler, PreemptiveScheduler } from './schedulers'
import { toString } from './interop'

export type Options = {
  scheduler: 'preemptive' | 'async',
  steps: number
}

const DEFAULT_OPTIONS: Options = {
  scheduler: 'async',
  steps: 1000
}

export class ParseError {
  constructor(public errors: SourceError[]) {
  }
}

export function runInContext(
  code: string,
  context: Context,
  options: Partial<Options> = {}): Promise<Result> {
  const theOptions: Options = {...options, ...DEFAULT_OPTIONS}
  context.errors = []
  const program = parse(code, context)
  if (program) {
    const it = evaluate(program, context)
    let scheduler: Scheduler
    if (options.scheduler === 'async') {
      scheduler = new AsyncScheduler()
    } else {
      scheduler = new PreemptiveScheduler(theOptions.steps)
    }
    return scheduler.run(it, context)
  } else {
    return Promise.resolve({ status: 'error' } as Result)
  }
}

export function resume(result: Result) {
  if (result.status === 'finished' || result.status === 'error') {
    return result
  } else {
    return result.scheduler.run(result.it, result.context)
  }
}

export function interrupt(context: Context) {
  const globalFrame = context.runtime.frames[context.runtime.frames.length - 1]
  context.runtime.frames = [globalFrame]
  context.runtime.isRunning = false
  context.errors.push(new InterruptedError(context.runtime.nodes[0]))
}

export { createContext, toString, Context, Result }
