import { Blockquote, Code, H1, H2, H4, Icon, OL, Pre, UL } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { Link } from 'react-router-dom';
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

type RefType = React.MutableRefObject<Record<string, HTMLElement | null>>;
type AnchorLinkType = {
  children: React.ReactNode;
  id: string | undefined;
  refs: RefType;
  top: number;
};

const AnchorLink: React.FC<AnchorLinkType> = ({ refs, id, children, top }) => {
  return (
    <div className="sicp-anchor-link-container">
      {id && (
        <Link
          className="sicp-anchor-link"
          style={{ top: top }}
          ref={ref => (refs.current[id] = ref)}
          to={id}
        >
          <Icon icon={IconNames.LINK} />
        </Link>
      )}
      {children}
    </div>
  );
};

const handleFootnote = (obj: JsonType, refs: RefType) => {
  return (
    <>
      {obj.count === 1 && <hr />}
      <div className="sicp-footnote">
        <div ref={ref => (refs.current[obj.id!] = ref)} />
        <a href={obj.href}>{'[' + obj.count + '] '}</a>
        {parseArr(obj.child!, refs)}
      </div>
    </>
  );
};

const handleRef = (obj: JsonType, refs: RefType) => {
  return (
    <Link ref={ref => (refs.current[obj.id!] = ref)} to={obj.href!}>
      {obj.body}
    </Link>
  );
};

const handleEpigraph = (obj: JsonType, refs: RefType) => {
  const { child, author, title, date } = obj;

  const hasAttribution = author || title || date;

  const attribution = [];
  attribution.push(<React.Fragment key="attribution">-</React.Fragment>);

  if (author) {
    attribution.push(<React.Fragment key="author">{author}</React.Fragment>);
  }

  if (title) {
    attribution.push(<i key="title">{title}</i>);
  }

  if (date) {
    attribution.push(<React.Fragment key="date">{date}</React.Fragment>);
  }

  const text = child && parseArr(child, refs);

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
      output: obj.output!
    };
    return <CodeSnippet {...CodeSnippetProps} />;
  }
};

const handleFigure = (obj: JsonType, refs: RefType) => (
  <AnchorLink id={obj.id} refs={refs} top={36}>
    <div className="sicp-figure">
      {obj.src && handleImage(obj, refs)}
      {obj.snippet && processingFunctions['SNIPPET'](obj.snippet, refs)}
      {obj.table && processingFunctions['TABLE'](obj.table, refs)}
      {obj.captionName && (
        <h5 className="sicp-caption">
          {obj.captionName}
          {parseArr(obj.captionBody!, refs)}
        </h5>
      )}
    </div>
  </AnchorLink>
);

const handleImage = (obj: JsonType, _refs: RefType) => {
  return <img src={Constants.sicpBackendUrl + obj.src} alt={obj.id} width={obj.scale || '100%'} />;
};

const handleTR = (obj: JsonType, refs: RefType, index: number) => {
  return <tr key={index}>{obj.child!.map((x, index) => handleTD(x, refs, index))}</tr>;
};

const handleTD = (obj: JsonType, refs: RefType, index: number) => {
  return <td key={index}>{parseArr(obj.child!, refs)}</td>;
};

const handleExercise = (obj: JsonType, refs: RefType) => {
  return (
    <AnchorLink id={obj.id} refs={refs} top={5}>
      <SicpExercise
        title={obj.title!}
        body={parseArr(obj.child!, refs)}
        solution={obj.solution && parseArr(obj.solution, refs)}
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

const handleReference = (obj: JsonType, refs: RefType) => {
  return <div className="sicp-reference">{parseArr(obj.child!, refs)}</div>;
};

const handleText = (text: string) => {
  return <>{text}</>;
};

const handleLatex = (math: string) => {
  return <SicpLatex math={math} />;
};

export const processingFunctions: Record<string, (obj: JsonType, refs: RefType) => JSX.Element> = {
  '#text': (obj, _refs) => handleText(obj.body!),

  B: (obj, refs) => <b>{parseArr(obj.child!, refs)}</b>,

  BR: (_obj, _refs) => <br />,

  DISPLAYFOOTNOTE: handleFootnote,

  EM: (obj, refs) => <em>{parseArr(obj.child!, refs)}</em>,

  EPIGRAPH: handleEpigraph,

  EXERCISE: handleExercise,

  FIGURE: handleFigure,

  FOOTNOTE_REF: (obj, refs) => (
    <sup ref={ref => (refs.current[obj.id!] = ref)}>{handleRef(obj, refs)}</sup>
  ),

  JAVASCRIPTINLINE: (obj, _refs) => <Code>{obj.body}</Code>,

  LATEX: (obj, _refs) => handleLatex(obj.body!),

  LI: (obj, refs) => <li>{parseArr(obj.child!, refs)}</li>,

  LINK: (obj, _refs) => <a href={obj.href}>{obj.body}</a>,

  META: (obj, _refs) => <em>{obj.body}</em>,

  OL: (obj, refs) => <OL>{parseArr(obj.child!, refs)}</OL>,

  REF: handleRef,

  REFERENCE: handleReference,

  SNIPPET: (obj, _refs) => handleSnippet(obj),

  SUBHEADING: (obj, refs) => (
    <AnchorLink id={obj.id} refs={refs} top={2}>
      <H2>{parseArr(obj.child!, refs)}</H2>
    </AnchorLink>
  ),

  SUBSUBHEADING: (obj, refs) => (
    <AnchorLink id={obj.id} refs={refs} top={16}>
      <H4>
        <br />
        {parseArr(obj.child!, refs)}
      </H4>
    </AnchorLink>
  ),

  TABLE: (obj, refs) => (
    <table>
      <tbody>{obj.child!.map((x, index) => handleTR(x, refs, index))}</tbody>
    </table>
  ),

  TEXT: (obj, refs) => (
    <AnchorLink id={obj.id} refs={refs} top={-3}>
      <p className="sicp-text">{parseArr(obj.child!, refs)}</p>
    </AnchorLink>
  ),

  TITLE: handleTitle,

  TT: (obj, refs) => <Code>{parseArr(obj.child!, refs)}</Code>,

  UL: (obj, refs) => <UL>{parseArr(obj.child!, refs)}</UL>
};

// Parse array of objects. An array of objects represent sibling nodes.
export const parseArr = (arr: Array<JsonType>, refs: RefType) => {
  if (!arr) {
    return <></>;
  }

  return <>{arr.map((item, index) => parseObj(item, index, refs))}</>;
};

// Parse an object.
export const parseObj = (obj: JsonType, index: number | undefined, refs: RefType) => {
  if (obj.tag) {
    if (processingFunctions[obj.tag]) {
      return <React.Fragment key={index}>{processingFunctions[obj.tag](obj, refs)}</React.Fragment>;
    } else {
      throw new ParseJsonError('Unrecognised Tag: ' + obj.tag);
    }
  } else {
    // Handle case where tag does not exists. Should not happen if json file is created properly.
    return <React.Fragment key={index}>{parseArr(obj.child!, refs)}</React.Fragment>;
  }
};
