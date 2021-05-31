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

const processingFunctions = {
  B: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return <b>{parseArr(obj['child'], refs)}</b>;
  },
  TABLE: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return (
      <table>
        <tbody>{obj['child'].map((x, index) => processTR(x, refs, index))}</tbody>
      </table>
    );
  },
  BR: (_obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return <br />;
  },
  DISPLAYFOOTNOTE: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return (
      <>
        {obj['count'] === 1 && <hr />}
        <div ref={ref => (refs.current[obj['id']] = ref)} className="sicp-footnote">
          <p>{'[' + obj['count'] + '] '}</p>
          {parseArr(obj['child'], refs)}
        </div>
      </>
    );
  },
  EM: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return <em>{parseArr(obj['child'], refs)}</em>;
  },
  EPIGRAPH: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return handleEpigraph(obj, refs);
  },
  '#text': (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return <p>{obj['body']}</p>;
  },
  EXERCISE: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return handleExercise(obj, refs);
  },
  TEXT: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return (
      <>
        <div ref={ref => (refs.current[obj['id']] = ref)} className="sicp-text">
          {parseArr(obj['child'], refs)}
        </div>
        <br />
      </>
    );
  },
  TT: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return <code>{parseArr(obj['child'], refs)}</code>;
  },
  FIGURE: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return (
      <div ref={ref => (refs.current[obj['id']] = ref)}>
        {obj['images'].map((x, index) => handleImage(x, refs, index))}
      </div>
    );
  },
  FOOTNOTE_REF: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return <sup>{handleRef(obj)}</sup>;
  },
  SUBHEADING: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return <H2>{obj['child'][0]['child'][0]['body']}</H2>;
  },
  CHAPTER: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return handleContainer(obj, refs);
  },
  SECTION: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return handleContainer(obj, refs);
  },
  MATTER: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return handleContainer(obj, refs);
  },
  REF: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return handleRef(obj);
  },
  SUBSECTION: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return handleContainer(obj, refs);
  },
  SUBSUBSECTION: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return handleContainer(obj, refs);
  },
  SUBSUBHEADING: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return (
      <H4>
        <br />
        {parseArr(obj['child'], refs)}
      </H4>
    );
  },
  SNIPPET: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    if (obj['latex']) {
      return (
        <pre>
          <code>{parseArr(obj['child'], refs)}</code>
        </pre>
      );
    } else {
      if (!obj['body']) {
        return;
      }

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
    return handleContainer(obj, refs);
  },
  REFERENCES: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return handleContainer(obj, refs);
  },
  JAVASCRIPT: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return <code>{obj['output']}</code>;
  },
  JAVASCRIPTINLINE: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return <code>{obj['body']}</code>;
  },
  LaTeX: (_obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return handleText('LaTeX');
  },
  LATEX: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return handleLatex(obj['body'], true);
  },
  LATEXINLINE: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return handleLatex(obj['body'], false);
  },
  LINK: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return <a href={obj['body']}>{parseArr(obj['child'], refs)}</a>;
  },
  OL: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return <OL>{parseArr(obj['child'], refs)}</OL>;
  },
  UL: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return <UL>{parseArr(obj['child'], refs)}</UL>;
  },
  LI: (obj: JsonType, refs: React.MutableRefObject<{}>) => {
    return <li>{parseArr(obj['child'], refs)}</li>;
  },
  TeX: (_obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return handleText('TeX');
  },
  META: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return handleLatex(obj['body'], false);
  },
  METAPHRASE: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    return handleLatex('\\langle ' + obj['body'] + ' \\rangle', false);
  }
};

const handleRef = (obj: JsonType) => {
  return <a href={obj['href']}>{obj['body']}</a>;
};

const handleEpigraph = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
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

const processTR = (obj: JsonType, refs: React.MutableRefObject<{}>, index: integer) => {
  return <tr key={index}>{obj['child'].map((x, index) => processTD(x, refs, index))}</tr>;
};

const processTD = (obj: JsonType, refs: React.MutableRefObject<{}>, index: integer) => {
  return <td key={index}>{parseArr(obj['child'], refs)}</td>;
};

const handleExercise = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <div ref={ref => (refs.current[obj['id']] = ref)}>
      <SicpExercise
        title={obj['title']}
        body={parseArr(obj['child'], refs)}
        solution={parseArr(obj['solution'], refs)}
      />
    </div>
  );
};

const handleContainer = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <>
      {handleHeading(obj['body'])}
      <div>{parseArr(obj['child'], refs)}</div>
    </>
  );
};

const handleHeading = (heading: string) => {
  return <H1>{heading}</H1>;
};

const handleText = (text: string) => {
  return <p>{text}</p>;
};

const handleLatex = (math: string, block: boolean) => {
  const onError = (s: string) => {
    console.log('error in handleLatex function:\n' + s + '\n' + math);
  };

  return <MathComponent tex={math} display={block} onError={onError} />;
};

const handleImage = (obj: JsonType, refs: React.MutableRefObject<{}>, index: integer) => {
  return (
    <div key={index} className={'sicp-figure'}>
      {obj['src'] ? (
        <img src={'https://source-academy.github.io/sicp/' + obj['src']} alt={obj['id']} />
      ) : (
        <></>
      )}
      {obj['captionName'] ? (
        <h5>
          {obj['captionName']}
          {parseArr(obj['captionBody'], refs)}
        </h5>
      ) : (
        <></>
      )}
    </div>
  );
};

export const parseArr = (arr: Array<JsonType>, refs: React.MutableRefObject<{}>) => {
  if (!arr) {
    return <></>;
  }

  return <>{arr.map((item, index) => parseObj(item, index, refs))}</>;
};

const parseObj = (
  obj: JsonType,
  index: number | undefined,
  refs: React.MutableRefObject<{}>
) => {
  if (obj['tag']) {
    if (processingFunctions[obj['tag']]) {
      return <span key={index}>{processingFunctions[obj['tag']](obj, refs)}</span>;
    } else {
      return (
        <span style={{ color: 'red' }} key={index}>
          {obj['tag'] + ' ' + obj['body']}
        </span>
      );
    }
  } else {
    return <span key={index}>{parseArr(obj['child'], refs)}</span>;
  }
};
