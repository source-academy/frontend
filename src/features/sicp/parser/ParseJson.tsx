import { Blockquote, Code, H1, OL, Pre, UL } from '@blueprintjs/core';
import Constants from 'src/commons/utils/Constants';
import SicpExercise from 'src/pages/sicp/subcomponents/SicpExercise';
import SicpLatex from 'src/pages/sicp/subcomponents/SicpLatex';

import CodeSnippet from '../../../pages/sicp/subcomponents/CodeSnippet';

// Custom error class for errors when parsing JSON files.
export class ParseJsonError extends Error {}

/**
 * Functions to handle parsing of JSON files into JSX elements.
 */
export type JsonType = {
  child?: Array<JsonType>;
  tag?: string;
  body?: string;
  output?: string;
  scale?: string;
  snippet?: JsonType;
  table?: JsonType;
  images?: Array<JsonType>;
  src?: string;
  captionHref?: string;
  captionName?: string;
  captionBody?: Array<JsonType>;
  latex?: boolean;
  author?: string;
  date?: string;
  title?: string;
  solution?: Array<JsonType>;
  id?: string;
  withoutPrepend?: string;
  prepend?: string;
  program?: string;
  href?: string;
  count?: integer;
  eval?: boolean;
};

const handleFootnote = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <div>
      {obj['count'] === 1 && <hr />}
      <div className="sicp-footnote">
        <div ref={ref => (refs.current[obj['id']!] = ref)} />
        <a href={obj['href']}>{'[' + obj['count'] + '] '}</a>
        {parseArr(obj['child']!, refs)}
      </div>
    </div>
  );
};

const handleRef = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <a ref={ref => (refs.current[obj['id']!] = ref)} href={obj['href']}>
      {obj['body']}
    </a>
  );
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

  const text = child && parseArr(child!, refs);

  return text ? (
    <Blockquote className="sicp-epigraph">
      {text}
      {hasAttribution && <div className="sicp-attribution">{attribution}</div>}
    </Blockquote>
  ) : (
    <>{hasAttribution && <div className="sicp-attribution">{attribution}</div>}</>
  );
};

const handleSnippet = (obj: JsonType) => {
  if (obj['latex']) {
    return <Pre>{handleLatex(obj['body']!)}</Pre>;
  } else if (typeof obj['eval'] === 'boolean' && !obj['eval']) {
    return <Pre>{obj['body']}</Pre>;
  } else {
    if (!obj['body']) {
      return;
    }

    const CodeSnippetProps = {
      body: obj['body']!,
      id: obj['id']!,
      initialEditorValueHash: obj['withoutPrepend']!,
      initialFullProgramHash: obj['program']! || obj['withoutPrepend']!,
      initialPrependHash: obj['prepend']!,
      output: obj['output']!
    };
    return <CodeSnippet {...CodeSnippetProps} />;
  }
};

const handleFigure = (obj: JsonType, refs: React.MutableRefObject<{}>) => (
  <div className="sicp-figure">
    <div ref={ref => (refs.current[obj['id']!] = ref)} />
    {handleImage(obj, refs)}
    {obj['captionName'] && (
      <h5 className="sicp-caption">
        {obj['captionName']}
        {parseArr(obj['captionBody']!, refs)}
      </h5>
    )}
  </div>
);

const handleImage = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  if (obj['src']) {
    return (
      <img
        src={Constants.interactiveSicpDataUrl + obj['src']}
        alt={obj['id']}
        width={obj['scale'] || '100%'}
      />
    );
  } else if (obj['snippet']) {
    return processingFunctions['SNIPPET'](obj['snippet'], refs);
  } else if (obj['table']) {
    return processingFunctions['TABLE'](obj['table'], refs);
  } else {
    throw new ParseJsonError('Figure has no image');
  }
};

const handleTR = (obj: JsonType, refs: React.MutableRefObject<{}>, index: integer) => {
  return <tr key={index}>{obj['child']!.map((x, index) => handleTD(x, refs, index))}</tr>;
};

const handleTD = (obj: JsonType, refs: React.MutableRefObject<{}>, index: integer) => {
  return <td key={index}>{parseArr(obj['child']!, refs)}</td>;
};

const handleExercise = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <div>
      <div ref={ref => (refs.current[obj['id']!] = ref)} />
      <SicpExercise
        title={obj['title']!}
        body={parseArr(obj['child']!, refs)}
        solution={obj['solution'] && parseArr(obj['solution'], refs)}
      />
    </div>
  );
};

