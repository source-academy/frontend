import { Button, Classes, Divider, MenuItem, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import { Chapter, Variant } from 'js-slang/dist/types';
import * as React from 'react';

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

class DeploymentTab extends React.Component<DeploymentTabProps, {}> {
  public render() {
    if (!this.props.isOptionalDeployment) {
      return (
        <div>
          {this.props.label + ' Deployment'}
          <br />
          {this.deploymentTab()}
        </div>
      );
    } else {
      return (
        <div>
          <Switch
            checked={!this.isEmptyLibrary()}
            label={'Enable ' + this.props.label + ' Deployment'}
            onChange={this.handleSwitchDeployment}
          />
          {this.isEmptyLibrary() ? null : this.deploymentTab()}
        </div>
      );
    }
  }

  private deploymentTab = () => {
    const deploymentPath = this.props.pathToLibrary;
    const deployment = getValueFromPath(deploymentPath, this.props.assessment) as Library;
    // const deploymentDisp = this.props.isGlobalDeployment ? 'Global Deployment' : 'Local Deployment';
    const symbols = deployment.external.symbols.map((symbol, i) => (
      <tr key={i}>
        <td>{this.textareaContent(deploymentPath.concat(['external', 'symbols', i]))}</td>
        <td style={{ width: '100px' }}>
          <ControlButton
            label="Delete"
            icon={IconNames.MINUS}
            onClick={this.handleSymbolDelete(i)}
          />
        </td>
      </tr>
    ));

    const globals = deployment.globals.map((symbol, i) => (
      <tr key={i}>
        <td style={{ width: '170px' }}>
          {this.textareaContent(deploymentPath.concat(['globals', i, 0]))}
        </td>
        <td>{this.globalValueTextareaContent(i)}</td>
        <td style={{ width: '90px' }}>
          <ControlButton
            label="Delete"
            icon={IconNames.MINUS}
            onClick={this.handleGlobalDelete(i)}
          />
        </td>
      </tr>
    ));

    const resetLibrary = (
      <ControlButton
        label="Use this Library"
        icon={IconNames.REFRESH}
        onClick={() => this.props.handleRefreshLibrary(deployment)}
      />
    );

    const symbolsFragment = (
      <React.Fragment>
        External Library:
        <br />
        {externalSelect(deployment.external.name, this.handleExternalSelect!)}
        <Divider />
        <div>Symbols:</div>
        <br />
        <table style={{ width: '100%' }}>
          <tbody>{symbols}</tbody>
        </table>
        <ControlButton label="New Symbol" icon={IconNames.PLUS} onClick={this.handleNewSymbol} />
      </React.Fragment>
    );

    const globalsFragment = (
      <React.Fragment>
        <div>Globals:</div>
        <br />
        <table style={{ width: '100%', borderSpacing: '5px' }}>
          <tbody>{globals}</tbody>
        </table>
        <ControlButton label="New Global" icon={IconNames.PLUS} onClick={this.handleNewGlobal} />
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
        {chapterSelect(deployment.chapter, deployment.variant, this.handleChapterSelect)}
        <Divider />
        {symbolsFragment}
        <Divider />
        {globalsFragment}
      </div>
    );
  };

  private textareaContent = (path: Array<string | number>) => {
    return (
      <TextAreaContent
        assessment={this.props.assessment}
        path={path}
        processResults={removeSpaces}
        updateAssessment={this.props.updateAssessment}
        useRawValue={true}
      />
    );
  };

  private globalValueTextareaContent = (i: number) => {
    const pathVal = this.props.pathToLibrary.concat(['globals', i, 2]);
    return (
      <TextAreaContent
        assessment={this.props.assessment}
        path={pathVal}
        updateAssessment={this.handleGlobalValueUpdate(i)}
        useRawValue={true}
      />
    );
  };

  private handleGlobalValueUpdate = (i: number) => (assessment: Assessment) => {
    const deployment = getValueFromPath(this.props.pathToLibrary, this.props.assessment) as Library;
    const global = deployment.globals[i];
    try {
      global[1] = altEval(global[2]!);
      this.props.updateAssessment(assessment);
    } catch (e) {
      global[2] = '"Invalid Expression"';
    }
  };

  private handleSymbolDelete = (index: number) => () => {
    const assessment = this.props.assessment;
    const deployment = getValueFromPath(this.props.pathToLibrary, assessment) as Library;
    const symbols = deployment.external.symbols;
    symbols.splice(index, 1);
    this.props.updateAssessment(assessment);
  };

  private handleNewSymbol = () => {
    const assessment = this.props.assessment;
    const deployment = getValueFromPath(this.props.pathToLibrary, assessment) as Library;
    const symbols = deployment.external.symbols;
    symbols.push('new_symbol');
    this.props.updateAssessment(assessment);
  };

  private handleGlobalDelete = (index: number) => () => {
    const assessment = this.props.assessment;
    const deployment = getValueFromPath(this.props.pathToLibrary, assessment) as Library;
    deployment.globals.splice(index, 1);
    this.props.updateAssessment(assessment);
  };

  private handleNewGlobal = () => {
    const assessment = this.props.assessment;
    const deployment = getValueFromPath(this.props.pathToLibrary, assessment) as Library;
    deployment.globals.push(['new_global', null, 'null']);
    this.props.updateAssessment(assessment);
  };

  private handleChapterSelect = (i: SALanguage, _e?: React.SyntheticEvent<HTMLElement>) => {
    const assessment = this.props.assessment;
    const deployment = getValueFromPath(this.props.pathToLibrary, assessment) as Library;
    deployment.chapter = i.chapter;
    this.props.updateAssessment(assessment);
  };

  private handleExternalSelect = (i: External, _e?: React.SyntheticEvent<HTMLElement>) => {
    const assessment = this.props.assessment;
    const deployment = getValueFromPath(this.props.pathToLibrary, assessment) as Library;
    deployment.external.name = i.name;
    deployment.external.symbols = JSON.parse(JSON.stringify(externalLibraries.get(i.name)!));
    this.props.updateAssessment(assessment);
  };

  private handleSwitchDeployment = () => {
    const assessment = this.props.assessment;
    if (this.isEmptyLibrary()) {
      let library = getValueFromPath(
        this.props.pathToCopy || ['globalDeployment'],
        assessment
      ) as Library;
      if (library.chapter === -1) {
        library = assessment.globalDeployment!;
      }
      library = JSON.parse(JSON.stringify(library));
      assignToPath(this.props.pathToLibrary, library, assessment);
    } else {
      assignToPath(this.props.pathToLibrary, emptyLibrary(), assessment);
    }
    this.props.updateAssessment(assessment);
  };

  private isEmptyLibrary = (path: Array<string | number> = this.props.pathToLibrary) => {
    return getValueFromPath(path.concat(['chapter']), this.props.assessment) === -1;
  };
}

const removeSpaces = (str: string | number) => {
  return typeof str === 'string' ? str.replace(/\s+/g, '') : str;
};

const altEval = (str: string): any => {
  // eslint-disable-next-line no-new-func
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
      className={Classes.MINIMAL}
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
    <Button
      className={Classes.MINIMAL}
      text={currentExternal}
      rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
    />
  </ExternalSelectComponent>
);

const ExternalSelectComponent = Select.ofType<External>();

const externalRenderer: ItemRenderer<External> = (external, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={external.key} onClick={handleClick} text={external.name} />
);

export default DeploymentTab;
