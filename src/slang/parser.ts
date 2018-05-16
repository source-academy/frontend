import * as es from 'estree'
import { parse as acornParse, Options as AcornOptions, Position } from 'acorn'
import { stripIndent } from 'common-tags'
import { simple } from 'acorn/dist/walk'
import { SourceError, ErrorType, ErrorSeverity, Context } from './types'
import syntaxTypes from './syntaxTypes'
import rules from './rules'

export type ParserOptions = {
  week: number
}

export class DisallowedConstructError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR
  nodeType: string

  constructor(public node: es.Node) {
    this.nodeType = this.splitNodeType()
  }

  get location() {
    return this.node.loc!
  }

  explain() {
    return `${this.nodeType} is not allowed`
  }

  elaborate() {
    return stripIndent`
      You are trying to use ${this.nodeType}, which is not yet allowed (yet).
    `
  }

  private splitNodeType() {
    const nodeType = this.node.type
    const tokens: string[] = []
    let soFar = ''
    for (let i = 0; i < nodeType.length; i++) {
      const isUppercase = nodeType[i] === nodeType[i].toUpperCase()
      if (isUppercase && i > 0) {
        tokens.push(soFar)
        soFar = ''
      } else {
        soFar += nodeType[i]
      }
    }
    return tokens.join(' ')
  }
}

export class FatalSyntaxError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR
  constructor(public location: es.SourceLocation, public message: string) {}

  explain() {
    return this.message
  }

  elaborate() {
    return 'There is a syntax error in your program'
  }
}

export class MissingSemicolonError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR
  constructor(public location: es.SourceLocation) {}

  explain() {
    return 'Missing semicolon at the end of statement'
  }

  elaborate() {
    return 'Every statement must be terminated by a semicolon.'
  }
}

export class TrailingCommaError implements SourceError {
  type: ErrorType.SYNTAX
  severity: ErrorSeverity.WARNING
  constructor(public location: es.SourceLocation) {}

  explain() {
    return 'Trailing comma'
  }

  elaborate() {
    return 'Please remove the trailing comma'
  }
}

export const freshId = (() => {
  let id = 0
  return () => {
    id++
    return 'node_' + id
  }
})()

function compose<T extends es.Node, S>(
  w1: (node: T, state: S) => void,
  w2: (node: T, state: S) => void
) {
  return (node: T, state: S) => {
    w1(node, state)
    w2(node, state)
  }
}

const walkers: {
  [name: string]: (node: es.Node, context: Context) => void
} = {}

for (const type of Object.keys(syntaxTypes)) {
  walkers[type] = (node: es.Node, context: Context) => {
    const id = freshId()
    Object.defineProperty(node, '__id', {
      enumerable: true,
      configurable: false,
      writable: false,
      value: id
    })
    context.cfg.nodes[id] = {
      id,
      node,
      scope: undefined,
      usages: []
    }
    context.cfg.edges[id] = []
    if (syntaxTypes[node.type] > context.week) {
      context.errors.push(new DisallowedConstructError(node))
    }
  }
}

const createAcornParserOptions = (context: Context): AcornOptions => ({
  sourceType: 'script',
  ecmaVersion: 6,
  locations: true,
  // tslint:disable-next-line:no-any
  onInsertedSemicolon(end: any, loc: any) {
    context.errors.push(
      new MissingSemicolonError({
        end: { line: loc.line, column: loc.column + 1 },
        start: loc
      })
    )
  },
  // tslint:disable-next-line:no-any
  onTrailingComma(end: any, loc: Position) {
    context.errors.push(
      new TrailingCommaError({
        end: { line: loc.line, column: loc.column + 1 },
        start: loc
      })
    )
  }
})

rules.forEach(rule => {
  const keys = Object.keys(rule.checkers)
  keys.forEach(key => {
    walkers[key] = compose(walkers[key], (node, context) => {
      if (
        typeof rule.disableOn !== 'undefined' &&
        context.week >= rule.disableOn
      ) {
        return
      }
      const checker = rule.checkers[key]
      const errors = checker(node)
      errors.forEach(e => context.errors.push(e))
    })
  })
})

export const parse = (source: string, context: Context) => {
  let program: es.Program | undefined = undefined
  try {
    program = acornParse(source, createAcornParserOptions(context))
    simple(program, walkers, undefined, context)
  } catch (error) {
    if (error instanceof SyntaxError) {
      // tslint:disable-next-line:no-any
      const loc = (error as any).loc
      const location = {
        start: { line: loc.line, column: loc.column },
        end: { line: loc.line, column: loc.column + 1 }
      }
      context.errors.push(new FatalSyntaxError(location, error.toString()))
    } else {
      throw error
    }
  }
  const hasErrors = context.errors.find(m => m.severity === ErrorSeverity.ERROR)
  if (program && !hasErrors) {
    // context.cfg.scopes[0].node = program
    return program
  } else {
    return undefined
  }
}
