import { Blockquote, H1, H2, OL } from '@blueprintjs/core';
import TeX from '@matejmazur/react-katex';
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
  latex: boolean;
  author: string;
  date: string;
  title: string;
  solution: Array<JsonType>;
  id: string;
  withoutPrepend: string;
  prepend: string;
  program: string;
};

const processText = {
  DISPLAYFOOTNOTE: (obj: JsonType) => {
    return (
      <>
        <hr />
        <div className="sicp-footnote">{parseJson(obj['child'])}</div>
      </>
    );
  },
  EPIGRAPH: (obj: JsonType) => {
    return parseEpigraph(obj);
  },
  '#text': (obj: JsonType) => {
    return <p>{obj['body']}</p>;
  },
  EXERCISE: (obj: JsonType) => {
    return parseExercise(obj);
  },
  TEXT: (obj: JsonType) => {
    return (
      <>
        <div id={obj['id']} className="sicp-text">
          {parseJson(obj['child'])}
        </div>
        <br />
      </>
    );
  },
  FIGURE: (obj: JsonType) => {
    return obj['images'].map(x => parseImage(x));
  },
  SUBHEADING: (obj: JsonType) => {
    return <H2>{obj['child'][0]['child'][0]['body']}</H2>;
  },
  CHAPTER: (obj: JsonType) => {
    return parseContainer(obj);
  },
  SECTION: (obj: JsonType) => {
    return parseContainer(obj);
  },
  MATTER: (obj: JsonType) => {
    return parseContainer(obj);
  },
  SUBSECTION: (obj: JsonType) => {
    return parseContainer(obj);
  },
  SNIPPET: (obj: JsonType) => {
    if (obj['latex']) {
      return (
        <pre>
          <code>{parseJson(obj['child'])}</code>
        </pre>
      );
    } else {
      const CodeSnippetProps = {
        body: obj['body'],
        output: obj['output'],
        id: obj['id'],
        initialEditorValueHash: obj['withoutPrepend'],
        initialPrependHash: obj['prepend'],
        initialFullProgramHash: obj['program'],
      };
      return <CodeSnippet {...CodeSnippetProps} />;
    }
  },
  SPACE: (obj: JsonType) => {
    return parseText(' ');
  },
  REFERENCES: (obj: JsonType) => {
    return parseContainer(obj);
  },
  JAVASCRIPT: (obj: JsonType) => {
    return <code>{obj['output']}</code>;
  },
  JAVASCRIPTINLINE: (obj: JsonType) => {
    return <code>{obj['body']}</code>;
  },
  LaTeX: (obj: JsonType) => {
    return parseText('LaTeX');
  },
  LATEX: (obj: JsonType) => {
    return parseLatex(obj['body'], false);
  },
  LATEXINLINE: (obj: JsonType) => {
    return parseLatex(obj['body'], true);
  },
  OL: (obj: JsonType) => {
    return (
      <OL key="OL">
        {obj['child'].map((x, index) => (
          //TODO BUG NON-UNIQUE KEY
          <li key={index}>{parseObj(x, undefined)}</li>
        ))}
      </OL>
    );
  }
};

function parseEpigraph(obj: JsonType) {
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
      {child.map((x, index) => parseObj(x, index))}
      {hasAttribution ? <div className="sicp-attribution">{attribution}</div> : <></>}
    </Blockquote>
  );
}

function parseExercise(obj: JsonType) {
  return (
    <SicpExercise
      title={obj['title']}
      body={parseJson(obj['child'])}
      solution={parseJson(obj['solution'])}
    />
  );
}

const parseContainer = (obj: JsonType) => {
  return (
    <>
      {parseHeading(obj['body'])}
      <div>{parseJson(obj['child'])}</div>
    </>
  );
};

const parseHeading = (heading: string) => {
  return <H1>{heading}</H1>;
};

const parseText = (text: string) => {
  return <p>{text}</p>;
};

const parseLatex = (math: string, inline: boolean) => {
  if (inline) {
    return <TeX math={math} />;
  } else {
    // block math
    return <TeX math={math} block />;
  }
};

const parseImage = (obj: JsonType) => {
  return (
    <div className={'sicp-figure'}>
      {obj['src'] ? <img src={'/sicp/' + obj['src']} alt={'Figure'} /> : <></>}
      {obj['captionName'] ? <h5>{obj['captionName']}</h5> : <></>}
    </div>
  );
};

export const parseJson = (obj: Array<JsonType>) => {
  if (!obj) {
    return <></>;
  }

  return <>{obj.map((item, index) => parseObj(item, index))}</>;
};

const parseObj = (obj: JsonType, index: number | undefined) => {
  if (obj['tag']) {
    if (processText[obj['tag']]) {
      return <span key={index}>{processText[obj['tag']](obj)}</span>;
    } else {
      return (
        <span style={{ color: 'red' }} key={index}>
          {obj['tag'] + ' ' + obj['body']}
        </span>
      );
    }
  } else {
    return <span key={index}>{parseJson(obj['child'])}</span>;
  }
};
