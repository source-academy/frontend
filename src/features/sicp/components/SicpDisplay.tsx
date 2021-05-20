import * as React from 'react';
import ContentDisplay from 'src/commons/ContentDisplay';
import { parseJson } from 'src/features/sicp/parser/ParseJson';

import SicpToc from './SicpToc';

type SicpDisplayProps = OwnProps;
type OwnProps = {
  content: any;
  isJson: boolean;
};

const indexContent = (
  <>
    <h2>Content</h2>
    <SicpToc location={'index'} />
  </>
);

const SicpDisplay: React.FC<SicpDisplayProps> = props => {
  const { content, isJson } = props;

  const sicpDisplayProps = {
    fullWidth: false,
    display: isJson ? parseJson(content) : indexContent,
    loadContentDispatch: () => {}
  };

  return <ContentDisplay {...sicpDisplayProps} />;
};

export default SicpDisplay;
