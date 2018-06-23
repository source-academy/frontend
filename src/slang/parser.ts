/* tslint:disable: max-classes-per-file */
import { Options as AcornOptions, parse as acornParse, Position } from 'acorn'
import { simple } from 'acorn/dist/walk'
import { stripIndent } from 'common-tags'
import * as es from 'estree'

import rules from './rules'
import syntaxTypes from './syntaxTypes'
import { Context, ErrorSeverity, ErrorType, Rule, SourceError } from './types'

// tslint:disable-next-line:interface-name
export interface ParserOptions {
  chapter: number
}

export class DisallowedConstructError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public nodeType: string

  constructor(public node: es.Node) {
    this.nodeType = this.formatNodeType(this.node.type)
  }

  get location() {
    return this.node.loc!
  }

  public explain() {
    return `${this.nodeType} are not allowed`
  }

  public elaborate() {
    return stripIndent`
      You are trying to use ${this.nodeType}, which is not yet allowed (yet).
    `
  }

  /**
   * Converts estree node.type into english
   * e.g. ThisExpression -> 'this' expressions
   *      Property -> Properties
   *      EmptyStatement -> Empty Statements
   */
  private formatNodeType(nodeType: string) {
    switch (nodeType) {
      case 'ThisExpression':
        return "'this' expressions"
      case 'Property':
        return 'Properties'
      default:
        const words = nodeType.split(/(?=[A-Z])/)
        return words.map((word, i) => (i === 0 ? word : word.toLowerCase())).join(' ') + 's'
    }
  }
}

export class FatalSyntaxError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public constructor(public location: es.SourceLocation, public message: string) {}

  public explain() {
    return this.message
  }

  public elaborate() {
    return 'There is a syntax error in your program'
  }
}

export class MissingSemicolonError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public constructor(public location: es.SourceLocation) {}

  public explain() {
    return 'Missing semicolon at the end of statement'
  }

  public elaborate() {
    return 'Every statement must be terminated by a semicolon.'
  }
}

export class TrailingCommaError implements SourceError {
  public type: ErrorType.SYNTAX
  public severity: ErrorSeverity.WARNING
  public constructor(public location: es.SourceLocation) {}

  public explain() {
    return 'Trailing comma'
  }

  public elaborate() {
    return 'Please remove the trailing comma'
  }
}

export function parse(source: string, context: Context) {
  let program: es.Program | undefined
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

function createWalkers(
  allowedSyntaxes: { [nodeName: string]: number },
  parserRules: Array<Rule<es.Node>>
) {
  const newWalkers = new Map<string, (n: es.Node, c: Context) => void>()

  // Provide callbacks checking for disallowed syntaxes, such as case, switch...
  const syntaxPairs = Object.entries(allowedSyntaxes)
  syntaxPairs.map(pair => {
    const syntax = pair[0]
    const allowedChap = pair[1]
    newWalkers.set(syntax, (node: es.Node, context: Context) => {
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
      if (context.chapter < allowedChap) {
        context.errors.push(new DisallowedConstructError(node))
      }
    })
  })

  // Provide callbacks checking for rule violations, e.g. no block arrow funcs, non-empty lists...
  parserRules.forEach(rule => {
    const checkers = rule.checkers
    const syntaxCheckerPair = Object.entries(checkers)
    syntaxCheckerPair.forEach(pair => {
      const syntax = pair[0]
      const checker = pair[1]
      const oldCheck = newWalkers.get(syntax)
      const newCheck = (node: es.Node, context: Context) => {
        if (typeof rule.disableOn !== 'undefined' && context.chapter >= rule.disableOn) {
          return
        }
        const errors = checker(node)
        errors.forEach(e => context.errors.push(e))
      }
      newWalkers.set(syntax, (node, context) => {
        if (oldCheck) {
          oldCheck(node, context)
        }
        newCheck(node, context)
      })
    })
  })

  return mapToObj(newWalkers)
}

export const freshId = (() => {
  let id = 0
  return () => {
    id++
    return 'node_' + id
  }
})()

const mapToObj = (map: Map<string, any>) =>
  Array.from(map).reduce((obj, [k, v]) => Object.assign(obj, { [k]: v }), {})

const walkers: { [name: string]: (node: es.Node, ctxt: Context) => void } = createWalkers(
  syntaxTypes,
  rules
)
