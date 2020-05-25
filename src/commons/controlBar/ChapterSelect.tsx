import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';

import { Variant } from 'js-slang/dist/types';

// TODO: Import from commons
import { ISourceLanguage, sourceLanguages, styliseChapter } from 'src/reducers/states';

type ChapterSelectProps = DispatchProps & StateProps;

type DispatchProps = {
  handleChapterSelect?: (i: Chapter, e: React.ChangeEvent<HTMLSelectElement>) => void;
};

type StateProps = {
  sourceChapter: number;
  sourceVariant: Variant;
  key: string;
};

// TODO: Duplicate from EditingWorkspaceContent/DeploymentTab, AcademyDefaultChapterComponent, and ChapterSelect
export type Chapter = {
  chapter: number;
  variant: Variant;
  displayName: string;
};

export function ChapterSelect(props: ChapterSelectProps) {
  const chapters = sourceLanguages.map((lang: ISourceLanguage) => {
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
    handleSelect = (i: Chapter, e: React.ChangeEvent<HTMLSelectElement>) => {}
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

  return chapSelect(props.sourceChapter, props.sourceVariant, props.handleChapterSelect);
}
