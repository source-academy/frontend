import CodeSnippet from '../components/CodeSnippet';

type JsonType = {
  child: Array<JsonType>;
  tag: string;
  body: string;
  output: string;
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
        <div>{parseJson(obj['child'])}</div>
        <br />
      </>
    );
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
    return <CodeSnippet key={key} body={obj['body']} output={obj['output']} />;
  }
};

export const parseJson = (obj: Array<JsonType>): JSX.Element => {
  if (!obj) return <></>;

  return <span key="root">{obj.map((item: JsonType) => parseObj(item))}</span>;
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
