import * as React from 'react';
import { useEffect, useState } from 'react';

import SicpDisplay from './subcomponents/SicpDisplay';

export type SicpProps = OwnProps;
export type OwnProps = {
  chapter: integer;
};

const Sicp: React.FC<SicpProps> = props => {
  // const { chapter } = props;

  const [data, setData] = useState([]);
  // const [text, setText] = useState("");
  const dataUrl = '/temp/1.1.1.json';

  const getData = () => {
    fetch(dataUrl)
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
  // data.forEach(x => text = text + x["body"]);
  // const content = text + "test" + chapter;

  
  return (
    <SicpDisplay content={data} />
  );
};

export default Sicp;
