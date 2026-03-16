import { screen } from '@testing-library/react';
import { renderTree } from 'src/commons/utils/TestUtils';

import getSicpError, { SicpErrorType } from '../SicpErrors';

describe('Sicp errors:', () => {
  test('unexpected error renders correctly', async () => {
    const element = getSicpError(SicpErrorType.UNEXPECTED_ERROR);
    expect(await renderTree(element)).toMatchSnapshot();
    screen.getByTestId('sicp-unexpected-error');
  });

  test('page not found error renders correctly', async () => {
    const element = getSicpError(SicpErrorType.PAGE_NOT_FOUND_ERROR);
    expect(await renderTree(element)).toMatchSnapshot();
    screen.getByTestId('sicp-page-not-found-error');
  });

  test('unexpected error renders correctly', async () => {
    const element = getSicpError(SicpErrorType.PARSING_ERROR);
    expect(await renderTree(element)).toMatchSnapshot();
    screen.getByTestId('sicp-parsing-error');
  });
});
