import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';

// TODO: Import from commons
import { externalLibraries } from '../../reducers/externalLibraries';
import { ExternalLibraryName } from '../assessment/AssessmentTypes';

/**
 * Defined for displaying an external library.
 * @see Library under assessmentShape.ts for
 *   the definition of a Library in an assessment.
 */
export interface IExternal {
  key: number;
  name: ExternalLibraryName;
  symbols: string[];
}

export type ExternalLibrarySelectProps = {
  externalLibraryName?: string;
  handleExternalSelect?: (i: IExternal, e: React.ChangeEvent<HTMLSelectElement>) => void;
  key: string;
};

export function ExternalLibrarySelect(props: ExternalLibrarySelectProps) {
  const iExternals = Array.from(externalLibraries.entries()).map((entry, index) => ({
    name: entry[0] as ExternalLibraryName,
    key: index,
    symbols: entry[1]
  }));

  const ExternalSelectComponent = Select.ofType<IExternal>();

  const externalRenderer: ItemRenderer<IExternal> = (
    external,
    { handleClick, modifiers, query }
  ) => <MenuItem active={false} key={external.key} onClick={handleClick} text={external.name} />;

  const externalSelect = (
    currentExternal: string,
    handleSelect: (i: IExternal, e: React.ChangeEvent<HTMLSelectElement>) => void
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
