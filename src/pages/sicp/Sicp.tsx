import 'katex/dist/katex.min.css';

import { Button, Classes, NonIdealState, Spinner } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { RouteComponentProps, useHistory, useParams } from 'react-router';
import Constants from 'src/commons/utils/Constants';
import { resetWorkspace, toggleUsingSubst } from 'src/commons/workspace/WorkspaceActions';
import { parseArr, ParseJsonError } from 'src/features/sicp/parser/ParseJson';
import { getNext, getPrev } from 'src/features/sicp/TableOfContentsHelper';

import SicpErrorBoundary from '../../features/sicp/errors/SicpErrorBoundary';
import getSicpError, { SicpErrorType } from '../../features/sicp/errors/SicpErrors';
import SicpIndexPage from './subcomponents/SicpIndexPage';

type SicpProps = RouteComponentProps<{}>;

const baseUrl = Constants.interactiveSicpDataUrl + 'json/';
const extension = '.json';

// Context to determine which code snippet is active
export const CodeSnippetContext = React.createContext({
  active: '0',
  setActive: (x: string) => {}
});

const loadingComponent = <NonIdealState title="Loading Content" icon={<Spinner />} />;

const Sicp: React.FC<SicpProps> = props => {
  const [data, setData] = React.useState(<></>);
  const [loading, setLoading] = React.useState(true);
  const [active, setActive] = React.useState('0');
  const { section } = useParams<{ section: string }>();
  const parentRef = React.useRef<HTMLDivElement>(null);
  const refs = React.useRef({});
  const history = useHistory();

  const scrollRefIntoView = (ref: HTMLDivElement | null) => {
    if (!ref || !parentRef?.current) {
      return;
    }

    const parent = parentRef.current!;
    const relativeTop = window.scrollY > parent.offsetTop ? window.scrollY : parent.offsetTop;

    parent.scrollTo({
      behavior: 'smooth',
      top: ref.offsetTop - relativeTop
    });
  };

  // Fetch json data
  React.useEffect(() => {
    setLoading(true);

    if (section === 'index') {
      setLoading(false);
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
        try {
          const newData = parseArr(myJson, refs); // Might throw error
          setData(newData);
          setLoading(false);
        } catch (error) {
          throw new ParseJsonError(error.message);
        }
      })
      .catch(error => {
        console.error(error);

        if (error.message === 'Not Found') {
          // page not found
          setData(getSicpError(SicpErrorType.PAGE_NOT_FOUND_ERROR));
        } else if (error instanceof ParseJsonError) {
          // error occurred while parsing JSON
          setData(getSicpError(SicpErrorType.PARSING_ERROR));
        } else {
          setData(getSicpError(SicpErrorType.UNEXPECTED_ERROR));
        }

        setLoading(false);
      });
  }, [section]);

  // Scroll to correct position
  React.useEffect(() => {
    if (loading) {
      return;
    }

    const hash = props.location.hash;
    const ref = refs.current[hash];

    scrollRefIntoView(ref);
  }, [props.location.hash, loading]);

  // Close all active code snippet when new page is loaded
  React.useEffect(() => {
    setActive('0');
  }, [data]);

  const dispatch = useDispatch();
  const handleSnippetEditorOpen = (s: string) => {
    setActive(s);
    dispatch(resetWorkspace('sicp'));
    dispatch(toggleUsingSubst(false, 'sicp'));
  };
  const handleNavigation = (sect: string | undefined) => {
    history.push('/sicpjs/' + sect);
  };

  const navigationButtons = (
    <div className="sicp-navigation-buttons">
      {getPrev(section) && (
        <Button onClick={() => handleNavigation(getPrev(section))}>Previous</Button>
      )}
      {getNext(section) && <Button onClick={() => handleNavigation(getNext(section))}>Next</Button>}
    </div>
  );

  return (
    <div
      className={classNames('Sicp', Classes.RUNNING_TEXT, Classes.TEXT_LARGE, Classes.DARK)}
      ref={parentRef}
    >
      <SicpErrorBoundary>
        <CodeSnippetContext.Provider value={{ active: active, setActive: handleSnippetEditorOpen }}>
          {loading ? (
            <div className="sicp-content">{loadingComponent}</div>
          ) : section === 'index' ? (
            <SicpIndexPage />
          ) : (
            <div className="sicp-content">
              {data}
              {navigationButtons}
            </div>
          )}
        </CodeSnippetContext.Provider>
      </SicpErrorBoundary>
    </div>
  );
};

export default Sicp;
