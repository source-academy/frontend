import ContentDisplay, { ContentDisplayProps } from '../ContentDisplay';
import { renderTreeJson } from '../utils/TestUtils';

const mockProps: ContentDisplayProps = {
  display: <div> Test Content </div>
};

test('ContentDisplay page renders correctly', async () => {
  const app = <ContentDisplay {...mockProps} />;
  const tree = await renderTreeJson(app);
  expect(tree).toMatchSnapshot();
});
