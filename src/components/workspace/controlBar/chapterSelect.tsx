import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';

import { Variant } from 'js-slang/dist/types';
import { sourceChapters, sourceVariants, styliseChapter } from '../../../reducers/states';

export type ChapterSelectProps = {
  handleChapterSelect?: (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => void;
  sourceChapter: number;
  sourceVariant: Variant;
  key: string;
};

export interface IChapter {
  chapter: number;
  variant: Variant;
  displayName: string;
}

export function ChapterSelect(props: ChapterSelectProps) {
  let chapters = sourceChapters.map(chap => {
    const variant = 'default' as Variant;
    return {
      displayName: styliseChapter(chap),
      variant,
      chapter: chap
    };
  });

  const chaptersWithVariants = sourceVariants.map((variant: Variant) => ({
    displayName: styliseChapter(3) + ' ' + variant,
    variant,
    chapter: 3
  }));

  chapters = chapters.concat(chaptersWithVariants);

  const chapterRenderer: ItemRenderer<IChapter> = (chap, { handleClick }) => (
    <MenuItem
      active={false}
      key={chap.chapter + chap.variant}
      onClick={handleClick}
      text={chap.displayName}
    />
  );
  const ChapterSelectComponent = Select.ofType<IChapter>();

  const chapSelect = (
    currentChap: number,
    currentVariant: Variant,
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

  return chapSelect(props.sourceChapter, props.sourceVariant, props.handleChapterSelect);
}
