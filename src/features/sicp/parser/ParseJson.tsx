import { Blockquote, Code, H1, H2, H4, Icon, OL, Pre, UL } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Fragment } from 'react';
import { Link } from 'react-router';
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
  program?: string;
  href?: string;
  count?: number;
  eval?: boolean;
  prependLength?: number;
};

type RefType = React.RefObject<Record<string, HTMLElement | null>>;
type SnippetLanguage = 'javascript' | 'python';
type AnchorLinkType = {
  children: React.ReactNode;
  id: string | undefined;
  refs: RefType;
  top: number;
};

function AnchorLink({ refs, id, children, top }: AnchorLinkType) {
  return (
    <div className="sicp-anchor-link-container">
      {id && (
        <Link
          className="sicp-anchor-link"
          style={{ top: top }}
          ref={ref => {
            refs.current[id] = ref;
          }}
          to={id}
        >
          <Icon icon={IconNames.LINK} />
        </Link>
      )}
      {children}
    </div>
  );
}

const handleFootnote = (obj: JsonType, refs: RefType, language: SnippetLanguage) => {
  return (
    <>
      {obj.count === 1 && <hr />}
      <div className="sicp-footnote">
        <div
          ref={ref => {
            refs.current[obj.id!] = ref;
          }}
        />
        <a href={obj.href}>{'[' + obj.count + '] '}</a>
        {parseArr(obj.child!, refs, language)}
      </div>
    </>
  );
};

const handleRef = (obj: JsonType, refs: RefType) => {
  return (
    <Link
      ref={ref => {
        refs.current[obj.id!] = ref;
      }}
      to={obj.href!}
    >
      {obj.body}
    </Link>
  );
};

const handleEpigraph = (obj: JsonType, refs: RefType, language: SnippetLanguage) => {
  const { child, author, title, date } = obj;

  const hasAttribution = author || title || date;

  const attribution = [];
  attribution.push(<Fragment key="attribution">-</Fragment>);

  if (author) {
    attribution.push(<Fragment key="author">{author}</Fragment>);
  }

  if (title) {
    attribution.push(<i key="title">{title}</i>);
  }

  if (date) {
    attribution.push(<Fragment key="date">{date}</Fragment>);
  }

  const text = child && parseArr(child, refs, language);

  return text ? (
    <Blockquote className="sicp-epigraph">
      {text}
      {hasAttribution && <div className="sicp-attribution">{attribution}</div>}
    </Blockquote>
  ) : (
    <>{hasAttribution && <div className="sicp-attribution">{attribution}</div>}</>
  );
};

const handleSnippet = (obj: JsonType, language: SnippetLanguage) => {
  if (obj.latex) {
    return <Pre>{handleLatex(obj.body!)}</Pre>;
  } else if (typeof obj.eval === 'boolean' && !obj.eval) {
    return (
      <>
        {obj.body && <Pre>{obj.body}</Pre>}
        {obj.output && (
          <Pre>
            <em>{obj.output}</em>
          </Pre>
        )}
      </>
    );
  } else {
    if (!obj.body) {
      return <></>;
    }

    const CodeSnippetProps = {
      body: obj.body,
      id: obj.id!,
      initialEditorValueHash: obj.program!,
      prependLength: obj.prependLength!,
      output: obj.output!,
      language,
    };
    return <CodeSnippet {...CodeSnippetProps} />;
  }
};

const handleFigure = (obj: JsonType, refs: RefType, language: SnippetLanguage) => (
  <AnchorLink id={obj.id} refs={refs} top={36}>
    <div className="sicp-figure">
      {obj.src && handleImage(obj, refs)}
      {obj.snippet && processingFunctions['SNIPPET'](obj.snippet, refs, language)}
      {obj.table && processingFunctions['TABLE'](obj.table, refs, language)}
      {obj.captionName && (
        <h5 className="sicp-caption">
          {obj.captionName}
          {parseArr(obj.captionBody!, refs, language)}
        </h5>
      )}
    </div>
  </AnchorLink>
);

const handleImage = (obj: JsonType, _refs: RefType) => {
  return <img src={Constants.sicpBackendUrl + obj.src} alt={obj.id} width={obj.scale || '100%'} />;
};

const handleTR = (obj: JsonType, refs: RefType, index: number, language: SnippetLanguage) => {
  return <tr key={index}>{obj.child!.map((x, index) => handleTD(x, refs, index, language))}</tr>;
};

const handleTD = (obj: JsonType, refs: RefType, index: number, language: SnippetLanguage) => {
  return <td key={index}>{parseArr(obj.child!, refs, language)}</td>;
};

