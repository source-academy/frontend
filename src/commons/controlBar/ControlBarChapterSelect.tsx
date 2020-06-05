import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';

import { Variant } from 'js-slang/dist/types';

import { SourceLanguage, sourceLanguages, styliseChapter } from '../application/ApplicationTypes';
import { Chapter } from '../application/types/ChapterTypes';

type ControlBarChapterSelectProps = DispatchProps & StateProps;

type DispatchProps = {
  handleChapterSelect?: (i: Chapter, e?: React.SyntheticEvent<HTMLElement>) => void;
};

type StateProps = {
  sourceChapter: number;
  sourceVariant: Variant;
  disabled?: boolean;
  key: string;
};

export function ControlBarChapterSelect(props: ControlBarChapterSelectProps) {
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

  const chapterSelector = (currentChap: number, currentVariant: Variant, disabled: boolean) => {
    return (
      <div>
        <Button
          className={Classes.MINIMAL}
          text={styliseChapter(currentChap, currentVariant)}
          rightIcon={disabled ? null : IconNames.DOUBLE_CARET_VERTICAL}
          disabled={disabled || false}
        />
      </div>
    );
  };

  const chapSelect = (
    currentChap: number,
    currentVariant: Variant,
    handleSelect = (i: Chapter, e?: React.SyntheticEvent<HTMLElement>) => {},
    disabled: boolean
  ) => (
    <ChapterSelectComponent
      className={Classes.MINIMAL}
      items={chapters}
      onItemSelect={handleSelect}
      itemRenderer={chapterRenderer}
      filterable={false}
      disabled={disabled || false}
    >
      {chapterSelector(currentChap, currentVariant, disabled)}
    </ChapterSelectComponent>
  );

  return chapSelect(
    props.sourceChapter,
    props.sourceVariant,
    props.handleChapterSelect,
    props.disabled || false
  );
}
