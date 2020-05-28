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
  handleExternalSelect?: (i: External, e: React.ChangeEvent<HTMLSelectElement>) => void;
};

type StateProps = {
  externalLibraryName?: string;
  key: string;
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

  const externalSelect = (
    currentExternal: string,
    handleSelect: (i: External, e: React.ChangeEvent<HTMLSelectElement>) => void
  ) => (
    <ExternalSelectComponent
      className={Classes.MINIMAL}
      items={iExternals}
      onItemSelect={handleSelect}
      itemRenderer={externalRenderer}
      filterable={false}
    >
      <Button
        className={Classes.MINIMAL}
        text={currentExternal}
        rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
      />
    </ExternalSelectComponent>
  );

  return externalSelect(props.externalLibraryName!, props.handleExternalSelect!);
}
