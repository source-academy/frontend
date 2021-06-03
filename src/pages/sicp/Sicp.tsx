import { Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { MathJaxContext } from 'better-react-mathjax';
import classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, useParams } from 'react-router';
import ContentDisplay from 'src/commons/ContentDisplay';
import Constants from 'src/commons/utils/Constants';
import { parseArr } from 'src/features/sicp/parser/ParseJson';

import testData from '../../features/sicp/data/test.json';
import SicpIndexPage from './subcomponents/SicpIndexPage';

type SicpProps = OwnProps & RouteComponentProps<{}>;
type OwnProps = {};

const baseUrl = Constants.interactiveSicpUrl + '/json/';
const extension = '.json';

// Context to determine which code snippet is active
export const CodeSnippetContext = React.createContext({
  active: '0',
  setActive: (x: string) => {}
});

export const mathjaxConfig = {
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

const loadingComponent = <NonIdealState title="Loading Content" icon={<Spinner />} />;
const errorComponent = (
  <NonIdealState
    title="Something went wrong :("
    description={
      <div>
        Something unexpected went wrong trying to load this page. Please try refreshing the page. If
        the issue persists, let us know by filing an issue at{' '}
        <a href="https://github.com/source-academy/cadet-frontend">
          https://github.com/source-academy/cadet-frontend
        </a>
        .
      </div>
    }
    icon={IconNames.ERROR}
  />
);

const Sicp: React.FC<SicpProps> = props => {
  const [data, setData] = React.useState(<></>);
  const [active, setActive] = React.useState('0');
  const { section } = useParams<{ section: string }>();
  const topRef = React.useRef<HTMLDivElement>(null);
  const refs = React.useRef({});

  // Fetch json data
  React.useEffect(() => {
    setData(loadingComponent);

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
      .catch(error => {
        console.log(error);
        setData(errorComponent);
      });
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
