import { Button, Classes, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemListRenderer, ItemRenderer, Select } from '@blueprintjs/select';
import { Chapter, Variant } from 'js-slang/dist/types';
import * as React from 'react';

import {
  defaultLanguages,
  fullJSLanguage,
  htmlLanguage,
  SALanguage,
  sourceLanguages,
  styliseSublanguage,
  variantLanguages
} from '../application/ApplicationTypes';
import Constants from '../utils/Constants';

type ControlBarChapterSelectProps = DispatchProps & StateProps;

type DispatchProps = {
  handleChapterSelect?: (i: SALanguage, e?: React.SyntheticEvent<HTMLElement>) => void;
};

type StateProps = {
  sourceChapter: Chapter;
  sourceVariant: Variant;
  disabled?: boolean;
};

const chapterListRenderer: ItemListRenderer<SALanguage> = ({ itemsParentRef, renderItem }) => {
  const defaultChoices = defaultLanguages.map(renderItem);
  const variantChoices = variantLanguages.map(renderItem);
  const fullJSChoice = renderItem(fullJSLanguage, 0);
  const htmlChoice = renderItem(htmlLanguage, 0);
  return (
    <Menu ulRef={itemsParentRef}>
      {defaultChoices}
      {Constants.playgroundOnly && fullJSChoice}
      {Constants.playgroundOnly && htmlChoice}
      <MenuItem key="variant-menu" text="Variants" icon="cog">
        {variantChoices}
      </MenuItem>
    </Menu>
  );
};

export const ControlBarChapterSelect: React.FC<ControlBarChapterSelectProps> = ({
  sourceChapter,
  sourceVariant,
  handleChapterSelect = () => {},
  disabled = false
}) => {
  const chapterRenderer: ItemRenderer<SALanguage> = (lang, { handleClick }) => (
    <MenuItem key={lang.displayName} onClick={handleClick} text={lang.displayName} />
  );

  const ChapterSelectComponent = Select.ofType<SALanguage>();

  return (
    <ChapterSelectComponent
      items={sourceLanguages}
      onItemSelect={handleChapterSelect}
      itemRenderer={chapterRenderer}
      itemListRenderer={chapterListRenderer}
      filterable={false}
      disabled={disabled}
    >
      <Button
        className={Classes.MINIMAL}
        text={styliseSublanguage(sourceChapter, sourceVariant)}
        rightIcon={disabled ? null : IconNames.DOUBLE_CARET_VERTICAL}
        disabled={disabled}
      />
    </ChapterSelectComponent>
  );
};
