import { Blockquote, H1, H2, H4, OL, UL } from '@blueprintjs/core';
import { MathComponent } from 'mathjax-react';
import SicpExercise from 'src/pages/sicp/subcomponents/SicpExercise';

import CodeSnippet from '../../../pages/sicp/subcomponents/CodeSnippet';

type JsonType = {
  child: Array<JsonType>;
  tag: string;
  body: string;
  output: string;
  class: string;
  images: Array<JsonType>;
  src: string;
  captionHref: string;
  captionName: string;
  captionBody: Array<JsonType>;
  latex: boolean;
  author: string;
  date: string;
  title: string;
  solution: Array<JsonType>;
  id: string;
  withoutPrepend: string;
  prepend: string;
  program: string;
  href: string;
  count: integer;
};

const processText = {
  BR: (_obj: JsonType) => {
    return <br />;
  },
  DISPLAYFOOTNOTE: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return (
      <>
        {obj['count'] === 1 && <hr />}
        <div ref={ref => (refs.current[obj['id']] = ref)} className="sicp-footnote">
          <p>{'[' + obj['count'] + '] '}</p>
          {parseJson(obj['child'], refs)}
        </div>
      </>
    );
  },
  EPIGRAPH: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return parseEpigraph(obj, refs);
  },
  '#text': (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return <p>{obj['body']}</p>;
  },
  EXERCISE: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return parseExercise(obj, refs);
  },
  TEXT: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return (
      <>
        <div ref={ref => (refs.current[obj['id']] = ref)} className="sicp-text">
          {parseJson(obj['child'], refs)}
        </div>
        <br />
      </>
    );
  },
  FIGURE: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return (
      <div ref={ref => (refs.current[obj['id']] = ref)}>
        {obj['images'].map(x => parseImage(x, refs))}
      </div>
    );
  },
  FOOTNOTE_REF: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return <sup>{parseRef(obj)}</sup>;
  },
  SUBHEADING: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return <H2>{obj['child'][0]['child'][0]['body']}</H2>;
  },
  CHAPTER: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return parseContainer(obj, refs);
  },
  SECTION: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return parseContainer(obj, refs);
  },
  MATTER: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return parseContainer(obj, refs);
  },
  REF: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return parseRef(obj);
  },
  SUBSECTION: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return parseContainer(obj, refs);
  },
  SUBSUBSECTION: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return parseContainer(obj, refs);
  },
  SUBSUBHEADING: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return (
      <H4>
        <br />
        {parseJson(obj['child'], refs)}
      </H4>
    );
  },
  SNIPPET: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    if (!obj['body']) {
      return;
    }

    if (obj['latex']) {
      return (
        <pre>
          <code>{parseJson(obj['child'], refs)}</code>
        </pre>
      );
    } else {
      const CodeSnippetProps = {
        body: obj['body'],
        output: obj['output'],
        id: obj['id'],
        initialEditorValueHash: obj['withoutPrepend'],
        initialPrependHash: obj['prepend'],
        initialFullProgramHash: obj['program']
      };
      return <CodeSnippet {...CodeSnippetProps} />;
    }
  },
  REFERENCE: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return parseContainer(obj, refs);
  },
  REFERENCES: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return parseContainer(obj, refs);
  },
  JAVASCRIPT: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return <code>{obj['output']}</code>;
  },
  JAVASCRIPTINLINE: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return <code>{obj['body']}</code>;
  },
  LaTeX: (_obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return parseText('LaTeX');
  },
  LATEX: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return parseLatex(obj['body'], true);
  },
  LATEXINLINE: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return parseLatex(obj['body'], false);
  },
  LINK: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return <a href={obj['body']}>{parseJson(obj['child'], refs)}</a>;
  },
  OL: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return (
      <OL key="OL">
        {obj['child'].map((x, index) => (
          //TODO BUG NON-UNIQUE KEY
          <li key={index}>{parseObj(x, undefined, refs)}</li>
        ))}
      </OL>
    );
  },
  UL: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return (
      <UL key="UL">
        {obj['child'].map((x, index) => (
          //TODO BUG NON-UNIQUE KEY
          <li key={index}>{parseObj(x, undefined, refs)}</li>
        ))}
      </UL>
    );
  },
  TeX: (_obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return parseText('TeX');
  },
  META: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return parseLatex(obj['body'], false);
  },
  METAPHRASE: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return parseLatex('\\langle ' + obj['body'] + ' \\rangle', false);
  }
};

const parseRef = (obj: JsonType) => {
  return <a href={obj['href']}>{obj['body']}</a>;
};

const parseEpigraph = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  const { child, author, title, date } = obj;

  const hasAttribution = author || title || date;

  const attribution = [];
  attribution.push(<span key="attribution">-</span>);

  if (author) {
    attribution.push(<span key="author">{author}</span>);
  }

  if (title) {
    attribution.push(<i key="title">{title}</i>);
  }

  if (date) {
    attribution.push(<span key="date">{date}</span>);
  }

  return (
    <Blockquote className="sicp-epigraph">
      {child.map((x, index) => parseObj(x, index, refs))}
      {hasAttribution ? <div className="sicp-attribution">{attribution}</div> : <></>}
    </Blockquote>
  );
};

const parseExercise = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <div ref={ref => (refs.current[obj['id']] = ref)}>
      <SicpExercise
        title={obj['title']}
        body={parseJson(obj['child'], refs)}
        solution={parseJson(obj['solution'], refs)}
      />
    </div>
  );
};

const parseContainer = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <>
      {parseHeading(obj['body'])}
      <div>{parseJson(obj['child'], refs)}</div>
    </>
  );
};

const parseHeading = (heading: string) => {
  return <H1>{heading}</H1>;
};

const parseText = (text: string) => {
  return <p>{text}</p>;
};

const parseLatex = (math: string, block: boolean) => {
  const onError = (s: string) => {
    console.log('error in parseLatex function:\n' + s + '\n' + math);
  };

  return <MathComponent tex={math} display={block} onError={onError} />;
};

const parseImage = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <div className={'sicp-figure'}>
      {obj['src'] ? (
        <img src={'https://source-academy.github.io/sicp/' + obj['src']} alt={obj['id']} />
      ) : (
        <></>
      )}
      {obj['captionName'] ? (
        <h5>
          {obj['captionName']}
          {parseJson(obj['captionBody'], refs)}
        </h5>
      ) : (
        <></>
      )}
    </div>
  );
};

export const parseJson = (obj: Array<JsonType>, refs: React.MutableRefObject<{}>) => {
  if (!obj) {
    return <></>;
  }

  return <>{obj.map((item, index) => parseObj(item, index, refs))}</>;
};

const parseObj = (obj: JsonType, index: number | undefined, refs: React.MutableRefObject<{}>) => {
  if (obj['tag']) {
    if (processText[obj['tag']]) {
      return <span key={index}>{processText[obj['tag']](obj, refs)}</span>;
    } else {
      return (
        <span style={{ color: 'red' }} key={index}>
          {obj['tag'] + ' ' + obj['body']}
        </span>
      );
    }
  } else {
    return <span key={index}>{parseJson(obj['child'], refs)}</span>;
  }
};
