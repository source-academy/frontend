import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';

import * as React from 'react';

import { RouteComponentProps } from 'react-router';

import { Variant } from 'js-slang/dist/types';
import { ISourceLanguage, sourceLanguages, styliseChapter } from '../../reducers/states';

export interface IChapterProps extends IDispatchProps, IStateProps, RouteComponentProps<{}> {}

export type IDispatchProps = {
  handleFetchChapter: () => void;
  handleUpdateChapter: (chapter: IChapter) => void;
  handleChapterSelect?: (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export interface IStateProps {
  sourceChapter: number;
  sourceVariant: Variant;
}

export interface IChapter {
  chapter: number;
  variant: Variant;
  displayName: string;
}

export function DefaultChapter(props: IChapterProps) {
  props.handleFetchChapter();

  const chapters = sourceLanguages.map((lang: ISourceLanguage) => {
    return {
      chapter: lang.chapter,
      variant: lang.variant,
      displayName: styliseChapter(lang.chapter, lang.variant)
    };
  });

  const chapterRenderer: ItemRenderer<IChapter> = (lang, { handleClick }) => (
    <MenuItem
      active={false}
      key={lang.chapter + lang.variant}
      onClick={handleClick}
      text={lang.displayName}
    />
  );

  const ChapterSelectComponent = Select.ofType<IChapter>();

  const chapSelect = (
    currentChap: number,
    currentVariant: Variant,
    handleSelect = (i: IChapter) => {}
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
        text={styliseChapter(currentChap, currentVariant)}
        rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
      />
    </ChapterSelectComponent>
  );

  return (
    <div> {chapSelect(props.sourceChapter, props.sourceVariant, props.handleUpdateChapter)} </div>
  );
}