const handleContainer = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <div>
      {obj['body'] && <H1>{obj['body']!}</H1>}
      <div>{parseArr(obj['child']!, refs)}</div>
    </div>
  );
};

const handleReference = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return <div>{parseArr(obj['child']!, refs)}</div>;
};

const handleText = (text: string) => {
  return <p>{text}</p>;
};

const handleLatex = (math: string) => {
  return <SicpLatex math={math} />;
};

export const processingFunctions = {
  '#text': (obj: JsonType, _refs: React.MutableRefObject<{}>) => <p>{obj['body']}</p>,

  B: (obj: JsonType, refs: React.MutableRefObject<{}>) => <b>{parseArr(obj['child']!, refs)}</b>,

  BR: (_obj: JsonType, _refs: React.MutableRefObject<{}>) => <br />,

  CHAPTER: handleContainer,

  DISPLAYFOOTNOTE: handleFootnote,

  EM: (obj: JsonType, refs: React.MutableRefObject<{}>) => <em>{parseArr(obj['child']!, refs)}</em>,

  EPIGRAPH: handleEpigraph,

  EXERCISE: handleExercise,

  FIGURE: handleFigure,

  FOOTNOTE_REF: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <sup>{handleRef(obj, refs)}</sup>
  ),

  JAVASCRIPTINLINE: (obj: JsonType, _refs: React.MutableRefObject<{}>) => (
    <Code>{obj['body']}</Code>
  ),

  LATEX: (obj: JsonType, _refs: React.MutableRefObject<{}>) => handleLatex(obj['body']!),

  LATEXINLINE: (obj: JsonType, _refs: React.MutableRefObject<{}>) => handleLatex(obj['body']!),

  LI: (obj: JsonType, refs: React.MutableRefObject<{}>) => <li>{parseArr(obj['child']!, refs)}</li>,

  LINK: handleRef,

  LaTeX: (_obj: JsonType, _refs: React.MutableRefObject<{}>) => handleText('LaTeX'),

  META: (obj: JsonType, _refs: React.MutableRefObject<{}>) => <em>{obj['body']}</em>,

  OL: (obj: JsonType, refs: React.MutableRefObject<{}>) => <OL>{parseArr(obj['child']!, refs)}</OL>,

  REF: handleRef,

  REFERENCE: handleReference,

  SECTION: handleContainer,

  SNIPPET: (obj: JsonType, _refs: React.MutableRefObject<{}>) => handleSnippet(obj),

  SUBHEADING: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <h2 className="bp3-heading" ref={ref => (refs.current[obj['id']!] = ref)}>
      {parseArr(obj['child']!, refs)}
    </h2>
  ),

  SUBSUBHEADING: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <h4 className="bp3-heading" ref={ref => (refs.current[obj['id']!] = ref)}>
      <br />
      {parseArr(obj['child']!, refs)}
    </h4>
  ),

  TABLE: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <table>
      <tbody>{obj['child']!.map((x, index) => handleTR(x, refs, index))}</tbody>
    </table>
  ),

  TEXT: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <>
      <div className="sicp-text">
        <div ref={ref => (refs.current[obj['id']!] = ref)} />
        {parseArr(obj['child']!, refs)}
      </div>
      <br />
    </>
  ),

  TT: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <Code>{parseArr(obj['child']!, refs)}</Code>
  ),

  TeX: (_obj: JsonType, _refs: React.MutableRefObject<{}>) => handleText('TeX'),

  UL: (obj: JsonType, refs: React.MutableRefObject<{}>) => <UL>{parseArr(obj['child']!, refs)}</UL>
};

// Parse array of objects. An array of objects represent sibling nodes.
export const parseArr = (arr: Array<JsonType>, refs: React.MutableRefObject<{}>) => {
  if (!arr) {
    return <></>;
  }

  return <>{arr.map((item, index) => parseObj(item, index, refs))}</>;
};

// Parse an object.
export const parseObj = (
  obj: JsonType,
  index: number | undefined,
  refs: React.MutableRefObject<{}>
) => {
  if (obj['tag']) {
    if (processingFunctions[obj['tag']]) {
      return <span key={index}>{processingFunctions[obj['tag']](obj, refs)}</span>;
    } else {
      throw new ParseJsonError('Unrecognised Tag: ' + obj['tag']);
    }
  } else {
    // Handle case where tag does not exists. Should not happen if json file is created properly.
    return <span key={index}>{parseArr(obj['child']!, refs)}</span>;
  }
};
