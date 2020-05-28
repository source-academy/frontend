import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { Variant } from 'js-slang/dist/types';

import {
  SourceLanguage,
  sourceLanguages,
  styliseChapter
} from '../../../commons/application/ApplicationTypes';
import { Chapter } from '../../../commons/application/types/ChapterTypes';

export type DefaultChapterProps = DispatchProps & StateProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleFetchChapter: () => void;
  handleUpdateChapter: (chapter: Chapter) => void;
  handleChapterSelect?: (i: Chapter, e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export type StateProps = {
  sourceChapter: number;
  sourceVariant: Variant;
};

export function DefaultChapter(props: DefaultChapterProps) {
  props.handleFetchChapter();

  const chapters = sourceLanguages.map((lang: SourceLanguage) => {
    return {
      chapter: lang.chapter,
      variant: lang.variant,
      displayName: styliseChapter(lang.chapter, lang.variant)
    };
  });

  const chapterRenderer: ItemRenderer<Chapter> = (lang, { handleClick }) => (
    <MenuItem
      active={false}
      key={lang.chapter + lang.variant}
      onClick={handleClick}
      text={lang.displayName}
    />
  );

  const ChapterSelectComponent = Select.ofType<Chapter>();

  const chapSelect = (
    currentChap: number,
    currentVariant: Variant,
    handleSelect = (i: Chapter) => {}
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
