import { Value } from '../types'

export function is_instance_of(a: Value, b: Value) {
  return a instanceof b
}
