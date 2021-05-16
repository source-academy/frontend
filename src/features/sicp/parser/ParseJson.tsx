import CodeSnippet from "../components/CodeSnippet";

let handleClick = () => {};

type JsonType = {
  child: Array<JsonType>;
  tag: string;
  body: string;
  output: string;
};

const processText = {
  '#text': (obj: JsonType) => {
    return <p style={{display: "inline"}}>{obj['body']}</p>;
  },
  'TEXT': (obj: JsonType) => {
    return <><br/><br/></>;
  },
  'SUBSECTION': (obj: JsonType) => {
    return <h1>{obj['body']}</h1>
  },
  'SNIPPET': (obj: JsonType) => {
    return <CodeSnippet body={obj['body']} output={obj['output']}/>
  }
};

export const parseJson = (jsonObj: Array<JsonType>, _handleClick: () => void): JSX.Element => {
  handleClick = _handleClick;
  
  if (!jsonObj) return <></>;

  return <>{jsonObj.map((item: JsonType) => parseObj(item))}</>;
};

const parseObj = (obj: JsonType) => {
  if (obj['tag']) {
    if (processText[obj['tag']]) {
      return processText[obj['tag']](obj);
    } else {
      return <>{obj['body']}</>;
    }
  } else {
    return <>{parseJson(obj['child'], handleClick)}</>;
  }
};
