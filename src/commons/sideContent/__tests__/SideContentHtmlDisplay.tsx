import { fireEvent, render } from '@testing-library/react';
import { stringify } from 'js-slang/dist/utils/stringify';
import { renderTreeJson } from 'src/commons/utils/TestUtils';

import SideContentHtmlDisplay from '../SideContentHtmlDisplay';

test('HTML Display renders correctly', () => {
  const mockProps = {
    content: stringify('<p>Hello World!</p>'),
    handleAddHtmlConsoleError: (errorMsg: string) => {}
  };
  const htmlDisplay = renderTreeJson(<SideContentHtmlDisplay {...mockProps} />);
  expect(htmlDisplay).toMatchSnapshot();
});

describe('HTML Display postMessage Listener', () => {
  const mockHandleAddHtmlConsoleError = jest.fn((errorMsg: string) => {});

  const mockProps = {
    content: stringify('<p>Hello World!</p>'),
    handleAddHtmlConsoleError: mockHandleAddHtmlConsoleError
  };

  const element = <SideContentHtmlDisplay {...mockProps} />;

  test('Does not call handleAddHtmlConsoleError if error message format is invalid', async () => {
    render(element);
    const mockMessage = {
      data: 'Invalid error',
      origin: '*'
    };
    fireEvent(window, new MessageEvent('message', mockMessage));
    expect(mockHandleAddHtmlConsoleError).toHaveBeenCalledTimes(0);
  });

  test('Calls handleAddHtmlConsoleError if error message format is valid', async () => {
    render(element);
    const mockMessage = {
      data: 'Line 1: Syntax Error',
      origin: '*'
    };
    fireEvent(window, new MessageEvent('message', mockMessage));
    expect(mockHandleAddHtmlConsoleError).toHaveBeenCalledTimes(1);
    expect(mockHandleAddHtmlConsoleError).toHaveBeenCalledWith(mockMessage.data);
  });
});
