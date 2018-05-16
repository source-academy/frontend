import { toString } from '../interop'
import { Value } from '../types'

declare global {
  interface Function {
    __SOURCE__?: string
  }
}

// tslint:disable
// list.js: Supporting lists in the Scheme style, using pairs made
//          up of two-element JavaScript array (vector)
// Author: Martin Henz
// Translated to TypeScript by Evan Sebastian

type List = Value[]

// array test works differently for Rhino and
// the Firefox environment (especially Web Console)
function array_test(x: Value) {
  if (Array.isArray === undefined) {
    return x instanceof Array
  } else {
    return Array.isArray(x)
  }
}
array_test.__SOURCE__ = 'array_test(x)'

// pair constructs a pair using a two-element array
// LOW-LEVEL FUNCTION, NOT SOURCE
export function pair(x: Value, xs: Value) {
  return [x, xs]
}
pair.__SOURCE__ = 'pair(x, xs)'

// is_pair returns true iff arg is a two-element array
// LOW-LEVEL FUNCTION, NOT SOURCE
export function is_pair(x: Value) {
  return array_test(x) && x.length === 2
}
is_pair.__SOURCE__ = 'is_pair(x)'

// head returns the first component of the given pair,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE
export function head(xs: List) {
  if (is_pair(xs)) {
    return xs[0]
  } else {
    throw new Error('head(xs) expects a pair as ' + 'argument xs, but encountered ' + toString(xs))
  }
}
head.__SOURCE__ = 'head(xs)'

// tail returns the second component of the given pair
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE
export function tail(xs: List) {
  if (is_pair(xs)) {
    return xs[1]
  } else {
    throw new Error('tail(xs) expects a pair as ' + 'argument xs, but encountered ' + toString(xs))
  }
}
tail.__SOURCE__ = 'tail(xs)'

// is_empty_list returns true if arg is []
// LOW-LEVEL FUNCTION, NOT SOURCE
export function is_empty_list(xs: List) {
  if (array_test(xs)) {
    if (xs.length === 0) {
      return true
    } else if (xs.length === 2) {
      return false
    } else {
      return false
    }
  } else {
    return false
  }
}
is_empty_list.__SOURCE__ = 'is_empty_list(xs)'

// is_list recurses down the list and checks that it ends with the empty list []
// does not throw Value exceptions
// LOW-LEVEL FUNCTION, NOT SOURCE
export function is_list(xs: List) {
  for (; ; xs = tail(xs)) {
    if (is_empty_list(xs)) {
      return true
    } else if (!is_pair(xs)) {
      return false
    }
  }
}
is_list.__SOURCE__ = 'is_list(xs)'

// list makes a list out of its arguments
// LOW-LEVEL FUNCTION, NOT SOURCE
export function list() {
  var the_list = []
  for (var i = arguments.length - 1; i >= 0; i--) {
    the_list = pair(arguments[i], the_list)
  }
  return the_list
}
list.__SOURCE__ = 'list(x, y, ...)'

// list_to_vector returns vector that contains the elements of the argument list
// in the given order.
// list_to_vector throws an exception if the argument is not a list
// LOW-LEVEL FUNCTION, NOT SOURCE
export function list_to_vector(lst: List) {
  var vector = []
  while (!is_empty_list(lst)) {
    vector.push(head(lst))
    lst = tail(lst)
  }
  return vector
}
list_to_vector.__SOURCE__ = 'list_to_vector(xs)'

// vector_to_list returns a list that contains the elements of the argument vector
// in the given order.
// vector_to_list throws an exception if the argument is not a vector
// LOW-LEVEL FUNCTION, NOT SOURCE
export function vector_to_list(vector: Value[]) {
  if (vector.length === 0) {
    return []
  }

  var result = []
  for (var i = vector.length - 1; i >= 0; i = i - 1) {
    result = pair(vector[i], result)
  }
  return result
}
vector_to_list.__SOURCE__ = 'vector_to_list(vs)'

