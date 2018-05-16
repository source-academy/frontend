import * as es from 'estree'
import { generate } from 'astring'
import { Value, SourceError, ErrorType, ErrorSeverity } from './types'
import { toString } from './interop'
import { UNKNOWN_LOCATION } from './constants'

export class InterruptedError implements SourceError {
  type = ErrorType.RUNTIME
  severity = ErrorSeverity.ERROR
  location: es.SourceLocation

  constructor(node: es.Node) {
    this.location = node.loc!
  }

  explain() {
    return 'Execution aborted by user.'
  }

  elaborate() {
    return 'TODO'
  }
}

export class ExceptionError implements SourceError {
  type = ErrorType.RUNTIME
  severity = ErrorSeverity.ERROR

  constructor(public error: Error, public location: es.SourceLocation) {}

  explain() {
    return this.error.toString()
  }

  elaborate() {
    return 'TODO'
  }
}

export class MaximumStackLimitExceeded implements SourceError {
  type = ErrorType.RUNTIME
  severity = ErrorSeverity.ERROR

  location: es.SourceLocation

  constructor(node: es.Node, private calls: es.CallExpression[]) {
    this.location = node ? node.loc! : UNKNOWN_LOCATION
  }

  explain() {
    return `
      Infinite recursion
      ${generate(this.calls[0])}..${generate(this.calls[1])}..${generate(
      this.calls[2]
    )}..
    `
  }

  elaborate() {
    return 'TODO'
  }
}

export class CallingNonFunctionValue implements SourceError {
  type = ErrorType.RUNTIME
  severity = ErrorSeverity.ERROR
  location: es.SourceLocation

  constructor(private callee: Value, node?: es.Node) {
    if (node) {
      this.location = node.loc!
    } else {
      this.location = UNKNOWN_LOCATION
    }
  }

  explain() {
    return `Calling non-function value ${toString(this.callee)}`
  }

  elaborate() {
    return 'TODO'
  }
}

export class UndefinedVariable implements SourceError {
  type = ErrorType.RUNTIME
  severity = ErrorSeverity.ERROR
  location: es.SourceLocation

  constructor(public name: string, node: es.Node) {
    this.location = node.loc!
  }

  explain() {
    return `Undefined Variable ${this.name}`
  }

  elaborate() {
    return 'TODO'
  }
}

export class InvalidNumberOfArguments implements SourceError {
  type = ErrorType.RUNTIME
  severity = ErrorSeverity.ERROR
  location: es.SourceLocation

  constructor(node: es.Node, private expected: number, private got: number) {
    this.location = node.loc!
  }

  explain() {
    return `Expected ${this.expected} arguments, but got ${this.got}`
  }

  elaborate() {
    return 'TODO'
  }
}

export class VariableRedeclaration implements SourceError {
  type = ErrorType.RUNTIME
  severity = ErrorSeverity.ERROR
  location: es.SourceLocation

  constructor(node: es.Node, private name: string) {
    this.location = node.loc!
  }

  explain() {
    return `Redeclaring variable ${this.name}`
  }

  elaborate() {
    return 'TODO'
  }
}
