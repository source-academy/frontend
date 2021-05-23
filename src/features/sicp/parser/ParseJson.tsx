import TeX from '@matejmazur/react-katex';

import CodeSnippet from '../components/CodeSnippet';

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
};

let key = 0;

const processText = {
  DISPLAYFOOTNOTE: (obj: JsonType) => {
    return (
      <>
        <hr />
        <div className="sicp-footnote">{parseJson(obj['child'])}</div>
      </>
    );
  },
  '#text': (obj: JsonType) => {
    return (
      <p key={key} style={{ display: 'inline' }}>
        {obj['body']}
      </p>
    );
  },
  TEXT: (obj: JsonType) => {
    return (
      <>
        <div className="sicp-text">{parseJson(obj['child'])}</div>
        <br />
      </>
    );
  },
  FIGURE: (obj: JsonType) => {
    return obj['images'].map(x => parseImage(x));
  },
  CHAPTER: (obj: JsonType) => {
    return processText['SUBSECTION'](obj);
  },
  SECTION: (obj: JsonType) => {
    return processText['SUBSECTION'](obj);
  },
  SUBSECTION: (obj: JsonType) => {
    return (
      <>
        <h1 key={key}>{obj['body']}</h1>
        <div>{parseJson(obj['child'])}</div>
      </>
    );
  },
  SNIPPET: (obj: JsonType) => {
    if (obj['latex']) {
      return (
        <pre>
          <code>{parseJson(obj['child'])}</code>
        </pre>
      );
    } else {
      return <CodeSnippet key={key} body={obj['body']} output={obj['output']} />;
    }
  },
  JAVASCRIPT: (obj: JsonType) => {
    return <code>{obj['output']}</code>;
  },
  LATEX: (obj: JsonType) => {
    return parseLatex(obj['body'], false);
  },
  LATEXINLINE: (obj: JsonType) => {
    return parseLatex(obj['body'], true);
  }
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
  if (!obj) return <></>;

  return <>{obj.map((item: JsonType) => parseObj(item))}</>;
};

const parseObj = (obj: JsonType) => {
  key++;
  if (obj['tag']) {
    if (processText[obj['tag']]) {
      return processText[obj['tag']](obj);
    } else {
      return <span key={key}>{obj['body']}</span>;
    }
  } else {
    return <span key={key}>{parseJson(obj['child'])}</span>;
  }
};
