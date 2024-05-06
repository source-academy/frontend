import { Button, Classes, Divider, MenuItem, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { Chapter, Variant } from 'js-slang/dist/types';
import React from 'react';

import { SALanguage, sourceLanguages, styliseSublanguage } from '../application/ApplicationTypes';
import {
  External,
  externalLibraries,
  ExternalLibraryName
} from '../application/types/ExternalTypes';
import { Assessment, emptyLibrary, Library } from '../assessment/AssessmentTypes';
import ControlButton from '../ControlButton';
import { assignToPath, getValueFromPath } from './EditingWorkspaceSideContentHelper';
import TextAreaContent from './EditingWorkspaceSideContentTextAreaContent';

type DeploymentTabProps = DispatchProps & StateProps;

type DispatchProps = {
  updateAssessment: (assessment: Assessment) => void;
  handleRefreshLibrary: (library: Library) => void;
};

type StateProps = {
  assessment: Assessment;
  label: string;
  pathToLibrary: Array<string | number>;
  pathToCopy?: Array<string | number>;
  isOptionalDeployment: boolean;
};

const DeploymentTab: React.FC<DeploymentTabProps> = props => {
  const deploymentTab = () => {
    const deploymentPath = props.pathToLibrary;
    const deployment = getValueFromPath(deploymentPath, props.assessment) as Library;
    // const deploymentDisp = props.isGlobalDeployment ? 'Global Deployment' : 'Local Deployment';
    const symbols = deployment.external.symbols.map((symbol, i) => (
      <tr key={i}>
        <td>{textareaContent(deploymentPath.concat(['external', 'symbols', i]))}</td>
        <td style={{ width: '100px' }}>
          <ControlButton label="Delete" icon={IconNames.MINUS} onClick={handleSymbolDelete(i)} />
        </td>
      </tr>
    ));

    const globals = deployment.globals.map((symbol, i) => (
      <tr key={i}>
        <td style={{ width: '170px' }}>
          {textareaContent(deploymentPath.concat(['globals', i, 0]))}
        </td>
        <td>{globalValueTextareaContent(i)}</td>
        <td style={{ width: '90px' }}>
          <ControlButton label="Delete" icon={IconNames.MINUS} onClick={handleGlobalDelete(i)} />
        </td>
      </tr>
    ));

    const resetLibrary = (
      <ControlButton
        label="Use this Library"
        icon={IconNames.REFRESH}
        onClick={() => props.handleRefreshLibrary(deployment)}
      />
    );

    const symbolsFragment = (
      <React.Fragment>
        External Library:
        <br />
        {externalSelect(deployment.external.name, handleExternalSelect)}
        <Divider />
        <div>Symbols:</div>
        <br />
        <table style={{ width: '100%' }}>
          <tbody>{symbols}</tbody>
        </table>
        <ControlButton label="New Symbol" icon={IconNames.PLUS} onClick={handleNewSymbol} />
      </React.Fragment>
    );

    const globalsFragment = (
      <React.Fragment>
        <div>Globals:</div>
        <br />
        <table style={{ width: '100%', borderSpacing: '5px' }}>
          <tbody>{globals}</tbody>
        </table>
        <ControlButton label="New Global" icon={IconNames.PLUS} onClick={handleNewGlobal} />
      </React.Fragment>
    );

    return (
      <div>
        {/* {deploymentDisp}
        <br /> */}
        <Divider />
        {resetLibrary}
        <Divider />
        Interpreter:
        <br />
        {chapterSelect(deployment.chapter, deployment.variant, handleChapterSelect)}
        <Divider />
        {symbolsFragment}
        <Divider />
        {globalsFragment}
      </div>
    );
  };

  const textareaContent = (path: Array<string | number>) => {
    return (
      <TextAreaContent
        assessment={props.assessment}
        path={path}
        processResults={removeSpaces}
        updateAssessment={props.updateAssessment}
        useRawValue={true}
      />
    );
  };

  const globalValueTextareaContent = (i: number) => {
    const pathVal = props.pathToLibrary.concat(['globals', i, 2]);
    return (
      <TextAreaContent
        assessment={props.assessment}
        path={pathVal}
        updateAssessment={handleGlobalValueUpdate(i)}
        useRawValue={true}
      />
    );
  };

  const handleGlobalValueUpdate = (i: number) => (assessment: Assessment) => {
    const deployment = getValueFromPath(props.pathToLibrary, props.assessment) as Library;
    const global = deployment.globals[i];
    try {
      global[1] = altEval(global[2]!);
      props.updateAssessment(assessment);
    } catch (e) {
      global[2] = '"Invalid Expression"';
    }
  };

  const handleSymbolDelete = (index: number) => () => {
    const assessment = props.assessment;
    const deployment = getValueFromPath(props.pathToLibrary, assessment) as Library;
    const symbols = deployment.external.symbols;
    symbols.splice(index, 1);
    props.updateAssessment(assessment);
  };

  const handleNewSymbol = () => {
    const assessment = props.assessment;
    const deployment = getValueFromPath(props.pathToLibrary, assessment) as Library;
    const symbols = deployment.external.symbols;
    symbols.push('new_symbol');
    props.updateAssessment(assessment);
  };

  const handleGlobalDelete = (index: number) => () => {
    const assessment = props.assessment;
    const deployment = getValueFromPath(props.pathToLibrary, assessment) as Library;
    deployment.globals.splice(index, 1);
    props.updateAssessment(assessment);
  };

  const handleNewGlobal = () => {
    const assessment = props.assessment;
    const deployment = getValueFromPath(props.pathToLibrary, assessment) as Library;
    deployment.globals.push(['new_global', null, 'null']);
    props.updateAssessment(assessment);
  };

  const handleChapterSelect = (i: SALanguage, _e?: React.SyntheticEvent<HTMLElement>) => {
    const assessment = props.assessment;
    const deployment = getValueFromPath(props.pathToLibrary, assessment) as Library;
    deployment.chapter = i.chapter;
    props.updateAssessment(assessment);
  };

  const handleExternalSelect = (i: External, _e?: React.SyntheticEvent<HTMLElement>) => {
    const assessment = props.assessment;
    const deployment = getValueFromPath(props.pathToLibrary, assessment) as Library;
    deployment.external.name = i.name;
    deployment.external.symbols = JSON.parse(JSON.stringify(externalLibraries.get(i.name)!));
    props.updateAssessment(assessment);
  };

  const handleSwitchDeployment = () => {
    const assessment = props.assessment;
    if (isEmptyLibrary()) {
      let library = getValueFromPath(
        props.pathToCopy || ['globalDeployment'],
        assessment
      ) as Library;
      if (library.chapter === -1) {
        library = assessment.globalDeployment!;
      }
      library = JSON.parse(JSON.stringify(library));
      assignToPath(props.pathToLibrary, library, assessment);
    } else {
      assignToPath(props.pathToLibrary, emptyLibrary(), assessment);
    }
    props.updateAssessment(assessment);
  };

  const isEmptyLibrary = (path: Array<string | number> = props.pathToLibrary) => {
    return getValueFromPath(path.concat(['chapter']), props.assessment) === -1;
  };

  if (!props.isOptionalDeployment) {
    return (
      <div>
        {props.label + ' Deployment'}
        <br />
        {deploymentTab()}
      </div>
    );
  } else {
    return (
      <div>
        <Switch
          checked={!isEmptyLibrary()}
          label={'Enable ' + props.label + ' Deployment'}
          onChange={handleSwitchDeployment}
        />
        {isEmptyLibrary() ? null : deploymentTab()}
      </div>
    );
  }
};

const removeSpaces = (str: string | number) => {
  return typeof str === 'string' ? str.replace(/\s+/g, '') : str;
};

const altEval = (str: string): any => {
  return Function('"use strict";return (' + str + ')')();
};

const chapterSelect = (
  currentChap: Chapter,
  variant: Variant = Variant.DEFAULT,
  handleSelect = (i: SALanguage, e?: React.SyntheticEvent<HTMLElement>) => {}
) => (
  <ChapterSelectComponent
    className={Classes.MINIMAL}
    items={sourceLanguages}
    onItemSelect={handleSelect}
    itemRenderer={chapterRenderer}
    filterable={false}
  >
    <Button
      minimal
      text={styliseSublanguage(currentChap, variant)}
      rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
    />
  </ChapterSelectComponent>
);

const ChapterSelectComponent = Select.ofType<SALanguage>();

const chapterRenderer: ItemRenderer<SALanguage> = (chap, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={chap.displayName} onClick={handleClick} text={chap.displayName} />
);

const iExternals = Array.from(externalLibraries.entries()).map((entry, index) => ({
  name: entry[0] as ExternalLibraryName,
  key: index,
  symbols: entry[1]
}));

const externalSelect = (
  currentExternal: string,
  handleSelect: (i: External, e?: React.SyntheticEvent<HTMLElement>) => void
) => (
  <ExternalSelectComponent
    className={Classes.MINIMAL}
    items={iExternals}
    onItemSelect={handleSelect}
    itemRenderer={externalRenderer}
    filterable={false}
  >
    <Button minimal text={currentExternal} rightIcon={IconNames.DOUBLE_CARET_VERTICAL} />
  </ExternalSelectComponent>
);

const ExternalSelectComponent = Select.ofType<External>();

const externalRenderer: ItemRenderer<External> = (external, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={external.key} onClick={handleClick} text={external.name} />
);

export default DeploymentTab;
