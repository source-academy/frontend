import { Button, Classes, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import { ItemListRenderer, ItemRenderer, Select } from '@blueprintjs/select';
import { Chapter, Variant } from 'js-slang/dist/types';
import React, { useEffect, useState } from 'react';
import { store } from 'src/pages/createStore';

import {
  defaultLanguages,
  fullJSLanguage,
  fullTSLanguage,
  htmlLanguage,
  pyLanguages,
  SALanguage,
  schemeLanguages,
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

const chapterListRendererA: ItemListRenderer<SALanguage> = ({ itemsParentRef, renderItem }) => {
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

const chapterListRendererB: ItemListRenderer<SALanguage> = ({ itemsParentRef, renderItem }) => {
  const schemeChoice = schemeLanguages.map(renderItem);
  return (
    <Menu ulRef={itemsParentRef} style={{ display: 'flex', flexDirection: 'column' }}>
      {Constants.playgroundOnly && schemeChoice}
    </Menu>
  );
};

const chapterListRendererC: ItemListRenderer<SALanguage> = ({ itemsParentRef, renderItem }) => {
  const pyChoice = pyLanguages.map(renderItem);
  return (
    <Menu ulRef={itemsParentRef} style={{ display: 'flex', flexDirection: 'column' }}>
      {Constants.playgroundOnly && pyChoice}
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
      <Tooltip2
        key={lang.displayName}
        content={tooltipContent}
        disabled={tooltipContent === undefined}
      >
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
  const [selectedLang, setSelectedLang] = useState(store.getState().playground.lang);
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const newSelectedLang = store.getState().playground.lang;
      setSelectedLang(newSelectedLang);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  let chapterListRenderer: ItemListRenderer<SALanguage> = chapterListRendererA;

  if (selectedLang === 'Source') {
    chapterListRenderer = chapterListRendererA;
  } else if (selectedLang === 'Scheme') {
    chapterListRenderer = chapterListRendererB;
  } else if (selectedLang === 'Python') {
    chapterListRenderer = chapterListRendererC;
  }

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
