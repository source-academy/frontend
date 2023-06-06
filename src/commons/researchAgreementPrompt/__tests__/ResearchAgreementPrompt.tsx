import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
import { updateCourseResearchAgreement } from 'src/commons/application/actions/SessionActions';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';

import ResearchAgreementPrompt from '../ResearchAgreementPrompt';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn()
}));
const useDispatchMock = useDispatch as jest.Mock;
const dispatchMock = jest.fn();

const renderDOM = () => {
  useDispatchMock.mockReturnValue(dispatchMock);
  dispatchMock.mockClear();

  const mockStore = mockInitialStore();
  const app = (
    <Provider store={mockStore}>
      <ResearchAgreementPrompt />
    </Provider>
  );

  return mount(app);
};

test('ResearchAgreementPrompt renders correctly', () => {
  const tree = renderDOM();
  expect(tree.debug()).toMatchSnapshot();
});

test('"I would like to opt out" dispatches correctly', () => {
  const tree = renderDOM();
  tree
    .findWhere(node => node.type() === 'button' && node.text() === 'I would like to opt out')
    .simulate('click');
  expect(dispatchMock).toBeCalledTimes(1);
  expect(dispatchMock).toBeCalledWith(updateCourseResearchAgreement(false));
});

test('"I consent!" dispatches correctly', () => {
  const tree = renderDOM();
  tree
    .findWhere(node => node.type() === 'button' && node.text() === 'I consent!')
    .simulate('click');
  expect(dispatchMock).toBeCalledTimes(1);
  expect(dispatchMock).toBeCalledWith(updateCourseResearchAgreement(true));
});
