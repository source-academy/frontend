/* tslint:disable: max-classes-per-file */
import * as es from 'estree'
import * as constants from './constants'
import { toJS } from './interop'
import * as errors from './interpreter-errors'
import { ArrowClosure, Closure, Context, ErrorSeverity, Frame, SourceError, Value } from './types'
import { createNode } from './utils/node'
import * as rttc from './utils/rttc'

class ReturnValue {
  constructor(public value: Value) {}
}

class BreakValue {}

class ContinueValue {}

class TailCallReturnValue {
  constructor(public callee: Closure, public args: Value[], public node: es.CallExpression) {}
}

const createFrame = (
  closure: ArrowClosure | Closure,
  args: Value[],
  callExpression?: es.CallExpression
): Frame => {
  const frame: Frame = {
    name: closure.name, // TODO: Change this
    parent: closure.frame,
    environment: {}
  }
  if (callExpression) {
    frame.callExpression = {
      ...callExpression,
      arguments: args.map(a => createNode(a) as es.Expression)
    }
  }
  closure.node.params.forEach((param, index) => {
    const ident = param as es.Identifier
    frame.environment[ident.name] = args[index]
  })
  return frame
}

const handleError = (context: Context, error: SourceError) => {
  context.errors.push(error)
  if (error.severity === ErrorSeverity.ERROR) {
    const globalFrame = context.runtime.frames[context.runtime.frames.length - 1]
    context.runtime.frames = [globalFrame]
    throw error
  } else {
    return context
  }
}

function defineVariable(context: Context, name: string, value: Value) {
  const frame = context.runtime.frames[0]

  if (frame.environment.hasOwnProperty(name)) {
    handleError(context, new errors.VariableRedeclaration(context.runtime.nodes[0]!, name))
  }

  frame.environment[name] = value

  return frame
}
function* visit(context: Context, node: es.Node) {
  context.runtime.nodes.unshift(node)
  yield context
}
function* leave(context: Context) {
  context.runtime.nodes.shift()
  yield context
}
const currentFrame = (context: Context) => context.runtime.frames[0]
const replaceFrame = (context: Context, frame: Frame) => (context.runtime.frames[0] = frame)
const popFrame = (context: Context) => context.runtime.frames.shift()
const pushFrame = (context: Context, frame: Frame) => context.runtime.frames.unshift(frame)

const getVariable = (context: Context, name: string) => {
  let frame: Frame | null = context.runtime.frames[0]
  while (frame) {
    if (frame.environment.hasOwnProperty(name)) {
      return frame.environment[name]
    } else {
      frame = frame.parent
    }
  }
  handleError(context, new errors.UndefinedVariable(name, context.runtime.nodes[0]))
}

const setVariable = (context: Context, name: string, value: any) => {
  let frame: Frame | null = context.runtime.frames[0]
  while (frame) {
    if (frame.environment.hasOwnProperty(name)) {
      frame.environment[name] = value
      return
    } else {
      frame = frame.parent
    }
  }
  handleError(context, new errors.UndefinedVariable(name, context.runtime.nodes[0]))
}

const checkNumberOfArguments = (
  context: Context,
  callee: ArrowClosure | Closure,
  args: Value[],
  exp: es.CallExpression
) => {
  if (callee.node.params.length !== args.length) {
    const error = new errors.InvalidNumberOfArguments(exp, callee.node.params.length, args.length)
    handleError(context, error)
  }
}

function* getArgs(context: Context, call: es.CallExpression) {
  const args = []
  for (const arg of call.arguments) {
    args.push(yield* evaluate(arg, context))
  }
  return args
}

export type Evaluator<T extends es.Node> = (node: T, context: Context) => IterableIterator<Value>

