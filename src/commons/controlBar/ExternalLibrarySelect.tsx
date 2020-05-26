import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';

import { ExternalLibraryName } from 'src/commons/assessment/AssessmentTypes';
import { externalLibraries } from 'src/reducers/externalLibraries'; // TODO: Import from commons

// TODO: There is duplicate on EditingWorkspaceSideContent\DeploymentTab
/**
 * Defined for displaying an external library.
 * @see Library under assessmentShape.ts for
 *   the definition of a Library in an assessment.
 */
type External = {
  key: number;
  name: ExternalLibraryName;
  symbols: string[];
};

type ExternalLibrarySelectProps = DispatchProps & StateProps;

type DispatchProps = {
  handleExternalSelect?: (i: External, e: React.ChangeEvent<HTMLSelectElement>) => void;
};

type StateProps = {
  externalLibraryName?: string;
  key: string;
};

export function ExternalLibrarySelect(props: ExternalLibrarySelectProps) {
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
