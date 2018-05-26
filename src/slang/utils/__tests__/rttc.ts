import { BinaryOperator, UnaryOperator } from 'estree'
import { mockClosure, mockRuntimeContext } from '../../../mocks/context'
import { checkBinaryExpression, checkLogicalExpression, checkUnaryExpression } from '../rttc'

const num = 0
const bool = true
const str = ' '
const func = mockClosure()

test('Valid unary type combinations are OK', () => {
  const operatorValue = [['!', bool], ['+', num], ['-', num]]
  const context = mockRuntimeContext()
  const errors = operatorValue.map(opVals => {
    return checkUnaryExpression(context, opVals[0] as UnaryOperator, opVals[1])
  })
  errors.map(error => expect(error).toBe(undefined))
})

test('Invalid unary type combinations return TypeError', () => {
  const operatorValue = [
    ['!', num],
    ['!', str],
    ['!', func],
    ['+', bool],
    ['+', str],
    ['+', func],
    ['-', bool],
    ['-', str],
    ['-', func]
  ]
  const context = mockRuntimeContext()
  const errors = operatorValue.map(opVals => {
    return checkUnaryExpression(context, opVals[0] as UnaryOperator, opVals[1])
  })
  errors.map(error => expect(error).toBeDefined())
})

test('Valid binary type combinations are OK for +', () => {
  const operatorValues = [
    ['+', num, num],
    ['+', str, num],
    ['+', str, bool],
    ['+', str, func],
    ['+', num, str],
    ['+', bool, str],
    ['+', func, str]
  ]
  const context = mockRuntimeContext()
  const errors = operatorValues.map(opVals => {
    return checkBinaryExpression(context, opVals[0] as BinaryOperator, opVals[1], opVals[2])
  })
  errors.map(error => expect(error).toBe(undefined))
})

test('Invalid binary type combinations for (-|*|/|%) return TypeError', () => {
  const operatorValues = [
    ['-', num, bool],
    ['-', num, str],
    ['-', num, func],
    ['-', bool, num],
    ['-', str, num],
    ['-', func, num],
    ['-', str, bool],
    ['-', str, func],
    ['-', bool, bool],
    ['-', str, str],
    ['-', func, func],
    ['*', num, bool],
    ['*', num, str],
    ['*', num, func],
    ['*', bool, num],
    ['*', str, num],
    ['*', func, num],
    ['*', str, bool],
    ['*', str, func],
    ['*', bool, bool],
    ['*', str, str],
    ['*', func, func],
    ['/', num, bool],
    ['/', num, str],
    ['/', num, func],
    ['/', bool, num],
    ['/', str, num],
    ['/', func, num],
    ['/', str, bool],
    ['/', str, func],
    ['/', bool, bool],
    ['/', str, str],
    ['/', func, func],
    ['%', num, bool],
    ['%', num, str],
    ['%', num, func],
    ['%', bool, num],
    ['%', str, num],
    ['%', func, num],
    ['%', str, bool],
    ['%', str, func],
    ['%', bool, bool],
    ['%', str, str],
    ['%', func, func]
  ]
  const context = mockRuntimeContext()
  const errors = operatorValues.map(opVals => {
    return checkBinaryExpression(context, opVals[0] as BinaryOperator, opVals[1], opVals[2])
  })
  errors.map(error => expect(error).toBeDefined())
})

test('Valid binary type combinations are OK for (===|!==)', () => {
  const operatorValues = [
    ['===', num, num],
    ['===', bool, bool],
    ['===', str, str],
    ['===', func, func],
    ['!==', num, num],
    ['!==', bool, bool],
    ['!==', str, str],
    ['!==', func, func]
  ]
  const context = mockRuntimeContext()
  const errors = operatorValues.map(opVals => {
    return checkBinaryExpression(context, opVals[0] as BinaryOperator, opVals[1], opVals[2])
  })
  errors.map(error => expect(error).toBe(undefined))
})

test('Invalid binary type combinations for (<|>|<==|>==) return TypeError', () => {
  const operatorValues = [
    ['<', bool, num],
    ['<', str, num],
    ['<', str, func],
    ['<', num, str],
    ['>', func, num],
    ['>', bool, num],
    ['>', func, bool],
    ['>', str, func],
    ['<=', str, num],
    ['<=', func, func],
    ['<=', num, str],
    ['<=', bool, bool],
    ['>=', func, num],
    ['>=', str, func]
  ]
  const context = mockRuntimeContext()
  const errors = operatorValues.map(opVals => {
    return checkBinaryExpression(context, opVals[0] as BinaryOperator, opVals[1], opVals[2])
  })
  errors.map(error => expect(error).toBeDefined())
})

test('Valid logical type combinations are OK', () => {
  const operatorValues = [[bool, bool], [bool, bool]]
  const context = mockRuntimeContext()
  const errors = operatorValues.map(opVals => {
    return checkLogicalExpression(context, opVals[0], opVals[1])
  })
  errors.map(error => expect(error).toBe(undefined))
})

test('Invalid logical type combinations return TypeError', () => {
  const operatorValues = [
    [num, bool],
    [bool, num],
    [func, bool],
    [bool, func],
    [func, func],
    [num, num],
    [str, str]
  ]
  const context = mockRuntimeContext()
  const errors = operatorValues.map(opVals => {
    return checkLogicalExpression(context, opVals[0], opVals[1])
  })
  errors.map(error => expect(error).toBeDefined())
})
