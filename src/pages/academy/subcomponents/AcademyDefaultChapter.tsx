import { Button, Classes, Dialog, Intent, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';

import { Variant } from 'js-slang/dist/types';

import {
  SourceLanguage,
  sourceLanguages,
  styliseSublanguage
} from '../../../commons/application/ApplicationTypes';
import controlButton from '../../../commons/ControlButton';

export type DefaultChapterProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleFetchSublanguage: () => void;
  handleUpdateSublanguage: (sublang: SourceLanguage) => void;
};

export type StateProps = {
  // handleChapterSelect?: (i: SourceLanguage, e: React.ChangeEvent<HTMLSelectElement>) => void;
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

  const chapterRenderer: ItemRenderer<SourceLanguage> = (lang, { handleClick }) => (
    <MenuItem key={lang.displayName} onClick={handleClick} text={lang.displayName} />
  );

  const ChapterSelect = Select.ofType<SourceLanguage>();

  const chapSelect = (
    currentChap: number,
    currentVariant: Variant,
    handleSelect = (item: SourceLanguage) => {}
  ) => (
    <ChapterSelect
      items={sourceLanguages}
      onItemSelect={handleSelect}
      itemRenderer={chapterRenderer}
      filterable={false}
    >
      <Button
        className={Classes.MINIMAL}
        text={styliseSublanguage(currentChap, currentVariant)}
        rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
      />
    </ChapterSelect>
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