export const evaluators: { [nodeType: string]: Evaluator<es.Node> } = {
  /** Simple Values */
  *Literal(node: es.Literal, context: Context) {
    return node.value
  },
  *ThisExpression(node: es.ThisExpression, context: Context) {
    return context.runtime.frames[0].thisContext
  },
  *ArrayExpression(node: es.ArrayExpression, context: Context) {
    const res = []
    for (const n of node.elements) {
      res.push(yield* evaluate(n, context))
    }
    return res
  },
  *FunctionExpression(node: es.FunctionExpression, context: Context) {
    return new Closure(node, currentFrame(context), context)
  },
  *ArrowFunctionExpression(node: es.Function, context: Context) {
    return new ArrowClosure(node, currentFrame(context), context)
  },
  *Identifier(node: es.Identifier, context: Context) {
    return getVariable(context, node.name)
  },
  *CallExpression(node: es.CallExpression, context: Context) {
    const callee = yield* evaluate(node.callee, context)
    const args = yield* getArgs(context, node)
    let thisContext
    if (node.callee.type === 'MemberExpression') {
      thisContext = yield* evaluate(node.callee.object, context)
    }
    const result = yield* apply(context, callee, args, node, thisContext)
    return result
  },
  *NewExpression(node: es.NewExpression, context: Context) {
    const callee = yield* evaluate(node.callee, context)
    const args = []
    for (const arg of node.arguments) {
      args.push(yield* evaluate(arg, context))
    }
    const obj: Value = {}
    if (callee instanceof Closure) {
      obj.__proto__ = callee.fun.prototype
      callee.fun.apply(obj, args)
    } else {
      obj.__proto__ = callee.prototype
      callee.apply(obj, args)
    }
    return obj
  },
  *UnaryExpression(node: es.UnaryExpression, context: Context) {
    const value = yield* evaluate(node.argument, context)

    const error = rttc.checkUnaryExpression(context, node.operator, value)
    if (error) {
      handleError(context, error)
      return undefined
    }

    if (node.operator === '!') {
      return !value
    } else if (node.operator === '-') {
      return -value
    } else {
      return +value
    }
  },
  *BinaryExpression(node: es.BinaryExpression, context: Context) {
    const left = yield* evaluate(node.left, context)
    const right = yield* evaluate(node.right, context)

    const error = rttc.checkBinaryExpression(context, node.operator, left, right)
    if (error) {
      handleError(context, error)
      return undefined
    }

    let result
    switch (node.operator) {
      case '+':
        result = left + right
        break
      case '-':
        result = left - right
        break
      case '*':
        result = left * right
        break
      case '/':
        result = left / right
        break
      case '%':
        result = left % right
        break
      case '===':
        result = left === right
        break
      case '!==':
        result = left !== right
        break
      case '<=':
        result = left <= right
        break
      case '<':
        result = left < right
        break
      case '>':
        result = left > right
        break
      case '>=':
        result = left >= right
        break
      default:
        result = undefined
    }
    return result
  },
  *ConditionalExpression(node: es.ConditionalExpression, context: Context) {
    return yield* this.IfStatement(node, context)
  },
  *LogicalExpression(node: es.LogicalExpression, context: Context) {
    const left = yield* evaluate(node.left, context)
    let error = rttc.checkLogicalExpression(context, left, true)
    if (error) {
      handleError(context, error)
      return undefined
    } else if ((node.operator === '&&' && left) || (node.operator === '||' && !left)) {
      // only evaluate right if required (lazy); but when we do, check typeof right
      const right = yield* evaluate(node.right, context)
      error = rttc.checkLogicalExpression(context, left, right)
      if (error) {
        handleError(context, error)
        return undefined
      } else {
        return right
      }
    } else {
      return left
    }
  },
  *VariableDeclaration(node: es.VariableDeclaration, context: Context) {
    const declaration = node.declarations[0]
    const id = declaration.id as es.Identifier
    const value = yield* evaluate(declaration.init!, context)
    defineVariable(context, id.name, value)
    return undefined
  },
  *ContinueStatement(node: es.ContinueStatement, context: Context) {
    return new ContinueValue()
  },
  *BreakStatement(node: es.BreakStatement, context: Context) {
    return new BreakValue()
  },
  *ForStatement(node: es.ForStatement, context: Context) {
    if (node.init) {
      yield* evaluate(node.init, context)
    }
    let test = node.test ? yield* evaluate(node.test, context) : true
    let value
    while (test) {
      value = yield* evaluate(node.body, context)
      if (value instanceof ContinueValue) {
        value = undefined
      }
      if (value instanceof BreakValue) {
        value = undefined
        break
      }
      if (value instanceof ReturnValue) {
        break
      }
      if (node.update) {
        yield* evaluate(node.update, context)
      }
      test = node.test ? yield* evaluate(node.test, context) : true
    }
    if (value instanceof BreakValue) {
      return undefined
    }
    return value
  },
  *MemberExpression(node: es.MemberExpression, context: Context) {
    let obj = yield* evaluate(node.object, context)
    if (obj instanceof Closure) {
      obj = obj.fun
    }
    if (node.computed) {
      const prop = yield* evaluate(node.property, context)
      return obj[prop]
    } else {
      const name = (node.property as es.Identifier).name
      if (name === 'prototype') {
        return obj.prototype
      } else {
        return obj[name]
      }
    }
  },
  *AssignmentExpression(node: es.AssignmentExpression, context: Context) {
    if (node.left.type === 'MemberExpression') {
      const left = node.left
      const obj = yield* evaluate(left.object, context)
      let prop
      if (left.computed) {
        prop = yield* evaluate(left.property, context)
      } else {
        prop = (left.property as es.Identifier).name
      }
      const val = yield* evaluate(node.right, context)
      obj[prop] = val
      return val
    }
    const id = node.left as es.Identifier
    // Make sure it exist
    const value = yield* evaluate(node.right, context)
    setVariable(context, id.name, value)
    return value
  },
  *FunctionDeclaration(node: es.FunctionDeclaration, context: Context) {
    const id = node.id as es.Identifier
    // tslint:disable-next-line:no-any
    const closure = new Closure(node as any, currentFrame(context), context)
    defineVariable(context, id.name, closure)
    return undefined
  },
  *IfStatement(node: es.IfStatement, context: Context) {
    const test = yield* evaluate(node.test, context)
    const error = rttc.checkIfStatement(context, test)
    if (error) {
      handleError(context, error)
      return undefined
    }

    if (test) {
      return yield* evaluate(node.consequent, context)
    } else if (node.alternate) {
      return yield* evaluate(node.alternate, context)
    } else {
      return undefined
    }
  },
  *ExpressionStatement(node: es.ExpressionStatement, context: Context) {
    return yield* evaluate(node.expression, context)
  },
  *ReturnStatement(node: es.ReturnStatement, context: Context) {
    if (node.argument) {
      if (node.argument.type === 'CallExpression') {
        const callee = yield* evaluate(node.argument.callee, context)
        const args = yield* getArgs(context, node.argument)
        return new TailCallReturnValue(callee, args, node.argument)
      } else {
        return new ReturnValue(yield* evaluate(node.argument, context))
      }
    } else {
      return new ReturnValue(undefined)
    }
  },
  *WhileStatement(node: es.WhileStatement, context: Context) {
    let value: any // tslint:disable-line
    let test
    while (
      // tslint:disable-next-line
      (test = yield* evaluate(node.test, context)) &&
      !(value instanceof ReturnValue) &&
      !(value instanceof BreakValue) &&
      !(value instanceof TailCallReturnValue)
    ) {
      value = yield* evaluate(node.body, context)
    }
    if (value instanceof BreakValue) {
      return undefined
    }
    return value
  },
  *ObjectExpression(node: es.ObjectExpression, context: Context) {
    const obj = {}
    for (const prop of node.properties) {
      let key
      if (prop.key.type === 'Identifier') {
        key = prop.key.name
      } else {
        key = yield* evaluate(prop.key, context)
      }
      obj[key] = yield* evaluate(prop.value, context)
    }
    return obj
  },
  *BlockStatement(node: es.BlockStatement, context: Context) {
    let result: Value
    for (const statement of node.body) {
      result = yield* evaluate(statement, context)
      if (
        result instanceof ReturnValue ||
        result instanceof BreakValue ||
        result instanceof ContinueValue
      ) {
        break
      }
    }
    return result
  },
  *Program(node: es.BlockStatement, context: Context) {
    let result: Value
    for (const statement of node.body) {
      result = yield* evaluate(statement, context)
      if (result instanceof ReturnValue) {
        break
      }
    }
    return result
  }
}

