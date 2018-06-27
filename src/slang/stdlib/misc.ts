/* tslint:disable: ban-types*/
import { toString } from '../interop'
import { Context, Value } from '../types'

import { handleConsoleLog } from '../../actions'

export function display(value: Value, location: any) {
  const output = toString(value)
  // TODO in 2019: fix this hack
  if (typeof (window as any).__REDUX_STORE__ !== 'undefined') {
    ;(window as any).__REDUX_STORE__.dispatch(handleConsoleLog(output, location))
  }
}
display.__SOURCE__ = 'display(a)'

export function error_message(value: Value) {
  const output = toString(value)
  throw new Error(output)
}
error_message.__SOURCE__ = 'error(a)'

// tslint:disable-next-line:no-any
export function timed(context: Context, f: Function, location: any) {
  return (...args: any[]) => {
    const start = runtime()
    const result = f(...args)
    const diff = runtime() - start
    display('Duration: ' + Math.round(diff) + 'ms', location)
    return result
  }
}
timed.__SOURCE__ = 'timed(f)'

export function is_number(v: Value) {
  return typeof v === 'number'
}
is_number.__SOURCE__ = 'is_number(v)'

export function array_length(xs: Value[]) {
  return xs.length
}
array_length.__SOURCE__ = 'array_length(xs)'

export function parse_int(inputString: string, radix: number) {
  const parsed = parseInt(inputString, radix)
  if (inputString && radix && parsed) {
    // the two arguments are provided, and parsed is not NaN
    return parsed
  } else {
    throw new Error('parseInt expects two arguments a string s, and a positive integer i')
  }
}
parse_int.__SOURCE__ = 'parse_int(s, i)'

export function runtime() {
  return new Date().getTime()
}
runtime.__SOURCE__ = 'runtime()'
