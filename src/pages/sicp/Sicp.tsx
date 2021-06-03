import { Classes } from '@blueprintjs/core';
import { MathJaxContext } from 'better-react-mathjax';
import classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, useParams } from 'react-router';
import ContentDisplay from 'src/commons/ContentDisplay';
import { Links } from 'src/commons/utils/Constants';
import { parseArr } from 'src/features/sicp/parser/ParseJson';

import testData from '../../features/sicp/data/test.json';
import SicpIndexPage from './subcomponents/SicpIndexPage';
import SicpLoadingPage from './subcomponents/SicpLoadingPage';

type SicpProps = OwnProps & RouteComponentProps<{}>;
type OwnProps = {};

const baseUrl = Links.sicp + '/json/';
const extension = '.json';

// Context to determine which code snippet is active
export const CodeSnippetContext = React.createContext({
  active: '0',
  setActive: (x: string) => {}
});

const mathjaxConfig = {
  loader: { load: ['[tex]/html'] },
  tex: {
    packages: { '[+]': ['html'] },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ]
  }
};

const Sicp: React.FC<SicpProps> = props => {
  const [data, setData] = React.useState(<></>);
  const [active, setActive] = React.useState('0');
  const { section } = useParams<{ section: string }>();
  const topRef = React.useRef<HTMLDivElement>(null);
  const refs = React.useRef({});

  // Fetch json data
  React.useEffect(() => {
    setData(<SicpLoadingPage />);

    if (section === 'index') {
      setData(<SicpIndexPage />);
      return;
    }

    if (section === 'test') {
      const newData = parseArr(testData as any[], refs);
      setData(newData);
      return;
    }

    fetch(baseUrl + section + extension)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(myJson => {
        const newData = parseArr(myJson, refs);
        setData(newData);
      })
      .catch(error => console.log(error));
  }, [section]);

  // Scroll to correct position
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
  }, [props.location.hash, data]);

  // Close all active code snippet when new page is loaded
  React.useEffect(() => {
    setActive('0');
  }, [data]);

  const sicpDisplayProps = {
    fullWidth: false,
    display: data,
    loadContentDispatch: () => {}
  };

  return (
    <CodeSnippetContext.Provider value={{ active: active, setActive: setActive }}>
      <div className={classNames('Sicp', Classes.DARK)}>
        <div ref={topRef} />
        <MathJaxContext version={3} config={mathjaxConfig}>
          <ContentDisplay {...sicpDisplayProps} />
        </MathJaxContext>
      </div>
    </CodeSnippetContext.Provider>
  );
};

export default Sicp;
