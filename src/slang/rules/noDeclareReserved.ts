import * as es from 'estree'

import { SourceError, Rule, ErrorSeverity, ErrorType } from '../types'

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

export class noDeclareReservedError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR

  constructor(public node: es.VariableDeclaration) {}

  get location() {
    return this.node.loc!
  }

  explain() {
    return `Reserved word '${this.node.declarations[0].id.name}'` + ' is not allowed as a name'
  }

  elaborate() {
    return this.explain()
  }
}

const noDeclareReserved: Rule<es.VariableDeclaration> = {
  name: 'no-declare-reserved',

  checkers: {
    VariableDeclaration(node: es.VariableDeclaration) {
      if (reservedNames.includes(node.declarations[0].id.name)) {
        return [new noDeclareReservedError(node)]
      } else {
        return []
      }
    }
  }
}

export default noDeclareReserved
