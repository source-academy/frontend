import * as es from 'estree'

import { ErrorSeverity, ErrorType, Rule, SourceError } from '../types'

const reservedNames = [
  'break',
  'case',
  'catch',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'finally',
  'for',
  'function',
  'if',
  'in',
  'instanceof',
  'new',
  'return',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'class',
  'const',
  'enum',
  'export',
  'extends',
  'import',
  'super',
  'implements',
  'interface',
  'let',
  'package',
  'private',
  'protected',
  'public',
  'static',
  'yield',
  'null',
  'true',
  'false'
]

export class NoDeclareReservedError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR

  constructor(public node: es.VariableDeclaration) {}

  get location() {
    return this.node.loc!
  }

  public explain() {
    return (
      `Reserved word '${(this.node.declarations[0].id as any).name}'` + ' is not allowed as a name'
    )
  }

  public elaborate() {
    return this.explain()
  }
}

const noDeclareReserved: Rule<es.VariableDeclaration> = {
  name: 'no-declare-reserved',

  checkers: {
    VariableDeclaration(node: es.VariableDeclaration) {
      if (reservedNames.includes((node.declarations[0].id as any).name)) {
        return [new NoDeclareReservedError(node)]
      } else {
        return []
      }
    }
  }
}

export default noDeclareReserved
