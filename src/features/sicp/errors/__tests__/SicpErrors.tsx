import { render, screen } from '@testing-library/react';
import { shallowRender } from 'src/commons/utils/TestUtils';

import getSicpError, { SicpErrorType } from '../SicpErrors';

describe('Sicp errors:', () => {
  test('unexpected error renders correctly', () => {
    const element = getSicpError(SicpErrorType.UNEXPECTED_ERROR);
    expect(shallowRender(element)).toMatchSnapshot();

    render(element);
    screen.getByTestId('sicp-unexpected-error');
  });

  test('page not found error renders correctly', () => {
    const element = getSicpError(SicpErrorType.PAGE_NOT_FOUND_ERROR);
    expect(shallowRender(element)).toMatchSnapshot();

    render(element);
    screen.getByTestId('sicp-page-not-found-error');
  });

  test('unexpected error renders correctly', () => {
    const element = getSicpError(SicpErrorType.PARSING_ERROR);
    expect(shallowRender(element)).toMatchSnapshot();

    render(element);
    screen.getByTestId('sicp-parsing-error');
  });
});
