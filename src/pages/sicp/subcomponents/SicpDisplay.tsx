import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import ContentDisplay from 'src/commons/ContentDisplay';
import { parseJson } from 'src/features/sicp/parser/ParseJson';

import SicpIndexPage from './SicpIndexPage';

type SicpDisplayProps = OwnProps & RouteComponentProps<{}>;
type OwnProps = {
  content: any;
  isJson: boolean;
};

export const CodeSnippetContext = React.createContext({
  active: '0',
  setActive: (x: string) => {}
});

const SicpDisplay: React.FC<SicpDisplayProps> = props => {
  const { content, isJson } = props;
  const [active, setActive] = React.useState('0');

  const sicpDisplayProps = {
    fullWidth: false,
    display: isJson ? parseJson(content) : <SicpIndexPage />,
    loadContentDispatch: () => {}
  };

  React.useEffect(() => {
    setActive('0');
  }, [content]);

  return (
    <CodeSnippetContext.Provider value={{ active: active, setActive: setActive }}>
      <ContentDisplay {...sicpDisplayProps} />
    </CodeSnippetContext.Provider>
  );
};

export default SicpDisplay;
