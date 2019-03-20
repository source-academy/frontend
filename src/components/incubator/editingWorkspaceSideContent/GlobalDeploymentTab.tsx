import { Button, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';
import { externalLibraries } from '../../../reducers/externalLibraries';
import { sourceChapters } from '../../../reducers/states';

import { ExternalLibraryName, IAssessment } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
import TextareaContent from './TextareaContent';

interface IProps {
  assessment: IAssessment;
  updateAssessment: (assessment: IAssessment) => void;
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

export class GlobalDeploymentTab extends React.Component<IProps, {}> {
  public constructor(props: IProps) {
    super(props);
  }

  public render() {
    return this.deploymentTab();
  }

  private deploymentTab = () => {
    const deployment = this.props.assessment.globalDeployment!;
    const symbols = deployment.external.symbols.map((symbol, i) => (
      <tr key={i}>
        <td>{this.symbolTextareaContent(i)}</td>
        <td>{controlButton('Delete', IconNames.MINUS, this.handleSymbolDelete(i))}</td>
      </tr>
    ));

    return (
      <div>
        Global Deployment
        <br />
        <br />
        Interpreter:
        <br />
        {chapterSelect(deployment.chapter, this.handleChapterSelect)}
        <br />
        <br />
        External Library:
        <br />
        {externalSelect(deployment.external.name, this.handleExternalSelect!)}
        <br />
        <br />
        Symbols:
        <br />
        <br />
        <table style={{ width: '100%' }}>{symbols}</table>
        {controlButton('New Symbol', IconNames.PLUS, this.handleNewSymbol)}
      </div>
    );
  };

  private symbolTextareaContent = (i: number) => {
    const symbolsPath = ['globalDeployment', 'external', 'symbols'];
    return (
      <TextareaContent
        assessment={this.props.assessment}
        path={symbolsPath.concat([i.toString()])}
        updateAssessment={this.handleSymbolUpdate(i)}
        useRawValue={true}
      />
    );
  };

  private handleSymbolUpdate = (index: number) => (assessment: IAssessment) => {
    const symbols = assessment.globalDeployment!.external.symbols;
    const symbol = symbols[index];
    if (symbol === '') {
      symbols.splice(index, 1);
    }
    this.props.updateAssessment(assessment);
  };

  private handleSymbolDelete = (index: number) => () => {
    const assessment = this.props.assessment;
    const symbols = assessment.globalDeployment!.external.symbols;
    symbols.splice(index, 1);
    this.props.updateAssessment(assessment);
  };

  private handleNewSymbol = () => {
    const assessment = this.props.assessment;
    const symbols = assessment.globalDeployment!.external.symbols;
    symbols.push('new symbol');
    this.props.updateAssessment(assessment);
  };

  private handleChapterSelect = (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => {
    const assessment = this.props.assessment;
    assessment.globalDeployment!.chapter = i.chapter;
    this.props.updateAssessment(assessment);
  };

  private handleExternalSelect = (i: IExternal, e: React.ChangeEvent<HTMLSelectElement>) => {
    const assessment = this.props.assessment;
    assessment.globalDeployment!.external.name = i.name;
    assessment.globalDeployment!.external.symbols = JSON.parse(
      JSON.stringify(externalLibraries.get(i.name)!)
    );
    this.props.updateAssessment(assessment);
  };
}

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

export default GlobalDeploymentTab;
