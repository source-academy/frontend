import { fireEvent } from '@testing-library/react';
import { mount } from 'enzyme';

import SideContentHtmlDisplay from '../SideContentHtmlDisplay';

test('HTML Display renders correctly', () => {
  const mockProps = {
    content: '<p>Hello World!</p>',
    handleAddHtmlConsoleError: (errorMsg: string) => {}
  };
  const htmlDisplay = mount(<SideContentHtmlDisplay {...mockProps} />);
  expect(htmlDisplay.debug()).toMatchSnapshot();
});

describe('HTML Display postMessage Listener', () => {
  const mockHandleAddHtmlConsoleError = jest.fn((errorMsg: string) => {});

  const mockProps = {
    content: '<p>Hello World!</p>',
    handleAddHtmlConsoleError: mockHandleAddHtmlConsoleError
  };

  beforeAll(() => {
    mount(<SideContentHtmlDisplay {...mockProps} />);
  });

  test('Does not call handleAddHtmlConsoleError if error message format is invalid', async () => {
    const mockMessage = {
      data: 'Invalid error',
      origin: '*'
    };
    fireEvent(window, new MessageEvent('message', mockMessage));
    expect(mockHandleAddHtmlConsoleError).toHaveBeenCalledTimes(0);
  });

  test('Calls handleAddHtmlConsoleError if error message format is valid', async () => {
    const mockMessage = {
      data: 'Line 1: Syntax Error',
      origin: '*'
    };
    fireEvent(window, new MessageEvent('message', mockMessage));
    expect(mockHandleAddHtmlConsoleError).toHaveBeenCalledTimes(1);
    expect(mockHandleAddHtmlConsoleError).toHaveBeenCalledWith(mockMessage.data);
  });
});
