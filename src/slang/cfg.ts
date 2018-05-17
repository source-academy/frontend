import { base, recursive, Walker, Walkers } from 'acorn/dist/walk'
import * as es from 'estree'
import * as invariant from 'invariant'

import { Types } from './constants'
import { CFG, Context } from './types'
import { composeWalker } from './utils/node'

const freshLambda = (() => {
  let id = 0
  return () => {
    id++
    return 'lambda_' + id
  }
})()

const walkers: Walkers<{}> = {}

let nodeStack: es.Node[] = []
let scopeQueue: CFG.Scope[] = []
let edgeLabel: CFG.EdgeLabel = 'next'

const currentScope = () => scopeQueue[0]!

const connect = (node: es.Node, context: Context) => {
  // Empty node stack, connect all of them with node
  let lastNode = nodeStack.pop()
  const vertex = context.cfg.nodes[node.__id!]

  // If there is no last node, this is the first node in the scope.
  if (!lastNode) {
    currentScope().entry = vertex
  }
  while (lastNode) {
    // Connect previously visited node with this node
    context.cfg.edges[lastNode.__id!].push({
      type: edgeLabel,
      to: vertex
    })
    lastNode = nodeStack.pop()
  }
  // Reset edge label
  edgeLabel = 'next'
  nodeStack.push(node)
}

const exitScope = (context: Context) => {
  while (nodeStack.length > 0) {
    const node = nodeStack.shift()!
    const vertex = context.cfg.nodes[node.__id!]
    currentScope().exits.push(vertex)
  }
}

walkers.ExpressionStatement = composeWalker(connect, base.ExpressionStatement)
walkers.VariableDeclaration = composeWalker(connect, base.VariableDeclaration)

const walkIfStatement: Walker<es.IfStatement, Context> = (node, context, recurse) => {
  const test = node.test as es.Node
  let consequentExit
  let alternateExit
  // Connect test with previous node
  connect(test, context)

  // Process the consequent branch
  edgeLabel = 'consequent'
  recurse(node.consequent, context)
  // Remember exits from consequent
  consequentExit = nodeStack
  // Process the alternate branch
  if (node.alternate) {
    const alternate = node.alternate
    edgeLabel = 'alternate'
    nodeStack = [test]
    recurse(alternate, context)
    alternateExit = nodeStack
  }
  // Restore node Stack to consequent exits
  nodeStack = consequentExit
  // Add alternate exits if any
  if (alternateExit) {
    nodeStack = nodeStack.concat(alternateExit)
  }
}
walkers.IfStatement = walkIfStatement

const walkReturnStatement: Walker<es.ReturnStatement, Context> = (node, state) => {
  connect(node, state)
  exitScope(state)
}
walkers.ReturnStatement = composeWalker(base.ReturnStatement, walkReturnStatement)

const walkFunction: Walker<es.FunctionDeclaration | es.FunctionExpression, Context> = (
  node,
  context,
  recurse
) => {
  // Check whether function declaration is from outer scope or its own
  if (scopeQueue[0].node !== node) {
    connect(node, context)
    const name = node.id ? node.id.name : freshLambda()
    const scope: CFG.Scope = {
      name,
      type: Types.ANY,
      node,
      parent: currentScope(),
      exits: [],
      env: {}
    }
    scopeQueue.push(scope!)
    context.cfg.scopes.push(scope)
  } else {
    node.body.body.forEach(child => {
      recurse(child, context)
    })
    exitScope(context)
  }
}
walkers.FunctionDeclaration = walkers.FunctionExpression = walkFunction

const walkProgram: Walker<es.Program, Context> = (node, context, recurse) => {
  exitScope(context)
}
walkers.Program = composeWalker(base.Program, walkProgram)

export const generateCFG = (context: Context) => {
  invariant(
    context.cfg.scopes.length >= 1,
    `context.cfg.scopes must contain
  exactly the global scope before generating CFG`
  )
  invariant(
    context.cfg.scopes[0].node,
    `context.cfg.scopes[0] node
  must be a program from the parser`
  )
  // Reset states
  nodeStack = []
  scopeQueue = [context.cfg.scopes[0]]
  edgeLabel = 'next'

  // Process Node BFS style
  while (scopeQueue.length > 0) {
    const current = scopeQueue[0].node!
    recursive(current, context, walkers)
    scopeQueue.shift()
  }
}
