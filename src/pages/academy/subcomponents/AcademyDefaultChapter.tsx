import { Button, Classes, Dialog, Intent, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { ItemRenderer, Select } from '@blueprintjs/select';
import * as React from 'react';

import { Variant } from 'js-slang/dist/types';

import {
  SourceLanguage,
  sourceLanguages,
  styliseChapter
} from '../../../commons/application/ApplicationTypes';
import controlButton from '../../../commons/ControlButton';
import { Chapter } from '../../../commons/application/types/ChapterTypes';

export type DefaultChapterProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleFetchChapter: () => void;
  handleUpdateChapter: (chapter: Chapter) => void;
  handleChapterSelect?: (i: Chapter, e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export type StateProps = {
  sourceChapter: number;
  sourceVariant: Variant;
};

export const sourceChapters: Chapter[] = sourceLanguages.map((lang: SourceLanguage) => {
  return { ...lang, displayName: styliseChapter(lang.chapter, lang.variant) };
});

const AcademyDefaultChapter: React.FunctionComponent<DefaultChapterProps> = props => {
  const { handleFetchChapter, handleUpdateChapter } = props;

  React.useEffect(() => {
    handleFetchChapter();
  }, [handleFetchChapter]);

  const { sourceChapter, sourceVariant } = props;

  const [chosenChapter, setChapterChoice] = React.useState<Chapter>(sourceChapters[0]);
  const [isDialogOpen, setDialogState] = React.useState<boolean>(false);

  const handleOpenDialog = React.useCallback(
    (choice: Chapter) => {
      setDialogState(true);
      setChapterChoice(choice);
    },
    [setDialogState, setChapterChoice]
  );
  const handleCloseDialog = React.useCallback(() => {
    setDialogState(false);
  }, [setDialogState]);
  const handleConfirmDialog = React.useCallback(() => {
    setDialogState(false);
    handleUpdateChapter(chosenChapter);
  }, [chosenChapter, setDialogState, handleUpdateChapter]);

  const chapterRenderer: ItemRenderer<Chapter> = (lang, { handleClick }) => (
    <MenuItem key={lang.displayName} onClick={handleClick} text={lang.displayName} />
  );

  const ChapterSelect = Select.ofType<Chapter>();

  const chapSelect = (
    currentChap: number,
    currentVariant: Variant,
    handleSelect = (item: Chapter) => {}
  ) => (
    <ChapterSelect
      items={sourceChapters}
      onItemSelect={handleSelect}
      itemRenderer={chapterRenderer}
      filterable={false}
    >
      <Button
        className={Classes.MINIMAL}
        text={styliseChapter(currentChap, currentVariant)}
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
        className="change-default-chapter-dialog"
        icon={IconNames.ERROR}
        isCloseButtonShown={true}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Updating default Source chapter"
      >
        <div className={Classes.DIALOG_BODY}>
          Are you sure you want to update the <b>default Playground Source chapter</b> from{' '}
          {styliseChapter(sourceChapter, sourceVariant)} to <b>{chosenChapter.displayName}</b>?
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
