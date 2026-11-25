import { Button, Dialog, DialogBody, DialogFooter, Intent, MenuItem } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { type ItemRenderer, Select } from '@blueprintjs/select';
import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector, useSession } from 'src/commons/utils/Hooks';

import ControlButton from '../../../../commons/ControlButton';
import WorkspaceActions from '../../../../commons/workspace/WorkspaceActions';

/** A language directory entry, identified by its 1-based position in the directory. */
type LanguageChoice = { chapter: number; displayName: string };

function DefaultChapterSelect() {
  const [chosenLanguage, setChosenLanguage] = useState<LanguageChoice>({
    chapter: 1,
    displayName: '',
  });
  const [isDialogOpen, setDialogState] = useState(false);

  const { sourceChapter } = useSession();

  const languages = useAppSelector(state => state.languageDirectory.languages);

  // `sourceChapter` is a 1-based index into the language directory's `languages` array (see
  // chapterLanguage.ts's `deriveLanguageFromChapter`) rather than a Source chapter.
  const items: LanguageChoice[] = languages.map((lang, index) => ({
    chapter: index + 1,
    displayName: lang.name,
  }));

  const currentLanguageName =
    (sourceChapter ? languages[sourceChapter - 1]?.name : undefined) ?? 'Loading…';

  const dispatch = useAppDispatch();
  const handleUpdateLanguage = useCallback(
    (lang: LanguageChoice) => dispatch(WorkspaceActions.changeDefaultLanguage(lang.chapter)),
    [dispatch],
  );

  const handleOpenDialog = useCallback(
    (choice: LanguageChoice) => {
      setDialogState(true);
      setChosenLanguage(choice);
    },
    [setDialogState, setChosenLanguage],
  );
  const handleCloseDialog = useCallback(() => {
    setDialogState(false);
  }, [setDialogState]);
  const handleConfirmDialog = useCallback(() => {
    setDialogState(false);
    handleUpdateLanguage(chosenLanguage);
  }, [chosenLanguage, setDialogState, handleUpdateLanguage]);

  const chapterRenderer: ItemRenderer<LanguageChoice> = useCallback(
    (lang, { handleClick }) => (
      <MenuItem key={lang.displayName} onClick={handleClick} text={lang.displayName} />
    ),
    [],
  );

  const dialog = (
    <Dialog
      canEscapeKeyClose
      canOutsideClickClose
      className="change-default-lang-dialog"
      icon={IconNames.ERROR}
      isCloseButtonShown
      isOpen={isDialogOpen}
      onClose={handleCloseDialog}
      title="Updating default language"
    >
      <DialogBody>
        Are you sure you want to update the <b>default Playground language</b> from{' '}
        {currentLanguageName} to <b>{chosenLanguage.displayName}</b>?
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <ControlButton
              label="Cancel"
              onClick={handleCloseDialog}
              options={{ variant: 'default' }}
            />
            <ControlButton
              label="Confirm"
              onClick={handleConfirmDialog}
              options={{ variant: 'default', intent: Intent.DANGER }}
            />
          </>
        }
      />
    </Dialog>
  );

  return (
    <>
      <Select<LanguageChoice>
        items={items}
        onItemSelect={handleOpenDialog}
        itemRenderer={chapterRenderer}
        filterable={false}
      >
        <Button endIcon={IconNames.DOUBLE_CARET_VERTICAL}>
          <span className="hidden-xs hidden-sm">Default language: </span>
          <span>{currentLanguageName}</span>
        </Button>
      </Select>
      {dialog}
    </>
  );
}

export default DefaultChapterSelect;
