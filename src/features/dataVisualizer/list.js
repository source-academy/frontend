// list.js: Supporting lists in the Scheme style, using pairs made
//          up of two-element JavaScript array (vector)

// Author: Martin Henz

// Note: this library is used in the externalLibs of the frontend.
// It is distinct from the LISTS library of Source §2, which contains
// primitive and predeclared functions from Chapter 2 of SICP JS.

// 'use strict'
// array test works differently for Rhino and
// the Firefox environment (especially Web Console)
export function array_test(x) {
  if (Array.isArray === undefined) {
    return x instanceof Array;
  } else {
    return Array.isArray(x);
  }
}

// pair constructs a pair using a two-element array
// LOW-LEVEL FUNCTION, NOT SOURCE
export function pair(x, xs) {
  return [x, xs];
}

// is_pair returns true iff arg is a two-element array
// LOW-LEVEL FUNCTION, NOT SOURCE
export function is_pair(x) {
  return array_test(x) && x.length === 2;
}

// head returns the first component of the given pair,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE
export function head(xs) {
  if (is_pair(xs)) {
    return xs[0];
  } else {
    throw new Error('head(xs) expects a pair as argument xs, but encountered ' + xs);
  }
}

// tail returns the second component of the given pair
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE
export function tail(xs) {
  if (is_pair(xs)) {
    return xs[1];
  } else {
    throw new Error('tail(xs) expects a pair as argument xs, but encountered ' + xs);
  }
}

// is_null returns true if arg is exactly null
// LOW-LEVEL FUNCTION, NOT SOURCE
export function is_null(xs) {
  return xs === null;
}

// is_list recurses down the list and checks that it ends with the empty list []
// does not throw Value exceptions
// LOW-LEVEL FUNCTION, NOT SOURCE
export function is_list(xs) {
  for (; ; xs = tail(xs)) {
    if (is_null(xs)) {
      return true;
    } else if (!is_pair(xs)) {
      return false;
    }
  }
}

// list makes a list out of its arguments
// LOW-LEVEL FUNCTION, NOT SOURCE
export function list() {
  let the_list = null;
  for (let i = arguments.length - 1; i >= 0; i--) {
    the_list = pair(arguments[i], the_list);
  }
  return the_list;
}

// list_to_vector returns vector that contains the elements of the argument list
// in the given order.
// list_to_vector throws an exception if the argument is not a list
// LOW-LEVEL FUNCTION, NOT SOURCE
export function list_to_vector(lst) {
  const vector = [];
  while (!is_null(lst)) {
    vector.push(head(lst));
    lst = tail(lst);
  }
  return vector;
}

// vector_to_list returns a list that contains the elements of the argument vector
// in the given order.
// vector_to_list throws an exception if the argument is not a vector
// LOW-LEVEL FUNCTION, NOT SOURCE
export function vector_to_list(vector) {
  let result = null;
  for (let i = vector.length - 1; i >= 0; i = i - 1) {
    result = pair(vector[i], result);
  }
  return result;
}

// returns the length of a given argument list
// throws an exception if the argument is not a list
export function length(xs) {
  let i = 0;
  while (!is_null(xs)) {
    i += 1;
    xs = tail(xs);
  }
  return i;
}

// map applies first arg f to the elements of the second argument,
// assumed to be a list.
// f is applied element-by-element:
// map(f,[1,[2,[]]]) results in [f(1),[f(2),[]]]
// map throws an exception if the second argument is not a list,
// and if the second argument is a non-empty list and the first
// argument is not a function.
// tslint:disable-next-line:ban-types
export function map(f, xs) {
  return is_null(xs) ? null : pair(f(head(xs)), map(f, tail(xs)));
}

// build_list takes a non-negative integer n as first argument,
// and a function fun as second argument.
// build_list returns a list of n elements, that results from
// applying fun to the numbers from 0 to n-1.
// tslint:disable-next-line:ban-types
export function build_list(n, fun) {
  if (typeof n !== 'number' || n < 0 || Math.floor(n) !== n) {
    throw new Error(
      'build_list(n, fun) expects a positive integer as argument n, but encountered ' + n
    );
  }

  // tslint:disable-next-line:ban-types
  function build(i, alreadyBuilt) {
    if (i < 0) {
      return alreadyBuilt;
    } else {
      return build(i - 1, pair(fun(i), alreadyBuilt));
    }
  }

  return build(n - 1, null);
}

// for_each applies first arg fun to the elements of the list passed as
// second argument. fun is applied element-by-element:
// for_each(fun,[1,[2,[]]]) results in the calls fun(1) and fun(2).
// for_each returns true.
// for_each throws an exception if the second argument is not a list,
// and if the second argument is a non-empty list and the
// first argument is not a function.
// tslint:disable-next-line:ban-types
export function for_each(fun, xs) {
  if (!is_list(xs)) {
    throw new Error('for_each expects a list as argument xs, but encountered ' + xs);
  }
  for (; !is_null(xs); xs = tail(xs)) {
    fun(head(xs));
  }
  return true;
}

