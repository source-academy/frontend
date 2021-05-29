import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import ContentDisplay from 'src/commons/ContentDisplay';
import { parseJson } from 'src/features/sicp/parser/ParseJson';

import SicpToc from './SicpToc';

type SicpDisplayProps = OwnProps & RouteComponentProps<{}>;
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
  const CodeSnippetContext = React.createContext(0);

  const sicpDisplayProps = {
    fullWidth: false,
    display: isJson ? parseJson(content) : indexContent,
    loadContentDispatch: () => {}
  };

  return (
    <CodeSnippetContext.Provider value={0}>
      <ContentDisplay {...sicpDisplayProps} />
    </CodeSnippetContext.Provider>
  );
};

export default SicpDisplay;
