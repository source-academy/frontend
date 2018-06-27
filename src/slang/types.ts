/* tslint:disable:interface-name max-classes-per-file */

import { SourceLocation } from 'acorn'
import * as es from 'estree'

import { closureToJS } from './interop'

export enum ErrorType {
  SYNTAX = 'Syntax',
  TYPE = 'Type',
  RUNTIME = 'Runtime'
}

export enum ErrorSeverity {
  WARNING = 'Warning',
  ERROR = 'Error'
}

export interface SourceError {
  type: ErrorType
  severity: ErrorSeverity
  location: es.SourceLocation
  explain(): string
  elaborate(): string
}

export interface Rule<T extends es.Node> {
  name: string
  disableOn?: number
  checkers: {
    [name: string]: (node: T) => SourceError[]
  }
}

// tslint:disable-next-line:no-namespace
export namespace CFG {
  // tslint:disable-next-line:no-shadowed-variable
  export interface Scope {
    name: string
    parent?: Scope
    entry?: Vertex
    exits: Vertex[]
    node?: es.Node
    proof?: es.Node
    type: Type
    env: {
      [name: string]: Sym
    }
  }

  export interface Vertex {
    id: string
    node: es.Node
    scope?: Scope
    usages: Sym[]
  }

  export interface Sym {
    name: string
    defined?: boolean
    definedAt?: es.SourceLocation
    type: Type
    proof?: es.Node
  }

  export interface Type {
    name: 'number' | 'string' | 'boolean' | 'function' | 'undefined' | 'any'
    params?: Type[]
    returnType?: Type
  }

  export type EdgeLabel = 'next' | 'alternate' | 'consequent'

  export interface Edge {
    type: EdgeLabel
    to: Vertex
  }
}

export interface Comment {
  type: 'Line' | 'Block'
  value: string
  start: number
  end: number
  loc: SourceLocation | undefined
}

export interface TypeError extends SourceError {
  expected: CFG.Type[]
  got: CFG.Type
  proof?: es.Node
}

export interface Context<T = any> {
  /** The source version used */
  chapter: number

  /** All the errors gathered */
  errors: SourceError[]

  /** CFG Specific State */
  cfg: {
    nodes: { [id: string]: CFG.Vertex }
    edges: { [from: string]: CFG.Edge[] }
    scopes: CFG.Scope[]
  }

  /** Runtime Sepecific state */
  runtime: {
    isRunning: boolean
    frames: Frame[]
    nodes: es.Node[]
  }

  /** 
   * Used for storing external properties,
   * e.g for interaction between slang and the 
   * main application 
   */
  external: T 
}

// tslint:disable:no-any
export interface Environment {
  [name: string]: any
}
export type Value = any
// tslint:enable:no-any

export interface Frame {
  name: string
  parent: Frame | null
  callExpression?: es.CallExpression
  environment: Environment
  thisContext?: Value
}

/**
 * Models function value in the interpreter environment.
 */
export class Closure {
  /** Keep track how many lambdas are created */
  private static lambdaCtr = 0

  /** Unique ID defined for anonymous closure */
  public name: string

  /** Fake closure function */
  // tslint:disable-next-line:ban-types
  public fun: Function

  constructor(public node: es.FunctionExpression, public frame: Frame, context: Context) {
    this.node = node
    try {
      if (this.node.id) {
        this.name = this.node.id.name
      }
    } catch (e) {
      this.name = `Anonymous${++Closure.lambdaCtr}`
    }
    this.fun = closureToJS(this, context, this.name)
  }
}

/**
 * Modified from class Closure, for construction of arrow functions.
 */
export class ArrowClosure {
  /** Keep track how many lambdas are created */
  private static arrowCtr = 0

  /** Unique ID defined for anonymous closure */
  public name: string

  /** Fake closure function */
  // tslint:disable-next-line:ban-types
  public fun: Function

  constructor(public node: es.Function, public frame: Frame, context: Context) {
    this.name = `Anonymous${++ArrowClosure.arrowCtr}`
    this.fun = closureToJS(this, context, this.name)
  }
}

interface Error {
  status: 'error'
}

export interface Finished {
  status: 'finished'
  value: Value
}

interface Suspended {
  status: 'suspended'
  it: IterableIterator<Value>
  scheduler: Scheduler
  context: Context
}

export type Result = Suspended | Finished | Error

export interface Scheduler {
  run(it: IterableIterator<Value>, context: Context): Promise<Result>
}
