import { mockContext } from '../../mocks/context'
import { parse } from '../parser'

test('Empty parse returns empty Program Node', () => {
  const context = mockContext()
  const program = parse('', context)
  expect(program).toMatchSnapshot()
})

test('Parse a single string', () => {
  const context = mockContext()
  const program = parse("'42';", context)
  expect(program).toMatchSnapshot()
})

test('Parse a single number', () => {
  const context = mockContext()
  const program = parse('42;', context)
  expect(program).toMatchSnapshot()
})
