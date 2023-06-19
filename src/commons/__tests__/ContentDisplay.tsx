import ContentDisplay, { ContentDisplayProps } from '../ContentDisplay';
import { renderTreeJson } from '../utils/TestUtils';

const mockProps: ContentDisplayProps = {
  display: <div> Test Content </div>,
  loadContentDispatch: () => {}
};

test('ContentDisplay page renders correctly', () => {
  const app = <ContentDisplay {...mockProps} />;
  const tree = renderTreeJson(app);
  expect(tree).toMatchSnapshot();
});
