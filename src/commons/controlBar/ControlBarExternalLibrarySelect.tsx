import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';

import {
  External,
  externalLibraries,
  ExternalLibraryName
} from '../application/types/ExternalTypes';

type ControlBarExternalLibrarySelectProps = DispatchProps & StateProps;

type DispatchProps = {
  handleExternalSelect: (i: External, e?: React.SyntheticEvent<HTMLElement>) => void;
};

type StateProps = {
  externalLibraryName: string;
  key: string;
  disabled?: boolean;
};

export function ControlBarExternalLibrarySelect(props: ControlBarExternalLibrarySelectProps) {
  const iExternals = Array.from(externalLibraries.entries()).map((entry, index) => ({
    name: entry[0] as ExternalLibraryName,
    key: index,
    symbols: entry[1]
  }));

  const ExternalSelectComponent = Select.ofType<External>();

  const externalRenderer: ItemRenderer<External> = (
    external,
    { handleClick, modifiers, query }
  ) => <MenuItem active={false} key={external.key} onClick={handleClick} text={external.name} />;

  return (
    <ExternalSelectComponent
      className={Classes.MINIMAL}
      items={iExternals}
      onItemSelect={props.handleExternalSelect}
      itemRenderer={externalRenderer}
      filterable={false}
      disabled={props.disabled}
    >
      <Button
        className={Classes.MINIMAL}
        text={props.externalLibraryName}
        rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
        disabled={props.disabled}
      />
    </ExternalSelectComponent>
  );
}
