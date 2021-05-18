import { Classes, Drawer, Position } from '@blueprintjs/core';
import classNames from 'classnames';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { parseQuery } from 'src/commons/utils/QueryHelper';
import SicpControlBar from 'src/features/sicp/components/SicpControlBar';
import SicpToc from 'src/features/sicp/components/SicpToc';

import SicpDisplay from './subcomponents/SicpDisplay';

export type SicpProps = OwnProps & RouteComponentProps<{}>;
export type OwnProps = {};

const parseHash = (hash: string) => {
  if (hash) {
    const qs = parseQuery(hash);
    return qs.section;
  }

  return '1';
};

const Sicp: React.FC<SicpProps> = props => {
  const [data, setData] = useState([]);
  const [isTocOpen, setIsTocOpen] = useState(false);

  const baseUrl = '/sicp/json/';
  const extension = '.json';

  const getData = useCallback((hash: string) => {
    const section = parseHash(hash);
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
    size: '360px',
    usePortal: false
  };

  return (
    <div className={classNames('Sicp', Classes.DARK)}>
      <Drawer {...drawerProps}>
        <SicpToc handleCloseToc={handleCloseToc} location="sidebar" />
      </Drawer>
      <SicpControlBar {...controlBarProps} />
      <SicpDisplay content={data} />
    </div>
  );
};

export default Sicp;
