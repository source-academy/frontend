import { Button, Classes, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';

import { Variant } from 'js-slang/dist/types';

import {
  SourceLanguage,
  sourceLanguages,
  styliseChapter
} from '../../../commons/application/ApplicationTypes';
import { Chapter } from '../../../commons/application/types/ChapterTypes';

export type DefaultChapterProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleFetchChapter: () => void;
  handleUpdateChapter: (chapter: Chapter) => void;
  handleChapterSelect?: (i: Chapter, e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export type StateProps = {
  sourceChapter: number;
  sourceVariant: Variant;
};

export const sourceChapters: Chapter[] = sourceLanguages.map((lang: SourceLanguage) => {
  return { ...lang, displayName: styliseChapter(lang.chapter, lang.variant) };
});

const AcademyDefaultChapter: React.FunctionComponent<DefaultChapterProps> = props => {
  const { handleFetchChapter, handleUpdateChapter } = props;

  React.useEffect(() => {
    handleFetchChapter();
  }, [handleFetchChapter]);

  const chapterRenderer: ItemRenderer<Chapter> = (lang, { handleClick }) => (
    <MenuItem key={lang.displayName} onClick={handleClick} text={lang.displayName} />
  );

  const ChapterSelectComponent = Select.ofType<Chapter>();

  const chapSelect = (
    currentChap: number,
    currentVariant: Variant,
    handleSelect = (item: Chapter) => {}
  ) => (
    <ChapterSelectComponent
      className={Classes.MINIMAL}
      items={sourceChapters}
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

  return <div>{chapSelect(props.sourceChapter, props.sourceVariant, handleUpdateChapter)}</div>;
};

export default AcademyDefaultChapter;
