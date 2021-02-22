import { Button, Classes, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemListRenderer, ItemRenderer, Select } from '@blueprintjs/select';
import { Variant } from 'js-slang/dist/types';
import * as React from 'react';

import {
  defaultLanguages,
  SourceLanguage,
  sourceLanguages,
  styliseSublanguage,
  variantLanguages
} from '../application/ApplicationTypes';

type ControlBarChapterSelectProps = DispatchProps & StateProps;

type DispatchProps = {
  handleChapterSelect?: (i: SourceLanguage, e?: React.SyntheticEvent<HTMLElement>) => void;
};

type StateProps = {
  sourceChapter: number;
  sourceVariant: Variant;
  disabled?: boolean;
  key: string;
};

export function ControlBarChapterSelect(props: ControlBarChapterSelectProps) {
  const chapterRenderer: ItemRenderer<SourceLanguage> = (lang, { handleClick }) => (
    <MenuItem key={lang.displayName} onClick={handleClick} text={lang.displayName} />
  );

  const chapterListRenderer: ItemListRenderer<SourceLanguage> = ({
    itemsParentRef,
    renderItem
  }) => {
    const defaultChoices = defaultLanguages.map(renderItem);
    const variantChoices = variantLanguages.map(renderItem);

    return (
      <Menu ulRef={itemsParentRef}>
        {defaultChoices}
        <MenuItem key="variant-menu" text="Variants" icon="cog">
          {variantChoices}
        </MenuItem>
      </Menu>
    );
  };

  const ChapterSelectComponent = Select.ofType<SourceLanguage>();

  const chapSelect = (
    currentChap: number,
    currentVariant: Variant,
    handleSelect = (item: SourceLanguage, event?: React.SyntheticEvent<HTMLElement>) => {},
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
