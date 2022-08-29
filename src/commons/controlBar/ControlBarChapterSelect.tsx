import { Button, Classes, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemListRenderer, ItemRenderer, Select } from '@blueprintjs/select';
import { Chapter, Variant } from 'js-slang/dist/types';
import * as React from 'react';

import {
  defaultLanguages,
  fullJSLanguage,
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
  key: string;
};

export function ControlBarChapterSelect(props: ControlBarChapterSelectProps) {
  const chapterRenderer: ItemRenderer<SALanguage> = (lang, { handleClick }) => (
    <MenuItem key={lang.displayName} onClick={handleClick} text={lang.displayName} />
  );

  const chapterListRenderer: ItemListRenderer<SALanguage> = ({ itemsParentRef, renderItem }) => {
    const defaultChoices = defaultLanguages.map(renderItem);
    const variantChoices = variantLanguages.map(renderItem);
    const fullJSChoice = renderItem(fullJSLanguage, 0);
    return (
      <Menu ulRef={itemsParentRef}>
        {defaultChoices}
        {Constants.playgroundOnly && fullJSChoice}
        <MenuItem key="variant-menu" text="Variants" icon="cog">
          {variantChoices}
        </MenuItem>
      </Menu>
    );
  };

  const ChapterSelectComponent = Select.ofType<SALanguage>();

  const chapSelect = (
    currentChap: number,
    currentVariant: Variant,
    handleSelect = (item: SALanguage, event?: React.SyntheticEvent<HTMLElement>) => {},
    disabled: boolean
  ) => (
    <ChapterSelectComponent
      items={sourceLanguages}
      onItemSelect={handleSelect}
      itemRenderer={chapterRenderer}
      itemListRenderer={chapterListRenderer}
      filterable={false}
      disabled={disabled || false}
    >
      <Button
        className={Classes.MINIMAL}
        text={styliseSublanguage(currentChap, currentVariant)}
        rightIcon={disabled ? null : IconNames.DOUBLE_CARET_VERTICAL}
        disabled={disabled || false}
      />
    </ChapterSelectComponent>
  );

  return chapSelect(
    props.sourceChapter,
    props.sourceVariant,
    props.handleChapterSelect,
    props.disabled || false
  );
}
