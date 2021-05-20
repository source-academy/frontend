import { Classes, Drawer, Position } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { parseQuery } from 'src/commons/utils/QueryHelper';
import SicpControlBar from 'src/features/sicp/components/SicpControlBar';
import SicpToc from 'src/features/sicp/components/SicpToc';

import SicpDisplay from '../../features/sicp/components/SicpDisplay';
import testData from '../../features/sicp/data/test.json'

type SicpProps = OwnProps & RouteComponentProps<{}>;
type OwnProps = {};

const parseHash = (hash: string) => {
  if (hash) {
    const qs = parseQuery(hash);
    return qs.section;
  }

  return 'index';
};

const Sicp: React.FC<SicpProps> = props => {
  const [data, setData] = useState<any[]>([]);
  const [isJson, setIsJson] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);

  const baseUrl = '/sicp/json/';
  const extension = '.json';

  const getData = useCallback((hash: string) => {
    const section = parseHash(hash);
    if (section === 'index') {
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
  }, []);

  useEffect(() => getData(props.location.hash), [getData, props.location.hash]);

  const controlBarProps = {
    handleOpenToc: () => setIsTocOpen(true)
  };

  const handleCloseToc = () => setIsTocOpen(false);

  const drawerProps = {
    onClose: handleCloseToc,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    hasBackdrop: true,
    isOpen: isTocOpen,
    position: Position.LEFT,
    size: '500px',
    usePortal: false
  };

  return (
    <div className={classNames('Sicp', Classes.DARK)}>
      <Drawer {...drawerProps}>
        <SicpToc handleCloseToc={handleCloseToc} location="sidebar" />
      </Drawer>
      <SicpControlBar {...controlBarProps} />
      <SicpDisplay content={data} isJson={isJson}/>
    </div>
  );
};

export default Sicp;
