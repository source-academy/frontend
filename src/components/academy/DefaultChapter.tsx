import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
//
import * as React from 'react';

import { RouteComponentProps } from 'react-router';

import { sourceChapters } from '../../reducers/states';

export interface IChapterProps extends IDispatchProps, IStateProps, RouteComponentProps<{}> {}

export type IDispatchProps = {
  handleFetchChapter: () => void;
  handleUpdateChapter: (chapter: IChapter) => void;
  handleChapterSelect?: (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export interface IStateProps {
  sourceChapter: number;
}

export interface IChapter {
  chapter: number;
  displayName: string;
}

// class DefaultChapter extends React.Component<IChapterProps, {}> {
export function DefaultChapter(props: IChapterProps) {
  props.handleFetchChapter();
  const styliseChapter = (chap: number) => `Source \xa7${chap}`;
  const chapters = sourceChapters.map(chap => ({
    displayName: styliseChapter(chap),
    chapter: chap
  }));

  const chapterRenderer: ItemRenderer<IChapter> = (chap, { handleClick }) => (
    <MenuItem active={false} key={chap.chapter} onClick={handleClick} text={chap.displayName} />
  );

  const ChapterSelectComponent = Select.ofType<IChapter>();

  const chapSelect = (currentChap: number, handleSelect = (i: IChapter) => {}) => (
    <ChapterSelectComponent
      className={Classes.MINIMAL}
      items={chapters}
      onItemSelect={handleSelect}
      itemRenderer={chapterRenderer}
      filterable={false}
    >
      <Button
        className={Classes.MINIMAL}
        text={styliseChapter(currentChap)}
        rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
      />
    </ChapterSelectComponent>
  );

  return <div> {chapSelect(props.sourceChapter, props.handleUpdateChapter)} </div>;
}
