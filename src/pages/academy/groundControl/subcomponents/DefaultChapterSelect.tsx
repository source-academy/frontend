import { Button, Classes, Dialog, Intent, Menu, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemListRenderer, ItemRenderer, Select } from '@blueprintjs/select';
import { Chapter, Variant } from 'js-slang/dist/types';
import React, { useCallback, useState } from 'react';

import {
  SALanguage,
  sourceLanguages,
  styliseSublanguage
} from '../../../../commons/application/ApplicationTypes';
import ControlButton from '../../../../commons/ControlButton';

type Props = DispatchProps & StateProps;

export type DispatchProps = {
  handleUpdateSublanguage: (sublang: SALanguage) => void;
};

export type StateProps = {
  sourceChapter: Chapter;
  sourceVariant: Variant;
};

const DefaultChapterSelect: React.FC<Props> = ({
  handleUpdateSublanguage,
  sourceChapter,
  sourceVariant
}) => {
  const [chosenSublang, setSublanguage] = useState<SALanguage>(sourceLanguages[0]);
  const [isDialogOpen, setDialogState] = useState(false);

  const handleOpenDialog = useCallback(
    (choice: SALanguage) => {
      setDialogState(true);
      setSublanguage(choice);
    },
    [setDialogState, setSublanguage]
  );
  const handleCloseDialog = useCallback(() => {
    setDialogState(false);
  }, [setDialogState]);
  const handleConfirmDialog = useCallback(() => {
    setDialogState(false);
    handleUpdateSublanguage(chosenSublang);
  }, [chosenSublang, setDialogState, handleUpdateSublanguage]);

  const chapterRenderer: ItemRenderer<SALanguage> = useCallback(
    (lang, { handleClick }) => (
      <MenuItem key={lang.displayName} onClick={handleClick} text={lang.displayName} />
    ),
    []
  );

  const chapterListRenderer: ItemListRenderer<SALanguage> = useCallback(
    ({ itemsParentRef, renderItem, items }) => {
      const defaultChoices = items.filter(({ variant }) => variant === Variant.DEFAULT);
      const variantChoices = items.filter(({ variant }) => variant !== Variant.DEFAULT);

      return (
        <Menu ulRef={itemsParentRef}>
          {defaultChoices.map(renderItem)}
          {variantChoices.length > 0 && (
            <MenuItem key="variant-menu" text="Variants" icon="cog">
              {variantChoices.map(renderItem)}
            </MenuItem>
          )}
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