// returns the length of a given argument list
// throws an exception if the argument is not a list
export function length(xs: List) {
  for (var i = 0; !is_empty_list(xs); ++i) {
    xs = tail(xs)
  }
  return i
}
length.__SOURCE__ = 'length(xs)'

// map applies first arg f to the elements of the second argument,
// assumed to be a list.
// f is applied element-by-element:
// map(f,[1,[2,[]]]) results in [f(1),[f(2),[]]]
// map throws an exception if the second argument is not a list,
// and if the second argument is a non-empty list and the first
// argument is not a function.
export function map(f: Function, xs: List): List {
  return is_empty_list(xs) ? [] : pair(f(head(xs)), map(f, tail(xs)))
}
map.__SOURCE__ = 'map(f, xs)'

// build_list takes a non-negative integer n as first argument,
// and a function fun as second argument.
// build_list returns a list of n elements, that results from
// applying fun to the numbers from 0 to n-1.
export function build_list(n: number, fun: Function) {
  function build(i: number, fun: Function, already_built: List): List {
    if (i < 0) {
      return already_built
    } else {
      return build(i - 1, fun, pair(fun(i), already_built))
    }
  }
  return build(n - 1, fun, [])
}
build_list.__SOURCE__ = 'build_list(n, fun)'

// for_each applies first arg fun to the elements of the list passed as
// second argument. fun is applied element-by-element:
// for_each(fun,[1,[2,[]]]) results in the calls fun(1) and fun(2).
// for_each returns true.
// for_each throws an exception if the second argument is not a list,
// and if the second argument is a non-empty list and the
// first argument is not a function.
export function for_each(fun: Function, xs: List) {
  if (!is_list(xs)) {
    throw new Error('for_each expects a list as argument xs, but ' + 'encountered ' + xs)
  }
  for (; !is_empty_list(xs); xs = tail(xs)) {
    fun(head(xs))
  }
  return true
}
for_each.__SOURCE__ = 'for_each(fun, xs)'

// list_to_string returns a string that represents the argument list.
// It applies itself recursively on the elements of the given list.
// When it encounters a non-list, it applies toString to it.
export function list_to_string(l: List): string {
  return toString(l)
}
list_to_string.__SOURCE__ = 'list_to_string(xs)'

// reverse reverses the argument list
// reverse throws an exception if the argument is not a list.
export function reverse(xs: List) {
  if (!is_list(xs)) {
    throw new Error('reverse(xs) expects a list as argument xs, but ' + 'encountered ' + xs)
  }
  var result = []
  for (; !is_empty_list(xs); xs = tail(xs)) {
    result = pair(head(xs), result)
  }
  return result
}
reverse.__SOURCE__ = 'reverse(xs)'

// append first argument list and second argument list.
// In the result, the [] at the end of the first argument list
// is replaced by the second argument list
// append throws an exception if the first argument is not a list
export function append(xs: List, ys: List): List {
  if (is_empty_list(xs)) {
    return ys
  } else {
    return pair(head(xs), append(tail(xs), ys))
  }
}
append.__SOURCE__ = 'append(xs, ys)'

// member looks for a given first-argument element in a given
// second argument list. It returns the first postfix sublist
// that starts with the given element. It returns [] if the
// element does not occur in the list
export function member(v: Value, xs: List) {
  for (; !is_empty_list(xs); xs = tail(xs)) {
    if (head(xs) === v) {
      return xs
    }
  }
  return []
}
member.__SOURCE__ = 'member(x, xs)'

// removes the first occurrence of a given first-argument element
// in a given second-argument list. Returns the original list
// if there is no occurrence.
export function remove(v: Value, xs: List): List {
  if (is_empty_list(xs)) {
    return []
  } else {
    if (v === head(xs)) {
      return tail(xs)
    } else {
      return pair(head(xs), remove(v, tail(xs)))
    }
  }
}
remove.__SOURCE__ = 'remove(x, xs)'