// reverse reverses the argument list
// reverse throws an exception if the argument is not a list.
export function reverse(xs) {
  if (!is_list(xs)) {
    throw new Error('reverse(xs) expects a list as argument xs, but encountered ' + xs);
  }
  let result = null;
  for (; !is_null(xs); xs = tail(xs)) {
    result = pair(head(xs), result);
  }
  return result;
}

// append first argument list and second argument list.
// In the result, the [] at the end of the first argument list
// is replaced by the second argument list
// append throws an exception if the first argument is not a list
export function append(xs, ys) {
  if (is_null(xs)) {
    return ys;
  } else {
    return pair(head(xs), append(tail(xs), ys));
  }
}

// member looks for a given first-argument element in a given
// second argument list. It returns the first postfix sublist
// that starts with the given element. It returns [] if the
// element does not occur in the list
export function member(v, xs) {
  for (; !is_null(xs); xs = tail(xs)) {
    if (head(xs) === v) {
      return xs;
    }
  }
  return null;
}

// removes the first occurrence of a given first-argument element
// in a given second-argument list. Returns the original list
// if there is no occurrence.
export function remove(v, xs) {
  if (is_null(xs)) {
    return null;
  } else {
    if (v === head(xs)) {
      return tail(xs);
    } else {
      return pair(head(xs), remove(v, tail(xs)));
    }
  }
}

// Similar to remove. But removes all instances of v instead of just the first
export function remove_all(v, xs) {
  if (is_null(xs)) {
    return null;
  } else {
    if (v === head(xs)) {
      return remove_all(v, tail(xs));
    } else {
      return pair(head(xs), remove_all(v, tail(xs)));
    }
  }
}

// for backwards-compatibility
// equal computes the structural equality
// over its arguments
export function equal(item1, item2) {
  if (is_pair(item1) && is_pair(item2)) {
    return equal(head(item1), head(item2)) && equal(tail(item1), tail(item2));
  } else {
    return item1 === item2;
  }
}

// assoc treats the second argument as an association,
// a list of (index,value) pairs.
// assoc returns the first (index,value) pair whose
// index equal (using structural equality) to the given
// first argument v. Returns false if there is no such
// pair
export function assoc(v, xs) {
  if (is_null(xs)) {
    return false;
  } else if (equal(v, head(head(xs)))) {
    return head(xs);
  } else {
    return assoc(v, tail(xs));
  }
}

// filter returns the sublist of elements of given list xs
// for which the given predicate function returns true.
// tslint:disable-next-line:ban-types
export function filter(pred, xs) {
  if (is_null(xs)) {
    return xs;
  } else {
    if (pred(head(xs))) {
      return pair(head(xs), filter(pred, tail(xs)));
    } else {
      return filter(pred, tail(xs));
    }
  }
}

// enumerates numbers starting from start,
// using a step size of 1, until the number
// exceeds end.
export function enum_list(start, end) {
  if (typeof start !== 'number') {
    throw new Error(
      'enum_list(start, end) expects a number as argument start, but encountered ' + start
    );
  }
  if (typeof end !== 'number') {
    throw new Error(
      'enum_list(start, end) expects a number as argument start, but encountered ' + end
    );
  }
  if (start > end) {
    return null;
  } else {
    return pair(start, enum_list(start + 1, end));
  }
}

// Returns the item in list lst at index n (the first item is at position 0)
export function list_ref(xs, n) {
  if (typeof n !== 'number' || n < 0 || Math.floor(n) !== n) {
    throw new Error(
      'list_ref(xs, n) expects a positive integer as argument n, but encountered ' + n
    );
  }
  for (; n > 0; --n) {
    xs = tail(xs);
  }
  return head(xs);
}

// accumulate applies given operation op to elements of a list
// in a right-to-left order, first apply op to the last element
// and an initial element, resulting in r1, then to the
// second-last element and r1, resulting in r2, etc, and finally
// to the first element and r_n-1, where n is the length of the
// list.
// accumulate(op,zero,list(1,2,3)) results in
// op(1, op(2, op(3, zero)))
export function accumulate(op, initial, sequence) {
  if (is_null(sequence)) {
    return initial;
  } else {
    return op(head(sequence), accumulate(op, initial, tail(sequence)));
  }
}

// set_head(xs,x) changes the head of given pair xs to be x,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE
export function set_head(xs, x) {
  if (is_pair(xs)) {
    xs[0] = x;
    return undefined;
  } else {
    throw new Error('set_head(xs,x) expects a pair as argument xs, but encountered ' + xs);
  }
}

// set_tail(xs,x) changes the tail of given pair xs to be x,
// throws an exception if the argument is not a pair
// LOW-LEVEL FUNCTION, NOT SOURCE
export function set_tail(xs, x) {
  if (is_pair(xs)) {
    xs[1] = x;
    return undefined;
  } else {
    throw new Error('set_tail(xs,x) expects a pair as argument xs, but encountered ' + xs);
  }
}
