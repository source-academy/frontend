import { generate } from 'astring'
import * as es from 'estree'

import { ErrorSeverity, ErrorType, Rule, SourceError } from '../types'

export class MultipleDeclarationsError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  private fixs: es.VariableDeclaration[]

  constructor(public node: es.VariableDeclaration) {
    this.fixs = node.declarations.map(declaration => ({
      type: 'VariableDeclaration' as 'VariableDeclaration',
      kind: 'var' as 'var',
      loc: declaration.loc,
      declarations: [declaration]
    }))
  }

  get location() {
    return this.node.loc!
  }

  public explain() {
    return 'Multiple declaration in a single statement'
  }

  public elaborate() {
    const fixs = this.fixs.map(n => '\t' + generate(n)).join('\n')
    return 'Split the variable declaration into multiple lines as follows\n\n' + fixs + '\n'
  }
}

const singleVariableDeclaration: Rule<es.VariableDeclaration> = {
  name: 'single-variable-declaration',

  checkers: {
    VariableDeclaration(node: es.VariableDeclaration) {
      if (node.declarations.length > 1) {
        return [new MultipleDeclarationsError(node)]
      } else {
        return []
      }
    }
  }
}

export default singleVariableDeclaration
