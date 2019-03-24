import { Button, MenuItem, Switch } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';
import { externalLibraries } from '../../../reducers/externalLibraries';
import { sourceChapters } from '../../../reducers/states';

import { ExternalLibraryName, IAssessment, Library } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
import SideContent from '../../workspace/side-content';
import { emptyLibrary } from '../assessmentTemplates';
import { assignToPath, getValueFromPath } from './';
import TextareaContent from './TextareaContent';

interface IProps {
  assessment: IAssessment;
  pathToLibrary: Array<string | number>;
  updateAssessment: (assessment: IAssessment) => void;
  handleRefreshLibrary: (library: Library) => void;
  isGlobalDeployment: boolean;
}

interface IChapter {
  chapter: number;
  displayName: string;
}

interface IExternal {
  key: number;
  name: ExternalLibraryName;
  symbols: string[];
}

export class DeploymentTab extends React.Component<
  IProps,
  { activeTab: number; deploymentEnabled: boolean }
> {
  public constructor(props: IProps) {
    super(props);
    this.state = {
      activeTab: 0,
      deploymentEnabled: false
    };
  }

  public render() {
    if (this.props.isGlobalDeployment) {
      return this.deploymentTab();
    } else {
      return (
        <div>
          <Switch
            checked={this.state.deploymentEnabled}
            label="Enable Local Deployment"
            onChange={this.handleSwitchDeployment}
          />
          {this.state.deploymentEnabled ? this.deploymentTab() : null}
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
        <td style={{ width: '520px' }}>
          {this.textareaContent(deploymentPath.concat(['external', 'symbols', i]))}
        </td>
        <td>{controlButton('Delete', IconNames.MINUS, this.handleSymbolDelete(i))}</td>
      </tr>
    ));

    const globals = deployment.globals.map((symbol, i) => (
      <tr key={i}>
        <td className="col-xs-3" style={{ height: '2rem', width: '10rem', overflow: 'auto' }}>
          <div style={{ height: '2rem', width: '10rem', overflow: 'auto' }}>
            {this.textareaContent(deploymentPath.concat(['globals', i, 0]))}
          </div>
        </td>
        <td className="col-xs-7" style={{ height: '2rem', width: '20rem', overflow: 'auto' }}>
          <div style={{ height: '2rem', width: '20rem', overflow: 'auto' }}>
            {this.globalValueTextareaContent(i)}
          </div>
        </td>
        <td className="col-xs-2">
          {controlButton('Delete', IconNames.MINUS, this.handleGlobalDelete(i))}
        </td>
      </tr>
    ));

    const resetLibrary = controlButton('Reload Library', IconNames.REFRESH, () =>
      this.props.handleRefreshLibrary(deployment)
    );

    const symbolsFragment = (
      <React.Fragment>
        External Library:
        <br />
        {externalSelect(deployment.external.name, this.handleExternalSelect!)}
        <br />
        <br />
        <div>Symbols:</div>
        <br />
        <table style={{ width: '100%' }}>{symbols}</table>
        {controlButton('New Symbol', IconNames.PLUS, this.handleNewSymbol)}
      </React.Fragment>
    );

    const globalsFragment = (
      <React.Fragment>
        <div>Globals:</div>
        <br />
        <table style={{ width: '100%' }}>{globals}</table>
        {controlButton('New Global', IconNames.PLUS, this.handleNewGlobal)}
      </React.Fragment>
    );

    const tabs = [
      {
        label: `Library`,
        icon: IconNames.BOOK,
        body: symbolsFragment
      },
      {
        label: `Globals`,
        icon: IconNames.GLOBE,
        body: globalsFragment
      }
    ];

    return (
      <div>
        {/* {deploymentDisp}
        <br /> */}
        {resetLibrary}
        <br />
        Interpreter:
        <br />
        {chapterSelect(deployment.chapter, this.handleChapterSelect)}
        <SideContent
          activeTab={this.state.activeTab}
          handleChangeActiveTab={this.handleChangeActiveTab}
          tabs={tabs}
        />
      </div>
    );
  };

  private handleChangeActiveTab = (tab: number) => {
    this.setState({
      activeTab: tab
    });
  };

  private textareaContent = (path: Array<string | number>) => {
    return (
      <TextareaContent
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
      <TextareaContent
        assessment={this.props.assessment}
        path={pathVal}
        updateAssessment={this.handleGlobalValueUpdate(i)}
        useRawValue={true}
      />
    );
  };

  private handleGlobalValueUpdate = (i: number) => (assessment: IAssessment) => {
    const deployment = getValueFromPath(this.props.pathToLibrary, this.props.assessment) as Library;
    const global = deployment.globals[i];
    try {
      global[1] = altEval(global[2]!);
      this.props.updateAssessment(assessment);
    } catch (e) {
      global[2] = 'Invalid Expression';
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

  private handleChapterSelect = (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => {
    const assessment = this.props.assessment;
    const deployment = getValueFromPath(this.props.pathToLibrary, assessment) as Library;
    deployment.chapter = i.chapter;
    this.props.updateAssessment(assessment);
  };

  private handleExternalSelect = (i: IExternal, e: React.ChangeEvent<HTMLSelectElement>) => {
    const assessment = this.props.assessment;
    const deployment = getValueFromPath(this.props.pathToLibrary, assessment) as Library;
    deployment.external.name = i.name;
    deployment.external.symbols = JSON.parse(JSON.stringify(externalLibraries.get(i.name)!));
    this.props.updateAssessment(assessment);
  };

  private handleSwitchDeployment = () => {
    const assessment = this.props.assessment;
    if (this.state.deploymentEnabled) {
      assignToPath(this.props.pathToLibrary, emptyLibrary(), assessment);
    } else {
      assignToPath(this.props.pathToLibrary.concat(['chapter']), 1, assessment);
    }
    this.setState({
      deploymentEnabled: !this.state.deploymentEnabled
    });
    this.props.updateAssessment(assessment);
  };
}

const removeSpaces = (str: string) => {
  return str.replace(/\s+/g, '');
};

function styliseChapter(chap: number) {
  return `Source \xa7${chap}`;
}

const chapters = sourceChapters.map(chap => ({ displayName: styliseChapter(chap), chapter: chap }));

const chapterSelect = (
  currentChap: number,
  handleSelect = (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => {}
) => (
  <ChapterSelectComponent
    className="pt-minimal"
    items={chapters}
    onItemSelect={handleSelect}
    itemRenderer={chapterRenderer}
    filterable={false}
  >
    <Button
      className="pt-minimal"
      text={styliseChapter(currentChap)}
      rightIcon="double-caret-vertical"
    />
  </ChapterSelectComponent>
);

const altEval = (str: string): any => {
  return Function('"use strict";return (' + str + ')')();
};

const ChapterSelectComponent = Select.ofType<IChapter>();

const chapterRenderer: ItemRenderer<IChapter> = (chap, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={chap.chapter} onClick={handleClick} text={chap.displayName} />
);

const iExternals = Array.from(externalLibraries.entries()).map((entry, index) => ({
  name: entry[0] as ExternalLibraryName,
  key: index,
  symbols: entry[1]
}));

const externalSelect = (
  currentExternal: string,
  handleSelect: (i: IExternal, e: React.ChangeEvent<HTMLSelectElement>) => void
) => (
  <ExternalSelectComponent
    className="pt-minimal"
    items={iExternals}
    onItemSelect={handleSelect}
    itemRenderer={externalRenderer}
    filterable={false}
  >
    <Button className="pt-minimal" text={currentExternal} rightIcon="double-caret-vertical" />
  </ExternalSelectComponent>
);

const ExternalSelectComponent = Select.ofType<IExternal>();

const externalRenderer: ItemRenderer<IExternal> = (external, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={external.key} onClick={handleClick} text={external.name} />
);

export default DeploymentTab;
