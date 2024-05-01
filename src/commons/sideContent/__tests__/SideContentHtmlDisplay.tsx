import { fireEvent, render } from '@testing-library/react';
import { stringify } from 'js-slang/dist/utils/stringify';
import { Provider } from 'react-redux';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { renderTreeJson } from 'src/commons/utils/TestUtils';

import {
  SideContentHtmlDisplay,
  SideContentHtmlDisplayProps
} from '../content/SideContentHtmlDisplay';
import { SideContentLocation } from '../SideContentTypes';

const Component = (props: SideContentHtmlDisplayProps) => {
  const store = mockInitialStore();
  return (
    <Provider store={store}>
      <SideContentHtmlDisplay {...props} />
    </Provider>
  );
};

test('HTML Display renders correctly', async () => {
  const mockProps = {
    content: stringify('<p>Hello World!</p>'),
    workspaceLocation: 'playground' as SideContentLocation,
    handleAddHtmlConsoleError: (errorMsg: string) => {}
  };
  const htmlDisplay = await renderTreeJson(<Component {...mockProps} />);
  expect(htmlDisplay).toMatchSnapshot();
});

describe('HTML Display postMessage Listener', () => {
  const mockHandleAddHtmlConsoleError = jest.fn((errorMsg: string) => {});

  const mockProps = {
    content: stringify('<p>Hello World!</p>'),
    handleAddHtmlConsoleError: mockHandleAddHtmlConsoleError,
    workspaceLocation: 'playground' as SideContentLocation
  };

  const element = <Component {...mockProps} />;

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
