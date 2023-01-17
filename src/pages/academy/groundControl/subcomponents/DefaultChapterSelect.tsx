import { Button, Classes, Dialog, Intent, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemListRenderer, ItemRenderer, Select } from '@blueprintjs/select';
import { Chapter, Variant } from 'js-slang/dist/types';
import * as React from 'react';

import {
  defaultLanguages,
  SALanguage,
  sourceLanguages,
  styliseSublanguage,
  variantLanguages
} from '../../../../commons/application/ApplicationTypes';
import ControlButton from '../../../../commons/ControlButton';

export type DefaultChapterSelectProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleUpdateSublanguage: (sublang: SALanguage) => void;
};

export type StateProps = {
  sourceChapter: Chapter;
  sourceVariant: Variant;
};

const DefaultChapterSelect: React.FunctionComponent<DefaultChapterSelectProps> = props => {
  const { handleUpdateSublanguage } = props;
  const { sourceChapter, sourceVariant } = props;

  const [chosenSublang, setSublanguage] = React.useState<SALanguage>(sourceLanguages[0]);
  const [isDialogOpen, setDialogState] = React.useState<boolean>(false);

  const handleOpenDialog = React.useCallback(
    (choice: SALanguage) => {
      setDialogState(true);
      setSublanguage(choice);
    },
    [setDialogState, setSublanguage]
  );
  const handleCloseDialog = React.useCallback(() => {
    setDialogState(false);
  }, [setDialogState]);
  const handleConfirmDialog = React.useCallback(() => {
    setDialogState(false);
    handleUpdateSublanguage(chosenSublang);
  }, [chosenSublang, setDialogState, handleUpdateSublanguage]);

  const chapterRenderer: ItemRenderer<SALanguage> = React.useCallback(
    (lang, { handleClick }) => (
      <MenuItem key={lang.displayName} onClick={handleClick} text={lang.displayName} />
    ),
    []
  );

  const chapterListRenderer: ItemListRenderer<SALanguage> = React.useCallback(
    ({ itemsParentRef, renderItem }) => {
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
    },
    []
  );

  const DefaultChapterSelectComponent = Select.ofType<SALanguage>();

  const dialog = (
    <Dialog
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      className="change-default-lang-dialog"
      icon={IconNames.ERROR}
      isCloseButtonShown={true}
      isOpen={isDialogOpen}
      onClose={handleCloseDialog}
      title="Updating default Source sublanguage"
    >
      <div className={Classes.DIALOG_BODY}>
        Are you sure you want to update the <b>default Playground Source sublanguage</b> from{' '}
        {styliseSublanguage(sourceChapter, sourceVariant)} to <b>{chosenSublang.displayName}</b>?
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <ControlButton label="Cancel" onClick={handleCloseDialog} options={{ minimal: false }} />
          <ControlButton
            label="Confirm"
            onClick={handleConfirmDialog}
            options={{ minimal: false, intent: Intent.DANGER }}
          />
        </div>
      </div>
    </Dialog>
  );

  return (
    <>
      <DefaultChapterSelectComponent
        items={sourceLanguages}
        onItemSelect={handleOpenDialog}
        itemRenderer={chapterRenderer}
        itemListRenderer={chapterListRenderer}
        filterable={false}
      >
        <Button rightIcon={IconNames.DOUBLE_CARET_VERTICAL}>
          <span className="hidden-xs hidden-sm">Default sublanguage: </span>
          <span>{styliseSublanguage(sourceChapter, sourceVariant)}</span>
        </Button>
      </DefaultChapterSelectComponent>
      {dialog}
    </>
  );
};

export default DefaultChapterSelect;
