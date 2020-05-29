import { mount } from 'enzyme';
import * as React from 'react';

import { generateSourceIntroduction } from '../utils/IntroductionHelper';
import Markdown from '../Markdown';

const mockProps = (sourceChapter: number, sourceVariant: string) => {
  return {
    content: generateSourceIntroduction(sourceChapter, sourceVariant),
    openLinksInNewWindow: true
  };
};

test('Markdown page renders correctly', () => {
  const app = <Markdown {...mockProps(1, 'default')} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Markdown page renders correct Source information', () => {
  const source1Default = <Markdown {...mockProps(1, 'default')} />;
  expect(source1Default.props.content).toContain('Source \xa71');

  const source1Lazy = <Markdown {...mockProps(1, 'lazy')} />;
  expect(source1Lazy.props.content).toContain('Source \xa71 Lazy');

  const source1Wasm = <Markdown {...mockProps(1, 'wasm')} />;
  expect(source1Wasm.props.content).toContain('Source \xa71 WebAssembly');

  const source2Default = <Markdown {...mockProps(2, 'default')} />;
  expect(source2Default.props.content).toContain('Source \xa72');

  const source2Lazy = <Markdown {...mockProps(2, 'lazy')} />;
  expect(source2Lazy.props.content).toContain('Source \xa72 Lazy');

  const source3Default = <Markdown {...mockProps(3, 'default')} />;
  expect(source3Default.props.content).toContain('Source \xa73');

  const source3NonDet = <Markdown {...mockProps(3, 'non-det')} />;
  expect(source3NonDet.props.content).toContain('Source \xa73 Non-Det');

  const source3Concurrent = <Markdown {...mockProps(3, 'concurrent')} />;
  expect(source3Concurrent.props.content).toContain('Source \xa73 Concurrent');

  const source4Default = <Markdown {...mockProps(4, 'default')} />;
  expect(source4Default.props.content).toContain('Source \xa74');

  const source4GPU = <Markdown {...mockProps(4, 'gpu')} />;
  expect(source4GPU.props.content).toContain('Source \xa74 GPU');

  const invalidSource = <Markdown {...mockProps(5, 'default')} />;
  expect(invalidSource.props.content).toContain(
    'You have chosen an invalid sublanguage. Please pick a sublanguage from the dropdown instead'
  );
});