export function* evaluate(node: es.Node, context: Context) {
  yield* visit(context, node)
  const result = yield* evaluators[node.type](node, context)
  yield* leave(context)
  return result
}

export function* apply(
  context: Context,
  fun: ArrowClosure | Closure | Value,
  args: Value[],
  node?: es.CallExpression,
  thisContext?: Value
) {
  let result: Value
  let total = 0

  while (!(result instanceof ReturnValue)) {
    if (fun instanceof Closure) {
      checkNumberOfArguments(context, fun, args, node!)
      const frame = createFrame(fun, args, node)
      frame.thisContext = thisContext
      if (result instanceof TailCallReturnValue) {
        replaceFrame(context, frame)
      } else {
        pushFrame(context, frame)
        total++
      }
      result = yield* evaluate(fun.node.body, context)
      if (result instanceof TailCallReturnValue) {
        fun = result.callee
        node = result.node
        args = result.args
      } else if (!(result instanceof ReturnValue)) {
        // No Return Value, set it as undefined
        result = new ReturnValue(undefined)
      }
    } else if (fun instanceof ArrowClosure) {
      checkNumberOfArguments(context, fun, args, node!)
      const frame = createFrame(fun, args, node)
      frame.thisContext = thisContext
      if (result instanceof TailCallReturnValue) {
        replaceFrame(context, frame)
      } else {
        pushFrame(context, frame)
        total++
      }
      result = new ReturnValue(yield* evaluate(fun.node.body, context))
    } else if (typeof fun === 'function') {
      try {
        const as = args.map(a => toJS(a, context))
        result = fun.apply(thisContext, as)
        break
      } catch (e) {
        // Recover from exception
        const globalFrame = context.runtime.frames[context.runtime.frames.length - 1]
        context.runtime.frames = [globalFrame]
        const loc = node ? node.loc! : constants.UNKNOWN_LOCATION
        handleError(context, new errors.ExceptionError(e, loc))
        result = undefined
      }
    } else {
      handleError(context, new errors.CallingNonFunctionValue(fun, node))
      result = undefined
      break
    }
  }
  // Unwraps return value and release stack frame
  if (result instanceof ReturnValue) {
    result = result.value
  }
  for (let i = 1; i <= total; i++) {
    popFrame(context)
  }
  return result
}
