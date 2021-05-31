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

  const topRef = React.useRef<HTMLDivElement>(null);
  const refs = React.useRef({});

  const sicpDisplayProps = {
    fullWidth: false,
    display: isJson ? parseJson(content, refs) : <SicpIndexPage />,
    loadContentDispatch: () => {}
  };

  React.useLayoutEffect(() => {
    const hash = props.location.hash;

    if (!hash) {
      if (topRef.current) {
        topRef.current.scrollIntoView();
      }
      return;
    }

    const ref = refs.current[hash];

    if (ref) {
      ref.scrollIntoView({ block: 'start' });
    }
  }, [props.location.hash, props.content]);

  React.useEffect(() => {
    setActive('0');
  }, [content]);

  return (
    <CodeSnippetContext.Provider value={{ active: active, setActive: setActive }}>
      <div ref={topRef} />
      <ContentDisplay {...sicpDisplayProps} />
    </CodeSnippetContext.Provider>
  );
};

export default SicpDisplay;
