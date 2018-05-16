import { stripIndent } from 'common-tags'
import * as es from 'estree'
import { generate } from 'astring'

import { SourceError, Rule, ErrorSeverity, ErrorType } from '../types'

export class NoIfWithoutElseError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR
  constructor(public node: es.IfStatement) {}

  get location() {
    return this.node.loc!
  }

  explain() {
    return 'Missing "else" in "if-else" statement'
  }

  elaborate() {
    return stripIndent`
      This "if" block requires corresponding "else" block which will be
      evaluated when ${generate(this.node.test)} expression evaluates to false.

      Later in the course we will lift this restriction and allow "if" without
      else.
    `
  }
}

const noIfWithoutElse: Rule<es.IfStatement> = {
  name: 'no-if-without-else',

  checkers: {
    IfStatement(node: es.IfStatement) {
      if (!node.alternate) {
        return [new NoIfWithoutElseError(node)]
      } else {
        return []
      }
    }
  }
}

export default noIfWithoutElse
