import { mount } from 'enzyme';
import { Chapter, Variant } from 'js-slang/dist/types';

import Markdown from '../Markdown';
import { generateSourceIntroduction } from '../utils/IntroductionHelper';

const mockProps = (sourceChapter: Chapter, sourceVariant: Variant) => {
  return {
    content: generateSourceIntroduction(sourceChapter, sourceVariant),
    openLinksInNewWindow: true
  };
};

test('Markdown page renders correctly', () => {
  const app = <Markdown {...mockProps(Chapter.SOURCE_1, Variant.DEFAULT)} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Markdown page renders correct Source information', () => {
  const source1Default = <Markdown {...mockProps(Chapter.SOURCE_1, Variant.DEFAULT)} />;
  expect(source1Default.props.content).toContain('Source \xa71');

  const source1Lazy = <Markdown {...mockProps(Chapter.SOURCE_1, Variant.LAZY)} />;
  expect(source1Lazy.props.content).toContain('Source \xa71 Lazy');

  const source1Wasm = <Markdown {...mockProps(Chapter.SOURCE_1, Variant.WASM)} />;
  expect(source1Wasm.props.content).toContain('Source \xa71 WebAssembly');

  const source2Default = <Markdown {...mockProps(Chapter.SOURCE_2, Variant.DEFAULT)} />;
  expect(source2Default.props.content).toContain('Source \xa72');

  const source2Lazy = <Markdown {...mockProps(Chapter.SOURCE_2, Variant.LAZY)} />;
  expect(source2Lazy.props.content).toContain('Source \xa72 Lazy');

  const source3Default = <Markdown {...mockProps(Chapter.SOURCE_3, Variant.DEFAULT)} />;
  expect(source3Default.props.content).toContain('Source \xa73');

  const source3NonDet = <Markdown {...mockProps(Chapter.SOURCE_3, Variant.NON_DET)} />;
  expect(source3NonDet.props.content).toContain('Source \xa73 Non-Det');

  const source3Concurrent = <Markdown {...mockProps(Chapter.SOURCE_3, Variant.CONCURRENT)} />;
  expect(source3Concurrent.props.content).toContain('Source \xa73 Concurrent');

  const source4Default = <Markdown {...mockProps(Chapter.SOURCE_4, Variant.DEFAULT)} />;
  expect(source4Default.props.content).toContain('Source \xa74');

  const source4GPU = <Markdown {...mockProps(Chapter.SOURCE_4, Variant.GPU)} />;
  expect(source4GPU.props.content).toContain('Source \xa74 GPU');

  const invalidSource = <Markdown {...mockProps(5, Variant.DEFAULT)} />;
  expect(invalidSource.props.content).toContain(
    'You have chosen an invalid sublanguage. Please pick a sublanguage from the dropdown instead'
  );
});
