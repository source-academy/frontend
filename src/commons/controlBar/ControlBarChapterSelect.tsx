import { Button, Classes, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ItemListRenderer, ItemRenderer, Select } from '@blueprintjs/select';
import { Chapter, Variant } from 'js-slang/dist/types';
import React from 'react';

import {
  defaultLanguages,
  fullJSLanguage,
  fullTSLanguage,
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
  isFolderModeEnabled: boolean;
  sourceChapter: Chapter;
  sourceVariant: Variant;
  disabled?: boolean;
};

const chapterListRenderer: ItemListRenderer<SALanguage> = ({ itemsParentRef, renderItem }) => {
  const defaultChoices = defaultLanguages.map(renderItem);
  const variantChoices = variantLanguages.map(renderItem);
  const fullJSChoice = renderItem(fullJSLanguage, 0);
  const fullTSChoice = renderItem(fullTSLanguage, 0);
  const htmlChoice = renderItem(htmlLanguage, 0);
  return (
    <Menu ulRef={itemsParentRef} style={{ display: 'flex', flexDirection: 'column' }}>
      {defaultChoices}
      {Constants.playgroundOnly && fullJSChoice}
      {Constants.playgroundOnly && fullTSChoice}
      {Constants.playgroundOnly && htmlChoice}
      <MenuItem key="variant-menu" text="Variants" icon="cog">
        {variantChoices}
      </MenuItem>
    </Menu>
  );
};

const chapterRenderer: (isFolderModeEnabled: boolean) => ItemRenderer<SALanguage> =
  (isFolderModeEnabled: boolean) =>
  (lang, { handleClick }) => {
    const isDisabled = isFolderModeEnabled && lang.chapter === Chapter.SOURCE_1;
    const tooltipContent = isDisabled
      ? 'Folder mode makes use of lists which are not available in Source 1. To switch to Source 1, disable Folder mode.'
      : '';
    return (
      <Tooltip2 key={lang.displayName} content={tooltipContent}>
        <MenuItem onClick={handleClick} text={lang.displayName} disabled={isDisabled} />
      </Tooltip2>
    );
  };

const ChapterSelectComponent = Select.ofType<SALanguage>();

export const ControlBarChapterSelect: React.FC<ControlBarChapterSelectProps> = ({
  isFolderModeEnabled,
  sourceChapter,
  sourceVariant,
  handleChapterSelect = () => {},
  disabled = false
}) => {
  return (
    <ChapterSelectComponent
      items={sourceLanguages}
      onItemSelect={handleChapterSelect}
      itemRenderer={chapterRenderer(isFolderModeEnabled)}
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
