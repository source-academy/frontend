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

const getKey = () => {
  return key++;
}

const processText = {
  APOS: (obj: JsonType) => {
    return parseText("'");
  },
  AMP: (obj: JsonType) => {
    return parseText("&");
  },
  DISPLAYFOOTNOTE: (obj: JsonType) => {
    return (
      <>
        <hr key={getKey()}/>
        <div key={getKey()} className="sicp-footnote">{parseJson(obj['child'])}</div>
      </>
    );
  },
  '#text': (obj: JsonType) => {
    return <p key={getKey()}>{obj['body']}</p>;
  },
  ELLIPSIS: (obj: JsonType) => {
    return parseText('…');
  },
  ENDASH: (obj: JsonType) => {
    return parseText('–');
  },
  EMDASH: (obj: JsonType) => {
    return parseText('—');
  },
  TEXT: (obj: JsonType) => {
    return (
      <>
        <div className="sicp-text" key={getKey()}>{parseJson(obj['child'])}</div>
        <br />
      </>
    );
  },
  FIGURE: (obj: JsonType) => {
    return obj['images'].map(x => parseImage(x));
  },
  SUBHEADING: (obj: JsonType) => {
    return <h2 key={getKey()}>{obj['child'][0]['child'][0]['body']}</h2>;
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
        <pre key={getKey()}>
          <code>{parseJson(obj['child'])}</code>
        </pre>
      );
    } else {
      return <CodeSnippet key={getKey()} body={obj['body']} output={obj['output']} />;
    }
  },
  SPACE: (obj: JsonType) => {
    return parseText(' ');
  },
  REFERENCES: (obj: JsonType) => {
    return parseContainer(obj);
  },
  JAVASCRIPT: (obj: JsonType) => {
    return <code key={getKey()}>{obj['output']}</code>;
  },
  JAVASCRIPTINLINE: (obj: JsonType) => {
    return  <code key={getKey()}>{obj['body']}</code>;
  },
  LaTeX: (obj: JsonType) => {
    return parseText("LaTeX");
  },
  LATEX: (obj: JsonType) => {
    return parseLatex(obj['body'], false);
  },
  LATEXINLINE: (obj: JsonType) => {
    return parseLatex(obj['body'], true);
  },
  OUML_LOWER: (obj: JsonType) => {
    return parseText("ö");
  },
  CCEDIL_LOWER: (obj: JsonType) => {
    return parseText("ç");
  },
  EACUTE_LOWER: (obj: JsonType) => {
    return parseText("é");
  },
  EGRAVE_LOWER: (obj: JsonType) => {
    return parseText("è");
  },
  AGRAVE_LOWER:  (obj: JsonType) => {
    return parseText("à");
  },
};

const parseContainer = (obj: JsonType) => {
  return (
    <>
      {parseHeading(obj['body'])}
      <div key={getKey()}>{parseJson(obj['child'])}</div>;
    </>
  );
};

const parseHeading = (heading: string) => {
  return <h1 key={getKey()}>{heading}</h1>;
}

const parseText = (text: string) => {
  return <p key={getKey()}>{text}</p>;
};

const parseLatex = (math: string, inline: boolean) => {
  if (inline) {
    return <TeX math={math} key={getKey()}/>;
  } else {
    // block math
    return <TeX math={math} block key={getKey()}/>;
  }
};

const parseImage = (obj: JsonType) => {
  return (
    <div className={'sicp-figure'} key={getKey()}>
      {obj['src'] ? <img src={'/sicp/' + obj['src']} alt={'Figure'} /> : <></>}
      {obj['captionName'] ? <h5>{obj['captionName']}</h5> : <></>}
    </div>
  );
};

export const parseJson = (obj: Array<JsonType>) => {
  if (!obj) return <></>;

  return <span key={getKey()}>{obj.map((item: JsonType) => parseObj(item))}</span>;
};

const parseObj = (obj: JsonType) => {
  key++;
  if (obj['tag']) {
    if (processText[obj['tag']]) {
      return processText[obj['tag']](obj);
    } else {
      return (
        <span key={getKey()} style={{ color: 'red' }}>
          {obj['tag'] + ' ' + obj['body']}
        </span>
      );
    }
  } else {
    return <span key={getKey()}>{parseJson(obj['child'])}</span>;
  }
};
