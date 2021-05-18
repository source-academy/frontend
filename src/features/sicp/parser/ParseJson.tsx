import CodeSnippet from '../components/CodeSnippet';

type JsonType = {
  child: Array<JsonType>;
  tag: string;
  body: string;
  output: string;
};

let parentCount = 1;

const processText = {
  '#text': (obj: JsonType) => {
    return <p key={String(obj)} style={{ display: 'inline' }}>{obj['body']}</p>;
  },
  TEXT: (obj: JsonType) => {
    return (
        <br key={String(obj)}/>
    );
  },
  SUBSECTION: (obj: JsonType) => {
    return <h1 key={String(obj)}>{obj['body']}</h1>;
  },
  SNIPPET: (obj: JsonType) => {
    return <CodeSnippet key={String(obj)} body={obj['body']} output={obj['output']} />;
  }
};

export const parseJson = (jsonObj: Array<JsonType>): JSX.Element => {
  if (!jsonObj) return <></>;

  return <span key="root">{jsonObj.map((item: JsonType) => parseObj(item))}</span>;
};

const parseObj = (obj: JsonType) => {
  if (obj['tag']) {
    if (processText[obj['tag']]) {
      return processText[obj['tag']](obj);
    } else {
      return <span key={String(obj)}>{obj['body']}</span>;
    }
  } else {
    parentCount++;
    return <span key={parentCount}>{parseJson(obj['child'])}</span>;
  }
};
