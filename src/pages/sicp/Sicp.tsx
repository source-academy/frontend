import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';
import { RouteComponentProps, useParams } from 'react-router';

import testData from '../../features/sicp/data/test.json';
import SicpDisplay from './subcomponents/SicpDisplay';

type SicpProps = OwnProps & RouteComponentProps<{}>;
type OwnProps = {};

const Sicp: React.FC<SicpProps> = props => {
  const [data, setData] = React.useState<any[]>([]);
  const [isJson, setIsJson] = React.useState(false);

  const { section } = useParams<{ section: string }>();

  const baseUrl = '/sicp/json/';
  const extension = '.json';

  React.useEffect(() => {
    if (!section) {
      setIsJson(false);
      return;
    }

    setIsJson(true);

    if (section === 'test') {
      setData(testData as any[]);
      return;
    }

    fetch(baseUrl + section + extension)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(myJson => {
        setData(myJson);
      })
      .catch(error => console.log(error));
  }, [section]);

  return (
    <div className={classNames('Sicp', Classes.DARK)}>
      <SicpDisplay content={data} isJson={isJson} {...props} />
    </div>
  );
};

export default Sicp;
