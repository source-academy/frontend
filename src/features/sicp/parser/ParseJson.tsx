import { Blockquote, H1, OL, UL } from '@blueprintjs/core';
import { MathJax } from 'better-react-mathjax';
import { Links } from 'src/commons/utils/Constants';
import SicpExercise from 'src/pages/sicp/subcomponents/SicpExercise';

import CodeSnippet from '../../../pages/sicp/subcomponents/CodeSnippet';

type JsonType = {
  child: Array<JsonType>;
  tag: string;
  body: string;
  output: string;
  scale: string;
  snippet: JsonType;
  table: JsonType;
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
  eval: string;
};

const processingFunctions = {
  '#text': (obj: JsonType, _refs: React.MutableRefObject<{}>) => <p>{obj['body']}</p>,

  B: (obj: JsonType, refs: React.MutableRefObject<{}>) => <b>{parseArr(obj['child'], refs)}</b>,

  BR: (_obj: JsonType, _refs: React.MutableRefObject<{}>) => <br />,

  CHAPTER: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleContainer(obj, refs),

  DISPLAYFOOTNOTE: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleFootnote(obj, refs),

  EM: (obj: JsonType, refs: React.MutableRefObject<{}>) => <em>{parseArr(obj['child'], refs)}</em>,

  EPIGRAPH: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleEpigraph(obj, refs),

  EXERCISE: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleExercise(obj, refs),

  FIGURE: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleFigure(obj, refs),

  FOOTNOTE_REF: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <sup>{handleRef(obj, refs)}</sup>
  ),

  JAVASCRIPT: (obj: JsonType, _refs: React.MutableRefObject<{}>) => <code>{obj['output']}</code>,

  JAVASCRIPTINLINE: (obj: JsonType, _refs: React.MutableRefObject<{}>) => (
    <code>{obj['body']}</code>
  ),

  LATEX: (obj: JsonType, _refs: React.MutableRefObject<{}>) => handleLatex(obj['body'], true),

  LATEXINLINE: (obj: JsonType, _refs: React.MutableRefObject<{}>) =>
    handleLatex(obj['body'], false),

  LI: (obj: JsonType, refs: React.MutableRefObject<{}>) => <li>{parseArr(obj['child'], refs)}</li>,

  LINK: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <a href={obj['body']}>{parseArr(obj['child'], refs)}</a>
  ),

  LaTeX: (_obj: JsonType, _refs: React.MutableRefObject<{}>) => handleText('LaTeX'),

  MATTER: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleContainer(obj, refs),

  META: (obj: JsonType, _refs: React.MutableRefObject<{}>) => handleLatex(obj['body'], false),

  METAPHRASE: (obj: JsonType, _refs: React.MutableRefObject<{}>) =>
    handleLatex('$\\langle$ ' + obj['body'] + ' $\\rangle$', false),

  OL: (obj: JsonType, refs: React.MutableRefObject<{}>) => <OL>{parseArr(obj['child'], refs)}</OL>,

  REF: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleRef(obj, refs),

  REFERENCE: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleContainer(obj, refs),

  REFERENCES: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleContainer(obj, refs),

  SECTION: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleContainer(obj, refs),

  SNIPPET: (obj: JsonType, _refs: React.MutableRefObject<{}>) => {
    if (obj['latex']) {
      return (
        <pre>
          <code>{handleLatex(obj['body'], true)}</code>
        </pre>
      );
    } else if (!obj['eval']) {
      return (
        <pre>
          <code>{obj['body']}</code>
        </pre>
      );
    } else {
      if (!obj['body']) {
        return;
      }

      const CodeSnippetProps = {
        body: obj['body'],
        id: obj['id'],
        initialEditorValueHash: obj['withoutPrepend'],
        initialFullProgramHash: obj['program'],
        initialPrependHash: obj['prepend'],
        output: obj['output']
      };
      return <CodeSnippet {...CodeSnippetProps} />;
    }
  },

  SUBHEADING: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <h2 ref={ref => (refs.current[obj['id']] = ref)}>{obj['child'][0]['child'][0]['body']}</h2>
  ),

  SUBSECTION: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleContainer(obj, refs),

  SUBSUBHEADING: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <h4 ref={ref => (refs.current[obj['id']] = ref)}>
      <br />
      {parseArr(obj['child'], refs)}
    </h4>
  ),

  SUBSUBSECTION: (obj: JsonType, refs: React.MutableRefObject<{}>) => handleContainer(obj, refs),

  TABLE: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <table>
      <tbody>{obj['child'].map((x, index) => handleTR(x, refs, index))}</tbody>
    </table>
  ),

  TEXT: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <>
      <div ref={ref => (refs.current[obj['id']] = ref)} className="sicp-text">
        {parseArr(obj['child'], refs)}
      </div>
      <br />
    </>
  ),

  TT: (obj: JsonType, refs: React.MutableRefObject<{}>) => (
    <code>{parseArr(obj['child'], refs)}</code>
  ),

  TeX: (_obj: JsonType, _refs: React.MutableRefObject<{}>) => handleText('TeX'),

  UL: (obj: JsonType, refs: React.MutableRefObject<{}>) => <UL>{parseArr(obj['child'], refs)}</UL>
};

const handleFootnote = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <>
      {obj['count'] === 1 && <hr />}
      <div ref={ref => (refs.current[obj['id']] = ref)} className="sicp-footnote">
        <a href={obj['href']}>{'[' + obj['count'] + '] '}</a>
        {parseArr(obj['child'], refs)}
      </div>
    </>
  );
};

const handleRef = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  return (
    <a ref={ref => (refs.current[obj['id']] = ref)} href={obj['href']}>
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

  return (
    <Blockquote className="sicp-epigraph">
      {child.map((x, index) => parseObj(x, index, refs))}
      {hasAttribution ? <div className="sicp-attribution">{attribution}</div> : <></>}
    </Blockquote>
  );
};

const handleFigure = (obj: JsonType, refs: React.MutableRefObject<{}>) => (
  <div ref={ref => (refs.current[obj['id']] = ref)} className="sicp-figure">
    {handleImage(obj, refs)}
    {obj['captionName'] && (
      <h5>
        {obj['captionName']}
        {parseArr(obj['captionBody'], refs)}
      </h5>
    )}
  </div>
);

const handleImage = (obj: JsonType, refs: React.MutableRefObject<{}>) => {
  if (obj['src']) {
    return (
      <div className={'sicp-figure'}>
        {obj['src'] && <img src={Links.textbook + obj['src']} alt={obj['id']} />}
      </div>
    );
  } else if (obj['snippet']) {
    return processingFunctions['SNIPPET'](obj['snippet'], refs);
  } else if (obj['table']) {
    return processingFunctions['TABLE'](obj['table'], refs);
  } else {
    console.log('parseJson error: Figure has no image');
    return <></>;
  }
};

const handleTR = (obj: JsonType, refs: React.MutableRefObject<{}>, index: integer) => {
  return <tr key={index}>{obj['child'].map((x, index) => handleTD(x, refs, index))}</tr>;
};

const handleTD = (obj: JsonType, refs: React.MutableRefObject<{}>, index: integer) => {
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
  if (block) {
    return <MathJax>{math}</MathJax>;
  } else {
    return <MathJax inline>{math}</MathJax>;
  }
};

export const parseArr = (arr: Array<JsonType>, refs: React.MutableRefObject<{}>) => {
  if (!arr) {
    return <></>;
  }

  return <>{arr.map((item, index) => parseObj(item, index, refs))}</>;
};

const parseObj = (obj: JsonType, index: number | undefined, refs: React.MutableRefObject<{}>) => {
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