const handleExercise = (obj: JsonType, refs: RefType, language: SnippetLanguage) => {
  return (
    <AnchorLink id={obj.id} refs={refs} top={5}>
      <SicpExercise
        title={obj.title!}
        body={parseArr(obj.child!, refs, language)}
        solution={obj.solution && parseArr(obj.solution, refs, language)}
      />
    </AnchorLink>
  );
};

const handleTitle = (obj: JsonType, refs: RefType) => {
  return (
    <AnchorLink id={obj.id} refs={refs} top={6}>
      <H1>{obj.body}</H1>
    </AnchorLink>
  );
};

const handleReference = (obj: JsonType, refs: RefType, language: SnippetLanguage) => {
  return <div className="sicp-reference">{parseArr(obj.child!, refs, language)}</div>;
};

const handleText = (text: string) => {
  return <>{text}</>;
};

const handleLatex = (math: string) => {
  return <SicpLatex math={math} />;
};

export const processingFunctions: Record<
  string,
  (obj: JsonType, refs: RefType, language: SnippetLanguage) => React.ReactElement
> = {
  '#text': obj => handleText(obj.body!),

  B: (obj, refs, language) => <b>{parseArr(obj.child!, refs, language)}</b>,

  BR: () => <br />,

  DISPLAYFOOTNOTE: handleFootnote,

  EM: (obj, refs, language) => <em>{parseArr(obj.child!, refs, language)}</em>,

  EPIGRAPH: handleEpigraph,

  EXERCISE: handleExercise,

  FIGURE: handleFigure,

  FOOTNOTE_REF: (obj, refs) => (
    <sup
      ref={ref => {
        refs.current[obj.id!] = ref;
      }}
    >
      {handleRef(obj, refs)}
    </sup>
  ),

  JAVASCRIPTINLINE: obj => <Code>{obj.body}</Code>,
  PYTHONINLINE: obj => <Code>{obj.body}</Code>,

  LATEX: obj => handleLatex(obj.body!),

  LI: (obj, refs, language) => <li>{parseArr(obj.child!, refs, language)}</li>,

  LINK: obj => <a href={obj.href}>{obj.body}</a>,

  META: obj => <em>{obj.body}</em>,

  OL: (obj, refs, language) => <OL>{parseArr(obj.child!, refs, language)}</OL>,

  REF: handleRef,

  REFERENCE: handleReference,

  SNIPPET: (obj, _refs, language) => handleSnippet(obj, language),

  SUBHEADING: (obj, refs, language) => (
    <AnchorLink id={obj.id} refs={refs} top={2}>
      <H2>{parseArr(obj.child!, refs, language)}</H2>
    </AnchorLink>
  ),

  SUBSUBHEADING: (obj, refs, language) => (
    <AnchorLink id={obj.id} refs={refs} top={16}>
      <H4>
        <br />
        {parseArr(obj.child!, refs, language)}
      </H4>
    </AnchorLink>
  ),

  TABLE: (obj, refs, language) => (
    <table>
      <tbody>{obj.child!.map((x, index) => handleTR(x, refs, index, language))}</tbody>
    </table>
  ),

  TEXT: (obj, refs, language) => (
    <AnchorLink id={obj.id} refs={refs} top={-3}>
      <p className="sicp-text">{parseArr(obj.child!, refs, language)}</p>
    </AnchorLink>
  ),

  TITLE: handleTitle,

  TT: (obj, refs, language) => <Code>{parseArr(obj.child!, refs, language)}</Code>,

  UL: (obj, refs, language) => <UL>{parseArr(obj.child!, refs, language)}</UL>,
};

// Parse array of objects. An array of objects represent sibling nodes.
export const parseArr = (
  arr: Array<JsonType>,
  refs: RefType,
  language: SnippetLanguage = 'javascript',
) => {
  if (!arr) {
    return <></>;
  }

  return <>{arr.map((item, index) => parseObj(item, index, refs, language))}</>;
};

// Parse an object.
export const parseObj = (
  obj: JsonType,
  index: number | undefined,
  refs: RefType,
  language: SnippetLanguage = 'javascript',
) => {
  if (obj.tag) {
    if (processingFunctions[obj.tag]) {
      return <Fragment key={index}>{processingFunctions[obj.tag](obj, refs, language)}</Fragment>;
    } else {
      throw new ParseJsonError('Unrecognised Tag: ' + obj.tag);
    }
  } else {
    // Handle case where tag does not exists. Should not happen if json file is created properly.
    return <Fragment key={index}>{parseArr(obj.child!, refs, language)}</Fragment>;
  }
};