// Similar to remove. But removes all instances of v instead of just the first
export function remove_all(v: Value, xs: List): List {
  if (is_empty_list(xs)) {
    return []
  } else {
    if (v === head(xs)) {
      return remove_all(v, tail(xs))
    } else {
      return pair(head(xs), remove_all(v, tail(xs)))
    }
  }
}
remove_all.__SOURCE__ = 'remove_all(x, xs)'
// for backwards-compatibility
export const removeAll = remove_all

// equal computes the structural equality
// over its arguments
export function equal(item1: Value, item2: Value): boolean {
  if (is_pair(item1) && is_pair(item2)) {
    return equal(head(item1), head(item2)) && equal(tail(item1), tail(item2))
  } else if (array_test(item1) && item1.length === 0 && array_test(item2) && item2.length === 0) {
    return true
  } else {
    return item1 === item2
  }
}
equal.__SOURCE__ = 'equal(x, y)'

// assoc treats the second argument as an association,
// a list of (index,value) pairs.
// assoc returns the first (index,value) pair whose
// index equal (using structural equality) to the given
// first argument v. Returns false if there is no such
// pair
export function assoc(v: Value, xs: List): boolean {
  if (is_empty_list(xs)) {
    return false
  } else if (equal(v, head(head(xs)))) {
    return head(xs)
  } else {
    return assoc(v, tail(xs))
  }
}
assoc.__SOURCE__ = 'assoc(v, xs)'

// filter returns the sublist of elements of given list xs
// for which the given predicate function returns true.
export function filter(pred: Function, xs: List): List {
  if (is_empty_list(xs)) {
    return xs
  } else {
    if (pred(head(xs))) {
      return pair(head(xs), filter(pred, tail(xs)))
    } else {
      return filter(pred, tail(xs))
    }
  }
}
filter.__SOURCE__ = 'filter(pred, xs)'

// enumerates numbers starting from start,
// using a step size of 1, until the number
// exceeds end.
export function enum_list(start: number, end: number): List {
  if (start > end) {
    return []
  } else {
    return pair(start, enum_list(start + 1, end))
  }
}
enum_list.__SOURCE__ = 'enum_list(start, end)'

// Returns the item in list lst at index n (the first item is at position 0)
export function list_ref(xs: List, n: number) {
  if (n < 0) {
    throw new Error(
      'list_ref(xs, n) expects a positive integer as ' + 'argument n, but encountered ' + n
    )
  }

  for (; n > 0; --n) {
    xs = tail(xs)
  }
  return head(xs)
}
list_ref.__SOURCE__ = 'list_ref(xs, n)'

// accumulate applies given operation op to elements of a list
// in a right-to-left order, first apply op to the last element
// and an initial element, resulting in r1, then to the
// second-last element and r1, resulting in r2, etc, and finally
// to the first element and r_n-1, where n is the length of the
// list.
// accumulate(op,zero,list(1,2,3)) results in
// op(1, op(2, op(3, zero)))

export function accumulate<T>(op: (value: Value, acc: T) => T, initial: T, sequence: List): T {
  if (is_empty_list(sequence)) {
    return initial
  } else {
    return op(head(sequence), accumulate(op, initial, tail(sequence)))
  }
}
accumulate.__SOURCE__ = 'accumulate(op, initial, xs)'

// set_head(xs,x) changes the head of given pair xs to be x,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE

export function set_head(xs: List, x: Value) {
  if (is_pair(xs)) {
    xs[0] = x
    return undefined
  } else {
    throw new Error(
      'set_head(xs,x) expects a pair as ' + 'argument xs, but encountered ' + toString(xs)
    )
  }
}
set_head.__SOURCE__ = 'set_head(xs, x)'

// set_tail(xs,x) changes the tail of given pair xs to be x,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE

export function set_tail(xs: List, x: Value) {
  if (is_pair(xs)) {
    xs[1] = x
    return undefined
  } else {
    throw new Error(
      'set_tail(xs,x) expects a pair as ' + 'argument xs, but encountered ' + toString(xs)
    )
  }
}
set_tail.__SOURCE__ = 'set_tail(xs, x)'
// tslint:enable
