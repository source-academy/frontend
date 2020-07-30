import { Button, Classes, Dialog, Intent, Menu, MenuItem } from '@blueprintjs/core';
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
} from '../../../commons/application/ApplicationTypes';
import controlButton from '../../../commons/ControlButton';

export type DefaultChapterProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleFetchSublanguage: () => void;
  handleUpdateSublanguage: (sublang: SourceLanguage) => void;
};

export type StateProps = {
  sourceChapter: number;
  sourceVariant: Variant;
};

const AcademyDefaultChapter: React.FunctionComponent<DefaultChapterProps> = props => {
  const { handleFetchSublanguage, handleUpdateSublanguage } = props;

  React.useEffect(() => {
    handleFetchSublanguage();
  }, [handleFetchSublanguage]);

  const { sourceChapter, sourceVariant } = props;

  const [chosenSublang, setSublanguage] = React.useState<SourceLanguage>(sourceLanguages[0]);
  const [isDialogOpen, setDialogState] = React.useState<boolean>(false);

  const handleOpenDialog = React.useCallback(
    (choice: SourceLanguage) => {
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

  const chapterRenderer: ItemRenderer<SourceLanguage> = React.useCallback(
    (lang, { handleClick }) => (
      <MenuItem key={lang.displayName} onClick={handleClick} text={lang.displayName} />
    ),
    []
  );

  const chapterListRenderer: ItemListRenderer<SourceLanguage> = React.useCallback(
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

  const ChapterSelectComponent = Select.ofType<SourceLanguage>();

  const chapSelect = React.useCallback(
    (
      currentChap: number,
      currentVariant: Variant,
      handleSelect = (item: SourceLanguage, event?: React.SyntheticEvent<HTMLElement>) => {}
    ) => (
      <ChapterSelectComponent
        items={sourceLanguages}
        onItemSelect={handleSelect}
        itemRenderer={chapterRenderer}
        itemListRenderer={chapterListRenderer}
        filterable={false}
      >
        <Button
          className={Classes.MINIMAL}
          text={styliseSublanguage(currentChap, currentVariant)}
          rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
        />
      </ChapterSelectComponent>
    ),
    [chapterListRenderer, chapterRenderer]
  );

  return (
    <div>
      {chapSelect(props.sourceChapter, props.sourceVariant, handleOpenDialog)}
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
            {controlButton('Cancel', null, handleCloseDialog, { minimal: false })}
            {controlButton('Confirm', null, handleConfirmDialog, {
              minimal: false,
              intent: Intent.DANGER
            })}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AcademyDefaultChapter;
