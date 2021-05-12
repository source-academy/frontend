import * as React from 'react';
import { useEffect, useState } from 'react';
import { SicpChapter } from 'src/features/sicp/SicpTypes';

import SicpDisplay from './subcomponents/SicpDisplay';

export type SicpProps = DispatchProps & StateProps & OwnProps;
export type DispatchProps = {
  handleChangeChapter: (chapter: SicpChapter) => void;
};
export type StateProps = {
  chapter: SicpChapter;
};
export type OwnProps = {};

const Sicp: React.FC<SicpProps> = props => {
  // const { chapter } = props;

  const [data, setData] = useState([]);
  // const [text, setText] = useState("");

  const getData = () => {
    fetch('https://raw.githubusercontent.com/samuelfangjw/test-repo/main/test.json')
      .then(response => {
          console.log(response);
          return response.json();
        })
      .then(myJson => {
          console.log(myJson);
          setData(myJson);
        });
  };

  useEffect(() => getData(), []);

  //TODO check for null json files, get correct type
  let text = "";
  text += data["body"];
  // data.forEach(x => text = text + x["body"]);
  // const content = text + "test" + chapter;

  
  return (
    <SicpDisplay content={text} />
  );
};

export default Sicp;
