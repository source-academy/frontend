import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import SicpDisplay from './subcomponents/SicpDisplay';

export type SicpProps = OwnProps;
export type OwnProps = {};

const Sicp: React.FC<SicpProps> = props => {
  const [section] = useState('1.1.1');
  const [data, setData] = useState([]);
  // const [text, setText] = useState("");
  const baseUrl = '/sicp/json/';
  const extension = '.json';

  const getData = useCallback(() => {
    fetch(baseUrl + section + extension)
      .then(response => {
        if (!response.ok) {
          console.log(response.statusText);
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(myJson => {
        // console.log(myJson);
        setData(myJson);
      })
      .catch(error => console.log(error));
  }, [section]);

  useEffect(() => getData(), [getData, section]);

  //TODO check for null json files, get correct type
  // data.forEach(x => text = text + x["body"]);
  // const content = text + "test" + chapter;

  return <SicpDisplay content={data} />;
};

export default Sicp;
