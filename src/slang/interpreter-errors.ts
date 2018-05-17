import { generate } from 'astring'
import * as es from 'estree'
import { UNKNOWN_LOCATION } from './constants'
import { toString } from './interop'
import { ErrorSeverity, ErrorType, SourceError, Value } from './types'

export class InterruptedError implements SourceError {
  public type = ErrorType.RUNTIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(node: es.Node) {
    this.location = node.loc!
  }

  public explain() {
    return 'Execution aborted by user.'
  }

  public elaborate() {
    return 'TODO'
  }
}

export class ExceptionError implements SourceError {
  public type = ErrorType.RUNTIME
  public severity = ErrorSeverity.ERROR

  constructor(public error: Error, public location: es.SourceLocation) {}

  public explain() {
    return this.error.toString()
  }

  public elaborate() {
    return 'TODO'
  }
}

export class MaximumStackLimitExceeded implements SourceError {
  public type = ErrorType.RUNTIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(node: es.Node, private calls: es.CallExpression[]) {
    this.location = node ? node.loc! : UNKNOWN_LOCATION
  }

  public explain() {
    return `
      Infinite recursion
      ${generate(this.calls[0])}..${generate(this.calls[1])}..${generate(this.calls[2])}..
    `
  }

  public elaborate() {
    return 'TODO'
  }
}

export class CallingNonFunctionValue implements SourceError {
  public type = ErrorType.RUNTIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(private callee: Value, node?: es.Node) {
    if (node) {
      this.location = node.loc!
    } else {
      this.location = UNKNOWN_LOCATION
    }
  }

  public explain() {
    return `Calling non-function value ${toString(this.callee)}`
  }

  public elaborate() {
    return 'TODO'
  }
}

export class UndefinedVariable implements SourceError {
  public type = ErrorType.RUNTIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(public name: string, node: es.Node) {
    this.location = node.loc!
  }

  public explain() {
    return `Undefined Variable ${this.name}`
  }

  public elaborate() {
    return 'TODO'
  }
}

export class InvalidNumberOfArguments implements SourceError {
  public type = ErrorType.RUNTIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(node: es.Node, private expected: number, private got: number) {
    this.location = node.loc!
  }

  public explain() {
    return `Expected ${this.expected} arguments, but got ${this.got}`
  }

  public elaborate() {
    return 'TODO'
  }
}

export class VariableRedeclaration implements SourceError {
  public type = ErrorType.RUNTIME
  public severity = ErrorSeverity.ERROR
  public location: es.SourceLocation

  constructor(node: es.Node, private name: string) {
    this.location = node.loc!
  }

  public explain() {
    return `Redeclaring variable ${this.name}`
  }

  public elaborate() {
    return 'TODO'
  }
}
