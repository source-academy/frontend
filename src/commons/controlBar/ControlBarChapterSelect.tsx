import { Button, Menu, MenuItem, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemListRenderer, ItemRenderer, Select } from '@blueprintjs/select';
import { Chapter, Variant } from 'js-slang/dist/types';
import React from 'react';

import {
  fullJSLanguage,
  fullTSLanguage,
  htmlLanguage,
  javaLanguages,
  pyLanguages,
  SALanguage,
  schemeLanguages,
  sourceLanguages,
  styliseSublanguage
} from '../application/ApplicationTypes';
import Constants from '../utils/Constants';
import { useTypedSelector } from '../utils/Hooks';

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

const chapterListRenderer: ItemListRenderer<SALanguage> = ({
  itemsParentRef,
  renderItem,
  items
}) => {
  const defaultChoices = items.filter(({ variant }) => variant === Variant.DEFAULT);
  const variantChoices = items.filter(({ variant }) => variant !== Variant.DEFAULT);

  return (
    <Menu ulRef={itemsParentRef} style={{ display: 'flex', flexDirection: 'column' }}>
      {defaultChoices.map(renderItem)}
      {variantChoices.length > 0 && (
        <MenuItem key="variant-menu" text="Variants" icon="cog">
          {variantChoices.map(renderItem)}
        </MenuItem>
      )}
    </Menu>
  );
};

const chapterRenderer: (isFolderModeEnabled: boolean) => ItemRenderer<SALanguage> =
  (isFolderModeEnabled: boolean) =>
  (lang, { handleClick }) => {
    const isDisabled = isFolderModeEnabled && lang.chapter === Chapter.SOURCE_1;
    const tooltipContent = isDisabled
      ? 'Folder mode makes use of lists which are not available in Source 1. To switch to Source 1, disable Folder mode.'
      : undefined;
    return (
      <Tooltip
        key={lang.displayName}
        content={tooltipContent}
        disabled={tooltipContent === undefined}
      >
        <MenuItem onClick={handleClick} text={lang.displayName} disabled={isDisabled} />
      </Tooltip>
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
  const selectedLang = useTypedSelector(store => store.playground.languageConfig.mainLanguage);

  const choices = [
    ...sourceLanguages,
    // Full JS/TS version uses eval(), which is a huge security risk, so we only enable
    // for public deployments. HTML, while sandboxed, is treated the same way to be safe.
    // See https://github.com/source-academy/frontend/pull/2460#issuecomment-1528759912
    ...(Constants.playgroundOnly ? [fullJSLanguage, fullTSLanguage, htmlLanguage] : []),
    ...schemeLanguages,
    ...pyLanguages,
    ...javaLanguages
  ];

  return (
    <ChapterSelectComponent
      items={choices.filter(({ mainLanguage }) => mainLanguage === selectedLang)}
      onItemSelect={handleChapterSelect}
      itemRenderer={chapterRenderer(isFolderModeEnabled)}
      itemListRenderer={chapterListRenderer}
      filterable={false}
      disabled={disabled}
    >
      <Button
        minimal
        text={styliseSublanguage(sourceChapter, sourceVariant)}
        rightIcon={disabled ? null : IconNames.DOUBLE_CARET_VERTICAL}
        disabled={disabled}
      />
    </ChapterSelectComponent>
  );
};
