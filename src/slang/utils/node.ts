/**
 * Utility functions to work with the AST (Abstract Syntax Tree)
 */
import * as es from 'estree'
import { Walker, SimpleWalker } from 'acorn/dist/walk'
import { Closure, Value } from '../types'

/**
 * Check whether two nodes are equal.
 *
 * Two nodes are equal if their `__id` field are equal, or
 * if they have `__call`, the `__call` field is checked instead.
 *
 * @param n1 First node
 * @param n2 Second node
 */
export const isNodeEqual = (n1: es.Node, n2: es.Node) => {
  if (n1.hasOwnProperty('__id') && n2.hasOwnProperty('__id')) {
    const first = n1.__id === n2.__id
    if (!first) {
      return false
    }
    if (n1.hasOwnProperty('__call') && n2.hasOwnProperty('__call')) {
      return n1.__call === n2.__call
    } else {
      return true
    }
  } else {
    return n1 === n2
  }
}

/**
 * Non-destructively search for a node in a parent node and replace it with another node.
 *
 * @param node The root node to be searched
 * @param before Node to be replaced
 * @param after Replacement node
 */
export const replaceAST = (node: es.Node, before: es.Node, after: es.Node) => {
  let found = false

  const go = (n: es.Node): {} => {
    if (found) {
      return n
    }

    if (isNodeEqual(n, before)) {
      found = true
      return after
    }

    if (n.type === 'CallExpression') {
      return { ...n, callee: go(n.callee), arguments: n.arguments.map(go) }
    } else if (n.type === 'ConditionalExpression') {
      return {
        ...n,
        test: go(n.test),
        consequent: go(n.consequent),
        alternate: go(n.alternate)
      }
    } else if (n.type === 'UnaryExpression') {
      return { ...n, argument: go(n.argument) }
    } else if (n.type === 'BinaryExpression' || n.type === 'LogicalExpression') {
      return { ...n, left: go(n.left), right: go(n.right) }
    } else {
      return n
    }
  }

  return go(node)
}

const createLiteralNode = (value: {}): es.Node => {
  if (typeof value === 'undefined') {
    return {
      type: 'Identifier',
      name: 'undefined',
      __id: freshId()
    }
  } else {
    return {
      type: 'Literal',
      value,
      raw: value,
      __id: freshId()
    }
  }
}

const freshId = (() => {
  let id = 0

  return () => {
    id++
    return '__syn' + id
  }
})()

/**
 * Create an AST node from a Source value.
 *
 * @param value any valid Source value (number/string/boolean/Closure)
 * @returns {Node}
 */
export const createNode = (value: Value): es.Node => {
  if (value instanceof Closure) {
    return value.node
  }
  return createLiteralNode(value)
}

export const composeWalker = <S, T extends es.Node>(w1: Walker<T, S>, w2: Walker<T, S>) => {
  return (node: T, state: S, recurse: SimpleWalker<S>) => {
    w1(node, state, recurse)
    w2(node, state, recurse)
  }
}
