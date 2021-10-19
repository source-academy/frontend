import { mount } from 'enzyme';

import getSicpError, { SicpErrorType } from '../SicpErrors';

describe('Sicp errors:', () => {
  test('unexpected error renders correctly', () => {
    const tree = mount(getSicpError(SicpErrorType.UNEXPECTED_ERROR));
    expect(tree.debug()).toMatchSnapshot();
  });

  test('page not found error renders correctly', () => {
    const tree = mount(getSicpError(SicpErrorType.PAGE_NOT_FOUND_ERROR));
    expect(tree.debug()).toMatchSnapshot();
  });

  test('unexpected error renders correctly', () => {
    const tree = mount(getSicpError(SicpErrorType.PARSING_ERROR));
    expect(tree.debug()).toMatchSnapshot();
  });
});
