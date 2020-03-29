import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';

import { sourceChapters, sourceDisplayNames } from '../../../reducers/states';

export type ChapterSelectProps = {
  handleChapterSelect?: (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => void;
  sourceChapter: number;
  key: string;
};

export interface IChapter {
  chapter: number;
  displayName: string;
}

export function ChapterSelect(props: ChapterSelectProps) {
  const styliseChapter = (chap: number) => {
    return `Source \xa7${sourceDisplayNames.has(chap) ? sourceDisplayNames.get(chap) : chap}`;
  };

  const chapters = sourceChapters.map(chap => ({
    displayName: styliseChapter(chap),
    chapter: chap
  }));
  const chapterRenderer: ItemRenderer<IChapter> = (chap, { handleClick }) => (
    <MenuItem active={false} key={chap.chapter} onClick={handleClick} text={chap.displayName} />
  );
  const ChapterSelectComponent = Select.ofType<IChapter>();

  const chapSelect = (
    currentChap: number,
    handleSelect = (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => {}
  ) => (
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

  return chapSelect(props.sourceChapter, props.handleChapterSelect);
}
