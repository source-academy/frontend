import * as es from 'estree'
import { stripIndent } from 'common-tags'

import { SourceError, Rule, ErrorSeverity, ErrorType } from '../types'

export class NoImplicitReturnUndefinedError implements SourceError {
  type = ErrorType.SYNTAX
  severity = ErrorSeverity.ERROR

  constructor(public node: es.ReturnStatement) {}

  get location() {
    return this.node.loc!
  }

  explain() {
    return 'Missing value in return statement'
  }

  elaborate() {
    return stripIndent`
      This return statement is missing a value.
      For instance, to return the value 42, you can write

        return 42;
    `
  }
}

const noImplicitReturnUndefined: Rule<es.ReturnStatement> = {
  name: 'no-implicit-return-undefined',

  checkers: {
    ReturnStatement(node: es.ReturnStatement) {
      if (!node.argument) {
        return [new NoImplicitReturnUndefinedError(node)]
      } else {
        return []
      }
    }
  }
}

export default noImplicitReturnUndefined
